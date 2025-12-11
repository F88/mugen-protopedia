/**
 * Shared time utilities for ProtoPedia data normalization.
 *
 * Convert upstream timestamps into UTC ISO strings so downstream consumers can
 * treat them as timezone-agnostic. Update this module when ProtoPedia changes
 * how it annotates offsets.
 */
export const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * Parse ProtoPedia timestamp (JST without explicit timezone offset).
 *
 * ProtoPedia timestamps are JST-based timestamps without explicit timezone offset.
 * Format: `YYYY-MM-DD HH:MM:SS.f+` (space separator, fractional seconds required)
 *
 * @param value - String to parse
 * @returns UTC ISO string if valid ProtoPedia timestamp, undefined otherwise
 */
export function parseAsProtoPediaTimestamp(value: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})\.(\d+)$/,
  );

  if (!match) {
    return undefined;
  }

  const [, y, m, d, hh, mm, ss, fractional] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  const hour = Number(hh);
  const minute = Number(mm);
  const second = Number(ss);
  // Fractional seconds are required in the format
  const padded = fractional.padEnd(3, '0').slice(0, 3);
  const milli = Number(padded);

  if (
    [year, month, day, hour, minute, second, milli].some((part) =>
      Number.isNaN(part),
    )
  ) {
    return undefined;
  }
  // ProtoPedia の既存レスポンスは JST 起点でなので、UTC へ換算するために固定オフセットを引く
  const utcMs =
    Date.UTC(year, month - 1, day, hour, minute, second, milli) - JST_OFFSET_MS;
  if (!Number.isFinite(utcMs)) {
    return undefined;
  }

  const iso = new Date(utcMs).toISOString();
  return iso;
}

/**
 * Parse ISO 8601 timestamp with explicit timezone offset.
 *
 * Accepts formats with explicit timezone:
 * - `YYYY-MM-DDTHH:MM:SSZ` (UTC)
 * - `YYYY-MM-DDTHH:MM:SS+HH:MM` (with offset)
 * - `YYYY-MM-DDTHH:MM:SS-HH:MM` (with offset)
 *
 * @param value - String to parse (should have T separator)
 * @returns UTC ISO string if valid, undefined otherwise
 */
export function parseAsIso8601(value: string): string | undefined {
  if (!value) {
    return undefined;
  }

  // Check for explicit timezone offset
  const hasOffset = value.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(value);

  if (!hasOffset) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}

/**
 * Normalize ProtoPedia timestamps to UTC ISO strings.
 *
 * Supports:
 * - ProtoPedia format: `YYYY-MM-DD HH:MM:SS.f+` (JST, space separator, fractional seconds required)
 * - ISO 8601 with explicit timezone: `YYYY-MM-DDTHH:MM:SS[.f+]Z` or with offset
 *
 * @param value - Timestamp string, null, or undefined from API response
 * @returns
 *   - UTC ISO string for valid JST or ISO 8601 timestamps
 *   - `null` if input is `null` (preserves explicit null)
 *   - `undefined` if input is `undefined` (preserves field absence)
 *   - Input value as-is if string cannot be parsed (allows downstream handling)
 */
export function normalizeProtoPediaTimestamp(
  value: string | null | undefined,
): string | null | undefined {
  if (value === null) {
    return null;
  }
  if (value === undefined) {
    return undefined;
  }

  const protoPediaResult = parseAsProtoPediaTimestamp(value);
  if (protoPediaResult !== undefined) {
    return protoPediaResult;
  }

  const iso8601Result = parseAsIso8601(value);
  if (iso8601Result !== undefined) {
    return iso8601Result;
  }

  return value;
}
