/**
 * @fileoverview Observatory-only "Circle of Masters" seat rankings.
 *
 * Direction 1 of The Alchemist's Table (see
 * docs/observatory/content/the-alchemists-table/the-circle-of-masters.md). This is
 * a thin RANKING layer over the per-user aggregate ({@link UserInsights} from
 * `build-user-insights.ts`): every seat is a sort + threshold over facts already
 * gathered. The only external input is `pioneerMaterialsByUser` (for the
 * Vanguard), which comes from the Chronicles' shared first-work-per-material map.
 *
 * Fact-based only — never engagement or `status`. Trophy Hunter (awards) is
 * intentionally NOT a seat.
 */
import type { UserInsights, UserInsightsEntry } from './build-user-insights';
import { takeWithTies, type MinimalLogger } from './insights-shared';

/** One material a maker is the top (most-devoted) user of — a Purist "crown". */
export interface PuristCrown {
  material: string;
  /** How many of the maker's works use this material. */
  count: number;
  /** Usage rate = count / workCount (0..1): the share of works using it. */
  rate: number;
  /** Devotion score = count² / workCount (usage rate × works using it). */
  score: number;
}

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
  /**
   * Purist seat only: the materials this maker is the champion of. Lets the UI
   * crown a maker on several materials at once (e.g. M5Stack + AWS) instead of
   * forcing one arbitrary pick. Omitted on the other seats.
   */
  crowns?: PuristCrown[];
  /**
   * Vanguard seat only: the materials this maker pioneered (was among the first
   * ever to wield), sorted by name. Omitted on the other seats.
   */
  materials?: string[];
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
   * Extra floor for rate/ratio seats (the Weaver), layered on top of `minWorks`.
   * Effective only while > `minWorks`; at or below it, it is a no-op (the base
   * gate dominates).
   */
  rateFloor?: number;
  /** Podium size per seat (ties at the boundary expand it). */
  podium?: number;
  /** Materials pioneered per maker (from the Chronicles first-work map). */
  pioneerMaterialsByUser?: Record<string, string[]>;
}

// Tuning knobs. Two gotchas before editing these:
//   1. `minWorks` is the base gate applied to EVERY seat (see `eligible`), so the
//      per-seat floor `rateFloor` only has an effect while it stays ABOVE it.
//      Raise `minWorks` to/above `rateFloor` and that floor becomes a no-op — the
//      Weaver then shares the `minWorks` gate. Keep `minWorks` below `rateFloor`
//      for it to mean anything.
//   2. `podium` here is overridden by the caller: `circle-of-masters-analysis.ts`
//      passes `podium: 10`, so changing this value alone does NOT change the UI.
const DEFAULTS = {
  minWorks: 5,
  rateFloor: 5,
  podium: 10,
} as const;

/** Devotion score for a maker's material: usage rate x works with it. */
const devotionScore = (count: number, workCount: number): number =>
  workCount > 0 ? (count * count) / workCount : 0;

/**
 * The Purist fact, computed PER MATERIAL and independent of any single-material
 * pick: for every material, the maker(s) most devoted to it — the highest
 * {@link devotionScore} (`count^2 / workCount`, i.e. usage rate times the works
 * using it). Each such win is a "crown"; a maker can win several materials (e.g.
 * someone who always pairs M5Stack + AWS wins both), so ALL their crowns are
 * kept — no maker is forced down to one material.
 *
 * Returns, per maker holding >= 1 crown, their crowns sorted by score then
 * material name (deterministic, independent of `materialCounts` order).
 */
export function materialChampions(
  makers: UserInsightsEntry[],
): Map<string, PuristCrown[]> {
  // Pass 1: the best devotion score reached for each material.
  const bestByMaterial = new Map<string, number>();
  for (const u of makers) {
    for (const [m, c] of Object.entries(u.materialCounts)) {
      const score = devotionScore(c, u.workCount);
      if (score > (bestByMaterial.get(m) ?? -Infinity)) {
        bestByMaterial.set(m, score);
      }
    }
  }

  // Pass 2: every maker matching a material's best score wins its crown (ties
  // give a material more than one champion — accepted as fact).
  const crownsByUser = new Map<string, PuristCrown[]>();
  for (const u of makers) {
    for (const [m, c] of Object.entries(u.materialCounts)) {
      const score = devotionScore(c, u.workCount);
      if (score > 0 && score === bestByMaterial.get(m)) {
        const crowns = crownsByUser.get(u.user) ?? [];
        crowns.push({ material: m, count: c, rate: c / u.workCount, score });
        crownsByUser.set(u.user, crowns);
      }
    }
  }

  for (const crowns of crownsByUser.values()) {
    crowns.sort(
      (a, b) => b.score - a.score || a.material.localeCompare(b.material),
    );
  }
  return crownsByUser;
}

export function buildCircleInsights(
  userInsights: UserInsights,
  options: CircleOptions = {},
): CircleInsights {
  const startTime = Date.now();
  const minWorks = options.minWorks ?? DEFAULTS.minWorks;
  const rateFloor = options.rateFloor ?? DEFAULTS.rateFloor;
  const podium = options.podium ?? DEFAULTS.podium;
  const pioneerMaterialsByUser = options.pioneerMaterialsByUser ?? {};

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
    [...eligible].sort(
      (a, b) =>
        b.distinctMaterials - a.distinctMaterials ||
        a.user.localeCompare(b.user),
    ),
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
          b.distinctMaterials / b.workCount -
            a.distinctMaterials / a.workCount || a.user.localeCompare(b.user),
      ),
    (u) => u.distinctMaterials / u.workCount,
  ).map(({ row: u, rank }) => ({
    user: u.user,
    rank,
    value: u.distinctMaterials / u.workCount,
    detail: `${(u.distinctMaterials / u.workCount).toFixed(1)}x (${u.distinctMaterials}/${u.workCount})`,
  }));

  // Purist: rank the champion FACTS (maker + the material they top) by devotion
  // score, take the podium, then merge facts by maker so one seat can wear several
  // crowns (a maker keeps the best rank among their crowns).
  const crownsByUser = materialChampions(eligible);
  const championFacts = [...crownsByUser.entries()].flatMap(([user, crowns]) =>
    crowns.map((crown) => ({ user, crown })),
  );
  const purist = top(
    championFacts.sort(
      (a, b) =>
        b.crown.score - a.crown.score ||
        a.crown.material.localeCompare(b.crown.material) ||
        a.user.localeCompare(b.user),
    ),
    (f) => f.crown.score,
  ).reduce<SeatEntry[]>((seats, { row: { user, crown }, rank }) => {
    const existing = seats.find((s) => s.user === user);
    if (existing) {
      existing.crowns!.push(crown);
      existing.rank = Math.min(existing.rank, rank);
    } else {
      seats.push({
        user,
        rank,
        value: crown.score,
        detail: '',
        crowns: [crown],
      });
    }
    return seats;
  }, []);
  for (const seat of purist) {
    seat.crowns!.sort(
      (a, b) => b.score - a.score || a.material.localeCompare(b.material),
    );
    seat.value = seat.crowns![0].score;
    seat.detail = seat.crowns!.map((c) => c.material).join(', ');
  }
  purist.sort((a, b) => a.rank - b.rank);

  // Influence
  const vanguard = top(
    eligible
      .map((u) => ({
        user: u.user,
        materials: pioneerMaterialsByUser[u.user] ?? [],
      }))
      .filter((r) => r.materials.length > 0)
      .sort(
        (a, b) =>
          b.materials.length - a.materials.length ||
          a.user.localeCompare(b.user),
      ),
    (r) => r.materials.length,
  ).map(({ row: r, rank }) => ({
    user: r.user,
    rank,
    value: r.materials.length,
    detail: `${r.materials.length} materials pioneered`,
    materials: r.materials,
  }));

  // Meta — Grand Alchemist: holds 2+ seats. Each seat is its own distinct title
  // (Polymath, Weaver, Purist, Vanguard), so landing in two different seats'
  // podiums earns the honour.
  const titlesByUser: Record<string, Set<string>> = {};
  const record = (entries: SeatEntry[], title: string) => {
    for (const e of entries) (titlesByUser[e.user] ??= new Set()).add(title);
  };
  record(polymath, 'Polymath');
  record(weaver, 'Weaver');
  record(purist, 'Purist');
  record(vanguard, 'Vanguard');
  const grandAlchemists = Object.entries(titlesByUser)
    .filter(([, titles]) => titles.size >= 2)
    .map(([user, titles]) => ({ user, titles: [...titles] }))
    .sort(
      (a, b) =>
        b.titles.length - a.titles.length || a.user.localeCompare(b.user),
    );

  if (options.logger) {
    options.logger.debug(
      { elapsedMs: Date.now() - startTime, eligible: eligible.length },
      '[ANALYSIS] Built circle insights',
    );
  }

  // The effective works gate per seat. The Weaver's `rateFloor` is layered ON TOP
  // of the base gate, so its real gate is max(minWorks, rateFloor) (a no-op when
  // minWorks is the higher of the two). Emitted so the UI shows each seat's true
  // eligibility from a single source.
  const criteria: Record<SeatKey, SeatCriteria> = {
    polymath: { minWorks },
    weaver: { minWorks: Math.max(minWorks, rateFloor) },
    purist: { minWorks },
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
