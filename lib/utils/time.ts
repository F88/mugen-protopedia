/**
 * Shared time utilities for ProtoPedia data normalization.
 *
 * Convert upstream timestamps into UTC ISO strings so downstream consumers can
 * treat them as timezone-agnostic. Update this module when ProtoPedia changes
 * how it annotates offsets.
 */
export const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * Normalize ProtoPedia timestamps to UTC ISO strings.
 *
 * Supports both current JST-without-offset values and potential future shapes
 * that include explicit offsets or UTC markers. Update this function when the
 * upstream representation changes.
 */
export function normalizeProtoPediaTimestamp(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }

  const isoCandidate = trimmed.includes('T')
    ? trimmed
    : trimmed.replace(' ', 'T');

  const hasExplicitOffset =
    isoCandidate.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(isoCandidate);

  if (hasExplicitOffset) {
    const parsedWithOffset = new Date(isoCandidate);
    if (!Number.isNaN(parsedWithOffset.getTime())) {
      return parsedWithOffset.toISOString();
    }
  }

  const match = isoCandidate.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/,
  );

  if (!match) {
    return null;
  }

  const [, y, m, d, hh, mm, ss, fractional] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  const hour = Number(hh);
  const minute = Number(mm);
  const second = Number(ss);
  const milli = (() => {
    if (!fractional) {
      return 0;
    }
    const padded = `${fractional}`.padEnd(3, '0').slice(0, 3);
    const parsed = Number(padded);
    return Number.isNaN(parsed) ? 0 : parsed;
  })();

  if (
    [year, month, day, hour, minute, second].some((part) => Number.isNaN(part))
  ) {
    return null;
  }

  // ProtoPedia の既存レスポンスは JST 起点で、UTC へ換算するために固定オフセットを引く
  const utcMs =
    Date.UTC(year, month - 1, day, hour, minute, second, milli) - JST_OFFSET_MS;
  if (!Number.isFinite(utcMs)) {
    return null;
  }

  const iso = new Date(utcMs).toISOString();
  return iso;
}
