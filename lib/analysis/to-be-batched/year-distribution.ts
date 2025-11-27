/**
 * @fileoverview
 * To-be-batched: Year distribution analysis for prototypes.
 *
 * This function is kept for compatibility and will be refactored into a batch process.
 */

import type { NormalizedPrototype } from '../../api/prototypes';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

/**
 * Buckets prototypes by release year (UTC) while filtering out invalid years.
 *
 * @deprecated Should be batched with other analysis.
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Year distribution map (year → count).
 */
export function buildYearDistribution(
  prototypes: NormalizedPrototype[],
  options?: { logger?: MinimalLogger },
): Record<number, number> {
  const startTime = performance.now();
  const distribution: Record<number, number> = {};
  prototypes.forEach((prototype) => {
    const year = new Date(prototype.releaseDate).getFullYear();
    if (!Number.isNaN(year) && year > 1900) {
      distribution[year] = (distribution[year] ?? 0) + 1;
    }
  });
  if (options?.logger) {
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
    options.logger.debug(
      {
        elapsedMs,
        distinctYears: Object.keys(distribution).length,
        totalSamples: prototypes.length,
      },
      '[ANALYSIS] Built year distribution',
    );
  }
  return distribution;
}
