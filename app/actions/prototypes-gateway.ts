'use server';

/**
 * @fileoverview Consumer-facing prototype server actions (facade).
 *
 * The cached reads (`getAllPrototypes` / `getPrototypeNames` /
 * `getMaxPrototypeId` / `getPrototypeById` / `getRandomPrototype`) route to the
 * promidas in-memory Repository when the `USE_PROMIDAS_REPOSITORY` flag is
 * enabled (see `lib/feature-flags`), and otherwise delegate to the legacy
 * map-store path (`prototypes.ts` stays untouched). `fetchPrototypesNoStore` is
 * the non-cached path (always via the promidas fetcher, not flag-gated).
 * Consumers import these purpose-named actions; backend-specific functions live
 * in `lib/`. Part of #136 / #181.
 */

import type { PrototypeForMpp } from '@/lib/api/prototypes';
import type {
  FetchPrototypesParams,
  FetchPrototypesResult,
} from '@/types/prototype-api.types';

import {
  getAllPrototypesFromMapOrFetch,
  getMaxPrototypeId as getMaxPrototypeIdFromMapStore,
  getPrototypeNamesFromStore,
} from '@/app/actions/prototypes';

import { isPromidasRepositoryEnabled } from '@/lib/feature-flags';
import { getRandomPrototypeData } from '@/lib/fetcher/get-random-prototype';
import { fetchPrototypesViaPromidasNoStore } from '@/lib/promidas-no-store-client';
import { promidasBackedRepository } from '@/lib/repositories/promidas-repository';
import { prototypeRepository } from '@/lib/repositories/prototype-repository';

/**
 * Fetch prototypes without caching, via the promidas fetcher (always hits
 * upstream, bypassing the in-memory snapshot). Not flag-gated; used where the
 * freshest data is required (e.g. the SHOW / by-id path).
 */
export async function fetchPrototypesNoStore(
  params: FetchPrototypesParams = {},
): Promise<FetchPrototypesResult> {
  return fetchPrototypesViaPromidasNoStore(params);
}

/**
 * Fetch all prototypes. Uses the promidas snapshot when
 * `USE_PROMIDAS_REPOSITORY` is enabled, otherwise the legacy map-store path.
 */
export async function getAllPrototypes(): Promise<FetchPrototypesResult> {
  if (isPromidasRepositoryEnabled()) {
    return promidasBackedRepository.getAllPrototypes();
  }
  return getAllPrototypesFromMapOrFetch();
}

/**
 * Resolve a single prototype by id (cached). Returns `undefined` when not found
 * (the app's by-id convention; see `prototypeRepository.getByPrototypeId`). Uses
 * the promidas snapshot when `USE_PROMIDAS_REPOSITORY` is enabled — the snapshot
 * is the complete dataset, so a miss is `undefined` with no fallback fetch
 * (promidas's `null` is normalized to `undefined` here). Otherwise the legacy
 * path (`prototypeRepository.getByPrototypeId`: map-store, then a by-id fetch
 * fallback on miss).
 */
export async function getPrototypeById(
  id: number,
): Promise<PrototypeForMpp | undefined> {
  if (isPromidasRepositoryEnabled()) {
    return (await promidasBackedRepository.getPrototypeById(id)) ?? undefined;
  }
  return prototypeRepository.getByPrototypeId(id);
}

/**
 * Pick a random prototype (cached). Returns `PrototypeForMpp | null` (`null`
 * when none is available); a load failure throws. Uses the promidas snapshot
 * when `USE_PROMIDAS_REPOSITORY` is enabled, otherwise the legacy map-store path
 * (`getRandomPrototypeData`, which collapses its Result and falls back to a
 * direct fetch).
 */
export async function getRandomPrototype(): Promise<PrototypeForMpp | null> {
  if (isPromidasRepositoryEnabled()) {
    return promidasBackedRepository.getRandomPrototype();
  }
  return getRandomPrototypeData();
}

/**
 * Resolve the maximum prototype id. Uses the promidas snapshot when
 * `USE_PROMIDAS_REPOSITORY` is enabled, otherwise the legacy map-store path.
 */
export async function getMaxPrototypeId(): Promise<number | null> {
  if (isPromidasRepositoryEnabled()) {
    return promidasBackedRepository.getMaxPrototypeId();
  }
  return getMaxPrototypeIdFromMapStore();
}

/**
 * Resolve prototype names for the given ids. Uses the promidas snapshot when
 * `USE_PROMIDAS_REPOSITORY` is enabled, otherwise the legacy map-store path.
 */
export async function getPrototypeNames(
  ids: number[],
): Promise<Record<number, string>> {
  if (isPromidasRepositoryEnabled()) {
    return promidasBackedRepository.getPrototypeNames(ids);
  }
  return getPrototypeNamesFromStore(ids);
}
