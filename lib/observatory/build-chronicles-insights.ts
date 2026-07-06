/**
 * @fileoverview Observatory-only per-MATERIAL "Chronicles" insights.
 *
 * Powers Direction 2 of The Alchemist's Table — The Elemental Chronicles (see
 * docs/observatory/content/the-alchemists-table/the-elemental-chronicles.md).
 * For each material it derives two facets:
 *
 * - Facet 1, the key people: Pioneer / Grandmaster / Innovator (top-N, ties
 *   expand the list).
 * - Facet 2, the material's portrait: Symbiote (co-use), Domain (genre tags),
 *   Addictive Elixir (repeat rate / DX), Supernova (propagation speed).
 *
 * Fact-based only (`createDate`, `users`, `materials`, `tags`, `awards`) — never
 * engagement or `status`. Kept separate from the base analysis, like
 * `build-material-insights.ts` / `build-user-insights.ts`, so it never bloats the
 * 無限PP top-page pipeline.
 *
 * Date basis is `createDate` (falling back to `releaseDate`), matching the
 * maker-tenure semantics of `build-user-insights.ts`, so the Pioneer map here and
 * the Circle's Vanguard agree.
 */
import type { PrototypeForMpp } from '@/lib/api/prototypes';

import {
  activityDate,
  asArray,
  takeWithTies,
  type MinimalLogger,
} from './insights-shared';

/** An internal work reference (carries the whole team). */
interface WorkRef {
  prototypeId: number;
  prototypeName: string;
  users: string[];
  date: string;
}

/** One maker's earliest qualifying work — the unit of the Pioneer / Innovator lists. */
export interface MakerFirst {
  user: string;
  prototypeId: number;
  prototypeName: string;
  date: string;
}

export interface NamedCount {
  name: string;
  count: number;
}

/** Everything the Chronicles know about a single material. */
export interface MaterialChronicle {
  material: string;
  usageCount: number;
  /** Distinct makers who have used this material (across any number of works). */
  uniqueMakers: number;
  /** Facet 1 — the key people (distinct makers, earliest first; ties expand). */
  pioneers: MakerFirst[];
  grandmasters: NamedCount[];
  innovators: MakerFirst[];
  /** Facet 2 — the material's portrait. */
  symbiotes: NamedCount[];
  domains: NamedCount[];
  /** Repeat rate (0-1) and how many makers backed it, or null below the floor. */
  addictiveElixir: { rate: number; makers: number } | null;
  /**
   * Usage lifespan: the material's first and last use dates and the days between
   * them. Null if it has no dated works. Shown in The Nature of the Element.
   */
  lifespan: { firstUsed: string; lastUsed: string; days: number } | null;
  /**
   * Propagation speed (WORKS) — the material facet: for each milestone in
   * `supernovaMilestones`, the days from the material's first use to its N-th USE
   * (work using it). Only milestones actually reached are included. Shown in The
   * Nature of the Element.
   */
  supernova: { n: number; days: number }[];
  /**
   * Adoption speed (PEOPLE) — the maker facet: the same milestones measured over
   * DISTINCT makers (days from first use to when the N-th person adopted it).
   * Shown in The Forgers of this Element.
   */
  adoption: { n: number; days: number }[];
}

export interface ChroniclesInsights {
  materials: MaterialChronicle[];
  /**
   * Materials pioneered per maker — the materials this maker was among the first
   * ever to wield (rank-1 Pioneer), across ALL materials (no eligibility floor),
   * sorted by name. This is the Chronicles' Pioneer map seen "by maker": it feeds
   * {@link https://../the-circle-of-masters.md The Circle of Masters}' Vanguard
   * seat (which ranks by the list length), so both directions come from one
   * computation.
   */
  pioneerMaterialsByUser: Record<string, string[]>;
}

export interface ChroniclesOptions {
  logger?: MinimalLogger;
  /** Top-N per people/portrait list (ties at the boundary expand it). */
  listSize?: number;
  /** Distinct-maker milestones for the Supernova (days to reach each), ascending. */
  supernovaMilestones?: number[];
  /** Minimum qualifying makers for the Addictive Elixir to be reported. */
  addictiveFloor?: number;
}

const DEFAULTS = {
  listSize: 10,
  supernovaMilestones: [10, 50, 100],
  addictiveFloor: 10,
} as const;

/**
 * Reduce works to DISTINCT makers, each represented by their earliest work, then
 * take the top `size` by that date (ties expand). This is why the Pioneer /
 * Innovator lists are "top 5 people", not "top 5 works" — a prolific maker with
 * several early works appears once.
 */
function distinctMakerFirsts(works: WorkRef[], size: number): MakerFirst[] {
  const firstByUser = new Map<string, WorkRef>();
  for (const w of works) {
    for (const u of w.users) {
      const current = firstByUser.get(u);
      if (current == null || w.date < current.date) firstByUser.set(u, w);
    }
  }
  const entries: MakerFirst[] = [...firstByUser.entries()]
    .map(([user, w]) => ({
      user,
      prototypeId: w.prototypeId,
      prototypeName: w.prototypeName,
      date: w.date,
    }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.user.localeCompare(b.user));
  return takeWithTies(entries, size, (e) => e.date);
}

/**
 * Given ASCENDING dates, the days from the first date to the k-th, for each
 * milestone `k` actually reached. Used for both the works-based Supernova and the
 * maker-based Adoption — only the date series differs.
 */
function reachMilestones(
  sortedDates: string[],
  thresholds: readonly number[],
): { n: number; days: number }[] {
  return thresholds
    .filter((k) => sortedDates.length >= k)
    .map((k) => ({
      n: k,
      days: Math.round(
        (new Date(sortedDates[k - 1]).getTime() -
          new Date(sortedDates[0]).getTime()) /
          86_400_000,
      ),
    }));
}

/** A tag is noise for The Domain if it echoes a material or names an event. */
function isNoiseTag(tag: string, material: string, materialVocabCI: Set<string>): boolean {
  const t = tag.toLowerCase();
  if (t === material.toLowerCase()) return true; // self-name echo
  if (materialVocabCI.has(t)) return true; // any material's name in the tag field
  return /contest|hackathon|hackason/i.test(tag); // event-pattern tag
}

/**
 * Materials pioneered per maker, from a per-material works map: for each material
 * the maker(s) of its earliest work (ties at the min date all count), returned
 * per maker sorted by material name (deterministic). Shared by the full
 * Chronicles and the lightweight {@link buildPioneerMaterialsByUser}.
 */
function pioneerMaterialsFromWorks(
  works: Record<string, WorkRef[]>,
): Record<string, string[]> {
  const pioneerMaterialsByUser: Record<string, string[]> = {};
  for (const [material, list] of Object.entries(works)) {
    let minDate = '';
    for (const w of list) {
      if (w.date !== '' && (minDate === '' || w.date < minDate)) minDate = w.date;
    }
    if (minDate === '') continue;
    const firstMakers = new Set<string>();
    for (const w of list) {
      if (w.date === minDate) for (const u of w.users) firstMakers.add(u);
    }
    for (const u of firstMakers) {
      (pioneerMaterialsByUser[u] ??= []).push(material);
    }
  }
  // Deterministic order per maker (independent of material iteration order).
  for (const materials of Object.values(pioneerMaterialsByUser)) {
    materials.sort((a, b) => a.localeCompare(b));
  }
  return pioneerMaterialsByUser;
}

/**
 * Lightweight path for the Circle of Masters' Vanguard: JUST the per-maker
 * pioneered-materials map, WITHOUT the full per-material Chronicles (symbiotes,
 * domains, milestones, Addictive Elixir, ...). One pass collects each material's
 * works (date + makers); everything else the full builder computes is skipped.
 * Produces the SAME map as `buildChroniclesInsights(...).pioneerMaterialsByUser`.
 */
export function buildPioneerMaterialsByUser(
  prototypes: PrototypeForMpp[],
  options: { logger?: MinimalLogger } = {},
): Record<string, string[]> {
  const startTime = Date.now();
  const works: Record<string, WorkRef[]> = {};
  for (const prototype of prototypes) {
    const mats = [...new Set(asArray(prototype.materials))];
    if (mats.length === 0) continue;
    const ref: WorkRef = {
      prototypeId: prototype.id,
      prototypeName: prototype.prototypeNm,
      users: asArray(prototype.users),
      date: activityDate(prototype),
    };
    for (const m of mats) (works[m] ??= []).push(ref);
  }
  const pioneerMaterialsByUser = pioneerMaterialsFromWorks(works);
  options.logger?.debug(
    {
      elapsedMs: Date.now() - startTime,
      totalSamples: prototypes.length,
      distinctMaterials: Object.keys(works).length,
      pioneers: Object.keys(pioneerMaterialsByUser).length,
    },
    '[CHRONICLES] Built pioneer-materials-by-user (lightweight)',
  );
  return pioneerMaterialsByUser;
}

export function buildChroniclesInsights(
  prototypes: PrototypeForMpp[],
  options: ChroniclesOptions = {},
): ChroniclesInsights {
  const startTime = Date.now();
  const listSize = options.listSize ?? DEFAULTS.listSize;
  const supernovaMilestones =
    options.supernovaMilestones ?? DEFAULTS.supernovaMilestones;
  const addictiveFloor = options.addictiveFloor ?? DEFAULTS.addictiveFloor;

  const usage: Record<string, number> = {};
  const materialVocabCI = new Set<string>();
  // Per-material collections.
  const works: Record<string, WorkRef[]> = {}; // all works using the material
  const awardWorks: Record<string, WorkRef[]> = {}; // award-winning ones only
  const grandmaster: Record<string, Record<string, number>> = {}; // mat -> user -> count
  const symbiote: Record<string, Record<string, number>> = {}; // mat -> other mat -> count
  const domain: Record<string, Record<string, number>> = {}; // mat -> tag -> count
  // Per-user time-ordered works, for the Addictive Elixir.
  const byUser: Record<string, { date: string; mats: Set<string> }[]> = {};

  for (const prototype of prototypes) {
    const mats = [...new Set(asArray(prototype.materials))];
    if (mats.length === 0) continue;
    for (const m of mats) materialVocabCI.add(m.toLowerCase());

    const users = asArray(prototype.users);
    const tags = new Set(asArray(prototype.tags));
    const wonAward = asArray(prototype.awards).length > 0;
    const date = activityDate(prototype);
    const ref: WorkRef = {
      prototypeId: prototype.id,
      prototypeName: prototype.prototypeNm,
      users,
      date,
    };

    for (const m of mats) {
      usage[m] = (usage[m] ?? 0) + 1;
      (works[m] ??= []).push(ref);
      if (wonAward) (awardWorks[m] ??= []).push(ref);
      // Grandmaster: credit each maker.
      const gm = (grandmaster[m] ??= {});
      for (const u of users) gm[u] = (gm[u] ?? 0) + 1;
      // Symbiote: co-occurring materials.
      const sy = (symbiote[m] ??= {});
      for (const other of mats) if (other !== m) sy[other] = (sy[other] ?? 0) + 1;
      // Domain: tags on works using this material (filtered later).
      const dm = (domain[m] ??= {});
      for (const t of tags) dm[t] = (dm[t] ?? 0) + 1;
    }

    if (date !== '') {
      const matSet = new Set(mats);
      for (const u of users) (byUser[u] ??= []).push({ date, mats: matSet });
    }
  }

  // Addictive Elixir: per material, average share of a maker's LATER works that
  // reuse it (among makers with at least one work after their first use).
  for (const list of Object.values(byUser)) list.sort((a, b) => a.date.localeCompare(b.date));
  const retention: Record<string, { sum: number; makers: number }> = {};
  for (const list of Object.values(byUser)) {
    const firstIdx: Record<string, number> = {};
    list.forEach((w, i) => {
      for (const m of w.mats) if (firstIdx[m] === undefined) firstIdx[m] = i;
    });
    for (const m of Object.keys(firstIdx)) {
      const post = list.slice(firstIdx[m] + 1);
      if (post.length === 0) continue;
      const reused = post.filter((w) => w.mats.has(m)).length;
      const r = (retention[m] ??= { sum: 0, makers: 0 });
      r.sum += reused / post.length;
      r.makers += 1;
    }
  }

  // Materials pioneered per maker (rank-1 Pioneer), across ALL materials — feeds
  // the Circle's Vanguard. Shared with the lightweight buildPioneerMaterialsByUser.
  const pioneerMaterialsByUser = pioneerMaterialsFromWorks(works);

  // Every material earns a Chronicle, sorted by usage desc. Any size or
  // selection limit is the consumer's concern, not the builder's.
  const rankedMaterials = Object.keys(usage).sort((a, b) => usage[b] - usage[a]);

  const materials: MaterialChronicle[] = rankedMaterials.map((m) => {
    const pioneers = distinctMakerFirsts(works[m], listSize);
    const innovators = distinctMakerFirsts(awardWorks[m] ?? [], listSize);

    // Distinct makers = the keys of the per-maker work-count map for this material.
    const uniqueMakers = Object.keys(grandmaster[m]).length;
    const grandmasters = takeWithTies(
      Object.entries(grandmaster[m])
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      listSize,
      (g) => g.count,
    );

    const symbiotes = takeWithTies(
      Object.entries(symbiote[m] ?? {})
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      listSize,
      (s) => s.count,
    );

    const domains = takeWithTies(
      Object.entries(domain[m] ?? {})
        .filter(([tag]) => !isNoiseTag(tag, m, materialVocabCI))
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      listSize,
      (d) => d.count,
    );

    const ret = retention[m];
    const addictiveElixir =
      ret != null && ret.makers >= addictiveFloor
        ? { rate: ret.sum / ret.makers, makers: ret.makers }
        : null;

    // Supernova (WORKS): how fast N works came to use the material.
    const workDates = works[m]
      .map((w) => w.date)
      .filter((d) => d !== '')
      .sort();
    const supernova = reachMilestones(workDates, supernovaMilestones);
    const lifespan =
      workDates.length > 0
        ? {
            firstUsed: workDates[0],
            lastUsed: workDates[workDates.length - 1],
            days: Math.round(
              (new Date(workDates[workDates.length - 1]).getTime() -
                new Date(workDates[0]).getTime()) /
                86_400_000,
            ),
          }
        : null;

    // Adoption (PEOPLE): the date each DISTINCT maker first used the material,
    // sorted — so the k-th entry is when the k-th person started using it.
    const firstAdoption = new Map<string, string>();
    for (const w of works[m]) {
      if (w.date === '') continue;
      for (const u of w.users) {
        const prev = firstAdoption.get(u);
        if (prev == null || w.date < prev) firstAdoption.set(u, w.date);
      }
    }
    const adoption = reachMilestones(
      [...firstAdoption.values()].sort(),
      supernovaMilestones,
    );

    return {
      material: m,
      usageCount: usage[m],
      uniqueMakers,
      pioneers,
      grandmasters,
      innovators,
      symbiotes,
      domains,
      addictiveElixir,
      lifespan,
      supernova,
      adoption,
    };
  });

  if (options.logger) {
    options.logger.debug(
      {
        elapsedMs: Date.now() - startTime,
        totalSamples: prototypes.length,
        totalMaterials: materials.length,
        distinctMaterials: Object.keys(usage).length,
      },
      '[ANALYSIS] Built chronicles insights',
    );
  }

  return { materials, pioneerMaterialsByUser };
}
