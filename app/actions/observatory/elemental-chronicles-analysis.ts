'use server';

/**
 * @fileoverview Observatory-only Elemental Chronicles data source (per material).
 *
 * Like `material-analysis.ts`, this is intentionally SEPARATE from the base
 * analysis that the 無限PP top page depends on: it shares only the raw dataset via
 * `getAllPrototypes()` and runs the per-material Chronicles builder on demand, so
 * The Alchemist's Table can render the Element Chronicles lazily at access time
 * without touching (or bloating) the base analysis pipeline.
 */

import { analysisRepository } from '@/lib/repositories/analysis-repository';
import type { ChroniclesInsights } from '@/lib/observatory/alchemists-table/build-chronicles-insights';

/** Successful response containing the per-material Chronicles. */
export interface GetElementalChroniclesAnalysisSuccess {
  ok: true;
  data: ChroniclesInsights;
}

/** Failed response with an error message. */
export interface GetElementalChroniclesAnalysisFailure {
  ok: false;
  error: string;
}

export type GetElementalChroniclesAnalysisResult =
  GetElementalChroniclesAnalysisSuccess | GetElementalChroniclesAnalysisFailure;

/**
 * Compute the Elemental Chronicles for The Alchemist's Table, via the Analysis
 * Repository. Does not run, or depend on, the base server analysis.
 */
export async function getElementalChroniclesAnalysis(): Promise<GetElementalChroniclesAnalysisResult> {
  return analysisRepository.getElementalChroniclesAnalysis();
}
