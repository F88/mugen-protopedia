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
    .slice(0, 10)
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
    .slice(0, 10)
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
    .slice(0, 10)
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
      (prototype) => prototype.releaseDate && isBirthDay(prototype.releaseDate),
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
