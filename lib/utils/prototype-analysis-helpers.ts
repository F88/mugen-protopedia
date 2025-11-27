/**
 * Shared helper utilities that power `analyzePrototypes`.
 *
 * ## Purpose
 *
 * - **TZ-agnostic helpers** (statuses, tags, teams, year distribution): safe to
 *   run on server or UI; produce identical results regardless of timezone.
 * - **TZ-sensitive helpers** (`buildAnniversaries`, `buildAnniversarySlice`):
 *   rely on `isBirthDay`, `isToday`, `calculateAge` from `anniversary-nerd`.
 *
 * ## Execution environment
 *
 * ```text
 *   ____    _   _   _ _____ ___ ___  _   _
 *  / ___|  / \ | | | |_   _|_ _/ _ \| \ | |
 * | |     / _ \| | | | | |  | | | | |  \| |
 * | |___ / ___ \ |_| | | |  | | |_| | |\  |
 *  \____/_/   \_\___/  |_| |___\___/|_| \_|
 *
 *  UI以外で「今日」を判定するな!
 *  Anniversary helpers MUST run on the UI for authoritative results.
 * ```
 *
 * **Timezone policy (non-negotiable):**
 *
 * - Anniversary-related helpers (`buildAnniversaries`, age calculations) are
 *   designed to run in the **UI** where the end-user timezone is authoritative.
 * - Server usage is allowed only as a **transitional fallback snapshot**; the
 *   client MUST recompute for production-critical "today" checks.
 * - Any new date-sensitive logic must follow the same UI-first pattern.
 * - See `docs/specs/analysis.md` for the full policy and rationale.
 */

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import {
  calculateAge,
  isBirthDay,
  isToday,
} from '@/lib/utils/anniversary-nerd';
import { JST_OFFSET_MS } from '@/lib/utils/time';

/**
 * Represents a prototype celebrating a birthday "today".
 *
 * @property years - Age in years; depends on the timezone where
 *   `calculateAge` was executed. UI recomputation recommended.
 */
export type BirthdayPrototype = {
  id: number;
  title: string;
  years: number;
  releaseDate: string;
};

/**
 * Represents a prototype published "today".
 *
 * Membership determined by `isToday` at runtime; timezone-sensitive.
 */
export type NewbornPrototype = {
  id: number;
  title: string;
  releaseDate: string;
};

/**
 * Summary slice containing birthday and newborn prototypes for "today".
 *
 * **TZ-sensitive**: Counts and arrays reflect the timezone where
 * `buildAnniversaries` executed. UI recomputation strongly recommended.
 */
export type AnniversariesSlice = {
  birthdayCount: number;
  birthdayPrototypes: BirthdayPrototype[];
  newbornCount: number;
  newbornPrototypes: NewbornPrototype[];
};

/**
 * Builds a histogram of prototype statuses, falling back to `unknown` when a
 * status code is missing.
 *
 * Runs on: **server or UI** (timezone-agnostic).
 *
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Status distribution map (status code/string → count).
 */
export function buildStatusDistribution(
  prototypes: NormalizedPrototype[],
): Record<string, number> {
  const distribution: Record<string, number> = {};
  prototypes.forEach((prototype) => {
    const status = prototype.status ?? 'unknown';
    distribution[status] = (distribution[status] ?? 0) + 1;
  });
  return distribution;
}

/**
 * Counts how many prototypes include at least one award entry.
 *
 * Runs on: **server or UI** (timezone-agnostic).
 *
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Count of prototypes with at least one award.
 */
export function countPrototypesWithAwards(
  prototypes: NormalizedPrototype[],
): number {
  return prototypes.filter(
    (prototype) => prototype.awards && prototype.awards.length > 0,
  ).length;
}

/**
 * Aggregates tag frequency, returning both the raw counts and the top 10 tags
 * sorted by usage.
 *
 * Runs on: **server or UI** (timezone-agnostic).
 *
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Object containing top 10 tags array and complete tag counts map.
 */
export function buildTopTags(prototypes: NormalizedPrototype[]): {
  topTags: Array<{ tag: string; count: number }>;
  tagCounts: Record<string, number>;
} {
  const tagCounts: Record<string, number> = {};
  prototypes.forEach((prototype) => {
    if (prototype.tags && Array.isArray(prototype.tags)) {
      prototype.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      });
    }
  });

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30)
    .map(([tag, count]) => ({ tag, count }));

  return { topTags, tagCounts };
}

/**
 * Computes the average age in days of all prototypes relative to the supplied
 * reference date, skipping invalid or future-dated entries.
 *
 * Runs on: **server** (default) but can rerun on the UI if a TZ-specific
 * reference date is required.
 *
 * @param prototypes - Array of normalized prototypes to analyze.
 * @param referenceDate - Date to measure age against (typically "now").
 * @returns Average age in days; 0 if no valid prototypes.
 */
export function computeAverageAgeInDays(
  prototypes: NormalizedPrototype[],
  referenceDate: Date,
): number {
  const ages = prototypes
    .map((prototype) => {
      const releaseDate = new Date(prototype.releaseDate);
      return (
        (referenceDate.getTime() - releaseDate.getTime()) /
        (1000 * 60 * 60 * 24)
      );
    })
    .filter((age) => !Number.isNaN(age) && age >= 0);

  if (ages.length === 0) {
    return 0;
  }

  const total = ages.reduce((sum, age) => sum + age, 0);
  return total / ages.length;
}

/**
 * Buckets prototypes by release year (UTC) while filtering out invalid years.
 *
 * Runs on: **server or UI** (timezone-agnostic).
 *
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Year distribution map (year → count).
 */
export function buildYearDistribution(
  prototypes: NormalizedPrototype[],
): Record<number, number> {
  const distribution: Record<number, number> = {};
  prototypes.forEach((prototype) => {
    const year = new Date(prototype.releaseDate).getFullYear();
    if (!Number.isNaN(year) && year > 1900) {
      distribution[year] = (distribution[year] ?? 0) + 1;
    }
  });
  return distribution;
}

/**
 * Tallies prototypes per team, trimming whitespace and returning the top 10
 * most prolific teams alongside the raw counts map.
 *
 * Runs on: **server or UI** (timezone-agnostic).
 *
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Object containing top 10 teams array and complete team counts map.
 */
export function buildTopTeams(prototypes: NormalizedPrototype[]): {
  topTeams: Array<{ team: string; count: number }>;
  teamCounts: Record<string, number>;
} {
  const teamCounts: Record<string, number> = {};
  prototypes.forEach((prototype) => {
    if (prototype.teamNm && prototype.teamNm.trim() !== '') {
      const team = prototype.teamNm.trim();
      teamCounts[team] = (teamCounts[team] ?? 0) + 1;
    }
  });

  const topTeams = Object.entries(teamCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30)
    .map(([team, count]) => ({ team, count }));

  return { topTeams, teamCounts };
}

/**
 * Aggregates material frequency, returning both the raw counts and the top 10 materials
 * sorted by usage.
 *
 * Runs on: **server or UI** (timezone-agnostic).
 *
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Object containing top 10 materials array and complete material counts map.
 */
export function buildTopMaterials(prototypes: NormalizedPrototype[]): {
  topMaterials: Array<{ material: string; count: number }>;
  materialCounts: Record<string, number>;
} {
  const materialCounts: Record<string, number> = {};
  prototypes.forEach((prototype) => {
    if (prototype.materials && Array.isArray(prototype.materials)) {
      prototype.materials.forEach((material) => {
        materialCounts[material] = (materialCounts[material] ?? 0) + 1;
      });
    }
  });

  const topMaterials = Object.entries(materialCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30)
    .map(([material, count]) => ({ material, count }));

  return { topMaterials, materialCounts };
}

/**
 * Derives birthday and newborn prototype lists using the shared anniversary
 * utilities (`isBirthDay`, `isToday`, `calculateAge`).
 *
 * **CRITICAL: Timezone-dependent function.**
 *
 * - Runs on: **UI (authoritative)**.
 * - Server usage: allowed only as a **fallback snapshot** until the UI
 *   recomputes. Do NOT rely on server results for production display.
 * - The runtime timezone determines which prototypes qualify as "today".
 * - Client recomputation via `preferClientTimezoneAnniversaries` flag is
 *   strongly recommended for any user-facing anniversary display.
 *
 * @param prototypes - Prototype array with minimal required fields (id, title/prototypeNm, releaseDate).
 * @returns Birthday and newborn arrays reflecting the current runtime TZ.
 */
export function buildAnniversaries(
  prototypes: Array<{
    id: number;
    releaseDate: string;
    title?: string;
    prototypeNm?: string;
  }>,
): {
  birthdayPrototypes: BirthdayPrototype[];
  newbornPrototypes: NewbornPrototype[];
} {
  const getTitle = (p: { title?: string; prototypeNm?: string }): string =>
    p.title ?? p.prototypeNm ?? '';

  const birthdayPrototypes = prototypes
    .filter(
      (prototype) =>
        prototype.releaseDate &&
        isBirthDay(prototype.releaseDate) &&
        // Exclude "newborns" (released today) from the birthday list.
        // Note: isToday() checks the full date (YYYY-MM-DD), so prototypes released
        // in previous years on this same month/day will return false for isToday()
        // and correctly appear in the birthday list.
        !isToday(prototype.releaseDate),
    )
    .map((prototype) => {
      const age = calculateAge(prototype.releaseDate);
      return {
        id: prototype.id,
        title: getTitle(prototype),
        years: age.years,
        releaseDate: prototype.releaseDate,
      };
    });

  const newbornPrototypes = prototypes
    .filter(
      (prototype) => prototype.releaseDate && isToday(prototype.releaseDate),
    )
    .map((prototype) => ({
      id: prototype.id,
      title: getTitle(prototype),
      releaseDate: prototype.releaseDate,
    }));

  return { birthdayPrototypes, newbornPrototypes };
}

/**
 * Produces a summarized anniversaries slice with counts alongside the raw
 * birthday/newborn arrays.
 *
 * **TZ-sensitivity inherited:** This helper is TZ-agnostic itself, but the
 * slice it produces is only as accurate as the input arrays. If the inputs
 * came from a server-side `buildAnniversaries`, the slice reflects server TZ.
 *
 * Runs on: **same side** that produced the birthday/newborn arrays (UI when
 * TZ fidelity matters, server for transitional fallback).
 *
 * @param birthdayPrototypes - Already-filtered birthday list.
 * @param newbornPrototypes - Already-filtered newborn list.
 * @returns Slice with counts and arrays.
 */
export function buildAnniversarySlice(
  birthdayPrototypes: BirthdayPrototype[],
  newbornPrototypes: NewbornPrototype[],
): AnniversariesSlice {
  return {
    birthdayCount: birthdayPrototypes.length,
    birthdayPrototypes,
    newbornCount: newbornPrototypes.length,
    newbornPrototypes,
  };
}

/**
 * Computes release and update time distributions (heatmap data) and collects unique release dates.
 *
 * Runs on: **server or UI** (timezone-agnostic logic, but hardcoded to JST for specific analysis).
 *
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Object containing release/update distributions and unique release dates set.
 */
export function buildTimeDistributionsAndUniqueDates(
  prototypes: NormalizedPrototype[],
) {
  const dayOfWeek: number[] = new Array(7).fill(0);
  const hour: number[] = new Array(24).fill(0);
  const heatmap: number[][] = Array.from({ length: 7 }, () =>
    new Array(24).fill(0),
  );

  const updateDayOfWeek: number[] = new Array(7).fill(0);
  const updateHour: number[] = new Array(24).fill(0);
  const updateHeatmap: number[][] = Array.from({ length: 7 }, () =>
    new Array(24).fill(0),
  );

  const uniqueReleaseDates = new Set<string>();

  prototypes.forEach((p) => {
    if (!p.releaseDate) return;
    const date = new Date(p.releaseDate);
    if (Number.isNaN(date.getTime())) return;

    // Convert to JST
    const jstDate = new Date(date.getTime() + JST_OFFSET_MS);

    // Maker's Rhythm (Release)
    const d = jstDate.getUTCDay(); // 0-6 (Sunday is 0)
    const h = jstDate.getUTCHours(); // 0-23
    dayOfWeek[d]++;
    hour[h]++;
    heatmap[d][h]++;

    // Maker's Rhythm (Update)
    if (p.updateDate) {
      const updateDate = new Date(p.updateDate);
      if (!Number.isNaN(updateDate.getTime())) {
        const jstUpdateDate = new Date(updateDate.getTime() + JST_OFFSET_MS);
        const ud = jstUpdateDate.getUTCDay();
        const uh = jstUpdateDate.getUTCHours();
        updateDayOfWeek[ud]++;
        updateHour[uh]++;
        updateHeatmap[ud][uh]++;
      }
    }

    // Eternal Flame (YYYY-MM-DD in JST)
    const yyyy = jstDate.getUTCFullYear();
    const mm = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(jstDate.getUTCDate()).padStart(2, '0');
    uniqueReleaseDates.add(`${yyyy}-${mm}-${dd}`);
  });

  return {
    releaseTimeDistribution: { dayOfWeek, hour, heatmap },
    updateTimeDistribution: {
      dayOfWeek: updateDayOfWeek,
      hour: updateHour,
      heatmap: updateHeatmap,
    },
    uniqueReleaseDates,
  };
}

/**
 * Calculates the current and longest streak of consecutive release days.
 *
 * Runs on: **server or UI** (timezone-agnostic logic, but relies on JST dates from input).
 *
 * @param uniqueReleaseDates - Set of unique release dates (YYYY-MM-DD).
 * @param now - Current date object.
 * @returns Object containing streak statistics.
 */
export function calculateCreationStreak(
  uniqueReleaseDates: Set<string>,
  now: Date,
) {
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
  const nowJST = new Date(now.getTime() + JST_OFFSET_MS);
  const todayJSTStr = nowJST.toISOString().split('T')[0]; // YYYY-MM-DD (UTC of JST time)

  const yesterdayJST = new Date(nowJST.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayJSTStr = yesterdayJST.toISOString().split('T')[0];

  const lastReleaseDate = sortedDates[sortedDates.length - 1];

  if (lastReleaseDate === todayJSTStr || lastReleaseDate === yesterdayJSTStr) {
    currentStreak = tempStreak;
  } else {
    currentStreak = 0;
  }

  return {
    currentStreak,
    longestStreak,
    longestStreakEndDate,
    totalActiveDays: sortedDates.length,
  };
}

/**
 * Performs advanced analysis including First Penguins, Star Alignments, etc.
 *
 * Runs on: **server or UI** (timezone-agnostic logic, but hardcoded to JST for specific analysis).
 *
 * @param prototypes - Array of normalized prototypes to analyze.
 * @param topTags - Array of top tags for Early Adopter analysis.
 * @returns Object containing advanced analysis results.
 */
export function buildAdvancedAnalysis(
  prototypes: NormalizedPrototype[],
  topTags: { tag: string; count: number }[],
) {
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

  // 10. Long-Term Evolution (Maintenance Period)
  const maintenanceData: Array<{
    id: number;
    title: string;
    maintenanceDays: number;
    releaseDate: string;
    updateDate: string;
  }> = [];
  let totalMaintenanceDays = 0;
  let prototypesWithMaintenance = 0;

  prototypes.forEach((p) => {
    if (!p.releaseDate) return;
    const date = new Date(p.releaseDate);
    if (Number.isNaN(date.getTime())) return;

    // JST Conversion for Calendar-based analysis
    const jstDate = new Date(date.getTime() + JST_OFFSET_MS);
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

    // 10. Long-Term Evolution (Maintenance Period)
    if (p.releaseDate && p.updateDate) {
      const releaseTime = new Date(p.releaseDate).getTime();
      const updateTime = new Date(p.updateDate).getTime();
      const diffMs = updateTime - releaseTime;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        prototypesWithMaintenance++;
        totalMaintenanceDays += diffDays;

        maintenanceData.push({
          id: p.id,
          title: p.prototypeNm,
          maintenanceDays: diffDays,
          releaseDate: p.releaseDate,
          updateDate: p.updateDate,
        });
      }
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
    .slice(0, 30) // Top 30
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
      .slice(0, 30),
    distribution: gestationDistribution,
  };

  const maternityHospital = {
    topEvents: Object.entries(eventCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 30)
      .map(([event, count]) => ({ event, count })),
    independentRatio:
      totalWithEventStatus > 0 ? independentCount / totalWithEventStatus : 0,
  };

  const powerOfDeadlines = {
    spikes: Object.entries(dailyReleaseCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 30)
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
      .slice(0, 30)
      .map(([date, count]) => ({ date, count })),
  };

  const longTermEvolution = {
    longestMaintenance: maintenanceData
      .sort((a, b) => b.maintenanceDays - a.maintenanceDays)
      .slice(0, 30),
    averageMaintenanceDays:
      prototypesWithMaintenance > 0
        ? totalMaintenanceDays / prototypesWithMaintenance
        : 0,
    maintenanceRatio:
      prototypes.length > 0 ? prototypesWithMaintenance / prototypes.length : 0,
  };

  return {
    firstPenguins,
    starAlignments,
    anniversaryEffect,
    earlyAdopters,
    laborOfLove,
    maternityHospital,
    powerOfDeadlines,
    weekendWarrior,
    holyDay,
    longTermEvolution,
  };
}
