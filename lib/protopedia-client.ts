/**
 * ProtoPedia API v2 client configuration.
 *
 * This module exposes two preconfigured clients:
 *
 * - `protopediaForceCacheClient`:
 *   Data-cache-aware client that uses the Next.js Data Cache
 *   (`cache: "force-cache"`, `next.revalidate: 60`). Intended for list,
 *   playlist, and analysis paths where a slightly stale view is acceptable.
 *
 * - `protopediaNoStoreClient`:
 *   No-store client that bypasses the Next.js Data Cache
 *   (`cache: "no-store"`, `next.revalidate: 0`). Intended for SHOW /
 *   upstream-only paths that prefer the freshest possible data.
 *
 * Both clients share the same environment-driven configuration:
 * - `PROTOPEDIA_API_V2_TOKEN` for authentication (optional).
 * - `PROTOPEDIA_API_V2_BASE_URL` for overriding the upstream base URL.
 * - `PROTOPEDIA_API_V2_LOG_LEVEL` to control SDK log verbosity.
 * - `PROTOPEDIA_API_V2_TIMEOUT_MS` for overriding the request timeout.
 */
import {
  createProtoPediaClient,
  ProtoPediaApiError,
} from 'protopedia-api-v2-client';
import { logger as baseLogger } from '@/lib/logger.server';
import { getRequestTimeoutMs } from '@/lib/protopedia-request-timeout';

/**
 * Timeout for a whole request, passed to the SDK as `timeoutMs`.
 *
 * The custom `fetch` functions below must forward `init.signal` unchanged:
 * the SDK uses it for both this timeout and caller cancellation.
 */
const REQUEST_TIMEOUT_MS = getRequestTimeoutMs();

const accessToken = process.env.PROTOPEDIA_API_V2_TOKEN;
const baseUrl = process.env.PROTOPEDIA_API_V2_BASE_URL;
const logLevel =
  (process.env.PROTOPEDIA_API_V2_LOG_LEVEL as
    'silent' | 'error' | 'warn' | 'info' | 'debug' | undefined) ?? 'error';

// console.debug('process.env.PROTOPEDIA_API_V2_TOKEN', process.env.PROTOPEDIA_API_V2_TOKEN);

// Check if token is set and valid (not a placeholder)
const validToken =
  accessToken && accessToken !== 'your_token_here'
    ? accessToken
    : 'DUMMY_TOKEN_FOR_BUILD';

if (validToken === 'DUMMY_TOKEN_FOR_BUILD') {
  baseLogger.warn(
    'PROTOPEDIA_API_V2_TOKEN is not set or is using placeholder value. Using dummy token to initialize client.',
  );
}

baseLogger.debug({ logLevel }, 'ProtoPedia client configuration');

/**
 * Re-export ProtoPediaApiError from the SDK for convenience.
 *
 * In v2.0.0+, the error structure includes:
 * - `req.url`: The request URL
 * - `req.method`: The HTTP method
 * - `status`: HTTP status code
 * - `body`: Response body for debugging
 */
export { ProtoPediaApiError };

/**
 * Data-cache-aware ProtoPedia client.
 *
 * - Uses `cache: 'force-cache'` with `next.revalidate: 60`, allowing
 *   Next.js to cache responses for up to 60 seconds.
 * - Suitable for list endpoints, playlist bootstrapping, and analysis
 *   paths where slightly stale data is acceptable and reduced upstream
 *   load is desirable.
 *
 * The client shares the same token / base URL / log-level configuration
 * as {@link protopediaNoStoreClient}.
 */
export const protopediaForceCacheClient = createProtoPediaClient({
  token: validToken,
  baseUrl,
  timeoutMs: REQUEST_TIMEOUT_MS,
  fetch: (url, init) =>
    globalThis.fetch(url, {
      ...init,
      cache: 'force-cache',
      next: {
        revalidate: 60,
      },
    }),
  // Reduce noisy logs in development; can be overridden via env
  logLevel,
});

/**
 * No-store ProtoPedia client for SHOW and other upstream-only paths.
 *
 * - Uses `cache: 'no-store'` with `next.revalidate: 0`, bypassing the
 *   Next.js Data Cache and always hitting the upstream API.
 * - Intended for interactive paths (e.g., SHOW-by-ID) where the caller
 *   prefers the freshest possible data even at the cost of more network
 *   traffic.
 *
 * This client still applies the request timeout to avoid hanging requests
 * when the upstream is unresponsive.
 *
 * Backs the legacy (SDK-based) no-store path via
 * `fetchPrototypesViaNoStoreClient`, which `fetchPrototypesNoStore` in
 * `@/app/actions/prototypes-gateway` dispatches to when
 * `USE_PROMIDAS_REPOSITORY` is disabled. The promidas counterpart is
 * `promidasNoStoreClient` in `@/lib/promidas-no-store-client`.
 */
export const protopediaNoStoreClient = createProtoPediaClient({
  token: validToken,
  baseUrl,
  timeoutMs: REQUEST_TIMEOUT_MS,
  fetch: (url, init) =>
    globalThis.fetch(url, {
      ...init,
      cache: 'no-store',
      next: {
        revalidate: 0,
      },
    }),
  logLevel,
});
