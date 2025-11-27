/**
 * @fileoverview
 * To-be-batched: Single-purpose inefficient top tags analysis.
 *
 * This function is kept for compatibility and will be refactored into a batch process.
 */
import type { NormalizedPrototype } from '../../api/prototypes';

/**
 * Aggregates tag frequency, returning both the raw counts and the top tags sorted by usage.
 *
 * @deprecated Should be batched with other analysis.
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Object containing top tags array and complete tag counts map.
 */
export function buildTopTags(prototypes: NormalizedPrototype[]): {
  topTags: Array<{ tag: string; count: number }>;
  tagCounts: Record<string, number>;
} {
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
  return { topTags, tagCounts };
}
