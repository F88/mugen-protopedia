/**
 * @fileoverview React hooks for accessing cached prototype analysis data.
 *
 * 分析結果は疑似スナップショットであり更新頻度も低いため、SWR ではなく
 * 素直な `useState` と `useEffect` を使ってサーバーアクションを直接叩いている。
 */

import { useCallback, useEffect, useState } from 'react';

import {
  getAllAnalyses,
  getLatestAnalysis,
  type GetAllAnalysesResult,
} from '@/app/actions/analysis';

import type { PrototypeAnalysis } from '@/lib/utils/prototype-analysis';

/**
 * Shared state shape returned by analysis hooks.
 *
 * SWR を使用せずローカル state を直接扱うため、各フィールドは純粋な値と
 * imperative `refresh` を提供する構造になっている。
 */
type AnalysisHookState<T> = {
  /**
   * The latest analysis data, or null if not available.
   */
  data: T | null;
  /** Indicates whether the analysis data is currently being loaded. */
  isLoading: boolean;
  /** Latest error message, or null if no error occurred. */
  error: string | null;
  /** Refreshes the analysis data. */
  refresh: (options?: { forceRecompute?: boolean }) => void;
};

/**
 * Hook for accessing the latest analysis from cache without SWR.
 *
 * - トリガーのたびにサーバーアクションを直接呼び出し、最新分析を取得する。
 * - 分析データはサイズが大きく、更新頻度も低いため SWR キャッシュを挟まず
 *   必要時に明示フェッチする設計にしている。
 */
export function useLatestAnalysis(): AnalysisHookState<PrototypeAnalysis> {
  const [state, setState] = useState<{
    data: PrototypeAnalysis | null;
    isLoading: boolean;
    error: string | null;
  }>({
    data: null,
    isLoading: true,
    error: null,
  });

  const performFetchLatest = useCallback(
    async (signal?: AbortSignal, options?: { forceRecompute?: boolean }) => {
      try {
        const result = await getLatestAnalysis(options);

        if (signal?.aborted) {
          return;
        }

        if (result.ok) {
          setState({
            data: result.data,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            data: null,
            isLoading: false,
            error: result.error,
          });
        }
      } catch (error) {
        if (signal?.aborted) {
          return;
        }

        setState({
          data: null,
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void performFetchLatest(controller.signal);
    return () => {
      controller.abort();
    };
  }, [performFetchLatest]);

  const refresh = useCallback(
    (options?: { forceRecompute?: boolean }) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      void performFetchLatest(undefined, options);
    },
    [performFetchLatest],
  );

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
  };
}

/**
 * Hook for accessing all cached analyses with statistics (SWR 非利用版).
 *
 * 最新のみと同様、明示フェッチでスナップショットを取得する。分析結果が重い
 * データであること、キャッシュのリフレッシュを UI 側で明示的に制御したいことが
 * 理由で、SWR のデフォルト挙動には依存していない。
 */
export function useAllAnalyses(): AnalysisHookState<GetAllAnalysesResult> {
  const [state, setState] = useState<{
    data: GetAllAnalysesResult | null;
    isLoading: boolean;
    error: string | null;
  }>({
    data: null,
    isLoading: true,
    error: null,
  });

  const performFetchAll = useCallback(async (signal?: AbortSignal) => {
    try {
      const result = await getAllAnalyses();

      if (signal?.aborted) {
        return;
      }

      setState({
        data: result,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setState({
        data: null,
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void performFetchAll(controller.signal);
    return () => {
      controller.abort();
    };
  }, [performFetchAll]);

  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    void performFetchAll();
  }, [performFetchAll]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
  };
}
