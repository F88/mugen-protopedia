/**
 * @fileoverview Observatory-only "Circle of Masters" seat rankings.
 *
 * Direction 1 of The Alchemist's Table (see
 * docs/observatory/content/the-alchemists-table/the-circle-of-masters.md). This is
 * a thin RANKING layer over the per-user aggregate ({@link UserInsights} from
 * `build-user-insights.ts`): every seat is a sort + threshold over facts already
 * gathered. The only external input is `pioneerCountByUser` (for the Vanguard),
 * which comes from the Chronicles' shared first-work-per-material map.
 *
 * Fact-based only — never engagement or `status`. Trophy Hunter (awards) is
 * intentionally NOT a seat.
 */
import type { UserInsights, UserInsightsEntry } from './build-user-insights';
import { jstYear, takeWithTies, type MinimalLogger } from './insights-shared';

/** One seated maker: the metric `value`, plus a human-readable `detail`. */
export interface SeatEntry {
  user: string;
  value: number;
  detail: string;
}

export interface CircleInsights {
  /** Range. */
  polymathGrand: SeatEntry[];
  polymathRising: SeatEntry[];
  purist: SeatEntry[];
  /** Time. */
  veteran: SeatEntry[];
  perennial: SeatEntry[];
  rising: SeatEntry[];
  /** Influence. */
  vanguard: SeatEntry[];
  /** Meta — makers who hold two or more seats (by title family). */
  grandAlchemists: { user: string; titles: string[] }[];
}

export interface CircleOptions {
  logger?: MinimalLogger;
  /** Eligibility gate: minimum works to be an Alchemist at all. */
  minWorks?: number;
  /** Extra floor for the Purist (single-material devotion). */
  puristFloor?: number;
  /** Extra floor for rate/ratio seats (Rising Polymath). */
  rateFloor?: number;
  /** Rising = debuted within this many years of the latest debut year. */
  risingWindowYears?: number;
  /** Podium size per seat (ties at the boundary expand it). */
  podium?: number;
  /** Materials pioneered per maker (from the Chronicles first-work map). */
  pioneerCountByUser?: Record<string, number>;
}

const DEFAULTS = {
  minWorks: 3,
  puristFloor: 8,
  rateFloor: 6,
  risingWindowYears: 1,
  podium: 3,
} as const;

/** The maker's most-used material and how many of their works use it. */
function dominantMaterial(u: UserInsightsEntry): { material: string; count: number } {
  let material = '';
  let count = 0;
  for (const [m, c] of Object.entries(u.materialCounts)) {
    if (c > count) {
      count = c;
      material = m;
    }
  }
  return { material, count };
}

export function buildCircleInsights(
  userInsights: UserInsights,
  options: CircleOptions = {},
): CircleInsights {
  const startTime = Date.now();
  const minWorks = options.minWorks ?? DEFAULTS.minWorks;
  const puristFloor = options.puristFloor ?? DEFAULTS.puristFloor;
  const rateFloor = options.rateFloor ?? DEFAULTS.rateFloor;
  const risingWindowYears = options.risingWindowYears ?? DEFAULTS.risingWindowYears;
  const podium = options.podium ?? DEFAULTS.podium;
  const pioneerCountByUser = options.pioneerCountByUser ?? {};

  const eligible = userInsights.users.filter((u) => u.workCount >= minWorks);

  // Latest debut year across ALL makers — the anchor for "Rising".
  let latestYear = 0;
  for (const u of userInsights.users) {
    const y = jstYear(u.firstDate);
    if (!Number.isNaN(y) && y > latestYear) latestYear = y;
  }

  const top = <T>(rows: T[], valueOf: (r: T) => number | string) =>
    takeWithTies(rows, podium, valueOf);

  // Range
  const polymathGrand = top(
    [...eligible].sort((a, b) => b.distinctMaterials - a.distinctMaterials),
    (u) => u.distinctMaterials,
  ).map((u) => ({ user: u.user, value: u.distinctMaterials, detail: `${u.distinctMaterials} materials / ${u.workCount} works` }));

  const polymathRising = top(
    eligible
      .filter((u) => u.workCount >= rateFloor)
      .sort((a, b) => b.distinctMaterials / b.workCount - a.distinctMaterials / a.workCount),
    (u) => u.distinctMaterials / u.workCount,
  ).map((u) => ({
    user: u.user,
    value: u.distinctMaterials / u.workCount,
    detail: `${(u.distinctMaterials / u.workCount).toFixed(1)}x (${u.distinctMaterials}/${u.workCount})`,
  }));

  const purist = top(
    eligible
      .filter((u) => u.workCount >= puristFloor && u.distinctMaterials >= 1)
      .map((u) => ({ u, dom: dominantMaterial(u) }))
      .sort((a, b) => b.dom.count / b.u.workCount - a.dom.count / a.u.workCount),
    (r) => r.dom.count / r.u.workCount,
  ).map(({ u, dom }) => ({
    user: u.user,
    value: dom.count / u.workCount,
    detail: `${((dom.count / u.workCount) * 100).toFixed(0)}% ${dom.material} (${dom.count}/${u.workCount})`,
  }));

  // Time
  const veteran = top(
    eligible.filter((u) => u.firstDate !== '').sort((a, b) => a.firstDate.localeCompare(b.firstDate)),
    (u) => u.firstDate,
  ).map((u) => ({ user: u.user, value: jstYear(u.firstDate), detail: u.firstDate.slice(0, 10) }));

  const perennial = top(
    [...eligible].sort((a, b) => b.activeYears - a.activeYears || a.firstDate.localeCompare(b.firstDate)),
    (u) => u.activeYears,
  ).map((u) => ({ user: u.user, value: u.activeYears, detail: `${u.activeYears} years` }));

  const rising = top(
    eligible
      .filter((u) => {
        const y = jstYear(u.firstDate);
        return !Number.isNaN(y) && y >= latestYear - risingWindowYears;
      })
      .sort((a, b) => b.workCount - a.workCount),
    (u) => u.workCount,
  ).map((u) => ({ user: u.user, value: u.workCount, detail: `${u.workCount} works since ${u.firstDate.slice(0, 7)}` }));

  // Influence
  const vanguard = top(
    eligible
      .map((u) => ({ user: u.user, count: pioneerCountByUser[u.user] ?? 0 }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count),
    (r) => r.count,
  ).map((r) => ({ user: r.user, value: r.count, detail: `${r.count} materials pioneered` }));

  // Meta — Grand Alchemist: holds 2+ seats (counted by title FAMILY, so the two
  // Polymath twins count once).
  const titlesByUser: Record<string, Set<string>> = {};
  const record = (entries: SeatEntry[], title: string) => {
    for (const e of entries) (titlesByUser[e.user] ??= new Set()).add(title);
  };
  record(polymathGrand, 'Polymath');
  record(polymathRising, 'Polymath');
  record(purist, 'Purist');
  record(veteran, 'Veteran');
  record(perennial, 'Perennial');
  record(rising, 'Rising');
  record(vanguard, 'Vanguard');
  const grandAlchemists = Object.entries(titlesByUser)
    .filter(([, titles]) => titles.size >= 2)
    .map(([user, titles]) => ({ user, titles: [...titles] }))
    .sort((a, b) => b.titles.length - a.titles.length);

  if (options.logger) {
    options.logger.debug(
      { elapsedMs: Date.now() - startTime, eligible: eligible.length, latestYear },
      '[ANALYSIS] Built circle insights',
    );
  }

  return {
    polymathGrand,
    polymathRising,
    purist,
    veteran,
    perennial,
    rising,
    vanguard,
    grandAlchemists,
  };
}
