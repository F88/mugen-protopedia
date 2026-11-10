/** Default limit for a whole ProtoPedia API request, in milliseconds. */
export const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

/**
 * Resolve the `timeoutMs` passed to the ProtoPedia API clients.
 *
 * The limit covers a whole request, from the start of the connection until the
 * response body has been received. Override it with
 * `PROTOPEDIA_API_V2_TIMEOUT_MS` (e.g. on a slow development connection).
 *
 * Anything but a positive integer falls back to the default: the SDK treats `0`
 * as "no timeout", so a misconfigured value must not disable it.
 */
export function getRequestTimeoutMs(): number {
  const raw = process.env.PROTOPEDIA_API_V2_TIMEOUT_MS;
  if (raw === undefined) {
    return DEFAULT_REQUEST_TIMEOUT_MS;
  }
  const value = Number(raw);
  return Number.isInteger(value) && value > 0
    ? value
    : DEFAULT_REQUEST_TIMEOUT_MS;
}
