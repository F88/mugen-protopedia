/**
 * @fileoverview
 * To-be-batched: Single-purpose inefficient top materials analysis.
 *
 * This function is kept for compatibility and will be refactored into a batch process.
 */
import type { NormalizedPrototype } from '../../api/prototypes';

/**
 * Aggregates material frequency, returning both the raw counts and the top materials sorted by usage.
 *
 * @deprecated Should be batched with other analysis.
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Object containing top materials array and complete material counts map.
 */
export function buildTopMaterials(prototypes: NormalizedPrototype[]): {
  topMaterials: Array<{ material: string; count: number }>;
  materialCounts: Record<string, number>;
} {
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
  return { topMaterials, materialCounts };
}
