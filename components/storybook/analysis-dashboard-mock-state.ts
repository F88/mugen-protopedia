/**
 * @fileoverview Shared Storybook mock state for the REAL `AnalysisDashboard`.
 *
 * `AnalysisDashboard` is presentational (the server-action-importing hook
 * lives in `AnalysisDashboardContainer`), so stories can render the real
 * component as long as they inject a resolved `analysisState` and a client
 * anniversaries override (to avoid the client-side recompute path). This
 * module builds that mock state once so every story (the dashboard's own
 * stories, Header, MugenProtopediaView) shares a single source instead of
 * maintaining a visual copy of the component.
 */
import {
  anniversaryMinimalPrototype,
  fullfilledPrototype,
  minimalPrototype,
} from '@/.storybook/prototypes.fixture';
import type { PrototypeForMpp } from '@/lib/api/prototypes';
import {
  buildTagAnalytics,
  buildCoreSummaries,
  buildMaterialAnalytics,
  buildTimeDistributions,
  buildDateBasedPrototypeInsights,
  buildAdvancedAnalysis,
} from '@/lib/analysis/batch';
import { calculateCreationStreak } from '@/lib/analysis/core';
import {
  buildAnniversaries,
  buildAnniversarySlice,
} from '@/lib/analysis/shared/anniversaries';
import type { PrototypeAnalysis } from '@/lib/analysis/types';

/** Analyze a small fixture set the way the server would (Storybook-local). */
export function analyzePrototypes(
  prototypes: PrototypeForMpp[],
): PrototypeAnalysis {
  const referenceDate = new Date();
  const totalCount = prototypes.length;
  const {
    statusDistribution,
    prototypesWithAwards,
    averageAgeInDays: rawAverageAgeInDays,
  } = buildCoreSummaries(prototypes, { referenceDate });
  const { topTags } = buildTagAnalytics(prototypes);
  const { topMaterials } = buildMaterialAnalytics(prototypes);
  const { releaseTimeDistribution, updateTimeDistribution } =
    buildTimeDistributions(prototypes);
  const { uniqueReleaseDates } = buildDateBasedPrototypeInsights(prototypes);
  const creationStreak = calculateCreationStreak(
    uniqueReleaseDates,
    referenceDate,
  );
  const advancedAnalysis = buildAdvancedAnalysis(prototypes, topTags);

  const averageAgeInDays =
    totalCount > 0 ? Math.round(rawAverageAgeInDays * 100) / 100 : 0;

  const anniversariesSliceSource = buildAnniversaries(prototypes);
  const anniversaries = buildAnniversarySlice(
    anniversariesSliceSource.birthdayPrototypes,
    anniversariesSliceSource.newbornPrototypes,
  );

  const oneDayMs = 24 * 60 * 60 * 1000;
  const anniversaryCandidates = {
    metadata: {
      computedAt: referenceDate.toISOString(),
      windowUTC: {
        fromISO: new Date(referenceDate.getTime() - oneDayMs).toISOString(),
        toISO: new Date(referenceDate.getTime() + oneDayMs).toISOString(),
      },
    },
    mmdd: prototypes
      .filter(
        (prototype): prototype is typeof prototype & { releaseDate: string } =>
          prototype.releaseDate != null,
      )
      .map((prototype) => ({
        id: prototype.id,
        title: prototype.prototypeNm ?? '',
        releaseDate: prototype.releaseDate,
        teamNm: prototype.teamNm,
        users: prototype.users,
      })),
  } as const;

  return {
    totalCount,
    statusDistribution,
    prototypesWithAwards,
    topTags,
    recentTopTags: [168, 720].map((lookbackHours) => ({
      lookbackHours,
      tags: topTags,
    })),
    topMaterials,
    recentTopMaterials: [168, 720].map((lookbackHours) => ({
      lookbackHours,
      materials: topMaterials,
    })),
    averageAgeInDays,
    analyzedAt: referenceDate.toISOString(),
    anniversaryCandidates,
    anniversaries,
    releaseTimeDistribution,
    updateTimeDistribution,
    creationStreak,
    ...advancedAnalysis,
  };
}

export type MockAnalysisState = {
  data?: PrototypeAnalysis | null;
  isLoading?: boolean;
  error?: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const refresh = (_opts?: { forceRecompute?: boolean }) => {};

/** A realistic analysis computed from the shared Storybook fixtures. */
export const sampleAnalysis = analyzePrototypes([
  fullfilledPrototype,
  minimalPrototype,
  anniversaryMinimalPrototype,
]);

/** The resolved `analysisState` prop for the real `AnalysisDashboard`. */
export const withMockState = (state: MockAnalysisState = {}) => ({
  data: state.data !== undefined ? state.data : sampleAnalysis,
  isLoading: state.isLoading ?? false,
  error: state.error ?? null,
  refresh,
});

/** A mock anniversaries override so stories never hit the client recompute. */
export const buildClientAnniversariesOverride = (
  state: MockAnalysisState = {},
) => {
  const data = state.data !== undefined ? state.data : sampleAnalysis;
  const isLoading = Boolean(state.isLoading);
  const error = state.error ?? null;
  return {
    anniversaries: data ? data.anniversaries : null,
    isLoading,
    error,
  } as const;
};
