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
  buildMaterialAnalytics,
  type MaterialAnalytics,
} from '@/lib/analysis/batch/build-material-analytics';
import { logger as baseLogger } from '@/lib/logger.server';

/**
 * Successful response containing material analytics.
 */
export interface GetMaterialAnalysisSuccess {
  ok: true;
  data: MaterialAnalytics;
}

/**
 * Failed response with an error message.
 */
export interface GetMaterialAnalysisFailure {
  ok: false;
  error: string;
}

export type GetMaterialAnalysisResult =
  | GetMaterialAnalysisSuccess
  | GetMaterialAnalysisFailure;

/**
 * Compute material analytics for Observatory material-centric pages.
 *
 * Fetches the shared prototype dataset via {@link getAllPrototypes} and runs the
 * existing {@link buildMaterialAnalytics} batch builder. Does not run, or depend
 * on, the base server analysis.
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

  const data = buildMaterialAnalytics(result.data, { logger });
  return { ok: true, data };
}
