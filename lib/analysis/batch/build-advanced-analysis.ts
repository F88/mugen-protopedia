/**
 * @fileoverview
 * Batch-oriented prototype insights covering advanced storytelling metrics.
 *
 * Runs where timezone is stable (server or UI) but applies JST conversions for
 * calendar-grouped aggregations to keep reporting consistent across platforms.
 */

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import {
  createPrototypeLifecycleContext,
  type LifecycleMomentContext,
  type PrototypeLifecycleContext,
} from '../lifecycle';

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
    weekendHourlyCounts: number[];
    totalWeekendCount: number;
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
  /**
   * Evolution Span analysis (Distribution of active duration).
   */
  evolutionSpan: {
    distribution: {
      noUpdates: number;
      sameDayUpdate: number;
      within3Days: number;
      within7Days: number;
      within14Days: number;
      within30Days: number;
      within90Days: number;
      over90Days: number;
    };
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
  const collectors = createAdvancedCollectors(topTags);

  prototypes.forEach((prototype) => {
    const context = createPrototypeLifecycleContext(prototype);
    if (context) {
      collectors.collect(context);
    }
  });

  const result = collectors.finalize({ totalPrototypes: prototypes.length });

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

type SpecialDayStats = {
  name: string;
  count: number;
  examples: Array<{ id: number; title: string; year: number }>;
};

function createSpecialDayMap(): Record<string, SpecialDayStats> {
  return {
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
}

function createAdvancedCollectors(topTags: { tag: string; count: number }[]) {
  const firstPenguins = new Map<
    number,
    {
      prototype: NormalizedPrototype;
      timestampMs: number;
    }
  >();
  const timestampMap = new Map<string, NormalizedPrototype[]>();
  const specialDays = createSpecialDayMap();
  const earlyAdopters = new Map<
    string,
    {
      prototype: NormalizedPrototype;
      timestampMs: number;
    }
  >();
  const topTagNames = new Set(topTags.slice(0, 50).map((tag) => tag.tag));
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
  const eventCounts: Record<string, number> = {};
  let independentCount = 0;
  let totalWithEventStatus = 0;
  const dailyReleaseCounts: Record<string, number> = {};
  // Fri 18:00 - Mon 24:00 (Total 78 hours)
  // 0-5: Fri 18-23
  // 6-29: Sat 00-23
  // 30-53: Sun 00-23
  // 54-77: Mon 00-23
  const weekendHourlyCounts = new Array(78).fill(0);
  let totalWeekendCount = 0;
  const holyDayCounts: Record<string, number> = {};
  const maintenanceData: Array<{
    id: number;
    title: string;
    maintenanceDays: number;
    releaseDate: string;
    updateDate: string;
  }> = [];
  let totalMaintenanceDays = 0;
  let prototypesWithMaintenance = 0;

  const evolutionSpanCounts = {
    noUpdates: 0,
    sameDayUpdate: 0,
    within3Days: 0,
    within7Days: 0,
    within14Days: 0,
    within30Days: 0,
    within90Days: 0,
    over90Days: 0,
  };

  function collect(context: PrototypeLifecycleContext) {
    const { prototype, release } = context;

    collectFirstPenguin(release, prototype);
    collectStarAlignment(release, prototype);
    collectSpecialDays(release, prototype);
    collectEarlyAdopters(release, prototype);
    collectGestation(prototype);
    collectEvents(prototype);
    collectDeadlines(release);
    collectWeekendWarrior(release);
    collectHolyDay(release);
    collectMaintenance(context);
    collectEvolutionSpan(context);
  }

  function collectFirstPenguin(
    release: LifecycleMomentContext,
    prototype: NormalizedPrototype,
  ) {
    const record = firstPenguins.get(release.year);
    if (!record || release.timestampMs < record.timestampMs) {
      firstPenguins.set(release.year, {
        prototype,
        timestampMs: release.timestampMs,
      });
    }
  }

  function collectStarAlignment(
    release: LifecycleMomentContext,
    prototype: NormalizedPrototype,
  ) {
    const list = timestampMap.get(release.iso);
    if (list) {
      list.push(prototype);
    } else {
      timestampMap.set(release.iso, [prototype]);
    }
  }

  function collectSpecialDays(
    release: LifecycleMomentContext,
    prototype: NormalizedPrototype,
  ) {
    const bucket = specialDays[release.mmdd];
    if (!bucket) {
      return;
    }

    bucket.count += 1;
    bucket.examples.push({
      id: prototype.id,
      title: prototype.prototypeNm,
      year: release.year,
    });
  }

  function collectEarlyAdopters(
    release: LifecycleMomentContext,
    prototype: NormalizedPrototype,
  ) {
    if (!prototype.tags || prototype.tags.length === 0) {
      return;
    }

    prototype.tags.forEach((tag) => {
      if (!topTagNames.has(tag)) {
        return;
      }

      const current = earlyAdopters.get(tag);
      if (!current || release.timestampMs < current.timestampMs) {
        earlyAdopters.set(tag, {
          prototype,
          timestampMs: release.timestampMs,
        });
      }
    });
  }

  function collectGestation(prototype: NormalizedPrototype) {
    if (!prototype.createDate || !prototype.releaseDate) {
      return;
    }

    const createTime = Date.parse(prototype.createDate);
    const releaseTime = Date.parse(prototype.releaseDate);
    if (Number.isNaN(createTime) || Number.isNaN(releaseTime)) {
      return;
    }

    const diffDays = Math.floor(
      (releaseTime - createTime) / (1000 * 60 * 60 * 24),
    );
    if (diffDays <= 0) {
      return;
    }

    gestationData.push({
      id: prototype.id,
      title: prototype.prototypeNm,
      durationDays: diffDays,
      createDate: prototype.createDate,
      releaseDate: prototype.releaseDate,
    });

    if (diffDays < 7) {
      gestationDistribution['Less than 1 week'] += 1;
    } else if (diffDays < 30) {
      gestationDistribution['1 week - 1 month'] += 1;
    } else if (diffDays < 90) {
      gestationDistribution['1 month - 3 months'] += 1;
    } else if (diffDays < 180) {
      gestationDistribution['3 months - 6 months'] += 1;
    } else if (diffDays < 365) {
      gestationDistribution['6 months - 1 year'] += 1;
    } else {
      gestationDistribution['Over 1 year'] += 1;
    }
  }

  function collectEvents(prototype: NormalizedPrototype) {
    totalWithEventStatus += 1;

    if (prototype.events && prototype.events.length > 0) {
      prototype.events.forEach((event) => {
        eventCounts[event] = (eventCounts[event] ?? 0) + 1;
      });
      return;
    }

    independentCount += 1;
  }

  function collectDeadlines(release: LifecycleMomentContext) {
    dailyReleaseCounts[release.yyyymmdd] =
      (dailyReleaseCounts[release.yyyymmdd] ?? 0) + 1;
  }

  function collectWeekendWarrior(release: LifecycleMomentContext) {
    // Fri (5) 18:00 - 23:00
    if (release.weekday === 5 && release.hour >= 18) {
      const index = release.hour - 18; // 0-5
      weekendHourlyCounts[index] += 1;
      totalWeekendCount += 1;
    }
    // Sat (6) 00:00 - 23:00
    else if (release.weekday === 6) {
      const index = 6 + release.hour; // 6-29
      weekendHourlyCounts[index] += 1;
      totalWeekendCount += 1;
    }
    // Sun (0) 00:00 - 23:00
    else if (release.weekday === 0) {
      const index = 30 + release.hour; // 30-53
      weekendHourlyCounts[index] += 1;
      totalWeekendCount += 1;
    }
    // Mon (1) 00:00 - 23:00
    else if (release.weekday === 1) {
      const index = 54 + release.hour; // 54-77
      weekendHourlyCounts[index] += 1;
      totalWeekendCount += 1;
    }
  }

  function collectHolyDay(release: LifecycleMomentContext) {
    holyDayCounts[release.mmdd] = (holyDayCounts[release.mmdd] ?? 0) + 1;
  }

  function collectMaintenance(context: PrototypeLifecycleContext) {
    const { prototype, release, update } = context;
    if (!update) {
      return;
    }

    const diffDays = Math.floor(
      (update.timestampMs - release.timestampMs) / (1000 * 60 * 60 * 24),
    );
    if (diffDays <= 0) {
      return;
    }

    prototypesWithMaintenance += 1;
    totalMaintenanceDays += diffDays;
    maintenanceData.push({
      id: prototype.id,
      title: prototype.prototypeNm,
      maintenanceDays: diffDays,
      releaseDate: release.iso,
      updateDate: update.iso,
    });
  }

  function collectEvolutionSpan(context: PrototypeLifecycleContext) {
    const { release, update } = context;

    if (update) {
      const updateMs = update.timestampMs;
      const releaseMs = release.timestampMs;

      // Ensure update is not before release (sanity check)
      if (updateMs >= releaseMs) {
        const diffMs = updateMs - releaseMs;
        const diffDays = diffMs / (24 * 60 * 60 * 1000);

        if (diffDays < 1) {
          // Less than 24 hours or same timestamp
          evolutionSpanCounts.sameDayUpdate++;
        } else if (diffDays <= 3) {
          evolutionSpanCounts.within3Days++;
        } else if (diffDays <= 7) {
          evolutionSpanCounts.within7Days++;
        } else if (diffDays <= 14) {
          evolutionSpanCounts.within14Days++;
        } else if (diffDays <= 30) {
          evolutionSpanCounts.within30Days++;
        } else if (diffDays <= 90) {
          evolutionSpanCounts.within90Days++;
        } else {
          evolutionSpanCounts.over90Days++;
        }
      } else {
        // If update is before release, treat as same day update (data anomaly)
        evolutionSpanCounts.sameDayUpdate++;
      }
    } else {
      // No update date -> No Updates
      evolutionSpanCounts.noUpdates++;
    }
  }

  function finalize({
    totalPrototypes,
  }: {
    totalPrototypes: number;
  }): AdvancedAnalysis {
    return {
      firstPenguins: finalizeFirstPenguins(),
      starAlignments: finalizeStarAlignments(),
      anniversaryEffect: finalizeAnniversaryEffect(),
      earlyAdopters: finalizeEarlyAdopters(),
      laborOfLove: finalizeLaborOfLove(),
      maternityHospital: finalizeMaternityHospital(),
      powerOfDeadlines: finalizePowerOfDeadlines(),
      weekendWarrior: finalizeWeekendWarrior(),
      holyDay: finalizeHolyDay(),
      longTermEvolution: finalizeLongTermEvolution(totalPrototypes),
      evolutionSpan: {
        distribution: evolutionSpanCounts,
      },
    };
  }

  function finalizeFirstPenguins() {
    return Array.from(firstPenguins.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, record]) => ({
        year,
        prototype: {
          id: record.prototype.id,
          title: record.prototype.prototypeNm,
          releaseDate: record.prototype.releaseDate!,
          user:
            record.prototype.teamNm ||
            (record.prototype.users && record.prototype.users.length > 0
              ? record.prototype.users[0]
              : 'Unknown Creator'),
        },
      }));
  }

  function finalizeStarAlignments() {
    return Array.from(timestampMap.entries())
      .filter(([, protos]) => protos.length > 1)
      .sort((a, b) => Date.parse(b[0]) - Date.parse(a[0]))
      .slice(0, 30)
      .map(([timestamp, protos]) => ({
        timestamp,
        prototypes: protos.map((prototype) => ({
          id: prototype.id,
          title: prototype.prototypeNm,
        })),
      }));
  }

  function finalizeAnniversaryEffect() {
    return Object.entries(specialDays)
      .map(([date, data]) => ({
        name: data.name,
        date,
        count: data.count,
        examples: data.examples
          .slice()
          .sort((a, b) => b.year - a.year)
          .slice(0, 5),
      }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count);
  }

  function finalizeEarlyAdopters() {
    return Array.from(earlyAdopters.entries())
      .map(([tag, record]) => ({
        tag,
        prototypeId: record.prototype.id,
        prototypeTitle: record.prototype.prototypeNm,
        releaseDate: record.prototype.releaseDate!,
      }))
      .sort((a, b) => Date.parse(a.releaseDate) - Date.parse(b.releaseDate));
  }

  function finalizeLaborOfLove() {
    return {
      longestGestation: gestationData
        .slice()
        .sort((a, b) => b.durationDays - a.durationDays)
        .slice(0, 30),
      distribution: gestationDistribution,
    };
  }

  function finalizeMaternityHospital() {
    const topEvents = Object.entries(eventCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 30)
      .map(([event, count]) => ({ event, count }));

    const independentRatio =
      totalWithEventStatus > 0 ? independentCount / totalWithEventStatus : 0;

    return { topEvents, independentRatio };
  }

  function finalizePowerOfDeadlines() {
    return {
      spikes: Object.entries(dailyReleaseCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 30)
        .map(([date, count]) => ({ date, count, score: count })),
    };
  }

  function finalizeWeekendWarrior() {
    return {
      weekendHourlyCounts,
      totalWeekendCount,
    };
  }

  function finalizeHolyDay() {
    return {
      topDays: Object.entries(holyDayCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 30)
        .map(([date, count]) => ({ date, count })),
    };
  }

  function finalizeLongTermEvolution(totalPrototypes: number) {
    const longestMaintenance = maintenanceData
      .slice()
      .sort((a, b) => b.maintenanceDays - a.maintenanceDays)
      .slice(0, 30);

    const averageMaintenanceDays =
      prototypesWithMaintenance > 0
        ? totalMaintenanceDays / prototypesWithMaintenance
        : 0;

    const maintenanceRatio =
      totalPrototypes > 0 ? prototypesWithMaintenance / totalPrototypes : 0;

    return {
      longestMaintenance,
      averageMaintenanceDays,
      maintenanceRatio,
    };
  }

  return { collect, finalize };
}
