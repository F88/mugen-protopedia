import { NormalizedPrototype } from '@/lib/api/prototypes';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

export type TimeDistributionsAndUniqueDates = {
  createTimeDistribution: {
    dayOfWeek: number[];
    hour: number[];
    heatmap: number[][];
  };
  createDateDistribution: {
    month: number[];
    year: Record<number, number>;
    daily: Record<number, Record<number, Record<number, number>>>;
  };
  releaseTimeDistribution: {
    dayOfWeek: number[];
    hour: number[];
    heatmap: number[][];
  };
  releaseDateDistribution: {
    month: number[];
    year: Record<number, number>;
    daily: Record<number, Record<number, Record<number, number>>>;
  };
  updateTimeDistribution: {
    dayOfWeek: number[];
    hour: number[];
    heatmap: number[][];
  };
  updateDateDistribution: {
    month: number[];
    year: Record<number, number>;
    daily: Record<number, Record<number, Record<number, number>>>;
  };
  uniqueReleaseDates: Set<string>;
};

/**
 * Computes release and update time distributions (heatmap data) and collects unique release dates.
 *
 * Runs on: server or UI (timezone-agnostic logic, but hardcoded to JST for specific analysis).
 *
 * @param prototypes - Array of normalized prototypes to analyze.
 * @returns Object containing release/update distributions and unique release dates set.
 */
export function buildTimeDistributionsAndUniqueDates(
  prototypes: NormalizedPrototype[],
  options?: { logger?: MinimalLogger },
): TimeDistributionsAndUniqueDates {
  const startTime = performance.now();
  // JST offset in milliseconds
  const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
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

  const uniqueReleaseDates = new Set<string>();

  prototypes.forEach((p) => {
    // Maker's Rhythm (Create)
    if (p.createDate) {
      const createDate = new Date(p.createDate);
      if (!Number.isNaN(createDate.getTime())) {
        const jstCreateDate = new Date(createDate.getTime() + JST_OFFSET_MS);
        const cd = jstCreateDate.getUTCDay();
        const ch = jstCreateDate.getUTCHours();
        const cm = jstCreateDate.getUTCMonth();
        const cy = jstCreateDate.getUTCFullYear();
        const cday = jstCreateDate.getUTCDate();
        createDayOfWeek[cd]++;
        createHour[ch]++;
        createMonth[cm]++;
        if (cy > 1900) {
          createYear[cy] = (createYear[cy] ?? 0) + 1;
          if (!createDaily[cy]) createDaily[cy] = {};
          if (!createDaily[cy][cm + 1]) createDaily[cy][cm + 1] = {};
          createDaily[cy][cm + 1][cday] =
            (createDaily[cy][cm + 1][cday] ?? 0) + 1;
        }
        createHeatmap[cd][ch]++;
      }
    }
    if (!p.releaseDate) return;
    const date = new Date(p.releaseDate);
    if (Number.isNaN(date.getTime())) return;
    // Convert to JST
    const jstDate = new Date(date.getTime() + JST_OFFSET_MS);
    // Maker's Rhythm (Release)
    const d = jstDate.getUTCDay();
    const h = jstDate.getUTCHours();
    const m = jstDate.getUTCMonth();
    const y = jstDate.getUTCFullYear();
    const day = jstDate.getUTCDate();
    dayOfWeek[d]++;
    hour[h]++;
    month[m]++;
    if (y > 1900) {
      year[y] = (year[y] ?? 0) + 1;
      if (!daily[y]) daily[y] = {};
      if (!daily[y][m + 1]) daily[y][m + 1] = {};
      daily[y][m + 1][day] = (daily[y][m + 1][day] ?? 0) + 1;
    }
    heatmap[d][h]++;
    // Maker's Rhythm (Update)
    if (p.updateDate) {
      const updateDate = new Date(p.updateDate);
      if (!Number.isNaN(updateDate.getTime())) {
        const jstUpdateDate = new Date(updateDate.getTime() + JST_OFFSET_MS);
        const ud = jstUpdateDate.getUTCDay();
        const uh = jstUpdateDate.getUTCHours();
        const um = jstUpdateDate.getUTCMonth();
        const uy = jstUpdateDate.getUTCFullYear();
        const uday = jstUpdateDate.getUTCDate();
        updateDayOfWeek[ud]++;
        updateHour[uh]++;
        updateMonth[um]++;
        if (uy > 1900) {
          updateYear[uy] = (updateYear[uy] ?? 0) + 1;
          if (!updateDaily[uy]) updateDaily[uy] = {};
          if (!updateDaily[uy][um + 1]) updateDaily[uy][um + 1] = {};
          updateDaily[uy][um + 1][uday] =
            (updateDaily[uy][um + 1][uday] ?? 0) + 1;
        }
        updateHeatmap[ud][uh]++;
      }
    }
    // Eternal Flame (YYYY-MM-DD in JST)
    const yyyy = jstDate.getUTCFullYear();
    const mm = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(jstDate.getUTCDate()).padStart(2, '0');
    uniqueReleaseDates.add(`${yyyy}-${mm}-${dd}`);
  });
  const result: TimeDistributionsAndUniqueDates = {
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
    uniqueReleaseDates,
  };

  if (options?.logger) {
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
    options.logger.debug(
      {
        elapsedMs,
        outputs: {
          createTimeDistribution: Object.keys(result.createTimeDistribution),
          createDateDistribution: Object.keys(result.createDateDistribution),
          releaseTimeDistribution: Object.keys(result.releaseTimeDistribution),
          releaseDateDistribution: Object.keys(result.releaseDateDistribution),
          updateTimeDistribution: Object.keys(result.updateTimeDistribution),
          updateDateDistribution: Object.keys(result.updateDateDistribution),
          uniqueReleaseDates: 'Set<string>',
        },
      },
      '[ANALYSIS] Time distributions computed',
    );
  }

  return result;
}
