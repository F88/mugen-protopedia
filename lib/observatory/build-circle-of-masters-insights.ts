/**
 * @fileoverview Facade for The Alchemist's Table "Circle of Masters" section.
 *
 * A single entry point that turns raw prototypes into {@link CircleInsights},
 * mirroring the other Observatory facades (`build-hello-world-insights`,
 * `build-material-insights`, `build-chronicles-insights`) so the repository can
 * call one function per surface.
 *
 * It composes the three underlying blocks:
 * - {@link buildUserInsights} — the per-user aggregate every seat ranks over.
 * - {@link buildPioneerMaterialsByUser} — the Chronicles first-work-per-material
 *   map, needed only by the Vanguard seat.
 * - {@link buildCircleInsights} — the seat rankings themselves.
 *
 * The seat thresholds (minWorks / rateFloor / podium) live here, not in the
 * caller, so callers stay agnostic to the Circle's tuning.
 */
import type { PrototypeForMpp } from '@/lib/api/prototypes';
import { buildCircleInsights } from './build-circle-insights';
import type { CircleInsights } from './build-circle-insights';
import { buildUserInsights } from './build-user-insights';
import { buildPioneerMaterialsByUser } from './build-chronicles-insights';
import type { MinimalLogger } from './insights-shared';

export type { CircleInsights } from './build-circle-insights';

/** Seat tuning for the Circle of Masters. */
const CIRCLE_SEATING = {
  minWorks: 5,
  rateFloor: 5,
  podium: 20,
} as const;

/**
 * Builds the Circle of Masters seat rankings from raw prototypes.
 */
export function buildCircleOfMastersInsights(
  prototypes: PrototypeForMpp[],
  options?: { logger?: MinimalLogger },
): CircleInsights {
  const logger = options?.logger;
  const userInsights = buildUserInsights(prototypes, { logger });
  const pioneerMaterialsByUser = buildPioneerMaterialsByUser(prototypes, {
    logger,
  });
  return buildCircleInsights(userInsights, {
    logger,
    pioneerMaterialsByUser,
    ...CIRCLE_SEATING,
  });
}
