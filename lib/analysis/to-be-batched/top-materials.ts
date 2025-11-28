/**
 * @fileoverview
 * To-be-batched: Single-purpose inefficient top materials analysis.
 *
 * This function is kept for compatibility and will be refactored into a batch process.
 */
import type { NormalizedPrototype } from '../../api/prototypes';
import { buildMaterialAnalytics } from '../batch/build-material-analytics';

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
  return buildMaterialAnalytics(prototypes, options);
}
