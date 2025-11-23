/**
 * @fileoverview Hook for retrieving a specific prototype via SWR caching.
 *
 * Prototype IDs are stable, so they are stored in the shared SWR cache
 * and reused across multiple components.
 * The cache can be updated via `mutate`, ensuring that every UI that
 * subscribes to the same ID is automatically synchronized to the latest
 * state.
 */
'use client';

import { useCallback } from 'react';
import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { getPrototype } from '@/lib/fetcher/get-prototype';

type UsePrototypeOptions = {
  id?: number | null;
};

/**
 * Result object returned by {@link usePrototype}.
 */
type UsePrototypeResult = {
  /** Latest prototype data for the requested ID, or null if unresolved. */
  prototype: NormalizedPrototype | null;
  /** Normalized error message from the SWR fetcher. */
  error: string | null;
  /** Indicates that the hook is loading or revalidating. */
  isLoading: boolean;
  /**
   * Imperative accessor for fetching arbitrary prototype IDs.
   *
   * When the requested ID matches the current ID of this hook,
   * the SWR cache is also updated to keep subscribers in sync.
   */
  fetchPrototype: (
    prototypeId: number,
  ) => Promise<NormalizedPrototype | undefined>;
};

/**
 * Hook for consuming a single ProtoPedia entry by ID with SWR-backed caching.
 *
 * - Stable IDs benefit from the shared SWR cache, ensuring consistent data
 *   across components.
 * - `fetchPrototype` exposes an imperative getter while preserving cache consistency.
 */
export function usePrototype(
  { id }: UsePrototypeOptions = {},
  config?: SWRConfiguration<NormalizedPrototype | undefined, Error>,
): UsePrototypeResult {
  const hasId = typeof id === 'number';

  const fetcher = async () => {
    if (!hasId) {
      return undefined;
    }
    return await getPrototype(id as number);
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    NormalizedPrototype | undefined,
    Error
  >(hasId ? ['prototype', id] : null, fetcher, {
    ...config,
  });

  const fetchPrototypeById = useCallback(
    async (prototypeId: number) => {
      const result = await getPrototype(prototypeId);
      if (hasId && prototypeId === id) {
        await mutate(result, { revalidate: false });
      }
      return result;
    },
    [hasId, id, mutate],
  );

  return {
    prototype: data ?? null,
    error: error ? error.message : null,
    isLoading: hasId ? isLoading || isValidating : false,
    fetchPrototype: fetchPrototypeById,
  };
}
