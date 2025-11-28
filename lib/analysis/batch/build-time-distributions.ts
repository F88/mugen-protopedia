/**
 * @fileoverview
 * Batch utilities that summarize prototype activity timelines using
 * JST-aligned buckets for consistent reporting.
 */

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import {
  createLifecycleMomentContext,
  createPrototypeLifecycleContext,
  type LifecycleMomentContext,
} from '../lifecycle';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

/**
 * Maker's Rhythm heatmaps and bucketed counts separated from date-keyed insights.
 */
export type TimeDistributions = {
  /**
   * Maker's Rhythm (create) grouped by month/year/day (JST).
   * - `month`: index 0-11 → Jan-Dec counts.
   * - `year`: YYYY → total created that year.
   * - `daily`: YYYY -> MM -> DD → granular bucket for heatmaps.
   */
  createDateDistribution: {
    month: number[];
    year: Record<number, number>;
    daily: Record<number, Record<number, Record<number, number>>>;
  };
  /**
   * Maker's Rhythm (update) grouped by month/year/day (JST) using the latest update timestamp.
   */
  updateDateDistribution: {
    month: number[];
    year: Record<number, number>;
    daily: Record<number, Record<number, Record<number, number>>>;
  };
  /**
   * Maker's Rhythm (release) grouped by month/year/day (JST) for release timeline visualizations.
   */
  releaseDateDistribution: {
    month: number[];
    year: Record<number, number>;
    daily: Record<number, Record<number, Record<number, number>>>;
  };
  /**
   * Maker's Rhythm (create) aggregated by weekday/hour with a 7×24 heatmap matrix.
   */
  createTimeDistribution: {
    dayOfWeek: number[];
    hour: number[];
    heatmap: number[][];
  };
  /**
   * Maker's Rhythm (update) aggregated by weekday/hour with a 7×24 heatmap matrix.
   */
  updateTimeDistribution: {
    dayOfWeek: number[];
    hour: number[];
    heatmap: number[][];
  };
  /**
   * Maker's Rhythm (release) aggregated by weekday/hour with a 7×24 heatmap matrix.
   */
  releaseTimeDistribution: {
    dayOfWeek: number[];
    hour: number[];
    heatmap: number[][];
  };
};

/**
 * Records time-of-day information (weekday/hour/heatmap) for a lifecycle moment.
 */
function recordTimeBuckets(
  moment: LifecycleMomentContext,
  dayOfWeek: number[],
  hour: number[],
  heatmap: number[][],
): void {
  const weekday = moment.weekday;
  const hourOfDay = moment.hour;
  dayOfWeek[weekday] += 1;
  hour[hourOfDay] += 1;
  heatmap[weekday][hourOfDay] += 1;
}

/**
 * Records calendar-based information (month/year/daily counts) for a lifecycle moment.
 */
function recordDateBuckets(
  moment: LifecycleMomentContext,
  month: number[],
  year: Record<number, number>,
  daily: Record<number, Record<number, Record<number, number>>>,
): void {
  const [yearNum, monthNum, dayNum] = moment.yyyymmdd
    .split('-')
    .map((value) => Number(value));

  if (
    !Number.isFinite(yearNum) ||
    !Number.isFinite(monthNum) ||
    !Number.isFinite(dayNum)
  ) {
    return;
  }
  if (yearNum <= 1900) {
    return;
  }

  const monthIndex = monthNum - 1;
  if (monthIndex >= 0 && monthIndex < month.length) {
    month[monthIndex] += 1;
  }

  year[yearNum] = (year[yearNum] ?? 0) + 1;
  if (!daily[yearNum]) {
    daily[yearNum] = {};
  }
  if (!daily[yearNum][monthNum]) {
    daily[yearNum][monthNum] = {};
  }
  daily[yearNum][monthNum][dayNum] =
    (daily[yearNum][monthNum][dayNum] ?? 0) + 1;
}

/**
 * Computes release and update time distributions (heatmap data).
 * Use `buildDateBasedPrototypeInsights` when you need date-keyed metrics such as
 * unique create/update/release days.
 *
 * Runs on: server or UI (timezone-agnostic logic, but hardcoded to JST for specific analysis).
 *
 * @param prototypes - Array of normalized prototypes to analyze.
 * @param options - Optional logger injection for telemetry instrumentation.
 * @returns Aggregated time distributions for create/release/update events.
 */
export function buildTimeDistributions(
  prototypes: NormalizedPrototype[],
  options?: { logger?: MinimalLogger },
): TimeDistributions {
  const startTime = performance.now();
  const createDayOfWeek: number[] = new Array(7).fill(0);
  const createHour: number[] = new Array(24).fill(0);
  const createMonth: number[] = new Array(12).fill(0);
  const createYear: Record<number, number> = {};
  const createDaily: Record<
    number,
    Record<number, Record<number, number>>
  > = {};
  const createHeatmap: number[][] = Array.from({ length: 7 }, () =>
    new Array(24).fill(0),
  );

  const dayOfWeek: number[] = new Array(7).fill(0);
  const hour: number[] = new Array(24).fill(0);
  const month: number[] = new Array(12).fill(0);
  const year: Record<number, number> = {};
  const daily: Record<number, Record<number, Record<number, number>>> = {};
  const heatmap: number[][] = Array.from({ length: 7 }, () =>
    new Array(24).fill(0),
  );

  const updateDayOfWeek: number[] = new Array(7).fill(0);
  const updateHour: number[] = new Array(24).fill(0);
  const updateMonth: number[] = new Array(12).fill(0);
  const updateYear: Record<number, number> = {};
  const updateDaily: Record<
    number,
    Record<number, Record<number, number>>
  > = {};
  const updateHeatmap: number[][] = Array.from({ length: 7 }, () =>
    new Array(24).fill(0),
  );

  prototypes.forEach((prototype) => {
    let createMoment = createLifecycleMomentContext(prototype.createDate);

    const lifecycle = createPrototypeLifecycleContext(prototype);
    if (lifecycle?.create) {
      createMoment = lifecycle.create;
    }

    if (createMoment) {
      recordTimeBuckets(
        createMoment,
        createDayOfWeek,
        createHour,
        createHeatmap,
      );
      recordDateBuckets(createMoment, createMonth, createYear, createDaily);
    }

    if (!lifecycle) {
      return;
    }

    const { release, update } = lifecycle;
    recordTimeBuckets(release, dayOfWeek, hour, heatmap);
    recordDateBuckets(release, month, year, daily);

    if (update) {
      recordTimeBuckets(update, updateDayOfWeek, updateHour, updateHeatmap);
      recordDateBuckets(update, updateMonth, updateYear, updateDaily);
    }
  });
  const timeDistributions: TimeDistributions = {
    createTimeDistribution: {
      dayOfWeek: createDayOfWeek,
      hour: createHour,
      heatmap: createHeatmap,
    },
    createDateDistribution: {
      month: createMonth,
      year: createYear,
      daily: createDaily,
    },
    releaseTimeDistribution: { dayOfWeek, hour, heatmap },
    releaseDateDistribution: { month, year, daily },
    updateTimeDistribution: {
      dayOfWeek: updateDayOfWeek,
      hour: updateHour,
      heatmap: updateHeatmap,
    },
    updateDateDistribution: {
      month: updateMonth,
      year: updateYear,
      daily: updateDaily,
    },
  };

  if (options?.logger) {
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
    options.logger.debug(
      {
        elapsedMs,
        outputs: {
          createTimeDistribution: Object.keys(
            timeDistributions.createTimeDistribution,
          ),
          createDateDistribution: Object.keys(
            timeDistributions.createDateDistribution,
          ),
          releaseTimeDistribution: Object.keys(
            timeDistributions.releaseTimeDistribution,
          ),
          releaseDateDistribution: Object.keys(
            timeDistributions.releaseDateDistribution,
          ),
          updateTimeDistribution: Object.keys(
            timeDistributions.updateTimeDistribution,
          ),
          updateDateDistribution: Object.keys(
            timeDistributions.updateDateDistribution,
          ),
        },
      },
      '[ANALYSIS] Time distributions computed',
    );
  }

  return timeDistributions;
}
