'use server';

/**
 * @fileoverview Observatory-only material analytics data source.
 *
 * This is intentionally SEPARATE from the base analysis
 * (`buildAnalysisOverview` / `getAnalysisOverview`) that the 無限PP top page
 * depends on: growing that pipeline with Observatory-specific work would bloat it
 * and slow the top page. Here we share only the raw dataset via
 * `getAllPrototypes()` and run the material batch builder on demand, so The
 * Alchemist's Table (and other material-centric Observatory pages) can be built
 * lazily at access time without touching the base analysis.
 */

import {
  analysisRepository,
  type AnalysisResult,
} from '@/lib/repositories/analysis-repository';
import type { MaterialInsights } from '@/lib/observatory/alchemists-table/build-material-insights';

export type GetMaterialAnalysisResult = AnalysisResult<MaterialInsights>;

/**
 * Compute material insights for Observatory material-centric pages, via the
 * Analysis Repository (which owns the shared fetch + builder composition). Does
 * not run, or depend on, the base server analysis.
 */
export async function getMaterialAnalysis(): Promise<GetMaterialAnalysisResult> {
  return analysisRepository.getMaterialAnalysis();
}
