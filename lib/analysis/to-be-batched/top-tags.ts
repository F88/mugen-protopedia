/**
 * @fileoverview
 * To-be-batched: Single-purpose inefficient top tags analysis.
 *
 * This function is kept for compatibility and will be refactored into a batch process.
 */
import type { NormalizedPrototype } from '../../api/prototypes';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

/**
 * Aggregates tag frequency, returning both the raw counts and the top tags sorted by usage.
 *
 * @deprecated Should be batched with other analysis.
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Object containing top tags array and complete tag counts map.
 */
export function buildTopTags(
  prototypes: NormalizedPrototype[],
  options?: { logger?: MinimalLogger },
): {
  topTags: Array<{ tag: string; count: number }>;
  tagCounts: Record<string, number>;
} {
  const startTime = performance.now();
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
    .slice(0, 30)
    .map(([tag, count]) => ({ tag, count }));
  if (options?.logger) {
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
    options.logger.debug(
      {
        elapsedMs,
        distinctTags: Object.keys(tagCounts).length,
        topTagCount: topTags.length,
        totalSamples: prototypes.length,
      },
      '[ANALYSIS] Built top tags',
    );
  }
  return { topTags, tagCounts };
}
