/**
 * @fileoverview
 * Batch-oriented prototype insights covering advanced storytelling metrics.
 *
 * Runs where timezone is stable (server or UI) but applies JST conversions for
 * calendar-grouped aggregations to keep reporting consistent across platforms.
 */

import { NormalizedPrototype } from '@/lib/api/prototypes';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

/**
 * Story-driven batch insights built from a single traversal over normalized prototypes.
 */
export type AdvancedAnalysis = {
  /**
   * First release of each year (JST) highlighting pioneering creators.
   */
  firstPenguins: Array<{
    year: number;
    prototype: {
      id: number;
      title: string;
      releaseDate: string;
      user: string;
    };
  }>;
  /**
   * Identical release timestamps that signal coordinated launches.
   */
  starAlignments: Array<{
    timestamp: string;
    prototypes: Array<{ id: number; title: string }>;
  }>;
  /**
   * Special day releases (e.g. Tanabata, Halloween) with recent examples.
   */
  anniversaryEffect: Array<{
    name: string;
    date: string;
    count: number;
    examples: Array<{ id: number; title: string; year: number }>;
  }>;
  /**
   * Earliest adopters for top tags, capturing trendsetters.
   */
  earlyAdopters: Array<{
    tag: string;
    prototypeId: number;
    prototypeTitle: string;
    releaseDate: string;
  }>;
  /**
   * Gestation durations from creation to release and category distribution.
   */
  laborOfLove: {
    longestGestation: Array<{
      id: number;
      title: string;
      durationDays: number;
      createDate: string;
      releaseDate: string;
    }>;
    distribution: Record<string, number>;
  };
  /**
   * Event participation mix and independent creators ratio.
   */
  maternityHospital: {
    topEvents: Array<{ event: string; count: number }>;
    independentRatio: number;
  };
  /**
   * Daily release spikes scored by volume.
   */
  powerOfDeadlines: {
    spikes: Array<{ date: string; count: number; score: number }>;
  };
  /**
   * Weekend and late-night release habits summary.
   */
  weekendWarrior: {
    sundaySprintCount: number;
    midnightCount: number;
    daytimeCount: number;
    totalCount: number;
  };
  /**
   * Top MM-DD release clusters across the catalog.
   */
  holyDay: {
    topDays: Array<{ date: string; count: number }>;
  };
  /**
   * Maintenance longevity statistics after release.
   */
  longTermEvolution: {
    longestMaintenance: Array<{
      id: number;
      title: string;
      maintenanceDays: number;
      releaseDate: string;
      updateDate: string;
    }>;
    averageMaintenanceDays: number;
    maintenanceRatio: number;
  };
};

/**
 * Performs advanced analysis including First Penguins, Star Alignments, Anniversary Effect, Early Adopters, Labor of Love, Maternity Hospital, Power of Deadlines, Weekend Warrior, Holy Day, and Long-Term Evolution.
 *
 * Runs on: server or UI (timezone-agnostic logic, but hardcoded to JST for specific analysis).
 *
 * @param prototypes - Array of normalized prototypes to analyze.
 * @param topTags - Array of top tags for Early Adopter analysis.
 * @param options - Optional logger injection for telemetry instrumentation.
 * @returns Object containing advanced analysis results.
 */
export function buildAdvancedAnalysis(
  prototypes: NormalizedPrototype[],
  topTags: { tag: string; count: number }[],
  options?: { logger?: MinimalLogger },
): AdvancedAnalysis {
  const startTime = performance.now();
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
  // JST offset in milliseconds
  const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
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
    const day = jstDate.getUTCDay();
    const hour = jstDate.getUTCHours();
    totalReleaseCount++;
    if ((day === 0 && hour >= 20) || (day === 1 && hour < 5)) {
      sundaySprintCount++;
    }
    if (hour >= 23 || hour < 4) {
      midnightCount++;
    }
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
  const firstPenguins = Array.from(firstPenguinsMap.entries())
    .sort((a, b) => b[0] - a[0])
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
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    .slice(0, 30)
    .map(([ts, protos]) => ({
      timestamp: ts,
      prototypes: protos.map((p) => ({ id: p.id, title: p.prototypeNm })),
    }));
  const anniversaryEffect = Object.entries(specialDays)
    .map(([date, data]) => ({
      name: data.name,
      date,
      count: data.count,
      examples: data.examples.sort((a, b) => b.year - a.year).slice(0, 5),
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
      .map(([date, count]) => ({ date, count, score: count })),
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
  const result: AdvancedAnalysis = {
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

  if (options?.logger) {
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
    options.logger.debug(
      {
        elapsedMs,
        outputs: Object.keys(result),
      },
      '[ANALYSIS]Advanced analysis computed',
    );
  }

  return result;
}
