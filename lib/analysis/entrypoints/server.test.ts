import { afterEach, describe, expect, it, vi } from 'vitest';

import type { NormalizedPrototype } from '@/lib/api/prototypes';

const iso = (value: string) => new Date(value).toISOString();

type MockLogger = {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  child: (bindings: Record<string, unknown>) => MockLogger;
};

const createLoggerPair = (): {
  baseLogger: MockLogger;
  childLogger: MockLogger;
} => {
  const childLoggerChild =
    vi.fn<(bindings: Record<string, unknown>) => MockLogger>();
  const childLogger = {
    debug: vi.fn<(...args: unknown[]) => void>(),
    info: vi.fn<(...args: unknown[]) => void>(),
    warn: vi.fn<(...args: unknown[]) => void>(),
    error: vi.fn<(...args: unknown[]) => void>(),
    child: childLoggerChild,
  } satisfies MockLogger;
  childLoggerChild.mockReturnValue(childLogger);

  const baseLoggerChild =
    vi.fn<(bindings: Record<string, unknown>) => MockLogger>();
  const baseLogger = {
    debug: vi.fn<(...args: unknown[]) => void>(),
    info: vi.fn<(...args: unknown[]) => void>(),
    warn: vi.fn<(...args: unknown[]) => void>(),
    error: vi.fn<(...args: unknown[]) => void>(),
    child: baseLoggerChild,
  } satisfies MockLogger;
  baseLoggerChild.mockReturnValue(childLogger);

  return { baseLogger, childLogger };
};

const createPrototype = (
  overrides: Partial<NormalizedPrototype> = {},
): NormalizedPrototype => ({
  id: overrides.id ?? 1,
  prototypeNm: overrides.prototypeNm ?? 'Prototype',
  tags: overrides.tags ?? [],
  teamNm: overrides.teamNm ?? 'Team',
  users: overrides.users ?? ['User'],
  summary: overrides.summary ?? '',
  status: overrides.status ?? 1,
  releaseFlg: overrides.releaseFlg ?? 1,
  createId: overrides.createId ?? 1,
  createDate: overrides.createDate ?? iso('2023-01-01T00:00:00Z'),
  updateId: overrides.updateId ?? 1,
  updateDate: overrides.updateDate ?? iso('2023-01-02T00:00:00Z'),
  releaseDate: overrides.releaseDate ?? iso('2023-01-03T00:00:00Z'),
  revision: overrides.revision ?? 1,
  awards: overrides.awards ?? [],
  freeComment: overrides.freeComment ?? '',
  systemDescription: overrides.systemDescription ?? '',
  viewCount: overrides.viewCount ?? 0,
  goodCount: overrides.goodCount ?? 0,
  commentCount: overrides.commentCount ?? 0,
  videoUrl: overrides.videoUrl,
  mainUrl: overrides.mainUrl ?? 'https://example.com',
  relatedLink: overrides.relatedLink,
  relatedLink2: overrides.relatedLink2,
  relatedLink3: overrides.relatedLink3,
  relatedLink4: overrides.relatedLink4,
  relatedLink5: overrides.relatedLink5,
  licenseType: overrides.licenseType ?? 0,
  thanksFlg: overrides.thanksFlg ?? 0,
  events: overrides.events ?? [],
  officialLink: overrides.officialLink,
  materials: overrides.materials ?? [],
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.resetModules();
});

describe('analyzePrototypesForServer', () => {
  it('returns default analysis for empty prototypes', async () => {
    const { baseLogger, childLogger } = createLoggerPair();
    vi.doMock('@/lib/logger.server', () => ({ logger: baseLogger }));
    const { analyzePrototypesForServer } = await import('./server');

    const referenceDate = new Date('2024-01-15T03:00:00Z');
    const result = analyzePrototypesForServer([], {
      logger: baseLogger,
      referenceDate,
    });

    expect(baseLogger.child).toHaveBeenCalledWith({
      action: 'analyzePrototypesForServer',
    });
    expect(childLogger.debug).toHaveBeenCalledWith(
      'No prototypes to analyze, returning empty analysis',
    );
    expect(result.totalCount).toBe(0);
    expect(result.statusDistribution).toEqual({});
    expect(result.anniversaryCandidates.mmdd).toEqual([]);
    expect(result.anniversaryCandidates.metadata.windowUTC).toEqual({
      fromISO: '2024-01-14T00:00:00.000Z',
      toISO: '2024-01-16T23:59:59.999Z',
    });
    expect(result.createTimeDistribution).toEqual({
      dayOfWeek: [],
      hour: [],
      heatmap: [],
    });
    expect(result.creationStreak).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      longestStreakEndDate: null,
      totalActiveDays: 0,
    });
  });

  it('orchestrates builders and composes analysis output', async () => {
    const coreSummariesResult = {
      statusDistribution: { 1: 3 },
      prototypesWithAwards: 2,
      averageAgeInDays: 4,
    };
    const buildCoreSummariesMock = vi.fn(() => coreSummariesResult);

    const tagAnalyticsResult = {
      topTags: [{ tag: 'AI', count: 2 }],
      tagCounts: { AI: 2 },
    };
    const buildTagAnalyticsMock = vi.fn(() => tagAnalyticsResult);

    const teamAnalyticsResult = {
      teams: {
        topTeams: [{ team: 'Team', count: 1 }],
        teamCounts: { Team: 1 },
      },
    };
    const buildUserTeamAnalyticsMock = vi.fn(() => teamAnalyticsResult);

    const materialAnalyticsResult = {
      topMaterials: [{ material: 'Paper', count: 1 }],
      materialCounts: { Paper: 1 },
    };
    const buildMaterialAnalyticsMock = vi.fn(() => materialAnalyticsResult);

    vi.doMock('../batch', () => ({
      buildCoreSummaries: buildCoreSummariesMock,
      buildTagAnalytics: buildTagAnalyticsMock,
      buildUserTeamAnalytics: buildUserTeamAnalyticsMock,
      buildMaterialAnalytics: buildMaterialAnalyticsMock,
    }));

    const timeDistributionsResult = {
      createTimeDistribution: { dayOfWeek: [1], hour: [1], heatmap: [[1]] },
      createDateDistribution: {
        month: [1],
        year: { 2024: 1 },
        daily: { 2024: { 1: { 1: 1 } } },
      },
      releaseTimeDistribution: { dayOfWeek: [2], hour: [2], heatmap: [[2]] },
      releaseDateDistribution: {
        month: [2],
        year: { 2024: 2 },
        daily: { 2024: { 1: { 2: 1 } } },
      },
      updateTimeDistribution: { dayOfWeek: [3], hour: [3], heatmap: [[3]] },
      updateDateDistribution: {
        month: [3],
        year: { 2024: 3 },
        daily: { 2024: { 1: { 3: 1 } } },
      },
    };
    const buildTimeDistributionsMock = vi.fn(() => timeDistributionsResult);

    const uniqueDates = {
      uniqueCreateDates: new Set(['2024-01-01']),
      uniqueUpdateDates: new Set(['2024-01-02']),
      uniqueReleaseDates: new Set(['2024-01-03']),
    };
    const buildDateBasedPrototypeInsightsMock = vi.fn(() => uniqueDates);

    const creationStreakResult = {
      currentStreak: 1,
      longestStreak: 2,
      longestStreakEndDate: '2024-01-03',
      totalActiveDays: 3,
    };
    const calculateCreationStreakMock = vi.fn(() => creationStreakResult);

    const advancedAnalysisResult = {
      firstPenguins: [],
      starAlignments: [],
      anniversaryEffect: [],
      earlyAdopters: [],
      laborOfLove: { longestGestation: [], distribution: {} },
      maternityHospital: { topEvents: [], independentRatio: 0 },
      powerOfDeadlines: { spikes: [] },
      weekendWarrior: {
        weekendHourlyCounts: [],
        totalWeekendCount: 0,
      },
      holyDay: { topDays: [] },
      longTermEvolution: {
        longestMaintenance: [],
        averageMaintenanceDays: 0,
        maintenanceRatio: 0,
      },
    };
    const buildAdvancedAnalysisMock = vi.fn(() => advancedAnalysisResult);

    vi.doMock('../core', () => ({
      buildAdvancedAnalysis: buildAdvancedAnalysisMock,
      buildTimeDistributions: buildTimeDistributionsMock,
      buildDateBasedPrototypeInsights: buildDateBasedPrototypeInsightsMock,
      calculateCreationStreak: calculateCreationStreakMock,
    }));

    const { baseLogger, childLogger } = createLoggerPair();
    vi.doMock('@/lib/logger.server', () => ({ logger: baseLogger }));

    vi.spyOn(performance, 'now').mockReturnValue(0);

    const serverModule = await import('./server');
    const { analyzePrototypesForServer } = serverModule;
    const candidatesResult = {
      metadata: {
        computedAt: '2024-01-15T03:00:00.000Z',
        windowUTC: {
          fromISO: '2024-01-14T00:00:00.000Z',
          toISO: '2024-01-16T23:59:59.999Z',
        },
      },
      mmdd: [{ id: 1, title: 'Proto', releaseDate: '2024-01-03T00:00:00Z' }],
    };
    const buildAnniversaryCandidatesOverride = vi
      .fn<typeof serverModule.buildAnniversaryCandidates>()
      .mockReturnValue(candidatesResult);

    const referenceDate = new Date('2024-01-15T03:00:00Z');
    const prototypes = [
      createPrototype({
        id: 1,
        releaseDate: '2024-01-03T00:00:00Z',
        createDate: '2024-01-01T00:00:00Z',
        updateDate: '2024-01-04T00:00:00Z',
        tags: ['AI'],
      }),
    ];

    const result = analyzePrototypesForServer(prototypes, {
      logger: baseLogger,
      referenceDate,
      overrides: {
        buildAnniversaryCandidates: buildAnniversaryCandidatesOverride,
      },
    });

    expect(baseLogger.child).toHaveBeenCalledWith({
      action: 'analyzePrototypesForServer',
    });
    expect(buildCoreSummariesMock).toHaveBeenCalledWith(prototypes, {
      logger: childLogger,
      referenceDate,
    });
    expect(buildTagAnalyticsMock).toHaveBeenCalledWith(prototypes, {
      logger: childLogger,
    });
    expect(buildUserTeamAnalyticsMock).toHaveBeenCalledWith(prototypes, {
      logger: childLogger,
    });
    expect(buildMaterialAnalyticsMock).toHaveBeenCalledWith(prototypes, {
      logger: childLogger,
    });
    expect(buildAnniversaryCandidatesOverride).toHaveBeenCalledWith(
      prototypes,
      referenceDate,
      childLogger,
    );
    expect(buildTimeDistributionsMock).toHaveBeenCalledWith(prototypes, {
      logger: childLogger,
    });
    expect(buildDateBasedPrototypeInsightsMock).toHaveBeenCalledWith(
      prototypes,
      { logger: childLogger },
    );
    expect(calculateCreationStreakMock).toHaveBeenCalledWith(
      uniqueDates.uniqueReleaseDates,
      referenceDate,
      {
        logger: childLogger,
        dailyCounts: timeDistributionsResult.releaseDateDistribution.daily,
      },
    );
    expect(buildAdvancedAnalysisMock).toHaveBeenCalledWith(
      prototypes,
      tagAnalyticsResult.topTags,
      { logger: childLogger },
    );

    expect(result.statusDistribution).toBe(
      coreSummariesResult.statusDistribution,
    );
    expect(result.prototypesWithAwards).toBe(
      coreSummariesResult.prototypesWithAwards,
    );
    expect(result.averageAgeInDays).toBe(coreSummariesResult.averageAgeInDays);
    expect(result.topTags).toBe(tagAnalyticsResult.topTags);
    expect(result.topTeams).toBe(teamAnalyticsResult.teams.topTeams);
    expect(result.topMaterials).toBe(materialAnalyticsResult.topMaterials);
    expect(result.anniversaryCandidates).toBe(candidatesResult);
    expect(result.createDateDistribution).toBe(
      timeDistributionsResult.createDateDistribution,
    );
    expect(result.releaseTimeDistribution).toBe(
      timeDistributionsResult.releaseTimeDistribution,
    );
    expect(result.updateDateDistribution).toBe(
      timeDistributionsResult.updateDateDistribution,
    );
    expect(result.creationStreak).toBe(creationStreakResult);
    expect(result.longTermEvolution).toBe(
      advancedAnalysisResult.longTermEvolution,
    );
    const metrics = result._debugMetrics ?? {};
    expect(metrics.coreSummaries).toBe(0);
    expect(metrics.advancedAnalysis).toBe(0);
  });
});
