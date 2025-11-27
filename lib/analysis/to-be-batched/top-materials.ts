/**
 * @fileoverview
 * To-be-batched: Single-purpose inefficient top materials analysis.
 *
 * This function is kept for compatibility and will be refactored into a batch process.
 */
import type { NormalizedPrototype } from '../../api/prototypes';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

/**
 * Aggregates material frequency, returning both the raw counts and the top materials sorted by usage.
 *
 * @deprecated Should be batched with other analysis.
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Object containing top materials array and complete material counts map.
 */
export function buildTopMaterials(
  prototypes: NormalizedPrototype[],
  options?: { logger?: MinimalLogger },
): {
  topMaterials: Array<{ material: string; count: number }>;
  materialCounts: Record<string, number>;
} {
  const startTime = performance.now();
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
    .slice(0, 30)
    .map(([material, count]) => ({ material, count }));
  if (options?.logger) {
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
    options.logger.debug(
      {
        elapsedMs,
        distinctMaterials: Object.keys(materialCounts).length,
        topMaterialCount: topMaterials.length,
        totalSamples: prototypes.length,
      },
      '[ANALYSIS] Built top materials',
    );
  }
  return { topMaterials, materialCounts };
}
