'use server';

/**
 * @fileoverview Observatory-only material analytics data source.
 *
 * This is intentionally SEPARATE from the base analysis
 * (`analyzePrototypesForServer` / `getLatestAnalysis`) that the 無限PP top page
 * depends on: growing that pipeline with Observatory-specific work would bloat it
 * and slow the top page. Here we share only the raw dataset via
 * `getAllPrototypes()` and run the material batch builder on demand, so The
 * Alchemist's Table (and other material-centric Observatory pages) can be built
 * lazily at access time without touching the base analysis.
 */

import { getAllPrototypes } from '@/app/actions/prototypes-gateway';
import {
  buildMaterialInsights,
  type MaterialInsights,
} from '@/lib/analysis/batch/build-material-insights';
import { logger as baseLogger } from '@/lib/logger.server';

/** Material frequency histogram plus all derived insights for the page. */
export type MaterialAnalysisData = MaterialInsights;

/**
 * Successful response containing material analytics.
 */
export interface GetMaterialAnalysisSuccess {
  ok: true;
  data: MaterialAnalysisData;
}

/**
 * Failed response with an error message.
 */
export interface GetMaterialAnalysisFailure {
  ok: false;
  error: string;
}

export type GetMaterialAnalysisResult =
  GetMaterialAnalysisSuccess | GetMaterialAnalysisFailure;

/**
 * Compute material insights for Observatory material-centric pages.
 *
 * Fetches the shared prototype dataset via {@link getAllPrototypes} and runs
 * {@link buildMaterialInsights} in a SINGLE pass (frequency histogram + yearly /
 * monthly per-material data + all sections). Does not run, or depend on, the
 * base server analysis.
 */
export async function getMaterialAnalysis(): Promise<GetMaterialAnalysisResult> {
  const logger = baseLogger.child({ action: 'getMaterialAnalysis' });

  const result = await getAllPrototypes();
  if (!result.ok) {
    logger.warn(
      { status: result.status, error: result.error },
      '[MATERIAL-ANALYSIS] Failed to load prototypes',
    );
    return { ok: false, error: result.error };
  }

  return { ok: true, data: buildMaterialInsights(result.data, { logger }) };
}
