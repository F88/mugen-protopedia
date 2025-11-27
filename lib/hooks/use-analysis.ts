'use client';

/**
 * @fileoverview React hooks for accessing cached prototype analysis data.
 *
 * Analysis results behave like low-frequency snapshots, so instead of SWR
 * we use plain `useState` and `useEffect` to invoke server actions directly.
 */

import { useCallback, useEffect, useState } from 'react';
import { logger as clientLogger } from '@/lib/logger.client';

import {
  getAllAnalyses,
  getLatestAnalysis,
  type GetAllAnalysesResult,
} from '@/app/actions/analysis';

import type { ServerPrototypeAnalysis } from '@/lib/utils/prototype-analysis.types';

/**
 * Shared state shape returned by analysis hooks.
 *
 * Because we do not use SWR and instead manage local state directly,
 * each field is exposed as a plain value along with an imperative
 * `refresh` function.
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
 * - On each trigger, this hook calls the server action directly to obtain
 *   the latest analysis.
 * - Analysis data is large and infrequently updated, so we intentionally
 *   avoid SWR caching and instead fetch explicitly when needed.
 * - The returned analysis data is of type `ServerPrototypeAnalysis` and
 *   does not include the `anniversaries` field. When anniversaries are
 *   required on the client, use `useClientAnniversaries` together with
 *   this hook.
 */
export function useLatestAnalysis(): AnalysisHookState<ServerPrototypeAnalysis> {
  const [state, setState] = useState<{
    data: ServerPrototypeAnalysis | null;
    isLoading: boolean;
    error: string | null;
  }>({
    data: null,
    isLoading: true,
    error: null,
  });

  const performFetchLatest = useCallback(
    async (signal?: AbortSignal, options?: { forceRecompute?: boolean }) => {
      // Ensure state updates happen asynchronously to avoid synchronous
      // setState inside a React effect, which can trigger cascading renders.
      await Promise.resolve();

      const fetchStart = performance.now();
      clientLogger.debug(
        { options },
        '[ANALYSIS] useLatestAnalysis - starting fetchLatest',
      );
      try {
        const result = await getLatestAnalysis(options);

        const fetchElapsedMs =
          Math.round((performance.now() - fetchStart) * 100) / 100;
        clientLogger.debug(
          { fetchElapsedMs, resultOk: result?.ok ?? false },
          '[ANALYSIS] useLatestAnalysis - fetchLatest completed',
        );

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
    clientLogger.debug(
      '[ANALYSIS] useLatestAnalysis - Fetching latest analysis',
    );
    const controller = new AbortController();

    // Defer initial fetch to the next microtask so any setState inside
    // `performFetchLatest` cannot run synchronously during the effect body.
    (async () => {
      await Promise.resolve();
      void performFetchLatest(controller.signal);
    })();

    return () => {
      controller.abort();
    };
  }, [performFetchLatest]);

  const refresh = useCallback(
    (options?: { forceRecompute?: boolean }) => {
      clientLogger.debug(
        options ?? {},
        '[ANALYSIS] useLatestAnalysis - Refreshing latest analysis',
      );
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
 * Like the latest-only variant, this hook fetches the snapshot explicitly
 * instead of relying on SWR. The analysis results are relatively heavy,
 * and the UI is expected to control cache refresh behavior explicitly,
 * so we do not depend on SWR's default behavior.
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
    const fetchStart = performance.now();
    clientLogger.debug('[ANALYSIS] useAllAnalyses - starting fetchAll');
    try {
      const result = await getAllAnalyses();

      const fetchElapsedMs =
        Math.round((performance.now() - fetchStart) * 100) / 100;
      clientLogger.debug(
        { fetchElapsedMs },
        '[ANALYSIS] useAllAnalyses - fetchAll completed',
      );

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
    clientLogger.debug('[ANALYSIS] useAllAnalyses - Fetching all analyses');
    const controller = new AbortController();

    // Defer initial fetch to the next microtask so any setState inside
    // `performFetchAll` cannot run synchronously during the effect body.
    (async () => {
      await Promise.resolve();
      void performFetchAll(controller.signal);
    })();

    return () => {
      controller.abort();
    };
  }, [performFetchAll]);

  const refresh = useCallback(() => {
    clientLogger.debug('[ANALYSIS] useAllAnalyses - Refreshing all analyses');
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
