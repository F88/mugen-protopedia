/**
 * @fileoverview
 * Shared helpers for release-date keyed aggregations such as unique day counts.
 */

import type { NormalizedPrototype } from '@/lib/api/prototypes';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

export type DateBasedReleaseInsights = {
  uniqueReleaseDates: Set<string>;
};

/**
 * Initializes the aggregation container for daily release insights.
 */
export function createDateBasedReleaseInsights(): DateBasedReleaseInsights {
  return {
    uniqueReleaseDates: new Set<string>(),
  };
}

/**
 * Tracks a release taking place at the provided JST date by recording the YYYY-MM-DD string.
 */
export function trackDateBasedReleaseInsights(
  insights: DateBasedReleaseInsights,
  jstDate: Date,
): void {
  const year = jstDate.getUTCFullYear();
  if (Number.isNaN(year)) {
    return;
  }
  const month = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(jstDate.getUTCDate()).padStart(2, '0');
  insights.uniqueReleaseDates.add(`${year}-${month}-${day}`);
}

/**
 * Builds release-date keyed insights (e.g., unique JST dates) in a single pass.
 */
export function buildDateBasedReleaseInsights(
  prototypes: NormalizedPrototype[],
  options?: { logger?: MinimalLogger },
): DateBasedReleaseInsights {
  const startTime = performance.now();
  const insights = createDateBasedReleaseInsights();

  prototypes.forEach((prototype) => {
    if (!prototype.releaseDate) {
      return;
    }
    const releaseDate = new Date(prototype.releaseDate);
    if (Number.isNaN(releaseDate.getTime())) {
      return;
    }
    const jstDate = new Date(releaseDate.getTime() + JST_OFFSET_MS);
    trackDateBasedReleaseInsights(insights, jstDate);
  });

  if (options?.logger) {
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
    options.logger.debug(
      {
        elapsedMs,
        uniqueReleaseDates: insights.uniqueReleaseDates.size,
      },
      '[ANALYSIS] Date-based release insights computed',
    );
  }

  return insights;
}
