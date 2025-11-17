/**
 * @fileoverview Hook for retrieving a specific prototype via SWR caching.
 *
 * Prototype IDs are stable, so SWR のキャッシュに載せて複数コンポーネント間で共有する。
 * `mutate` を通じてキャッシュも更新可能になっており、同じ ID を参照する UI が
 * 自動で最新状態へ同期される構造になっている。
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
   * 请求した ID が現在の ID と一致する場合は SWR キャッシュも更新する。
   */
  fetchPrototype: (
    prototypeId: number,
  ) => Promise<NormalizedPrototype | undefined>;
};

/**
 * Hook for consuming a single ProtoPedia entry by ID with SWR-backed caching.
 *
 * - Stable IDs benefit from SWR の共有キャッシュ, ensuring consistent data across
 *   components.
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
