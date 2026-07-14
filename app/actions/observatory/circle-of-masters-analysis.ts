'use server';

/**
 * @fileoverview Observatory-only "Circle of Masters" data source (per maker).
 *
 * Direction 1 of The Alchemists' Ledger (see
 * docs/observatory/content/the-alchemists-table/the-circle-of-masters.md). Like
 * the Chronicles source, this is intentionally SEPARATE from the base analysis
 * the 無限PP top page depends on: it shares only the raw dataset via
 * `getAllPrototypes()` and runs the Circle builders on demand.
 *
 * The Circle is a thin ranking layer over two builders:
 *
 * - {@link buildUserInsights} — the per-maker aggregate (breadth, tenure, ...).
 * - {@link buildPioneerMaterialsByUser} — the Chronicles' pioneered-materials map,
 *   which powers the Vanguard seat (the Chronicles' Pioneer seen "by maker"). This
 *   is the lightweight path: the Vanguard needs only this map, so the full
 *   per-material Chronicles is not computed here.
 */

import {
  analysisRepository,
  type AnalysisResult,
} from '@/lib/repositories/analysis-repository';
import type { CircleInsights } from '@/lib/observatory/alchemists-table/build-circle-insights';

export type GetCircleOfMastersAnalysisResult = AnalysisResult<CircleInsights>;

/**
 * Compute the Circle of Masters for The Alchemist's Table, via the Analysis
 * Repository. Does not run, or depend on, the base server analysis.
 */
export async function getCircleOfMastersAnalysis(): Promise<GetCircleOfMastersAnalysisResult> {
  return analysisRepository.getCircleOfMastersAnalysis();
}
