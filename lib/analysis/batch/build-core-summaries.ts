/**
 * @fileoverview
 * Core batch summaries for dashboard header metrics.
 *
 * Provides status distribution, awards count, and average age calculations in
 * a single pass over normalized prototypes.
 */

import type { NormalizedPrototype } from '@/lib/api/prototypes';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

export type CoreSummaries = {
  statusDistribution: Record<string, number>;
  prototypesWithAwards: number;
  averageAgeInDays: number;
  validAgeSampleCount: number;
};

/**
 * Computes core dashboard metrics in a single traversal.
 */
export function buildCoreSummaries(
  prototypes: NormalizedPrototype[],
  options?: { referenceDate?: Date; logger?: MinimalLogger },
): CoreSummaries {
  const startTime = performance.now();
  const referenceDate = options?.referenceDate ?? new Date();

  const statusDistribution: Record<string, number> = {};
  let prototypesWithAwards = 0;
  let ageTotal = 0;
  let validAgeSampleCount = 0;

  prototypes.forEach((prototype) => {
    const statusKey = (prototype.status ?? 'unknown') as string | number;
    statusDistribution[String(statusKey)] =
      (statusDistribution[String(statusKey)] ?? 0) + 1;

    if (prototype.awards && prototype.awards.length > 0) {
      prototypesWithAwards += 1;
    }

    if (prototype.releaseDate) {
      const releaseTimestamp = Date.parse(prototype.releaseDate);
      if (!Number.isNaN(releaseTimestamp)) {
        const ageInDays =
          (referenceDate.getTime() - releaseTimestamp) / (1000 * 60 * 60 * 24);
        if (ageInDays >= 0) {
          ageTotal += ageInDays;
          validAgeSampleCount += 1;
        }
      }
    }
  });

  const averageAgeInDays =
    validAgeSampleCount > 0 ? ageTotal / validAgeSampleCount : 0;

  if (options?.logger) {
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
    options.logger.debug(
      {
        elapsedMs,
        totalSamples: prototypes.length,
        validAgeSamples: validAgeSampleCount,
        distinctStatuses: Object.keys(statusDistribution).length,
        prototypesWithAwards,
        averageAgeInDays,
      },
      '[ANALYSIS] Built core summaries',
    );
  }

  return {
    statusDistribution,
    prototypesWithAwards,
    averageAgeInDays,
    validAgeSampleCount,
  };
}
