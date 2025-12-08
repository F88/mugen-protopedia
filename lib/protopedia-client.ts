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
 */
import {
  createProtoPediaClient,
  ProtoPediaApiError,
} from 'protopedia-api-v2-client';
import { logger as baseLogger } from '@/lib/logger.server';

/**
 * Timeout for establishing a connection and receiving response headers.
 *
 * This timeout covers:
 * 1. DNS resolution
 * 2. TCP connection establishment
 * 3. TLS handshake
 * 4. Request transmission
 * 5. Server processing time (TTFB)
 * 6. Receiving response headers
 *
 * It does NOT cover the time required to download the response body.
 * This ensures we fail fast if the server is unresponsive, while allowing
 * large payloads (e.g., 20MB JSON) to download even if it takes longer than this threshold.
 */
const CONNECTION_AND_HEADER_TIMEOUT_MS = 30_000;

const accessToken = process.env.PROTOPEDIA_API_V2_TOKEN;
const baseUrl = process.env.PROTOPEDIA_API_V2_BASE_URL;
const logLevel =
  (process.env.PROTOPEDIA_API_V2_LOG_LEVEL as
    | 'silent'
    | 'error'
    | 'warn'
    | 'info'
    | 'debug'
    | undefined) ?? 'error';

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
  fetch: async (url, init) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      CONNECTION_AND_HEADER_TIMEOUT_MS,
    );
    try {
      return await globalThis.fetch(url, {
        ...init,
        signal: controller.signal,
        cache: 'force-cache',
        next: {
          revalidate: 60,
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }
  },
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
 * This client still benefits from connection / header timeouts to avoid
 * hanging requests when the upstream is unresponsive.
 */
export const protopediaNoStoreClient = createProtoPediaClient({
  token: validToken,
  baseUrl,
  fetch: async (url, init) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      CONNECTION_AND_HEADER_TIMEOUT_MS,
    );
    try {
      return await globalThis.fetch(url, {
        ...init,
        signal: controller.signal,
        cache: 'no-store',
        next: {
          revalidate: 0,
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }
  },
  logLevel,
});
