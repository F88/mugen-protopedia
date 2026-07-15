/**
 * @fileoverview
 * Shared date-window filtering for period-aware batch analytics
 * (e.g. {@link buildTopMaterialsInRange}, {@link buildTopTagsInRange}). Keeps
 * the "which prototypes fall in [from, to]" logic in one place so material and
 * tag rankings stay consistent.
 */

import type { PrototypeForMpp } from '@/lib/api/prototypes';

/** Which lifecycle date places a prototype on the timeline. */
export type PrototypeDateField = 'release' | 'create' | 'update';

/**
 * Builds a predicate that tests whether a prototype's date falls within the
 * `[from, to]` window (both inclusive, both optional).
 *
 * The prototype is dated ONLY by the selected `dateField` (default
 * `'release'`); there is deliberately no cross-field fallback. Falling back to
 * another date (e.g. `createDate` when `releaseDate` is missing) would place an
 * un-released prototype into a "released in [from, to]" window and corrupt the
 * result.
 *
 * - When BOTH `from` and `to` are omitted, every prototype passes even if it
 *   has no usable date (an all-time pass).
 * - When either bound is set, a prototype whose selected date is missing or
 *   malformed is excluded (it cannot be placed in the window).
 */
export function createDateRangeFilter(options?: {
  from?: Date;
  to?: Date;
  dateField?: PrototypeDateField;
}): (prototype: PrototypeForMpp) => boolean {
  const dateField = options?.dateField ?? 'release';
  const fromMs = options?.from?.getTime() ?? null;
  const toMs = options?.to?.getTime() ?? null;
  const isUnbounded = fromMs == null && toMs == null;

  return (prototype: PrototypeForMpp): boolean => {
    if (isUnbounded) return true;

    const dateStr =
      dateField === 'create'
        ? prototype.createDate
        : dateField === 'update'
          ? prototype.updateDate
          : prototype.releaseDate;
    if (dateStr == null) return false;

    const time = new Date(dateStr).getTime();
    if (Number.isNaN(time)) return false;
    if (fromMs != null && time < fromMs) return false;
    if (toMs != null && time > toMs) return false;
    return true;
  };
}
