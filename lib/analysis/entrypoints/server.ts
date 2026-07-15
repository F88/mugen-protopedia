import type { PrototypeForMpp } from '@/lib/api/prototypes';
import { logger as serverLogger } from '@/lib/logger.server';
import {
  buildAnniversaryCandidateTotals,
  extractMonthDay,
} from '@/lib/utils/anniversary-candidate-metrics';
import {
  buildTimeDistributions,
  buildDateBasedPrototypeInsights,
  calculateCreationStreak,
} from '../core';
import {
  buildMaterialAnalytics,
  buildTopMaterialsInRange,
  buildTagAnalytics,
  buildCoreSummaries,
  buildMaternityHospital,
} from '../batch';
import type {
  AnniversaryCandidates,
  MinimalLogger,
  AnalysisOverview,
} from '@/lib/analysis/types';

export { extractMonthDay } from '@/lib/utils/anniversary-candidate-metrics';

function isValidMMDD(mmdd: string | null): mmdd is string {
  return mmdd !== null;
}

type AnalysisPipelineResult = Pick<
  AnalysisOverview,
  | 'statusDistribution'
  | 'prototypesWithAwards'
  | 'averageAgeInDays'
  | 'topTags'
  | 'topMaterials'
  | 'anniversaryCandidates'
  | 'releaseTimeDistribution'
  | 'updateTimeDistribution'
  | 'creationStreak'
  | 'maternityHospital'
> & {
  materialCounts: Record<string, number>;
  metrics: Record<string, number>;
  tagCounts: Record<string, number>;
};

const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * Rolling lookback windows (in hours) for `recentTopMaterials`, measured back
 * from the analysis reference time and keyed by `releaseDate`. Values are
 * approximate calendar spans: 720h ≈ 1 month (30 days), 8640h ≈ 1 year
 * (30 × 12 = 360 days). Keep entries as multiples of 24 so the UI's
 * `≈ N days` label stays exact.
 */
const RECENT_MATERIAL_LOOKBACK_HOURS = [
  24 * 30 /* 1 month */,
  24 * 30 * 12 /* 1 year */,
] as const;

/**
 * Computes the top materials for each configured recent lookback window
 * ({@link RECENT_MATERIAL_LOOKBACK_HOURS}) relative to `now`.
 */
function buildRecentTopMaterials(
  prototypes: PrototypeForMpp[],
  now: Date,
  logger?: MinimalLogger,
): AnalysisOverview['recentTopMaterials'] {
  return RECENT_MATERIAL_LOOKBACK_HOURS.map((lookbackHours) => ({
    lookbackHours,
    materials: buildTopMaterialsInRange(prototypes, {
      from: new Date(now.getTime() - lookbackHours * MS_PER_HOUR),
      to: now,
      logger,
    }),
  }));
}

function buildEmptyAnalysisOverview(
  prototypes: PrototypeForMpp[],
  now: Date,
  logger: MinimalLogger,
  buildAnniversaryCandidatesFn: typeof buildAnniversaryCandidates,
): AnalysisOverview {
  const anniversaryCandidates = buildAnniversaryCandidatesFn(
    prototypes,
    now,
    logger,
  );

  return {
    totalCount: 0,
    statusDistribution: {},
    prototypesWithAwards: 0,
    topTags: [],
    topMaterials: [],
    recentTopMaterials: RECENT_MATERIAL_LOOKBACK_HOURS.map((lookbackHours) => ({
      lookbackHours,
      materials: [],
    })),
    averageAgeInDays: 0,
    analyzedAt: new Date().toISOString(),
    anniversaryCandidates,
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
  };
}

function runAnalysisPipelines(
  prototypes: PrototypeForMpp[],
  now: Date,
  logger: MinimalLogger,
  buildAnniversaryCandidatesFn: typeof buildAnniversaryCandidates,
): AnalysisPipelineResult {
  const metrics: Record<string, number> = {};

  const coreStart = performance.now();
  const summaries = buildCoreSummaries(prototypes, {
    logger,
    referenceDate: now,
  });
  const coreElapsed = performance.now() - coreStart;
  metrics.coreSummaries = coreElapsed;
  metrics.statusDistribution = coreElapsed;
  metrics.prototypesWithAwards = coreElapsed;
  metrics.averageAgeInDays = coreElapsed;

  const stepStartTags = performance.now();
  const { topTags, tagCounts } = buildTagAnalytics(prototypes, { logger });
  metrics.topTags = performance.now() - stepStartTags;

  const stepStartMaterials = performance.now();
  const { topMaterials, materialCounts } = buildMaterialAnalytics(prototypes, {
    logger,
  });
  metrics.topMaterials = performance.now() - stepStartMaterials;

  const stepStartAnniversaries = performance.now();
  const anniversaryCandidates = buildAnniversaryCandidatesFn(
    prototypes,
    now,
    logger,
  );
  metrics.anniversaryCandidates = performance.now() - stepStartAnniversaries;

  const stepStartRhythm = performance.now();
  // Home renders only the release/update time heatmaps; releaseDateDistribution
  // is kept locally to feed the creation streak (daily counts). The create/date
  // distributions the home page never renders are not threaded out.
  const {
    releaseTimeDistribution,
    releaseDateDistribution,
    updateTimeDistribution,
  } = buildTimeDistributions(prototypes, { logger });
  metrics.makerRhythm = performance.now() - stepStartRhythm;

  const stepStartDateInsights = performance.now();
  const dateBasedPrototypeInsights = buildDateBasedPrototypeInsights(
    prototypes,
    {
      logger,
    },
  );
  metrics.dateBasedPrototypeInsights =
    performance.now() - stepStartDateInsights;

  const stepStartStreak = performance.now();
  const creationStreak = calculateCreationStreak(
    dateBasedPrototypeInsights.uniqueReleaseDates,
    now,
    {
      logger,
      dailyCounts: releaseDateDistribution.daily,
    },
  );
  metrics.creationStreak = performance.now() - stepStartStreak;

  // The Maternity Hospital "Top Events" is the one advanced metric the home
  // dashboard renders; compute it standalone instead of the full (Hello-World
  // only) buildAdvancedAnalysis pass.
  const stepStartMaternity = performance.now();
  const maternityHospital = buildMaternityHospital(prototypes, { logger });
  metrics.maternityHospital = performance.now() - stepStartMaternity;

  return {
    statusDistribution: summaries.statusDistribution,
    prototypesWithAwards: summaries.prototypesWithAwards,
    averageAgeInDays: summaries.averageAgeInDays,
    topTags,
    topMaterials,
    anniversaryCandidates,
    releaseTimeDistribution,
    updateTimeDistribution,
    creationStreak,
    maternityHospital,
    tagCounts,
    materialCounts,
    metrics,
  };
}

/**
 * Computes UTC-based anniversary candidate metadata for client-side filtering.
 *
 * This helper generates:
 * - metadata.windowUTC: Inclusive ISO range [yesterday 00:00, tomorrow 23:59:59.999] in UTC
 * - metadata.computedAt: Current timestamp in UTC
 * - mmdd: Candidate prototype data (id, title, releaseDate, teamNm, users) within the 3-day window
 *
 * Clients can use this data to perform anniversary analysis without fetching
 * the entire dataset.
 *
 * **Month-Day Matching Strategy:**
 * Unlike timestamp-based filtering, this function matches prototypes by their
 * MM-DD (month-day) pattern regardless of year. A prototype released on 2022-11-14
 * will be included in the candidates when the reference date is 2025-11-14.
 *
 * @param prototypes - All prototypes to filter
 * @param referenceDate - The reference date (caller's "now")
 * @param logger - Optional logger for debug output
 * @returns Anniversary candidate data with filtered minimal prototypes
 *
 * @example
 * ```typescript
 * const candidates = buildAnniversaryCandidates(
 *   allPrototypes,
 *   new Date('2025-11-14T12:00:00Z')
 * );
 * // Returns prototypes with releaseDate MM-DD matching 11-13, 11-14, or 11-15
 * // from any year (2014, 2021, 2022, etc.)
 * ```
 */
export function buildAnniversaryCandidates(
  prototypes: PrototypeForMpp[],
  referenceDate: Date,
  logger?: MinimalLogger,
): AnniversaryCandidates {
  const startTime = performance.now();
  const uYear = referenceDate.getUTCFullYear();
  const uMonth = referenceDate.getUTCMonth(); // 0-based
  const uDate = referenceDate.getUTCDate();

  const dayMs = 24 * 60 * 60 * 1000;
  const startTodayUTC = Date.UTC(uYear, uMonth, uDate, 0, 0, 0, 0);
  const startYesterdayUTC = startTodayUTC - dayMs;
  const endTomorrowUTC = startTodayUTC + 2 * dayMs - 1; // inclusive end (23:59:59.999)

  // Build set of target MM-DD strings for 3-day window (yesterday, today, tomorrow)
  const yesterday = new Date(startYesterdayUTC);
  const today = new Date(startTodayUTC);
  const tomorrow = new Date(startTodayUTC + dayMs);

  const targetMonthDays = new Set(
    [
      extractMonthDay(yesterday),
      extractMonthDay(today),
      extractMonthDay(tomorrow),
    ].filter(isValidMMDD),
  );

  // Filter prototypes by month-day (regardless of year) and extract only necessary fields
  const candidatePrototypes = prototypes
    .filter((p): p is typeof p & { releaseDate: string } => {
      if (p.releaseDate == null) return false;
      const mmdd = extractMonthDay(p.releaseDate);
      return isValidMMDD(mmdd) && targetMonthDays.has(mmdd);
    })
    .map((p) => ({
      id: p.id,
      title: p.prototypeNm,
      releaseDate: p.releaseDate,
      teamNm: p.teamNm,
      users: p.users,
    }));
  const metadata = {
    computedAt: referenceDate.toISOString(),
    windowUTC: {
      fromISO: new Date(startYesterdayUTC).toISOString(),
      toISO: new Date(endTomorrowUTC).toISOString(),
    },
  };

  const result = {
    metadata,
    mmdd: candidatePrototypes,
  };

  if (logger) {
    const totals = buildAnniversaryCandidateTotals(candidatePrototypes, {
      referenceDate,
    });

    logger.debug(
      {
        elapsedMs: Math.round((performance.now() - startTime) * 100) / 100,
        metadata,
        totals,
        outputs: ['metadata', 'mmdd'],
      },
      '[ANALYSIS] Built anniversary candidates',
    );
  }

  return result;
}

/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃   ⚠️  CAUTION: TIMEZONE-SENSITIVE ANALYSIS ORCHESTRATOR  ⚠️   ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 *
 * Analyzes prototype data for SERVER-SIDE usage (excludes TZ-sensitive anniversaries).
 *
 * This function computes timezone-independent statistics suitable for server-side
 * caching and initial page rendering. Anniversary data is intentionally EXCLUDED
 * because "today" semantics must reflect the user's timezone, not the server's.
 *
 * **For client-side usage with anniversaries, use `analyzePrototypes` instead.**
 *
 * @param prototypes - Array of normalized prototype data to analyze
 * @param options - Optional configuration (logger for diagnostics, referenceDate for testing)
 * @returns Server analysis object WITHOUT anniversary data
 *
 * @example
 * ```typescript
 * // Server-side (in Server Actions)
 * const serverAnalysis = buildAnalysisOverview(prototypes.data);
 * // serverAnalysis does NOT include anniversaries field
 * ```
 */
export function buildAnalysisOverview(
  prototypes: PrototypeForMpp[],
  options?: {
    logger?: MinimalLogger;
    referenceDate?: Date;
    overrides?: {
      buildAnniversaryCandidates?: typeof buildAnniversaryCandidates;
    };
  },
): AnalysisOverview {
  const base: MinimalLogger = options?.logger ?? serverLogger;
  const logger = base.child({ action: 'buildAnalysisOverview' });
  const startTime = performance.now();

  const now = options?.referenceDate ?? new Date();
  const overrides = options?.overrides;
  const buildAnniversaryCandidatesFn =
    overrides?.buildAnniversaryCandidates ?? buildAnniversaryCandidates;

  if (prototypes.length === 0) {
    logger.debug('No prototypes to analyze, returning empty analysis');
    return buildEmptyAnalysisOverview(
      prototypes,
      now,
      logger,
      buildAnniversaryCandidatesFn,
    );
  }

  const {
    statusDistribution,
    prototypesWithAwards,
    averageAgeInDays,
    topTags,
    topMaterials,
    anniversaryCandidates,
    releaseTimeDistribution,
    updateTimeDistribution,
    creationStreak,
    maternityHospital,
    tagCounts,
    materialCounts,
    metrics,
  } = runAnalysisPipelines(
    prototypes,
    now,
    logger,
    buildAnniversaryCandidatesFn,
  );

  const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
  metrics.total = elapsedMs;

  // Compute dataset date range for diagnostics
  const validDates = prototypes
    .map((p) =>
      p.releaseDate != null ? Date.parse(p.releaseDate) : Number.NaN,
    )
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b);
  const datasetMin =
    validDates.length > 0 ? new Date(validDates[0]).toISOString() : null;
  const datasetMax =
    validDates.length > 0
      ? new Date(validDates[validDates.length - 1]).toISOString()
      : null;

  // Log processing summary (TZ-independent)
  logger.info(
    {
      summary: {
        totalCount: prototypes.length,
        statusKinds: Object.keys(statusDistribution).length,
        uniqueTags: Object.keys(tagCounts).length,
        uniqueMaterials: Object.keys(materialCounts).length,
        averageAgeInDays: Math.round(averageAgeInDays * 100) / 100,
        datasetMinISO: datasetMin,
        datasetMaxISO: datasetMax,
        elapsedMs,
        metrics, // Add metrics to the summary log
      },
    },
    '[ANALYSIS] Server-side analysis completed (TZ-independent data only)',
  );

  return {
    totalCount: prototypes.length,
    statusDistribution,
    prototypesWithAwards,
    topTags,
    averageAgeInDays: Math.round(averageAgeInDays * 100) / 100,
    topMaterials,
    recentTopMaterials: buildRecentTopMaterials(prototypes, now, logger),
    analyzedAt: new Date().toISOString(),
    anniversaryCandidates,
    releaseTimeDistribution,
    updateTimeDistribution,
    creationStreak,
    maternityHospital,
    _debugMetrics: metrics, // Include metrics in the returned object
  };
}
