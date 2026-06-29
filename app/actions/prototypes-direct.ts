'use server';

/**
 * @fileoverview Direct (non-cached) prototype fetch server action.
 *
 * Backed by promidas's fetcher via {@link fetchPrototypesViaPromidasNoStore}.
 * Kept separate from the SDK-based `fetchPrototypesViaNoStoreClient` action in
 * `prototypes.ts` so the direct path can be adopted or rolled back
 * independently (switch the consumer import to revert). Used by the SHOW /
 * by-id path only.
 */

import { fetchPrototypesViaPromidasNoStore } from '@/lib/promidas-no-store-client';

import type {
  FetchPrototypesParams,
  FetchPrototypesResult,
} from '@/types/prototype-api.types';

/**
 * No-store prototype fetch backed by promidas's fetcher.
 *
 * Returns the same {@link FetchPrototypesResult} contract as
 * `fetchPrototypesViaNoStoreClient`, so consumers can switch between the two
 * without other changes.
 */
export async function fetchPrototypesViaPromidasNoStoreClient(
  params: FetchPrototypesParams = {},
): Promise<FetchPrototypesResult> {
  return fetchPrototypesViaPromidasNoStore(params);
}
