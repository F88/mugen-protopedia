/**
 * @fileoverview Observatory-only per-USER insights (single pass).
 *
 * A reusable, extensible per-user aggregate for maker-centric Observatory
 * analysis — starting with The Circle of Masters on The Alchemist's Table (see
 * docs/observatory/content/the-alchemists-table/the-circle-of-masters.md). Kept
 * separate from the base analysis, exactly like `build-material-insights.ts`, so
 * it never bloats the 無限PP top-page pipeline.
 *
 * Deliberately a RAW aggregate, not the seat rankings: it records per-maker facts
 * (work count, material / tag / award counts, tenure, solo-vs-team split, and how
 * many materials the maker pioneered) and lets consumers derive titles. New fields
 * can be added over time as user-centric analyses grow — unused fields are cheap
 * to carry and keep the structure immediately reusable.
 */
import type { PrototypeForMpp } from '@/lib/api/prototypes';

import {
  activityDate,
  asArray,
  jstYear,
  type MinimalLogger,
} from './insights-shared';

/** Per-maker aggregate. All fields are facts, never engagement (views / likes). */
export interface UserInsightsEntry {
  user: string;
  workCount: number;
  /** Per-material usage count across this maker's works (one per work, deduped). */
  materialCounts: Record<string, number>;
  distinctMaterials: number;
  /** Per-tag usage count across this maker's works (one per work, deduped). */
  tagCounts: Record<string, number>;
  distinctTags: number;
  /** Total award tokens summed across this maker's works. */
  awardCount: number;
  /** Number of this maker's works that won at least one award. */
  awardWorkCount: number;
  /** Earliest / latest `createDate` (ISO) across this maker's works ('' if none). */
  firstDate: string;
  latestDate: string;
  /**
   * Work count per calendar year (by `createDate`) — the maker's year-by-year
   * activity, so consumers can read the shape of a career, not just its span.
   */
  worksByYear: Record<number, number>;
  /** Distinct active years, derived from `worksByYear` (a convenience for Perennial). */
  activeYears: number;
  /** Works made solo vs as part of a team (multi-user or a `teamNm` present). */
  soloWorkCount: number;
  teamWorkCount: number;
}

export interface UserInsights {
  /** Per-user entries, sorted by workCount desc (then user asc for stability). */
  users: UserInsightsEntry[];
  totalUsers: number;
}

/** Mutable accumulator (converted to a {@link UserInsightsEntry} at the end). */
interface UserAccumulator {
  workCount: number;
  materialCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  awardCount: number;
  awardWorkCount: number;
  firstDate: string;
  latestDate: string;
  worksByYear: Record<number, number>;
  soloWorkCount: number;
  teamWorkCount: number;
}

function createAccumulator(): UserAccumulator {
  return {
    workCount: 0,
    materialCounts: {},
    tagCounts: {},
    awardCount: 0,
    awardWorkCount: 0,
    firstDate: '',
    latestDate: '',
    worksByYear: {},
    soloWorkCount: 0,
    teamWorkCount: 0,
  };
}

/**
 * Build the per-user aggregate in a single pass.
 *
 * Uses `createDate` (falling back to `releaseDate`) as the maker's activity date:
 * unlike material trends — which key on the public `releaseDate` — a maker's
 * tenure is best anchored to when the work was first registered.
 *
 * NB: cross-maker facts (e.g. "materials pioneered" for the Vanguard, which needs
 * the global first-work-per-material map) deliberately live elsewhere — this
 * structure holds only what a maker's OWN works determine.
 */
export function buildUserInsights(
  prototypes: PrototypeForMpp[],
  options?: { logger?: MinimalLogger },
): UserInsights {
  const startTime = Date.now();

  const byUser = new Map<string, UserAccumulator>();

  for (const prototype of prototypes) {
    // Dedupe users so a maker listed twice on one work is credited once (this
    // also makes the team check below count DISTINCT makers).
    const users = [...new Set(asArray(prototype.users))];
    if (users.length === 0) continue;

    const materials = asArray(prototype.materials);
    const tags = asArray(prototype.tags);
    const awards = asArray(prototype.awards);

    const date = activityDate(prototype);
    const year = jstYear(date);

    const isTeam = users.length > 1 || (prototype.teamNm ?? '').trim() !== '';
    const wonAward = awards.length > 0;
    // Dedupe within a work so listing a material / tag twice counts once.
    const workMaterials = new Set(materials);
    const workTags = new Set(tags);

    for (const user of users) {
      let acc = byUser.get(user);
      if (acc == null) {
        acc = createAccumulator();
        byUser.set(user, acc);
      }
      acc.workCount += 1;
      for (const material of workMaterials) {
        acc.materialCounts[material] = (acc.materialCounts[material] ?? 0) + 1;
      }
      for (const tag of workTags) {
        acc.tagCounts[tag] = (acc.tagCounts[tag] ?? 0) + 1;
      }
      if (wonAward) {
        acc.awardWorkCount += 1;
        acc.awardCount += awards.length;
      }
      if (date !== '') {
        if (acc.firstDate === '' || date < acc.firstDate) acc.firstDate = date;
        if (date > acc.latestDate) acc.latestDate = date;
      }
      if (!Number.isNaN(year)) {
        acc.worksByYear[year] = (acc.worksByYear[year] ?? 0) + 1;
      }
      if (isTeam) acc.teamWorkCount += 1;
      else acc.soloWorkCount += 1;
    }
  }

  const users: UserInsightsEntry[] = Array.from(byUser.entries())
    .map(([user, acc]) => ({
      user,
      workCount: acc.workCount,
      materialCounts: acc.materialCounts,
      distinctMaterials: Object.keys(acc.materialCounts).length,
      tagCounts: acc.tagCounts,
      distinctTags: Object.keys(acc.tagCounts).length,
      awardCount: acc.awardCount,
      awardWorkCount: acc.awardWorkCount,
      firstDate: acc.firstDate,
      latestDate: acc.latestDate,
      worksByYear: acc.worksByYear,
      activeYears: Object.keys(acc.worksByYear).length,
      soloWorkCount: acc.soloWorkCount,
      teamWorkCount: acc.teamWorkCount,
    }))
    .sort((a, b) => b.workCount - a.workCount || a.user.localeCompare(b.user));

  if (options?.logger) {
    options.logger.debug(
      {
        elapsedMs: Date.now() - startTime,
        totalUsers: users.length,
        totalSamples: prototypes.length,
      },
      '[ANALYSIS] Built user insights',
    );
  }

  return { users, totalUsers: users.length };
}
