/**
 * @fileoverview
 * To-be-batched: Single-purpose inefficient average age calculation.
 *
 * This function is kept for compatibility and will be refactored into a batch process.
 */
import type { NormalizedPrototype } from '../../api/prototypes';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

/**
 * Computes the average age in days of all prototypes relative to the supplied reference date, skipping invalid or future-dated entries.
 *
 * @deprecated Should be batched with other analysis.
 * @param prototypes - Array of normalized prototypes to analyze.
 * @param referenceDate - Date to measure age against (typically "now").
 * @returns Average age in days; 0 if no valid prototypes.
 */
export function computeAverageAgeInDays(
  prototypes: NormalizedPrototype[],
  referenceDate: Date,
  options?: { logger?: MinimalLogger },
): number {
  const startTime = performance.now();
  let total = 0;
  let validCount = 0;
  prototypes.forEach((prototype) => {
    const releaseDate = new Date(prototype.releaseDate);
    const ageInDays =
      (referenceDate.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
    if (!Number.isNaN(ageInDays) && ageInDays >= 0) {
      total += ageInDays;
      validCount += 1;
    }
  });
  if (validCount === 0) {
    if (options?.logger) {
      const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
      options.logger.debug(
        {
          elapsedMs,
          validSamples: 0,
          totalSamples: prototypes.length,
        },
        '[ANALYSIS] Computed average age in days',
      );
    }
    return 0;
  }
  const average = total / validCount;
  if (options?.logger) {
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
    options.logger.debug(
      {
        elapsedMs,
        validSamples: validCount,
        totalSamples: prototypes.length,
        averageAgeInDays: average,
      },
      '[ANALYSIS] Computed average age in days',
    );
  }
  return average;
}
