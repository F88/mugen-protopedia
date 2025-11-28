import { useCallback, useEffect, useMemo, useState } from 'react';

import { analyzeCandidates } from '@/lib/analysis/entrypoints/client';
import type {
  PrototypeAnalysis,
  ServerPrototypeAnalysis,
} from '@/lib/analysis/types';

export type ClientAnniversariesState = {
  anniversaries: PrototypeAnalysis['anniversaries'] | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

/**
 * Recomputes anniversaries (birthdays/newborns) on the client using the user's
 * local timezone by fetching only candidate prototypes (filtered by UTC windows)
 * and running `analyzePrototypes` in the browser.
 *
 * This uses `anniversaryCandidates` metadata from server analysis to fetch a
 * minimal subset of prototypes, rather than fetching the entire dataset.
 *
 * @param serverAnalysis - Server analysis result containing anniversaryCandidates metadata
 * @param options - Optional configuration (enabled flag)
 */
export function useClientAnniversaries(
  serverAnalysis: ServerPrototypeAnalysis | null,
  options?: {
    enabled?: boolean;
  },
): ClientAnniversariesState {
  const enabled = options?.enabled !== undefined ? options.enabled : true;
  const [state, setState] = useState<{
    anniversaries: PrototypeAnalysis['anniversaries'] | null;
    isLoading: boolean;
    error: string | null;
  }>({ anniversaries: null, isLoading: enabled, error: null });

  const run = useCallback(
    async (signal?: AbortSignal) => {
      if (!enabled || !serverAnalysis) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }
      try {
        const { anniversaryCandidates } = serverAnalysis;

        // Use pre-filtered candidate prototypes from server (3-day window)
        // No need to fetch 10,000 items - server already filtered candidates
        const candidatePrototypes = anniversaryCandidates.mmdd;

        if (signal?.aborted) return;

        // Run anniversary analysis on candidate subset in user's timezone
        const analysis = analyzeCandidates(candidatePrototypes);
        if (signal?.aborted) return;

        setState({
          anniversaries: analysis.anniversaries,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (signal?.aborted) return;
        setState({
          anniversaries: null,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to recompute anniversaries',
        });
      }
    },
    [enabled, serverAnalysis],
  );

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run(controller.signal);
    return () => controller.abort();
  }, [run]);

  const refresh = useCallback(() => {
    if (!enabled || !serverAnalysis) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    void run();
  }, [enabled, serverAnalysis, run]);

  return useMemo(
    () => ({
      anniversaries: state.anniversaries,
      isLoading: state.isLoading,
      error: state.error,
      refresh,
    }),
    [state.anniversaries, state.isLoading, state.error, refresh],
  );
}
