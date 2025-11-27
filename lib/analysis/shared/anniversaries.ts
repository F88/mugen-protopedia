/**
 * @fileoverview
 * Timezone-sensitive anniversary helpers used by prototype analysis.
 *
 * These helpers MUST execute in the UI/runtime that reflects the end-user
 * timezone. Server usage is allowed only as a fallback snapshot until the
 * client recomputes authoritative values.
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

import type {
  BirthdayPrototype,
  NewbornPrototype,
  AnniversariesSlice,
} from '../types';
import {
  calculateAge,
  isBirthDay,
  isToday,
} from '@/lib/utils/anniversary-nerd';

/**
 * Derives birthday and newborn prototype lists using shared anniversary
 * utilities (`isBirthDay`, `isToday`, `calculateAge`).
 *
 * Runs on: **UI (authoritative)**.
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
  options?: {
    logger?: { debug: (payload: unknown, message?: string) => void };
  },
): {
  birthdayPrototypes: BirthdayPrototype[];
  newbornPrototypes: NewbornPrototype[];
} {
  const startTime = performance.now();
  const getTitle = (p: { title?: string; prototypeNm?: string }): string =>
    p.title ?? p.prototypeNm ?? '';

  const birthdayPrototypes = prototypes
    .filter(
      (prototype) =>
        prototype.releaseDate &&
        isBirthDay(prototype.releaseDate) &&
        !isToday(prototype.releaseDate),
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

  if (options?.logger) {
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
    options.logger.debug(
      {
        elapsedMs,
        inputCount: prototypes.length,
        birthdayCount: birthdayPrototypes.length,
        newbornCount: newbornPrototypes.length,
      },
      '[ANALYSIS] Built anniversaries lists',
    );
  }

  return { birthdayPrototypes, newbornPrototypes };
}

/**
 * Produces a summarized anniversaries slice with counts alongside the raw
 * birthday/newborn arrays.
 *
 * Runs on: **same runtime** that produced the birthday/newborn arrays.
 */
export function buildAnniversarySlice(
  birthdayPrototypes: BirthdayPrototype[],
  newbornPrototypes: NewbornPrototype[],
  options?: {
    logger?: { debug: (payload: unknown, message?: string) => void };
  },
): AnniversariesSlice {
  const startTime = performance.now();
  const slice: AnniversariesSlice = {
    birthdayCount: birthdayPrototypes.length,
    birthdayPrototypes,
    newbornCount: newbornPrototypes.length,
    newbornPrototypes,
  };

  if (options?.logger) {
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
    options.logger.debug(
      {
        elapsedMs,
        birthdayCount: slice.birthdayCount,
        newbornCount: slice.newbornCount,
      },
      '[ANALYSIS] Built anniversary slice',
    );
  }

  return slice;
}
