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
import {
  buildMaterialInsights,
  type MaterialInsights,
} from '@/lib/analysis/batch/build-material-insights';
import { logger as baseLogger } from '@/lib/logger.server';

/** Material analytics (frequency) plus derived insights for the page. */
export type MaterialAnalysisData = MaterialAnalytics & {
  insights: MaterialInsights;
};

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

  const analytics = buildMaterialAnalytics(result.data, { logger });
  const insights = buildMaterialInsights(
    result.data,
    analytics.materialCounts,
  );
  return { ok: true, data: { ...analytics, insights } };
}
