/**
 * @fileoverview
 * To-be-batched: Single-purpose inefficient status distribution analysis.
 *
 * This function is kept for compatibility and will be refactored into a batch process.
 */
import type { NormalizedPrototype } from '../../api/prototypes';

/**
 * Builds a histogram of prototype statuses, falling back to 'unknown' when a status code is missing.
 *
 * @deprecated Should be batched with other analysis.
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Status distribution map (status code/string → count).
 */
export function buildStatusDistribution(
  prototypes: NormalizedPrototype[],
): Record<string, number> {
  const distribution: Record<string, number> = {};
  prototypes.forEach((prototype) => {
    const status = prototype.status ?? 'unknown';
    distribution[status] = (distribution[status] ?? 0) + 1;
  });
  return distribution;
}
