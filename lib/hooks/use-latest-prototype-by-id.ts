/**
 * @fileoverview Hook for retrieving a specific prototype via SWR caching.
 *
 * Prototype IDs are stable, so they are stored in the shared SWR cache
 * and reused across multiple components.
 *
 * This hook is intentionally read-only from the caller's perspective:
 * it exposes the latest prototype, loading state, and a normalized error
 * message, but does not surface SWR's `mutate` function. Callers that need
 * imperative updates should use the underlying fetcher instead.
 */
'use client';
import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { getLatestPrototypeById } from '@/lib/fetcher/get-latest-prototype-by-id';

type UseLatestPrototypeByIdOptions = {
  id?: number | null;
};

/**
 * Result object returned by {@link useLatestPrototypeById}.
 */
type UseLatestPrototypeByIdResult = {
  /** Latest prototype data for the requested ID, or null if unresolved. */
  prototype: NormalizedPrototype | null;
  /** Normalized error message from the SWR fetcher. */
  error: string | null;
  /** Indicates that the hook is loading or revalidating. */
  isLoading: boolean;
};

/**
 * Hook for consuming a single ProtoPedia entry by ID with SWR-backed caching.
 *
 * - Stable IDs benefit from the shared SWR cache, ensuring consistent data
 *   across components.
 * - Designed primarily for reactive consumers (e.g. detail views) rather
 *   than imperative one-shot fetches.
 */
export function useLatestPrototypeById(
  { id }: UseLatestPrototypeByIdOptions = {},
  config: SWRConfiguration<NormalizedPrototype | undefined, Error> = {
    // Reasonable defaults for SHOW/useLatestPrototypeById:
    // - Do not refetch aggressively when data is still fresh.
    // - Avoid surprise refetches on window focus.
    dedupingInterval: 5_000,
    revalidateOnFocus: false,
    revalidateIfStale: true,
  },
): UseLatestPrototypeByIdResult {
  const hasId = typeof id === 'number';

  const fetcher = async () => {
    if (!hasId) {
      return undefined;
    }
    return await getLatestPrototypeById(id as number);
  };

  const { data, error, isLoading, isValidating } = useSWR<
    NormalizedPrototype | undefined,
    Error
  >(hasId ? ['prototype', id] : null, fetcher, config);

  return {
    prototype: data ?? null,
    error: error ? error.message : null,
    isLoading: hasId ? isLoading || isValidating : false,
  };
}
