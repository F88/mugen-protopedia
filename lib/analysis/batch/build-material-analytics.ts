/**
 * @fileoverview
 * Material-centric batch analytics. Provides rankings and raw histogram counts.
 */

import type { PrototypeForMpp } from '@/lib/api/prototypes';
import {
  createDateRangeFilter,
  type PrototypeDateField,
} from './prototype-date-range';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

export type MaterialAnalytics = {
  topMaterials: Array<{ material: string; count: number }>;
  materialCounts: Record<string, number>;
  yearlyTopMaterials: Record<
    number,
    Array<{ material: string; count: number }>
  >;
};

const TOP_MATERIAL_LIMIT = 30;

/**
 * Aggregates material frequency, returning ranked results and the complete histogram.
 */
export function buildMaterialAnalytics(
  prototypes: PrototypeForMpp[],
  options?: { logger?: MinimalLogger },
): MaterialAnalytics {
  const startTime = Date.now();
  const materialCounts: Record<string, number> = {};
  const yearlyMaterialCounts: Record<number, Record<string, number>> = {};

  prototypes.forEach((prototype) => {
    // Determine the year for the prototype.
    // Prefer releaseDate, fallback to createDate.
    const dateStr = prototype.releaseDate || prototype.createDate;
    const year = dateStr ? new Date(dateStr).getFullYear() : NaN;

    if (prototype.materials && Array.isArray(prototype.materials)) {
      prototype.materials.forEach((material) => {
        // Global aggregation
        materialCounts[material] = (materialCounts[material] ?? 0) + 1;

        // Yearly aggregation
        if (!isNaN(year)) {
          if (!yearlyMaterialCounts[year]) {
            yearlyMaterialCounts[year] = {};
          }
          yearlyMaterialCounts[year][material] =
            (yearlyMaterialCounts[year][material] ?? 0) + 1;
        }
      });
    }
  });

  const topMaterials = Object.entries(materialCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, TOP_MATERIAL_LIMIT)
    .map(([material, count]) => ({ material, count }));

  const yearlyTopMaterials: Record<
    number,
    Array<{ material: string; count: number }>
  > = {};

  Object.entries(yearlyMaterialCounts).forEach(([yearStr, counts]) => {
    const year = parseInt(yearStr, 10);
    yearlyTopMaterials[year] = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, TOP_MATERIAL_LIMIT)
      .map(([material, count]) => ({ material, count }));
  });

  if (options?.logger) {
    const elapsedMs = Date.now() - startTime;
    options.logger.debug(
      {
        elapsedMs,
        distinctMaterials: Object.keys(materialCounts).length,
        topMaterialCount: topMaterials.length,
        yearlyDataPoints: Object.keys(yearlyTopMaterials).length,
        totalSamples: prototypes.length,
      },
      '[ANALYSIS] Built material analytics',
    );
  }

  return { topMaterials, materialCounts, yearlyTopMaterials };
}

/**
 * Ranks the most frequently used materials among prototypes whose date falls
 * within the `[from, to]` window (both inclusive, both optional).
 *
 * This is the period-aware counterpart to {@link buildMaterialAnalytics}: pass
 * no bounds for an all-time ranking, or `from = now - N days` for a "latest N
 * days" ranking. The return shape matches `topMaterials` so it can feed the
 * same UI.
 *
 * Date resolution and window semantics follow {@link createDateRangeFilter}:
 * `dateField: 'release'` (default) uses `releaseDate` (falling back to
 * `createDate`); an unbounded window counts every prototype, while a bounded
 * window excludes prototypes with no usable date.
 *
 * @param prototypes - Prototypes to analyze.
 * @param options - Optional window, ranking limit, date field, and logger.
 * @returns Ranked `{ material, count }` entries, most frequent first.
 */
export function buildTopMaterialsInRange(
  prototypes: PrototypeForMpp[],
  options?: {
    from?: Date;
    to?: Date;
    limit?: number;
    dateField?: PrototypeDateField;
    logger?: MinimalLogger;
  },
): Array<{ material: string; count: number }> {
  const startTime = Date.now();
  const limit = options?.limit ?? TOP_MATERIAL_LIMIT;
  const dateField = options?.dateField ?? 'release';
  const isInRange = createDateRangeFilter({
    from: options?.from,
    to: options?.to,
    dateField,
  });

  const materialCounts: Record<string, number> = {};
  let matchedCount = 0;

  prototypes.forEach((prototype) => {
    if (!isInRange(prototype)) return;
    matchedCount += 1;
    if (prototype.materials && Array.isArray(prototype.materials)) {
      prototype.materials.forEach((material) => {
        materialCounts[material] = (materialCounts[material] ?? 0) + 1;
      });
    }
  });

  const topMaterials = Object.entries(materialCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([material, count]) => ({ material, count }));

  if (options?.logger) {
    const elapsedMs = Date.now() - startTime;
    options.logger.debug(
      {
        elapsedMs,
        fromISO: options?.from?.toISOString() ?? null,
        toISO: options?.to?.toISOString() ?? null,
        dateField,
        matchedCount,
        distinctMaterials: Object.keys(materialCounts).length,
        topMaterialCount: topMaterials.length,
        totalSamples: prototypes.length,
      },
      '[ANALYSIS] Built top materials in range',
    );
  }

  return topMaterials;
}
