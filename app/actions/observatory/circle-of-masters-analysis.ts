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

import { getAllPrototypes } from '@/app/actions/prototypes-gateway';
import { buildPioneerMaterialsByUser } from '@/lib/observatory/build-chronicles-insights';
import {
  buildCircleInsights,
  type CircleInsights,
} from '@/lib/observatory/build-circle-insights';
import { buildUserInsights } from '@/lib/observatory/build-user-insights';
import { logger as baseLogger } from '@/lib/logger.server';

/** Successful response containing the seated makers. */
export interface GetCircleOfMastersAnalysisSuccess {
  ok: true;
  data: CircleInsights;
}

/** Failed response with an error message. */
export interface GetCircleOfMastersAnalysisFailure {
  ok: false;
  error: string;
}

export type GetCircleOfMastersAnalysisResult =
  | GetCircleOfMastersAnalysisSuccess
  | GetCircleOfMastersAnalysisFailure;

/**
 * Compute the Circle of Masters for The Alchemist's Table.
 *
 * Fetches the shared prototype dataset via {@link getAllPrototypes} (cached),
 * builds the per-maker aggregate, derives the pioneer-per-maker map from the
 * Chronicles builder, and ranks the seats. Does not run, or depend on, the base
 * server analysis.
 */
export async function getCircleOfMastersAnalysis(): Promise<GetCircleOfMastersAnalysisResult> {
  const logger = baseLogger.child({ action: 'getCircleOfMastersAnalysis' });

  const result = await getAllPrototypes();
  if (!result.ok) {
    logger.warn(
      { status: result.status, error: result.error },
      '[CIRCLE-OF-MASTERS-ANALYSIS] Failed to load prototypes',
    );
    return { ok: false, error: result.error };
  }

  const userInsights = buildUserInsights(result.data, { logger });
  // The Vanguard only needs the pioneered-materials-per-maker map, so use the
  // lightweight builder instead of the full per-material Chronicles (whose
  // symbiotes / domains / milestones / Addictive Elixir would all be discarded).
  const pioneerMaterialsByUser = buildPioneerMaterialsByUser(result.data, {
    logger,
  });
  const data = buildCircleInsights(userInsights, {
    logger,
    pioneerMaterialsByUser,
    minWorks: 5,
    rateFloor: 5,
    // Seat a full top-10 per title (ties at 10th place expand the podium).
    // podium: 10,
    podium: 20,
  });

  return { ok: true, data };
}
