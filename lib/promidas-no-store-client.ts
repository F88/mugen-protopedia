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
import { ProtopediaApiCustomClient } from 'promidas/fetcher';

import { promidasLogger } from '@/lib/promidas-logger';
import { getRequestTimeoutMs } from '@/lib/protopedia-request-timeout';
import type {
  FetchPrototypesParams,
  FetchPrototypesResult,
} from '@/types/prototype-api.types';

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
 * `next.revalidate: 0`). `init.signal` must be forwarded unchanged: the SDK uses
 * it for both `timeoutMs` and caller cancellation.
 */
const noStoreFetch: typeof globalThis.fetch = (url, init) =>
  globalThis.fetch(url, {
    ...init,
    cache: 'no-store',
    next: { revalidate: 0 },
  });

/**
 * promidas fetcher client configured for non-cached, server-side use.
 * Progress tracking is disabled (single-prototype SHOW fetches are small);
 * diagnostics flow through the app's pino logger via {@link promidasLogger}.
 */
export const promidasNoStoreClient = new ProtopediaApiCustomClient({
  protoPediaApiClientOptions: {
    token: validToken,
    baseUrl,
    timeoutMs: getRequestTimeoutMs(),
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
 * Error status mapping: promidas's `status` is used when it is an error status;
 * otherwise a fetcher-level `timeout`/`abort` maps to 504 and other failures map
 * to 503, including an unparsable response, which has the status 200.
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
    // No-store path: a fresh upstream fetch, so the generation time is now.
    return { ok: true, data: result.data, lastFetchedAt: new Date() };
  }

  let status = result.kind === 'timeout' || result.kind === 'abort' ? 504 : 503;
  if (result.status !== undefined && result.status >= 400) {
    status = result.status;
  }

  return {
    ok: false,
    status,
    error: result.error,
    details: {
      statusText: result.details?.res?.statusText,
      code: result.details.causeCode,
      url: result.details?.req?.url,
    },
  };
};
