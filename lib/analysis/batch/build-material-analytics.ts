/**
 * @fileoverview
 * Material-centric batch analytics. Provides rankings and raw histogram counts.
 */

import type { NormalizedPrototype } from '@/lib/api/prototypes';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

export type MaterialAnalytics = {
  topMaterials: Array<{ material: string; count: number }>;
  materialCounts: Record<string, number>;
};

const TOP_MATERIAL_LIMIT = 30;

/**
 * Aggregates material frequency, returning ranked results and the complete histogram.
 */
export function buildMaterialAnalytics(
  prototypes: NormalizedPrototype[],
  options?: { logger?: MinimalLogger },
): MaterialAnalytics {
  const startTime = Date.now();
  const materialCounts: Record<string, number> = {};

  prototypes.forEach((prototype) => {
    if (prototype.materials && Array.isArray(prototype.materials)) {
      prototype.materials.forEach((material) => {
        materialCounts[material] = (materialCounts[material] ?? 0) + 1;
      });
    }
  });

  const topMaterials = Object.entries(materialCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, TOP_MATERIAL_LIMIT)
    .map(([material, count]) => ({ material, count }));

  if (options?.logger) {
    const elapsedMs = Date.now() - startTime;
    options.logger.debug(
      {
        elapsedMs,
        distinctMaterials: Object.keys(materialCounts).length,
        topMaterialCount: topMaterials.length,
        totalSamples: prototypes.length,
      },
      '[ANALYSIS] Built material analytics',
    );
  }

  return { topMaterials, materialCounts };
}
