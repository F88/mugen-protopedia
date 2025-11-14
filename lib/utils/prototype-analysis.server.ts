import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { logger as serverLogger } from '@/lib/logger.server';
import {
  buildAnniversaryCandidateTotals,
  extractMonthDay,
} from '@/lib/utils/anniversary-candidate-metrics';
import {
  buildStatusDistribution,
  buildTopTags,
  buildTopTeams,
  buildYearDistribution,
  computeAverageAgeInDays,
  countPrototypesWithAwards,
} from '@/lib/utils/prototype-analysis-helpers';
import type {
  AnniversaryCandidates,
  ServerPrototypeAnalysis,
} from '@/lib/utils/prototype-analysis.types';

export { extractMonthDay } from '@/lib/utils/anniversary-candidate-metrics';

/**
 * Minimal logger interface for dependency injection
 */
type MinimalLogger = {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  child: (bindings: Record<string, unknown>) => MinimalLogger;
};

/**
 * Computes UTC-based anniversary candidate metadata for client-side filtering.
 *
 * This helper generates:
 * - metadata.windowUTC: Inclusive ISO range [yesterday 00:00, tomorrow 23:59:59.999] in UTC
 * - metadata.computedAt: Current timestamp in UTC
 * - mmdd: Minimal prototype data (id, title, releaseDate only) within the 3-day window
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
  prototypes: NormalizedPrototype[],
  referenceDate: Date,
  logger?: MinimalLogger,
): AnniversaryCandidates {
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
    ].filter((mmdd): mmdd is string => mmdd !== null),
  );

  // Filter prototypes by month-day (regardless of year) and extract only necessary fields
  const candidatePrototypes = prototypes
    .filter((p) => {
      if (!p.releaseDate) return false;
      const mmdd = extractMonthDay(p.releaseDate);
      return mmdd !== null && targetMonthDays.has(mmdd);
    })
    .map((p) => ({
      id: p.id,
      title: p.prototypeNm,
      releaseDate: p.releaseDate,
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
        metadata,
        totals,
      },
      'Built anniversary candidates',
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
 * const serverAnalysis = analyzePrototypesForServer(prototypes.data);
 * // serverAnalysis does NOT include anniversaries field
 * ```
 */
export function analyzePrototypesForServer(
  prototypes: NormalizedPrototype[],
  options?: { logger?: MinimalLogger; referenceDate?: Date },
): ServerPrototypeAnalysis {
  const base: MinimalLogger = options?.logger ?? serverLogger;
  const logger = base.child({ action: 'analyzePrototypesForServer' });
  const startTime = performance.now();

  const now = options?.referenceDate ?? new Date();

  if (prototypes.length === 0) {
    logger.debug('No prototypes to analyze, returning empty analysis');
    return {
      totalCount: 0,
      statusDistribution: {},
      prototypesWithAwards: 0,
      topTags: [],
      averageAgeInDays: 0,
      yearDistribution: {},
      topTeams: [],
      analyzedAt: new Date().toISOString(),
      anniversaryCandidates: buildAnniversaryCandidates(
        prototypes,
        now,
        logger,
      ),
    };
  }

  const statusDistribution = buildStatusDistribution(prototypes);
  const prototypesWithAwards = countPrototypesWithAwards(prototypes);
  const { topTags, tagCounts } = buildTopTags(prototypes);
  const averageAgeInDays = computeAverageAgeInDays(prototypes, now);
  const yearDistribution = buildYearDistribution(prototypes);
  const { topTeams, teamCounts } = buildTopTeams(prototypes);
  const anniversaryCandidates = buildAnniversaryCandidates(
    prototypes,
    now,
    logger,
  );

  const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;

  // Compute dataset date range for diagnostics
  const validDates = prototypes
    .map((p) => Date.parse(p.releaseDate))
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
        uniqueTeams: Object.keys(teamCounts).length,
        averageAgeInDays: Math.round(averageAgeInDays * 100) / 100,
        datasetMinISO: datasetMin,
        datasetMaxISO: datasetMax,
        elapsedMs,
      },
    },
    'Server-side analysis completed (TZ-independent data only)',
  );

  return {
    totalCount: prototypes.length,
    statusDistribution,
    prototypesWithAwards,
    topTags,
    averageAgeInDays: Math.round(averageAgeInDays * 100) / 100,
    yearDistribution,
    topTeams,
    analyzedAt: new Date().toISOString(),
    anniversaryCandidates,
  };
}
