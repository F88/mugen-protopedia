/**
 * @fileoverview
 * To-be-batched: Single-purpose inefficient awards count analysis.
 *
 * This function is kept for compatibility and will be refactored into a batch process.
 */
import type { NormalizedPrototype } from '../../api/prototypes';

/**
 * Counts how many prototypes include at least one award entry.
 *
 * @deprecated Should be batched with other analysis.
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Count of prototypes with at least one award.
 */
export function countPrototypesWithAwards(
  prototypes: NormalizedPrototype[],
): number {
  return prototypes.filter(
    (prototype) => prototype.awards && prototype.awards.length > 0,
  ).length;
}
