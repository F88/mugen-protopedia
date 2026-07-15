// Shared test helper that builds a complete `AnalysisOverview` object.
//
// The analysis type carries many fields, so individual tests should not
// hand-build the whole shape. Use this factory and override only the fields
// that matter for the test under inspection.
import type { AnalysisOverview } from '@/lib/analysis/types';

/**
 * Create a fully-populated `AnalysisOverview` with neutral defaults.
 *
 * @param overrides - Partial fields to merge over the defaults.
 */
export function createMockAnalysisOverview(
  overrides: Partial<AnalysisOverview> = {},
): AnalysisOverview {
  return {
    totalCount: 0,
    statusDistribution: {},
    prototypesWithAwards: 0,
    topTags: [],
    topMaterials: [],
    recentTopMaterials: [],
    averageAgeInDays: 0,
    analyzedAt: '2025-01-01T00:00:00.000Z',
    anniversaryCandidates: {
      metadata: {
        computedAt: '2025-01-01T00:00:00.000Z',
        windowUTC: {
          fromISO: '2025-01-01T00:00:00.000Z',
          toISO: '2025-01-03T23:59:59.999Z',
        },
      },
      mmdd: [],
    },
    releaseTimeDistribution: { dayOfWeek: [], hour: [], heatmap: [] },
    updateTimeDistribution: { dayOfWeek: [], hour: [], heatmap: [] },
    creationStreak: {
      currentStreak: 0,
      longestStreak: 0,
      longestStreakEndDate: null,
      totalActiveDays: 0,
    },
    maternityHospital: { topEvents: [], independentRatio: 0 },
    _debugMetrics: {},
    ...overrides,
  };
}
