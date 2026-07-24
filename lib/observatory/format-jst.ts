/**
 * @fileoverview JST formatting for Observatory UI output.
 *
 * Observatory pages are server components (often ISR), so `toLocale*` calls
 * without an explicit `timeZone` format in the SERVER's zone — UTC in
 * production, the dev machine's zone locally. That is how UTC timestamps
 * leaked into the UI (e.g. The Star Alignment) while looking correct in
 * local development.
 *
 * Observatory policy: both computation and UI output are JST-based,
 * independent of the runtime environment. Every date/time rendered in an
 * Observatory page must go through {@link formatInJst} instead of calling
 * `toLocaleString` / `toLocaleDateString` / `toLocaleTimeString` directly.
 * See docs/observatory/observatory-architecture.md.
 *
 * Counterpart note: the home page analysis dashboard intentionally renders in
 * the VIEWER's local time zone — do not use this helper there.
 */

export const JST_TIME_ZONE = 'Asia/Tokyo';

/**
 * Formats a timestamp in JST regardless of the runtime's time zone.
 *
 * Locale and format options stay with the caller (Observatory pages have
 * design freedom in how they present dates); this helper only pins the time
 * zone. Passing only date parts renders a date, only time parts renders a
 * time, and no options renders the locale's full date+time — mirroring the
 * `toLocaleDateString` / `toLocaleTimeString` / `toLocaleString` trio.
 *
 * @param value - Timestamp to format. Normalized prototype timestamps are UTC
 *   ISO strings; `Date` instances and epoch millis are also accepted.
 * @param locale - BCP 47 locale tag (e.g. 'ja-JP', 'en-CA').
 * @param options - `Intl.DateTimeFormatOptions` except `timeZone`, which is
 *   always forced to JST.
 * @returns The formatted string, or `null` when `value` is `null`/`undefined`
 *   or unparseable (e.g. a prototype without a releaseDate) so the caller
 *   chooses the placeholder.
 */
export function formatInJst(
  value: string | number | Date | null | undefined,
  locale: string,
  options?: Omit<Intl.DateTimeFormatOptions, 'timeZone'>,
): string | null {
  if (value == null) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleString(locale, { ...options, timeZone: JST_TIME_ZONE });
}
