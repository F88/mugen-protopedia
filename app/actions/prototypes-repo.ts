'use server';

/**
 * @fileoverview promidas-Repository-backed prototype server actions.
 *
 * Drop-in alternatives to the map-store actions in `prototypes.ts`. Gated by
 * the `USE_PROMIDAS_REPOSITORY` flag (see `lib/feature-flags`): when enabled
 * they read via the promidas in-memory Repository, otherwise they delegate to
 * the legacy map-store action in `prototypes.ts` (which stays untouched). A
 * consumer migrates by switching its import here; the flag then controls the
 * backend at runtime (default: legacy). Part of #136 / #181.
 */
import { getPrototypeNamesFromStore as getPrototypeNamesFromMapStore } from '@/app/actions/prototypes';
import { isPromidasRepositoryEnabled } from '@/lib/feature-flags';
import {
  getPrototypeNamesFromRepo,
  promidasRepository,
} from '@/lib/repositories/promidas-repository';

/**
 * Resolve prototype names for the given ids. Routes to the promidas snapshot
 * when `USE_PROMIDAS_REPOSITORY` is enabled, otherwise the legacy map-store.
 * Drop-in for `getPrototypeNamesFromStore` in `prototypes.ts`.
 */
export async function getPrototypeNamesFromStore(
  ids: number[],
): Promise<Record<number, string>> {
  if (isPromidasRepositoryEnabled()) {
    return getPrototypeNamesFromRepo(promidasRepository, ids);
  }
  return getPrototypeNamesFromMapStore(ids);
}
