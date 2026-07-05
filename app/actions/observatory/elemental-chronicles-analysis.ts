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

import { getAllPrototypes } from '@/app/actions/prototypes-gateway';
import {
  buildChroniclesInsights,
  type ChroniclesInsights,
} from '@/lib/observatory/build-chronicles-insights';
import { logger as baseLogger } from '@/lib/logger.server';

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
 * Compute the Elemental Chronicles for The Alchemist's Table.
 *
 * Fetches the shared prototype dataset via {@link getAllPrototypes} (cached) and
 * runs {@link buildChroniclesInsights}. Does not run, or depend on, the base
 * server analysis.
 */
export async function getElementalChroniclesAnalysis(): Promise<GetElementalChroniclesAnalysisResult> {
  const logger = baseLogger.child({ action: 'getElementalChroniclesAnalysis' });

  const result = await getAllPrototypes();
  if (!result.ok) {
    logger.warn(
      { status: result.status, error: result.error },
      '[ELEMENTAL-CHRONICLES-ANALYSIS] Failed to load prototypes',
    );
    return { ok: false, error: result.error };
  }

  return { ok: true, data: buildChroniclesInsights(result.data, { logger }) };
}
