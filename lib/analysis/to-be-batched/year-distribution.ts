/**
 * @fileoverview
 * To-be-batched: Year distribution analysis for prototypes.
 *
 * This function is kept for compatibility and will be refactored into a batch process.
 */

import type { NormalizedPrototype } from '../../api/prototypes';

/**
 * Buckets prototypes by release year (UTC) while filtering out invalid years.
 *
 * @deprecated Should be batched with other analysis.
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Year distribution map (year → count).
 */
export function buildYearDistribution(
  prototypes: NormalizedPrototype[],
): Record<number, number> {
  const distribution: Record<number, number> = {};
  prototypes.forEach((prototype) => {
    const year = new Date(prototype.releaseDate).getFullYear();
    if (!Number.isNaN(year) && year > 1900) {
      distribution[year] = (distribution[year] ?? 0) + 1;
    }
  });
  return distribution;
}
