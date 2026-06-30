'use server';

/**
 * @fileoverview Consumer-facing prototype server actions (facade).
 *
 * The cached reads (`getAllPrototypes` / `getPrototypeNames` /
 * `getMaxPrototypeId`) route to the promidas in-memory Repository when the
 * `USE_PROMIDAS_REPOSITORY` flag is enabled (see `lib/feature-flags`), and
 * otherwise delegate to the legacy map-store actions in `prototypes.ts` (which
 * stays untouched). `fetchPrototypesNoStore` is the non-cached path (always via
 * the promidas fetcher, not flag-gated). Consumers import these purpose-named
 * actions; backend-specific functions live in `lib/`. Part of #136 / #181.
 */
import {
  getAllPrototypesFromMapOrFetch,
  getMaxPrototypeId as getMaxPrototypeIdFromMapStore,
  getPrototypeNamesFromStore,
} from '@/app/actions/prototypes';
import { isPromidasRepositoryEnabled } from '@/lib/feature-flags';
import { fetchPrototypesViaPromidasNoStore } from '@/lib/promidas-no-store-client';
import { promidasBackedRepository } from '@/lib/repositories/promidas-repository';
import type {
  FetchPrototypesParams,
  FetchPrototypesResult,
} from '@/types/prototype-api.types';

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
 * Fetch prototypes without caching, via the promidas fetcher (always hits
 * upstream, bypassing the in-memory snapshot). Not flag-gated; used where the
 * freshest data is required (e.g. the SHOW / by-id path).
 */
export async function fetchPrototypesNoStore(
  params: FetchPrototypesParams = {},
): Promise<FetchPrototypesResult> {
  return fetchPrototypesViaPromidasNoStore(params);
}
