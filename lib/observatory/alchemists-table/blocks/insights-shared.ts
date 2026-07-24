/**
 * @fileoverview Shared helpers for the Observatory-only insight builders
 * (`build-user-insights`, `build-chronicles-insights`, `build-circle-insights`).
 *
 * Extracted so the date basis, JST year, array coercion, and "top-N with ties"
 * logic have a single source of truth — a fix here (e.g. the JST year rule)
 * applies to every builder at once, rather than drifting between copies.
 */
import type { PrototypeForMpp } from '@/lib/api/prototypes';
import { createLifecycleMomentContext } from '@/lib/analysis/lifecycle';

/** Minimal logger accepted by the insight builders (structured debug only). */
export type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

/** A readonly string-array field coerced to a plain array (`[]` when absent). */
export function asArray(value: readonly string[] | undefined): string[] {
  return Array.isArray(value) ? [...value] : [];
}

/**
 * A maker's activity date for a prototype: `createDate` first (tenure basis),
 * falling back to `releaseDate`, else `''`. Deliberately different from material
 * trend code, which keys on the public `releaseDate`.
 */
export function activityDate(prototype: PrototypeForMpp): string {
  return prototype.createDate || prototype.releaseDate || '';
}

/**
 * JST calendar year of an ISO date string, or `NaN`. Observatory analysis is
 * JST-aligned, so this defers to the shared lifecycle helper — deterministic
 * across machines, unlike `new Date().getFullYear()`.
 */
export function jstYear(date: string): number {
  return createLifecycleMomentContext(date)?.year ?? NaN;
}

/**
 * JST calendar month (`YYYY-MM`) of an ISO date string, or `null`. Same JST
 * basis as {@link jstYear}: derive month keys from this — never from
 * `Date#getMonth` (runtime-TZ dependent) or raw ISO string slicing (UTC).
 */
export function jstYearMonth(date: string): string | null {
  return createLifecycleMomentContext(date)?.yyyymmdd.slice(0, 7) ?? null;
}

/**
 * Take the top `size` items from an ALREADY-sorted list, then keep going while
 * the next item ties the boundary item's value — so "top 5" can return 6+.
 */
export function takeWithTies<T>(
  sorted: T[],
  size: number,
  valueOf: (item: T) => number | string,
): T[] {
  if (sorted.length <= size) return sorted;
  const boundary = valueOf(sorted[size - 1]);
  const out: T[] = [];
  for (const item of sorted) {
    if (out.length < size || valueOf(item) === boundary) out.push(item);
    else break;
  }
  return out;
}
