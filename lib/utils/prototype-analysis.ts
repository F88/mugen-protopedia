import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { logger as clientLogger } from '@/lib/logger.client';
import type { AnniversariesSlice } from '@/lib/utils/prototype-analysis-helpers';
import {
  buildAnniversaries,
  buildAnniversarySlice,
  buildStatusDistribution,
  buildTopTags,
  buildTopTeams,
  buildYearDistribution,
  computeAverageAgeInDays,
  countPrototypesWithAwards,
} from '@/lib/utils/prototype-analysis-helpers';

/**
 * Analysis result for prototype data containing insights and statistics.
 */
export type PrototypeAnalysis = {
  /** Total number of prototypes analyzed */
  totalCount: number;
  /** Distribution of prototypes by status */
  statusDistribution: Record<string, number>;
  /** Number of prototypes with awards */
  prototypesWithAwards: number;
  /** Most common tags (top 10) */
  topTags: Array<{ tag: string; count: number }>;
  /** Average age of prototypes in days */
  averageAgeInDays: number;
  /** Distribution by release year */
  yearDistribution: Record<number, number>;
  /** Teams with most prototypes */
  topTeams: Array<{ team: string; count: number }>;
  /** Anniversary analysis */
  anniversaries: AnniversariesSlice;
  /**
   * Lightweight candidate info to aid client-side TZ filtering/sampling
   * - newborn.windowUTC: inclusive ISO range [from, to] around UTC yesterday..tomorrow
   * - birthday.monthDaysUTC: MM-DD strings for [yesterday, today, tomorrow] in UTC
   */
  anniversaryCandidates?: {
    newborn?: {
      windowUTC: { fromISO: string; toISO: string };
    };
    birthday?: {
      monthDaysUTC: string[]; // e.g. ["02-28", "02-29", "03-01"]
    };
    nowUTC?: string;
  };
  /** Minimal timezone context for transparency (optional) */
  tzContext?: {
    runtime: 'server' | 'client';
    timeZone?: string;
    offset?: string; // "+09:00" style
  };
  /** Analysis timestamp */
  analyzedAt: string;
};

/**
 * Analyzes a collection of prototype data and generates insights and statistics.
 *
 * This function processes normalized prototype data to extract meaningful insights including:
 * - Status distribution analysis
 * - Awards and achievement statistics
 * - Tag frequency analysis
 * - Age and temporal distribution
 * - Team activity analysis
 * - Anniversary analysis (birthday prototypes with age calculation)
 *
 * @param prototypes - Array of normalized prototype data to analyze
 * @returns Comprehensive analysis object with statistics and insights
 *
 * @example
 * ```typescript
 * const prototypes = await fetchPrototypes({ limit: 100 });
 * if (prototypes.ok) {
 *   const analysis = analyzePrototypes(prototypes.data);
 *   console.log('Status distribution:', analysis.statusDistribution);
 *   console.log('Top tags:', analysis.topTags);
 *   console.log('Birthday prototypes:', analysis.anniversaries.birthdayPrototypes);
 * }
 * ```
 */
type MinimalLogger = {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  child: (bindings: Record<string, unknown>) => MinimalLogger;
};

export function analyzePrototypes(
  prototypes: NormalizedPrototype[],
  options?: { logger?: MinimalLogger },
): PrototypeAnalysis {
  const base: MinimalLogger = options?.logger ?? clientLogger;
  const logger = base.child({ action: 'analyzePrototypes' });
  const startTime = performance.now();

  // Timezone diagnostics (works both in Node and browser)
  const now = new Date();
  const tz = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'unknown';
    } catch {
      return 'unknown';
    }
  })();
  const offsetMin = -now.getTimezoneOffset();
  const to2 = (n: number) => (n < 10 ? `0${n}` : String(n));
  const sign = offsetMin >= 0 ? '+' : '-';
  const absMin = Math.abs(offsetMin);
  const offset = `${sign}${to2(Math.trunc(absMin / 60))}:${to2(absMin % 60)}`;
  const localISO = `${now.getFullYear()}-${to2(now.getMonth() + 1)}-${to2(now.getDate())}T${to2(now.getHours())}:${to2(now.getMinutes())}:${to2(now.getSeconds())}${offset}`;
  const utcISO = now.toISOString();

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
      anniversaries: {
        birthdayCount: 0,
        birthdayPrototypes: [],
        newbornCount: 0,
        newbornPrototypes: [],
      },
      analyzedAt: new Date().toISOString(),
    };
  }

  const statusDistribution = buildStatusDistribution(prototypes);
  const prototypesWithAwards = countPrototypesWithAwards(prototypes);
  const { topTags, tagCounts } = buildTopTags(prototypes);
  const averageAgeInDays = computeAverageAgeInDays(prototypes, now);
  const yearDistribution = buildYearDistribution(prototypes);
  const { topTeams, teamCounts } = buildTopTeams(prototypes);
  const { birthdayPrototypes, newbornPrototypes } =
    buildAnniversaries(prototypes);

  const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;

  // Compute simple dataset range for summary
  const validDates = prototypes
    .map((p) => Date.parse(p.releaseDate))
    .filter((t) => Number.isFinite(t)) as number[];
  validDates.sort((a, b) => a - b);
  const datasetMin =
    validDates.length > 0 ? new Date(validDates[0]).toISOString() : null;
  const datasetMax =
    validDates.length > 0
      ? new Date(validDates[validDates.length - 1]).toISOString()
      : null;

  // Newborn candidate window (UTC): yesterday 00:00:00 UTC to tomorrow 23:59:59.999 UTC
  const utcY = now.getUTCFullYear();
  const utcM = now.getUTCMonth();
  const utcD = now.getUTCDate();
  const newbornFromUTC = new Date(Date.UTC(utcY, utcM, utcD - 1, 0, 0, 0, 0));
  const newbornToUTC = new Date(
    Date.UTC(utcY, utcM, utcD + 1, 23, 59, 59, 999),
  );

  const timesAll = prototypes
    .map((p) => Date.parse(p.releaseDate))
    .filter((t) => Number.isFinite(t)) as number[];

  const inNewbornWindowCount = timesAll.filter(
    (t) => t >= newbornFromUTC.getTime() && t <= newbornToUTC.getTime(),
  ).length;

  // Log detailed diagnostics with timezone and processing summary
  logger.info(
    {
      // Execution environment (minimal)
      environment: {
        runtime: typeof window === 'undefined' ? 'server' : 'client',
      },
      // Timezone diagnostics
      timezone: {
        timeZone: tz,
        offsetMinutes: offsetMin,
        offset,
        nowUTC: utcISO,
        nowLocal: localISO,
        todayLocalYMD: `${now.getFullYear()}-${to2(now.getMonth() + 1)}-${to2(now.getDate())}`,
        todayUTCYMD: utcISO.slice(0, 10),
      },
      // Newborn candidates window (UTC) diagnostics
      newbornCandidates: {
        windowUTC: {
          fromISO: newbornFromUTC.toISOString(),
          toISO: newbornToUTC.toISOString(),
        },
        inWindowCount: inNewbornWindowCount,
        finalNewbornCount: newbornPrototypes.length,
      },
      // Processing summary
      summary: {
        totalCount: prototypes.length,
        statusKinds: Object.keys(statusDistribution).length,
        uniqueTags: Object.keys(tagCounts).length,
        uniqueTeams: Object.keys(teamCounts).length,
        averageAgeInDays: Math.round(averageAgeInDays * 100) / 100,
        birthdayCount: birthdayPrototypes.length,
        newbornCount: newbornPrototypes.length,
        datasetMinISO: datasetMin,
        datasetMaxISO: datasetMax,
        elapsedMs,
      },
    },
    'Prototype analysis completed (timezone + summary)',
  );

  const ret = {
    totalCount: prototypes.length,
    statusDistribution,
    prototypesWithAwards,
    topTags,
    averageAgeInDays: Math.round(averageAgeInDays * 100) / 100,
    yearDistribution,
    topTeams,
    anniversaries: buildAnniversarySlice(birthdayPrototypes, newbornPrototypes),
    anniversaryCandidates: (() => {
      const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));
      const uYear = now.getUTCFullYear();
      const uMonth = now.getUTCMonth(); // 0-based
      const uDate = now.getUTCDate();
      const startTodayUTC = Date.UTC(uYear, uMonth, uDate, 0, 0, 0, 0);
      const dayMs = 24 * 60 * 60 * 1000;
      const startYesterdayUTC = startTodayUTC - dayMs;
      const endTomorrowUTCExclusive = startTodayUTC + 2 * dayMs; // exclusive end
      const endTomorrowUTC = endTomorrowUTCExclusive - 1; // inclusive end

      const y = new Date(startYesterdayUTC);
      const t = new Date(startTodayUTC);
      const tm = new Date(startTodayUTC + dayMs);

      const mmdd = (d: Date) =>
        `${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;

      return {
        newborn: {
          windowUTC: {
            fromISO: new Date(startYesterdayUTC).toISOString(),
            toISO: new Date(endTomorrowUTC).toISOString(),
          },
        },
        birthday: {
          monthDaysUTC: [mmdd(y), mmdd(t), mmdd(tm)],
        },
        nowUTC: utcISO,
      };
    })(),
    tzContext: {
      runtime: (typeof window === 'undefined' ? 'server' : 'client') as
        | 'server'
        | 'client',
      timeZone: tz,
      offset,
    },
    analyzedAt: new Date().toISOString(),
  };

  // console.debug('📊 Prototype data analysis completed:', ret);
  // console.debug(
  //   '📊 Prototype data analysis completed (Anniversaries):',
  //   inspect(ret.anniversaries, {
  //     depth: null,
  //     colors: true,
  //     compact: false,
  //     breakLength: 80,
  //     sorted: true,
  //   }),
  // );

  return ret;
}
