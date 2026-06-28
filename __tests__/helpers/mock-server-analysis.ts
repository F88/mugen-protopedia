// Shared test helper that builds a complete `ServerPrototypeAnalysis` object.
//
// The analysis type carries many fields, so individual tests should not
// hand-build the whole shape. Use this factory and override only the fields
// that matter for the test under inspection.
import type { ServerPrototypeAnalysis } from '@/lib/analysis/types';

/**
 * Create a fully-populated `ServerPrototypeAnalysis` with neutral defaults.
 *
 * @param overrides - Partial fields to merge over the defaults.
 */
export function createMockServerAnalysis(
  overrides: Partial<ServerPrototypeAnalysis> = {},
): ServerPrototypeAnalysis {
  return {
    totalCount: 0,
    statusDistribution: {},
    prototypesWithAwards: 0,
    topTags: [],
    topMaterials: [],
    yearlyTopMaterials: {},
    averageAgeInDays: 0,
    topTeams: [],
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
    createTimeDistribution: { dayOfWeek: [], hour: [], heatmap: [] },
    createDateDistribution: { month: [], year: {}, daily: {} },
    releaseTimeDistribution: { dayOfWeek: [], hour: [], heatmap: [] },
    releaseDateDistribution: { month: [], year: {}, daily: {} },
    updateTimeDistribution: { dayOfWeek: [], hour: [], heatmap: [] },
    updateDateDistribution: { month: [], year: {}, daily: {} },
    creationStreak: {
      currentStreak: 0,
      longestStreak: 0,
      longestStreakEndDate: null,
      totalActiveDays: 0,
    },
    earlyAdopters: [],
    firstPenguins: [],
    starAlignments: [],
    anniversaryEffect: [],
    laborOfLove: { longestGestation: [], distribution: {} },
    maternityHospital: { topEvents: [], independentRatio: 0 },
    powerOfDeadlines: { spikes: [] },
    weekendWarrior: { weekendHourlyCounts: [], totalWeekendCount: 0 },
    holyDay: { topDays: [] },
    longTermEvolution: {
      longestMaintenance: [],
      averageMaintenanceDays: 0,
      maintenanceRatio: 0,
    },
    evolutionSpan: {
      distribution: {
        noUpdates: 0,
        sameDayUpdate: 0,
        within3Days: 0,
        within7Days: 0,
        within14Days: 0,
        within30Days: 0,
        within90Days: 0,
        within180Days: 0,
        within1Year: 0,
        within3Years: 0,
        over3Years: 0,
      },
    },
    _debugMetrics: {},
    ...overrides,
  };
}
