export {
  buildAdvancedAnalysis,
  type AdvancedAnalysis,
} from './batch/build-advanced-analysis';
export {
  buildTimeDistributions,
  type TimeDistributions,
} from './batch/build-time-distributions';
export {
  buildDateBasedPrototypeInsights,
  createDateBasedPrototypeInsights,
  trackDateBasedPrototypeInsights,
  type DateBasedPrototypeInsights,
} from './batch/collect-unique-release-dates';
export {
  createLifecycleMomentContext,
  createPrototypeLifecycleContext,
  type LifecycleMomentContext,
  type PrototypeLifecycleContext,
} from './lifecycle';

/**
 * @fileoverview
 * Core analysis logic for prototype data aggregation, distribution, and pattern extraction.
 *
 * - Aggregates release/update/create distributions
 * - Calculates streaks, heatmaps, unique date extraction
 * - Performs multiple analyses in a single O(n) loop
 *
 * Always provide TSDoc for each function, describing intent, side effects, and return values.
 */

/**
 * Computes release and update time distributions (heatmap data) for Maker's
 * Rhythm visualizations.
 *
 * Runs on: server or UI (timezone-agnostic logic, but hardcoded to JST for specific analysis).
 *
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Aggregated time distributions.
 */

/**
 * Calculates the current and longest streak of consecutive release days.
 *
 * Runs on: server or UI (timezone-agnostic logic, but relies on JST dates from input).
 *
 * @param uniqueReleaseDates - Set of unique release dates (YYYY-MM-DD).
 * @param now - Current date object.
 * @returns Object containing streak statistics.
 */
export type CreationStreak = {
  currentStreak: number;
  longestStreak: number;
  longestStreakEndDate: string | null;
  totalActiveDays: number;
};

export function calculateCreationStreak(
  uniqueReleaseDates: Set<string>,
  now: Date,
  options?: {
    logger?: { debug: (payload: unknown, message?: string) => void };
  },
): CreationStreak {
  const startTime = performance.now();
  const sortedDates = Array.from(uniqueReleaseDates).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let longestStreakEndDate: string | null = null;
  let tempStreak = 0;
  let prevDateVal: number | null = null;
  const streakByDate = new Map<string, number>();
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
      if (Math.abs(diff - oneDay) < 1000) {
        tempStreak++;
      } else {
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
    streakByDate.set(dateStr, tempStreak);
  }
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
    longestStreakEndDate = sortedDates[sortedDates.length - 1];
  }
  // Determine "Current" streak
  // If the last release date is Today or Yesterday (JST), the streak is alive.
  const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const nowJST = new Date(now.getTime() + JST_OFFSET_MS);
  const todayJSTStr = nowJST.toISOString().split('T')[0];
  const yesterdayJST = new Date(nowJST.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayJSTStr = yesterdayJST.toISOString().split('T')[0];
  const lastRelevantDate = [...sortedDates]
    .reverse()
    .find((dateStr) => dateStr <= todayJSTStr);
  if (
    lastRelevantDate === todayJSTStr ||
    lastRelevantDate === yesterdayJSTStr
  ) {
    currentStreak = streakByDate.get(lastRelevantDate) ?? 0;
  } else {
    currentStreak = 0;
  }
  const result: CreationStreak = {
    currentStreak,
    longestStreak,
    longestStreakEndDate,
    totalActiveDays: sortedDates.length,
  };

  if (options?.logger) {
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
    options.logger.debug(
      {
        elapsedMs,
        totalDates: sortedDates.length,
        currentStreak,
        longestStreak,
        longestStreakEndDate,
      },
      '[ANALYSIS] Calculated creation streak',
    );
  }

  return result;
}

/**
 * Performs advanced analysis including First Penguins, Star Alignments, Anniversary Effect, Early Adopters, Labor of Love, Maternity Hospital, Power of Deadlines, Weekend Warrior, Holy Day, and Long-Term Evolution.
 *
 * Runs on: server or UI (timezone-agnostic logic, but hardcoded to JST for specific analysis).
 *
 * @param prototypes - Array of normalized prototypes to analyze.
 * @param topTags - Array of top tags for Early Adopter analysis.
 * @returns Object containing advanced analysis results.
 */
