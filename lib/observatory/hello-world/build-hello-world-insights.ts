/**
 * @fileoverview Observatory-only analysis for the "Hello World" page.
 *
 * This is intentionally SEPARATE from the base analysis
 * (`buildAnalysisOverview` / `getAnalysisOverview`) that the 無限PP top page
 * depends on: the home page must not pay to compute Hello-World-only metrics
 * (chiefly the heavy `buildAdvancedAnalysis` pass). Like the other Observatory
 * builders, this shares only the raw dataset via `getAllPrototypes()` and runs
 * on demand at page render.
 *
 * It composes existing analysis builders into exactly the fields the Hello World
 * sections consume. Shared builders (materials, time distributions, streak,
 * anniversary candidates) are re-run here rather than read from the base cache,
 * keeping the page independent; the expensive prototype fetch is already shared.
 */

import type { PrototypeForMpp } from '@/lib/api/prototypes';
import type {
  AnniversaryCandidates,
  MinimalLogger,
} from '@/lib/analysis/types';
import {
  buildAdvancedAnalysis,
  type AdvancedAnalysis,
  buildTimeDistributions,
  type TimeDistributions,
  buildDateBasedPrototypeInsights,
  calculateCreationStreak,
  type CreationStreak,
} from '@/lib/analysis/core';
import {
  buildMaterialAnalytics,
  type MaterialAnalytics,
  buildTagAnalytics,
} from '@/lib/analysis/batch';
import { buildAnniversaryCandidates } from '@/lib/analysis/entrypoints/server';

/**
 * The analysis payload consumed by `app/observatory/hello-world/content.tsx`.
 * Extends {@link AdvancedAnalysis} (First Penguin, Star Alignment, etc.) with the
 * shared distributions / materials / streak / anniversary candidates the page
 * also renders.
 */
export type HelloWorldInsights = AdvancedAnalysis & {
  anniversaryCandidates: AnniversaryCandidates;
  releaseTimeDistribution: TimeDistributions['releaseTimeDistribution'];
  releaseDateDistribution: TimeDistributions['releaseDateDistribution'];
  updateTimeDistribution: TimeDistributions['updateTimeDistribution'];
  updateDateDistribution: TimeDistributions['updateDateDistribution'];
  creationStreak: CreationStreak;
  topMaterials: MaterialAnalytics['topMaterials'];
  yearlyTopMaterials: MaterialAnalytics['yearlyTopMaterials'];
};

/**
 * Builds all analysis the Hello World page needs, on demand.
 *
 * @param prototypes - Shared normalized prototype dataset.
 * @param now - Reference "now" for streak / anniversary-candidate windows.
 * @param options - Optional logger injection.
 */
export function buildHelloWorldInsights(
  prototypes: PrototypeForMpp[],
  now: Date,
  options?: { logger?: MinimalLogger },
): HelloWorldInsights {
  const startTime = performance.now();
  const logger = options?.logger;

  // topTags feeds the advanced Early Adopters ranking; not surfaced by the page.
  const { topTags } = buildTagAnalytics(prototypes, { logger });

  const { topMaterials, yearlyTopMaterials } = buildMaterialAnalytics(
    prototypes,
    { logger },
  );

  const {
    releaseTimeDistribution,
    releaseDateDistribution,
    updateTimeDistribution,
    updateDateDistribution,
  } = buildTimeDistributions(prototypes, { logger });

  const { uniqueReleaseDates } = buildDateBasedPrototypeInsights(prototypes, {
    logger,
  });

  const creationStreak = calculateCreationStreak(uniqueReleaseDates, now, {
    logger,
    dailyCounts: releaseDateDistribution.daily,
  });

  const advanced = buildAdvancedAnalysis(prototypes, topTags, { logger });

  const anniversaryCandidates = buildAnniversaryCandidates(
    prototypes,
    now,
    logger,
  );

  if (logger) {
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
    logger.debug(
      { elapsedMs, totalPrototypes: prototypes.length },
      '[HELLO-WORLD-INSIGHTS] Built hello-world insights',
    );
  }

  return {
    ...advanced,
    anniversaryCandidates,
    releaseTimeDistribution,
    releaseDateDistribution,
    updateTimeDistribution,
    updateDateDistribution,
    creationStreak,
    topMaterials,
    yearlyTopMaterials,
  };
}
