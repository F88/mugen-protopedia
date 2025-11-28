/**
 * @fileoverview
 * To-be-batched: Single-purpose inefficient top tags analysis.
 *
 * This function is kept for compatibility and will be refactored into a batch process.
 */
import type { NormalizedPrototype } from '../../api/prototypes';
import { buildTagAnalytics } from '../batch/build-tag-analytics';

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
  return buildTagAnalytics(prototypes, options);
}
