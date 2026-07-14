/**
 * @fileoverview
 * The Maternity Hospital metric: event-participation mix and independent-creator
 * ratio, extracted as a standalone single-pass builder.
 *
 * This is the ONE advanced-analysis metric the home dashboard consumes (Community
 * Trends "Top Events"). Keeping it independent lets the home path compute it
 * cheaply without running the full {@link buildAdvancedAnalysis} pass (which is
 * otherwise Hello-World-only). {@link buildAdvancedAnalysis} keeps its own inline
 * copy of this metric (it shares a single aggregation pass), so this is NOT a
 * delegation; a drift-guard test in `build-maternity-hospital.test.ts` asserts the
 * two implementations stay identical.
 */

import type { PrototypeForMpp } from '@/lib/api/prototypes';
import { createLifecycleMomentContext } from '../lifecycle';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

export type MaternityHospital = {
  /** Top events by number of prototypes (descending, capped at 30). */
  topEvents: Array<{ event: string; count: number }>;
  /** Ratio of independent births (prototypes with no event). */
  independentRatio: number;
};

/**
 * Counts event participation across prototypes with a valid `releaseDate` (the
 * same gate {@link buildAdvancedAnalysis} applies via its lifecycle context), so
 * the result is identical whether computed here or inside the advanced pass.
 *
 * @param prototypes - Normalized prototypes to analyze.
 * @returns Top events plus the independent (no-event) ratio.
 */
export function buildMaternityHospital(
  prototypes: PrototypeForMpp[],
  options?: { logger?: MinimalLogger },
): MaternityHospital {
  const startTime = performance.now();

  const eventCounts: Record<string, number> = {};
  let independentCount = 0;
  let totalWithEventStatus = 0;

  for (const prototype of prototypes) {
    // Gate on release validity to match the advanced pass, which only counts
    // prototypes whose lifecycle context (release moment) is valid.
    if (createLifecycleMomentContext(prototype.releaseDate) === null) {
      continue;
    }

    totalWithEventStatus += 1;

    if (prototype.events && prototype.events.length > 0) {
      for (const event of prototype.events) {
        eventCounts[event] = (eventCounts[event] ?? 0) + 1;
      }
      continue;
    }

    independentCount += 1;
  }

  const topEvents = Object.entries(eventCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30)
    .map(([event, count]) => ({ event, count }));

  const independentRatio =
    totalWithEventStatus > 0 ? independentCount / totalWithEventStatus : 0;

  if (options?.logger) {
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
    options.logger.debug(
      {
        elapsedMs,
        totalWithEventStatus,
        distinctEvents: Object.keys(eventCounts).length,
      },
      '[ANALYSIS] Built maternity hospital',
    );
  }

  return { topEvents, independentRatio };
}
