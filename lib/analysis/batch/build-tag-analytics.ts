/**
 * @fileoverview
 * Tag-centric batch analytics. Provides rankings and raw histogram counts.
 */

import type { PrototypeForMpp } from '@/lib/api/prototypes';
import {
  createDateRangeFilter,
  type PrototypeDateField,
} from './prototype-date-range';

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
  prototypes: PrototypeForMpp[],
  options?: { logger?: MinimalLogger },
): TagAnalytics {
  const startTime = Date.now();
  const tagCounts: Record<string, number> = {};

  prototypes.forEach((prototype) => {
    if (Array.isArray(prototype.tags)) {
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

/**
 * Ranks the most frequently used tags among prototypes whose date falls within
 * the `[from, to]` window (both inclusive, both optional).
 *
 * This is the period-aware counterpart to {@link buildTagAnalytics}: pass no
 * bounds for an all-time ranking, or `from = now - N days` for a "latest N
 * days" ranking. The return shape matches `topTags` so it can feed the same UI.
 *
 * Date resolution and window semantics follow {@link createDateRangeFilter}:
 * `dateField: 'release'` (default) uses `releaseDate`; an unbounded window
 * counts every prototype, while a bounded window excludes prototypes whose
 * selected date is missing.
 *
 * @param prototypes - Prototypes to analyze.
 * @param options - Optional window, ranking limit, date field, and logger.
 * @returns Ranked `{ tag, count }` entries, most frequent first.
 */
export function buildTopTagsInRange(
  prototypes: PrototypeForMpp[],
  options?: {
    from?: Date;
    to?: Date;
    limit?: number;
    dateField?: PrototypeDateField;
    logger?: MinimalLogger;
  },
): Array<{ tag: string; count: number }> {
  const startTime = Date.now();
  const limit = options?.limit ?? TOP_TAG_LIMIT;
  const dateField = options?.dateField ?? 'release';
  const isInRange = createDateRangeFilter({
    from: options?.from,
    to: options?.to,
    dateField,
  });

  const tagCounts: Record<string, number> = {};
  let matchedCount = 0;

  prototypes.forEach((prototype) => {
    if (!isInRange(prototype)) return;
    matchedCount += 1;
    if (Array.isArray(prototype.tags)) {
      prototype.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      });
    }
  });

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));

  if (options?.logger) {
    const elapsedMs = Date.now() - startTime;
    options.logger.debug(
      {
        elapsedMs,
        fromISO: options?.from?.toISOString() ?? null,
        toISO: options?.to?.toISOString() ?? null,
        dateField,
        matchedCount,
        distinctTags: Object.keys(tagCounts).length,
        topTagCount: topTags.length,
        totalSamples: prototypes.length,
      },
      '[ANALYSIS] Built top tags in range',
    );
  }

  return topTags;
}
