/**
 * @fileoverview
 * Tag-centric batch analytics. Provides rankings and raw histogram counts.
 */

import type { NormalizedPrototype } from '@/lib/api/prototypes';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

export type TagAnalytics = {
  topTags: Array<{ tag: string; count: number }>;
  tagCounts: Record<string, number>;
};

const TOP_TAG_LIMIT = 30;

/**
 * Aggregates tag frequency and returns ranked results alongside raw counts.
 */
export function buildTagAnalytics(
  prototypes: NormalizedPrototype[],
  options?: { logger?: MinimalLogger },
): TagAnalytics {
  const startTime = Date.now();
  const tagCounts: Record<string, number> = {};

  prototypes.forEach((prototype) => {
    if (prototype.tags && Array.isArray(prototype.tags)) {
      prototype.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      });
    }
  });

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, TOP_TAG_LIMIT)
    .map(([tag, count]) => ({ tag, count }));

  if (options?.logger) {
    const elapsedMs = Date.now() - startTime;
    options.logger.debug(
      {
        elapsedMs,
        distinctTags: Object.keys(tagCounts).length,
        topTagCount: topTags.length,
        totalSamples: prototypes.length,
      },
      '[ANALYSIS] Built tag analytics',
    );
  }

  return { topTags, tagCounts };
}
