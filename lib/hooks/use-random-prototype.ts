/**
 * @fileoverview Client hook for fetching random prototypes without SWR caching.
 *
 * ランダム取得は毎回異なる結果を求められるため、SWR のキャッシュは利用せずに
 * 直接フェッチしている。フェッチの成否はローカル state でのみ管理し、呼び出し側は
 * `getRandomPrototype` の戻り値をそのまま利用する設計にしている。
 */
'use client';

import { useCallback, useState } from 'react';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { getRandomPrototypeData } from '@/lib/fetcher/get-random-prototype';

type RandomPrototypeError = string | null;

/**
 * Result object returned by {@link useRandomPrototype}.
 */
type UseRandomPrototypeResult = {
  /**
   * Fetches a single random prototype. Returns `null` when no candidate exists or
   * 処理が失敗した場合。
   */
  getRandomPrototype: () => Promise<NormalizedPrototype | null>;
  /** Indicates that a random fetch is currently in progress. */
  isLoading: boolean;
  /** Latest error message (if any). */
  error: RandomPrototypeError;
};

/**
 * Hook for retrieving random ProtoPedia entries on demand.
 *
 * - Uses imperative fetching instead of SWR to guarantee a fresh random pick on each call.
 * - Exposes loading and error state for UI feedback while leaving data persistence to callers.
 */
export function useRandomPrototype(): UseRandomPrototypeResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<RandomPrototypeError>(null);

  const getRandomPrototype =
    useCallback(async (): Promise<NormalizedPrototype | null> => {
      setIsLoading(true);
      setError(null);

      try {
        return await getRandomPrototypeData();
      } catch (caught) {
        const message =
          caught instanceof Error
            ? caught.message
            : 'Failed to fetch random prototype.';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    }, []);

  return {
    getRandomPrototype,
    isLoading,
    error,
  };
}
