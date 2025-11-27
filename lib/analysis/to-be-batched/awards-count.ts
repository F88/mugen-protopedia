/**
 * @fileoverview
 * To-be-batched: Single-purpose inefficient awards count analysis.
 *
 * This function is kept for compatibility and will be refactored into a batch process.
 */
import type { NormalizedPrototype } from '../../api/prototypes';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

/**
 * Counts how many prototypes include at least one award entry.
 *
 * @deprecated Should be batched with other analysis.
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Count of prototypes with at least one award.
 */
export function countPrototypesWithAwards(
  prototypes: NormalizedPrototype[],
  options?: { logger?: MinimalLogger },
): number {
  const startTime = performance.now();
  const count = prototypes.filter(
    (prototype) => prototype.awards && prototype.awards.length > 0,
  ).length;
  if (options?.logger) {
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
    options.logger.debug(
      {
        elapsedMs,
        totalSamples: prototypes.length,
        prototypesWithAwards: count,
      },
      '[ANALYSIS] Counted prototypes with awards',
    );
  }
  return count;
}
