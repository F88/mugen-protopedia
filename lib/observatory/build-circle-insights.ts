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
import { takeWithTies, type MinimalLogger } from './insights-shared';

/** One seated maker: the metric `value`, plus a human-readable `detail`. */
export interface SeatEntry {
  user: string;
  /**
   * Competition rank (1, 2, 2, 4-style): makers tied on the seat's metric share
   * a rank, so a podium expanded by ties at the boundary shows 10, 10, 10 —
   * not 10, 11, 12.
   */
  rank: number;
  value: number;
  detail: string;
}

/** The seat keys that carry a podium (everything except the meta-honour). */
export type SeatKey = 'polymath' | 'weaver' | 'purist' | 'vanguard';

/** The eligibility gate for one seat, surfaced so the UI can show it. */
export interface SeatCriteria {
  /** Effective minimum works to hold the seat (the base gate or a higher floor). */
  minWorks: number;
}

export interface CircleInsights {
  /** Range. */
  polymath: SeatEntry[];
  weaver: SeatEntry[];
  purist: SeatEntry[];
  /** Influence. */
  vanguard: SeatEntry[];
  /** Meta — makers who hold two or more seats (by title family). */
  grandAlchemists: { user: string; titles: string[] }[];
  /** Per-seat eligibility, so the UI can show each seat's gate. */
  criteria: Record<SeatKey, SeatCriteria>;
}

export interface CircleOptions {
  logger?: MinimalLogger;
  /**
   * Eligibility gate: minimum works to be an Alchemist at all. This is the
   * DOMINANT gate — it filters the whole pool up front (see `eligible`), so no
   * seat can ever surface a maker below it, and the per-seat floors below only
   * bite when they are HIGHER than this.
   */
  minWorks?: number;
  /**
   * Extra floor for the Purist, layered ON TOP of `minWorks`. Effective only
   * while > `minWorks`; at or below it, it is a no-op (the base gate dominates).
   */
  puristFloor?: number;
  /**
   * Extra floor for rate/ratio seats (the Weaver), layered on top of `minWorks`.
   * Effective only while > `minWorks` (same no-op rule as `puristFloor`).
   */
  rateFloor?: number;
  /** Podium size per seat (ties at the boundary expand it). */
  podium?: number;
  /** Materials pioneered per maker (from the Chronicles first-work map). */
  pioneerCountByUser?: Record<string, number>;
}

// Tuning knobs. Two gotchas before editing these:
//   1. `minWorks` is the base gate applied to EVERY seat (see `eligible`), so the
//      per-seat floors (`puristFloor`, `rateFloor`) only have an effect while
//      they stay ABOVE it. Raise `minWorks` to/above a floor and that floor
//      becomes a no-op — every seat then shares the `minWorks` gate. Keep
//      `minWorks` below the per-seat floors for them to mean anything.
//   2. `podium` here is overridden by the caller: `circle-of-masters-analysis.ts`
//      passes `podium: 10`, so changing this value alone does NOT change the UI.
const DEFAULTS = {
  minWorks: 5,
  rateFloor: 5,
  puristFloor: 10,
  podium: 10,
} as const;

/** The maker's most-used material and how many of their works use it. */
export function dominantMaterial(u: UserInsightsEntry): {
  material: string;
  count: number;
} {
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
  const podium = options.podium ?? DEFAULTS.podium;
  const pioneerCountByUser = options.pioneerCountByUser ?? {};

  // The dominant gate: filter the whole pool by `minWorks` once, up front. Every
  // seat derives from `eligible`, so this floor sits under all of them and no
  // per-seat floor (rateFloor / puristFloor) can ever reach below it.
  const eligible = userInsights.users.filter((u) => u.workCount >= minWorks);

  // Take the top `podium` (ties at the boundary expand it) and pair each row
  // with its competition rank, computed from the SAME `valueOf` used to sort and
  // to break the tie. Rows are already sorted, so the first index sharing a value
  // is that value's rank (tied rows get the same number).
  const top = <T>(rows: T[], valueOf: (r: T) => number | string) => {
    const taken = takeWithTies(rows, podium, valueOf);
    let rank = 0;
    let previous: number | string | undefined;
    return taken.map((row, index) => {
      const value = valueOf(row);
      if (index === 0 || value !== previous) rank = index + 1;
      previous = value;
      return { row, rank };
    });
  };

  // Range
  const polymath = top(
    [...eligible].sort((a, b) => b.distinctMaterials - a.distinctMaterials),
    (u) => u.distinctMaterials,
  ).map(({ row: u, rank }) => ({
    user: u.user,
    rank,
    value: u.distinctMaterials,
    detail: `${u.distinctMaterials} materials / ${u.workCount} works`,
  }));

  const weaver = top(
    eligible
      .filter((u) => u.workCount >= rateFloor)
      .sort(
        (a, b) =>
          b.distinctMaterials / b.workCount - a.distinctMaterials / a.workCount,
      ),
    (u) => u.distinctMaterials / u.workCount,
  ).map(({ row: u, rank }) => ({
    user: u.user,
    rank,
    value: u.distinctMaterials / u.workCount,
    detail: `${(u.distinctMaterials / u.workCount).toFixed(1)}x (${u.distinctMaterials}/${u.workCount})`,
  }));

  const purist = top(
    eligible
      .filter((u) => u.workCount >= puristFloor && u.distinctMaterials >= 1)
      .map((u) => ({ u, dom: dominantMaterial(u) }))
      .sort(
        (a, b) => b.dom.count / b.u.workCount - a.dom.count / a.u.workCount,
      ),
    (r) => r.dom.count / r.u.workCount,
  ).map(({ row: { u, dom }, rank }) => ({
    user: u.user,
    rank,
    value: dom.count / u.workCount,
    detail: `${((dom.count / u.workCount) * 100).toFixed(0)}% ${dom.material} (${dom.count}/${u.workCount})`,
  }));

  // Influence
  const vanguard = top(
    eligible
      .map((u) => ({ user: u.user, count: pioneerCountByUser[u.user] ?? 0 }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count),
    (r) => r.count,
  ).map(({ row: r, rank }) => ({
    user: r.user,
    rank,
    value: r.count,
    detail: `${r.count} materials pioneered`,
  }));

  // Meta — Grand Alchemist: holds 2+ seats (counted by title FAMILY, so the two
  // Polymath twins count once).
  const titlesByUser: Record<string, Set<string>> = {};
  const record = (entries: SeatEntry[], title: string) => {
    for (const e of entries) (titlesByUser[e.user] ??= new Set()).add(title);
  };
  record(polymath, 'Polymath');
  record(weaver, 'Polymath');
  record(purist, 'Purist');
  record(vanguard, 'Vanguard');
  const grandAlchemists = Object.entries(titlesByUser)
    .filter(([, titles]) => titles.size >= 2)
    .map(([user, titles]) => ({ user, titles: [...titles] }))
    .sort((a, b) => b.titles.length - a.titles.length);

  if (options.logger) {
    options.logger.debug(
      { elapsedMs: Date.now() - startTime, eligible: eligible.length },
      '[ANALYSIS] Built circle insights',
    );
  }

  // The effective works gate per seat. The per-seat floors are layered ON TOP of
  // the base gate, so the real gate is max(minWorks, floor): when minWorks is the
  // higher of the two it dominates and the floor is a no-op. Emitted so the UI
  // shows each seat's true eligibility from a single source.
  const criteria: Record<SeatKey, SeatCriteria> = {
    polymath: { minWorks },
    weaver: { minWorks: Math.max(minWorks, rateFloor) },
    purist: { minWorks: Math.max(minWorks, puristFloor) },
    vanguard: { minWorks },
  };

  return {
    polymath,
    weaver,
    purist,
    vanguard,
    grandAlchemists,
    criteria,
  };
}
