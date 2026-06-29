/**
 * Non-cached (no-store) ProtoPedia fetch backed by the `promidas` package.
 *
 * This is an isolated, opt-in alternative to the SDK-based
 * `protopediaNoStoreClient` in `lib/protopedia-client.ts`. It uses promidas's
 * {@link ProtopediaApiCustomClient.fetchPrototypes}, which fetches, normalizes,
 * and classifies errors in a single call.
 *
 * Scope is intentionally narrow: only the SHOW / by-id path uses this. The
 * list (force-cache) and random (map-store) paths are untouched, and a caller
 * can fall back to the SDK-based no-store path simply by switching its import
 * back to `fetchPrototypesViaNoStoreClient`.
 *
 * Config is read independently from the environment so `lib/protopedia-client.ts`
 * stays an untouched fallback.
 */
import { ProtopediaApiCustomClient, type Logger } from 'promidas/fetcher';

import { logger as baseLogger } from '@/lib/logger.server';
import type {
  FetchPrototypesParams,
  FetchPrototypesResult,
} from '@/types/prototype-api.types';

/**
 * Timeout for establishing a connection and receiving response headers.
 * Mirrors the value used by the SDK-based clients; does not cover body download.
 */
const CONNECTION_AND_HEADER_TIMEOUT_MS = 30_000;

/** Upper bound for `limit`, matching the SDK path's clamp, to guard against
 * accidentally huge upstream responses if this action is reused. */
const MAX_LIMIT = 10_000;

const accessToken = process.env.PROTOPEDIA_API_V2_TOKEN;
const baseUrl = process.env.PROTOPEDIA_API_V2_BASE_URL;

// The placeholder warning is emitted by lib/protopedia-client.ts; avoid a
// duplicate here and just resolve the token silently.
const validToken =
  accessToken && accessToken !== 'your_token_here'
    ? accessToken
    : 'DUMMY_TOKEN_FOR_BUILD';

/**
 * No-store fetch: bypasses the Next.js Data Cache (`cache: 'no-store'`,
 * `next.revalidate: 0`) with a connection/header timeout.
 */
const noStoreFetch: typeof globalThis.fetch = async (url, init) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    CONNECTION_AND_HEADER_TIMEOUT_MS,
  );

  // Compose any incoming signal (the SDK passes its own AbortSignal) with our
  // timeout controller so caller/SDK cancellation still propagates.
  const callerSignal = init?.signal;
  const onCallerAbort = () => controller.abort(callerSignal?.reason);
  if (callerSignal) {
    if (callerSignal.aborted) {
      onCallerAbort();
    } else {
      callerSignal.addEventListener('abort', onCallerAbort, { once: true });
    }
  }

  try {
    return await globalThis.fetch(url, {
      ...init,
      signal: controller.signal,
      cache: 'no-store',
      next: { revalidate: 0 },
    });
  } finally {
    clearTimeout(timeoutId);
    callerSignal?.removeEventListener('abort', onCallerAbort);
  }
};

/**
 * Adapt promidas's `(message, meta)` logger calls to pino's `(bindings, message)`
 * shape so this client's diagnostics flow through the app's structured server
 * logger rather than a standalone ConsoleLogger. Verbosity is governed by the
 * pino logger's own level.
 */
const emitLog = (
  level: 'error' | 'warn' | 'info' | 'debug',
  message: string,
  meta?: unknown,
): void => {
  if (meta == null) {
    baseLogger[level](message);
  } else if (typeof meta === 'object') {
    baseLogger[level](meta as Record<string, unknown>, message);
  } else {
    baseLogger[level]({ meta }, message);
  }
};

const promidasLogger: Logger = {
  error: (message, meta) => emitLog('error', message, meta),
  warn: (message, meta) => emitLog('warn', message, meta),
  info: (message, meta) => emitLog('info', message, meta),
  debug: (message, meta) => emitLog('debug', message, meta),
};

/**
 * promidas fetcher client configured for non-cached, server-side use.
 * Progress tracking is disabled (single-prototype SHOW fetches are small);
 * diagnostics flow through the app's pino logger via {@link promidasLogger}.
 */
export const promidasNoStoreClient = new ProtopediaApiCustomClient({
  protoPediaApiClientOptions: {
    token: validToken,
    baseUrl,
    fetch: noStoreFetch,
  },
  logger: promidasLogger,
  progressLog: false,
});

const validatePrototypeId = (prototypeId?: number) => {
  if (prototypeId === undefined) {
    return { ok: true as const, value: undefined };
  }
  if (!Number.isInteger(prototypeId) || prototypeId <= 0) {
    return {
      ok: false as const,
      error: 'Prototype ID must be a positive integer',
    };
  }
  return { ok: true as const, value: prototypeId };
};

/**
 * Fetch and normalize prototypes via the no-store promidas client, mapping
 * promidas's Result into the app's {@link FetchPrototypesResult} contract so
 * existing consumers are unchanged.
 *
 * Error status mapping: promidas's `status` is used when present; otherwise a
 * fetcher-level `timeout`/`abort` maps to 504 and other transport failures
 * (network/cors/unknown without a status) map to 503.
 */
export const fetchPrototypesViaPromidasNoStore = async (
  params: FetchPrototypesParams = {},
): Promise<FetchPrototypesResult> => {
  const idValidation = validatePrototypeId(params.prototypeId);
  if (!idValidation.ok) {
    return { ok: false, status: 400, error: idValidation.error };
  }

  const limit =
    typeof params.limit === 'number' && params.limit > 0
      ? Math.min(Math.floor(params.limit), MAX_LIMIT)
      : 1;
  const offset =
    typeof params.offset === 'number' && params.offset > 0
      ? Math.floor(params.offset)
      : 0;

  const result = await promidasNoStoreClient.fetchPrototypes({
    limit,
    offset,
    prototypeId: idValidation.value,
  });

  if (result.ok) {
    return { ok: true, data: result.data };
  }

  const status =
    result.status ??
    (result.kind === 'timeout' || result.kind === 'abort' ? 504 : 503);

  return {
    ok: false,
    status,
    error: result.error,
    details: {
      statusText: result.details?.res?.statusText,
      code: result.details?.res?.code,
      url: result.details?.req?.url,
    },
  };
};
