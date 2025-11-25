import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { logger as serverLogger } from '@/lib/logger.server';
import {
  buildAnniversaryCandidateTotals,
  extractMonthDay,
} from '@/lib/utils/anniversary-candidate-metrics';
import {
  buildStatusDistribution,
  buildTopMaterials,
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
  const metrics: Record<string, number> = {};

  if (prototypes.length === 0) {
    logger.debug('No prototypes to analyze, returning empty analysis');
    return {
      totalCount: 0,
      statusDistribution: {},
      prototypesWithAwards: 0,
      topTags: [],
      topMaterials: [],
      averageAgeInDays: 0,
      yearDistribution: {},
      topTeams: [],
      analyzedAt: new Date().toISOString(),
      anniversaryCandidates: buildAnniversaryCandidates(
        prototypes,
        now,
        logger,
      ),
      releaseTimeDistribution: { dayOfWeek: [], hour: [] },
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
      _debugMetrics: metrics,
    };
  }

  // --- Metrics collection for individual analysis steps ---

  let stepStart = performance.now();
  const statusDistribution = buildStatusDistribution(prototypes);
  metrics.statusDistribution = performance.now() - stepStart;

  stepStart = performance.now();
  const prototypesWithAwards = countPrototypesWithAwards(prototypes);
  metrics.prototypesWithAwards = performance.now() - stepStart;

  stepStart = performance.now();
  const { topTags, tagCounts } = buildTopTags(prototypes);
  metrics.topTags = performance.now() - stepStart;

  stepStart = performance.now();
  const averageAgeInDays = computeAverageAgeInDays(prototypes, now);
  metrics.averageAgeInDays = performance.now() - stepStart;

  stepStart = performance.now();
  const yearDistribution = buildYearDistribution(prototypes);
  metrics.yearDistribution = performance.now() - stepStart;

  stepStart = performance.now();
  const { topTeams, teamCounts } = buildTopTeams(prototypes);
  metrics.topTeams = performance.now() - stepStart;

  stepStart = performance.now();
  const { topMaterials, materialCounts } = buildTopMaterials(prototypes);
  metrics.topMaterials = performance.now() - stepStart;

  stepStart = performance.now();
  const anniversaryCandidates = buildAnniversaryCandidates(
    prototypes,
    now,
    logger,
  );
  metrics.anniversaryCandidates = performance.now() - stepStart;

  stepStart = performance.now();

  // --- Maker's Rhythm & Eternal Flame Analysis (JST based) ---
  const dayOfWeek: number[] = new Array(7).fill(0);
  const hour: number[] = new Array(24).fill(0);

  const uniqueReleaseDates = new Set<string>();
  const JST_OFFSET = 9 * 60 * 60 * 1000;

  prototypes.forEach((p) => {
    if (!p.releaseDate) return;
    const date = new Date(p.releaseDate);
    if (Number.isNaN(date.getTime())) return;

    // Convert to JST
    const jstDate = new Date(date.getTime() + JST_OFFSET);

    // Maker's Rhythm
    const d = jstDate.getUTCDay(); // 0-6 (Sunday is 0)
    const h = jstDate.getUTCHours(); // 0-23
    dayOfWeek[d]++;
    hour[h]++;

    // Eternal Flame (YYYY-MM-DD in JST)
    const yyyy = jstDate.getUTCFullYear();
    const mm = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(jstDate.getUTCDate()).padStart(2, '0');
    uniqueReleaseDates.add(`${yyyy}-${mm}-${dd}`);
  });

  const releaseTimeDistribution = { dayOfWeek, hour };

  // Calculate Streaks
  const sortedDates = Array.from(uniqueReleaseDates).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let longestStreakEndDate: string | null = null;
  let tempStreak = 0;
  let prevDateVal: number | null = null;

  // Helper to parse YYYY-MM-DD to timestamp (UTC midnight, but represents JST date)
  const parseDateStr = (str: string) => {
    const [y, m, d] = str.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };

  for (const dateStr of sortedDates) {
    const dateVal = parseDateStr(dateStr);

    if (prevDateVal === null) {
      tempStreak = 1;
    } else {
      const diff = dateVal - prevDateVal;
      const oneDay = 24 * 60 * 60 * 1000;

      // Allow small margin for leap seconds or slight calc errors, though Date.UTC should be exact
      if (Math.abs(diff - oneDay) < 1000) {
        tempStreak++;
      } else {
        // Streak broken
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
          longestStreakEndDate = new Date(prevDateVal)
            .toISOString()
            .split('T')[0];
        }
        tempStreak = 1;
      }
    }
    prevDateVal = dateVal;
  }

  // Check final streak
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
    longestStreakEndDate = sortedDates[sortedDates.length - 1];
  }

  // Determine "Current" streak
  // If the last release date is Today or Yesterday (JST), the streak is alive.
  const nowJST = new Date(now.getTime() + JST_OFFSET);
  const todayJSTStr = nowJST.toISOString().split('T')[0]; // YYYY-MM-DD (UTC of JST time)

  const yesterdayJST = new Date(nowJST.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayJSTStr = yesterdayJST.toISOString().split('T')[0];

  const lastReleaseDate = sortedDates[sortedDates.length - 1];

  if (lastReleaseDate === todayJSTStr || lastReleaseDate === yesterdayJSTStr) {
    currentStreak = tempStreak;
  } else {
    currentStreak = 0;
  }

  const creationStreak = {
    currentStreak,
    longestStreak,
    longestStreakEndDate,
    totalActiveDays: sortedDates.length,
  };

  // --- Advanced Analysis (First Penguin, Star Alignment, Anniversary, Early Adopters) ---

  // 1. First Penguins (Earliest release of each year - JST)
  const firstPenguinsMap = new Map<number, NormalizedPrototype>();

  // 2. Star Alignment (Exact same timestamp)
  const timestampMap = new Map<string, NormalizedPrototype[]>();

  // 3. Anniversary Effect (Special Days)
  const specialDays: Record<
    string,
    {
      name: string;
      count: number;
      examples: Array<{ id: number; title: string; year: number }>;
    }
  > = {
    '01-01': { name: "New Year's Day", count: 0, examples: [] },
    '02-14': { name: "Valentine's Day", count: 0, examples: [] },
    '03-14': { name: 'White Day', count: 0, examples: [] },
    '04-01': { name: "April Fool's Day", count: 0, examples: [] },
    '05-04': { name: 'Star Wars Day', count: 0, examples: [] },
    '07-07': { name: 'Tanabata', count: 0, examples: [] },
    '10-31': { name: 'Halloween', count: 0, examples: [] },
    '11-11': { name: 'Pocky Day', count: 0, examples: [] },
    '12-25': { name: 'Christmas', count: 0, examples: [] },
  };

  // 4. Early Adopters (First use of Top Tags)
  const earlyAdoptersMap = new Map<string, NormalizedPrototype>();
  const topTagNames = new Set(topTags.slice(0, 50).map((t) => t.tag));

  // 5. Labor of Love (Gestation Period)
  const gestationData: Array<{
    id: number;
    title: string;
    durationDays: number;
    createDate: string;
    releaseDate: string;
  }> = [];
  const gestationDistribution: Record<string, number> = {
    'Less than 1 week': 0,
    '1 week - 1 month': 0,
    '1 month - 3 months': 0,
    '3 months - 6 months': 0,
    '6 months - 1 year': 0,
    'Over 1 year': 0,
  };

  // 6. Maternity Hospital (Events)
  const eventCounts: Record<string, number> = {};
  let independentCount = 0;
  let totalWithEventStatus = 0;

  // 7. Power of Deadlines (Daily Spikes)
  const dailyReleaseCounts: Record<string, number> = {};

  // 8. Weekend Warrior
  let sundaySprintCount = 0;
  let midnightCount = 0;
  let daytimeCount = 0;
  let totalReleaseCount = 0;

  // 9. Holy Day (MM-DD aggregation)
  const holyDayCounts: Record<string, number> = {};

  prototypes.forEach((p) => {
    if (!p.releaseDate) return;
    const date = new Date(p.releaseDate);
    if (Number.isNaN(date.getTime())) return;

    // JST Conversion for Calendar-based analysis
    const jstDate = new Date(date.getTime() + JST_OFFSET);
    const year = jstDate.getUTCFullYear();
    const mm = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(jstDate.getUTCDate()).padStart(2, '0');
    const mmdd = `${mm}-${dd}`;
    const yyyymmdd = `${year}-${mm}-${dd}`;

    // 7. Power of Deadlines
    dailyReleaseCounts[yyyymmdd] = (dailyReleaseCounts[yyyymmdd] || 0) + 1;

    // 8. Weekend Warrior
    const day = jstDate.getUTCDay(); // 0=Sun, 1=Mon, ...
    const hour = jstDate.getUTCHours();

    totalReleaseCount++;

    // Sunday Sprint: Sun 20:00 - Mon 05:00
    if ((day === 0 && hour >= 20) || (day === 1 && hour < 5)) {
      sundaySprintCount++;
    }

    // Midnight: 23:00 - 04:00
    if (hour >= 23 || hour < 4) {
      midnightCount++;
    }

    // Daytime: 09:00 - 18:00
    if (hour >= 9 && hour < 18) {
      daytimeCount++;
    }

    // 9. Holy Day
    holyDayCounts[mmdd] = (holyDayCounts[mmdd] || 0) + 1;

    // 1. First Penguin
    if (!firstPenguinsMap.has(year)) {
      firstPenguinsMap.set(year, p);
    } else {
      const currentFirst = firstPenguinsMap.get(year)!;
      // Compare timestamps (original UTC is fine for comparison)
      if (
        new Date(p.releaseDate).getTime() <
        new Date(currentFirst.releaseDate).getTime()
      ) {
        firstPenguinsMap.set(year, p);
      }
    }

    // 2. Star Alignment
    const ts = p.releaseDate;
    if (!timestampMap.has(ts)) {
      timestampMap.set(ts, []);
    }
    timestampMap.get(ts)!.push(p);

    // 3. Anniversary Effect
    if (specialDays[mmdd]) {
      specialDays[mmdd].count++;
      specialDays[mmdd].examples.push({
        id: p.id,
        title: p.prototypeNm,
        year: year,
      });
    }

    // 4. Early Adopters
    if (p.tags) {
      p.tags.forEach((tag) => {
        if (topTagNames.has(tag)) {
          if (!earlyAdoptersMap.has(tag)) {
            earlyAdoptersMap.set(tag, p);
          } else {
            const current = earlyAdoptersMap.get(tag)!;
            if (
              new Date(p.releaseDate).getTime() <
              new Date(current.releaseDate).getTime()
            ) {
              earlyAdoptersMap.set(tag, p);
            }
          }
        }
      });
    }

    // 5. Labor of Love
    if (p.createDate && p.releaseDate) {
      const createTime = new Date(p.createDate).getTime();
      const releaseTime = new Date(p.releaseDate).getTime();
      const diffMs = releaseTime - createTime;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        gestationData.push({
          id: p.id,
          title: p.prototypeNm,
          durationDays: diffDays,
          createDate: p.createDate,
          releaseDate: p.releaseDate,
        });

        if (diffDays < 7) gestationDistribution['Less than 1 week']++;
        else if (diffDays < 30) gestationDistribution['1 week - 1 month']++;
        else if (diffDays < 90) gestationDistribution['1 month - 3 months']++;
        else if (diffDays < 180) gestationDistribution['3 months - 6 months']++;
        else if (diffDays < 365) gestationDistribution['6 months - 1 year']++;
        else gestationDistribution['Over 1 year']++;
      }
    }

    // 6. Maternity Hospital
    if (p.events && p.events.length > 0) {
      totalWithEventStatus++;
      p.events.forEach((event) => {
        eventCounts[event] = (eventCounts[event] || 0) + 1;
      });
    } else {
      independentCount++;
      totalWithEventStatus++;
    }
  });

  // Format Results

  const firstPenguins = Array.from(firstPenguinsMap.entries())
    .sort((a, b) => b[0] - a[0]) // Newest year first
    .map(([year, p]) => ({
      year,
      prototype: {
        id: p.id,
        title: p.prototypeNm,
        releaseDate: p.releaseDate,
        user:
          p.teamNm ||
          (p.users && p.users.length > 0 ? p.users[0] : 'Unknown Creator'),
      },
    }));

  const starAlignments = Array.from(timestampMap.entries())
    .filter(([, protos]) => protos.length > 1)
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()) // Newest first
    .slice(0, 10) // Top 10
    .map(([ts, protos]) => ({
      timestamp: ts,
      prototypes: protos.map((p) => ({ id: p.id, title: p.prototypeNm })),
    }));

  const anniversaryEffect = Object.entries(specialDays)
    .map(([date, data]) => ({
      name: data.name,
      date,
      count: data.count,
      examples: data.examples.sort((a, b) => b.year - a.year).slice(0, 5), // Recent examples
    }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  const earlyAdopters = Array.from(earlyAdoptersMap.entries())
    .map(([tag, p]) => ({
      tag,
      prototypeId: p.id,
      prototypeTitle: p.prototypeNm,
      releaseDate: p.releaseDate,
    }))
    .sort(
      (a, b) =>
        new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime(),
    );

  const laborOfLove = {
    longestGestation: gestationData
      .sort((a, b) => b.durationDays - a.durationDays)
      .slice(0, 10),
    distribution: gestationDistribution,
  };

  const maternityHospital = {
    topEvents: Object.entries(eventCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([event, count]) => ({ event, count })),
    independentRatio:
      totalWithEventStatus > 0 ? independentCount / totalWithEventStatus : 0,
  };

  const powerOfDeadlines = {
    spikes: Object.entries(dailyReleaseCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([date, count]) => ({ date, count, score: count })), // Score is just count for now
  };

  const weekendWarrior = {
    sundaySprintCount,
    midnightCount,
    daytimeCount,
    totalCount: totalReleaseCount,
  };

  const holyDay = {
    topDays: Object.entries(holyDayCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([date, count]) => ({ date, count })),
  };

  metrics.makerRhythmAndStreak = performance.now() - stepStart;

  // --- End metrics collection ---

  const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
  metrics.total = elapsedMs;

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
        uniqueMaterials: Object.keys(materialCounts).length,
        averageAgeInDays: Math.round(averageAgeInDays * 100) / 100,
        datasetMinISO: datasetMin,
        datasetMaxISO: datasetMax,
        elapsedMs,
        metrics, // Add metrics to the summary log
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
    topMaterials,
    analyzedAt: new Date().toISOString(),
    anniversaryCandidates,
    releaseTimeDistribution,
    creationStreak,
    earlyAdopters,
    firstPenguins,
    starAlignments,
    anniversaryEffect,
    laborOfLove,
    maternityHospital,
    powerOfDeadlines,
    weekendWarrior,
    holyDay,
    _debugMetrics: metrics, // Include metrics in the returned object
  };
}
