import { useCallback, useEffect, useMemo, useState } from 'react';

import { getPrototypes } from '@/lib/fetcher/get-prototypes';
import {
  analyzePrototypes,
  type PrototypeAnalysis,
} from '@/lib/utils/prototype-analysis';

export type ClientAnniversariesState = {
  anniversaries: PrototypeAnalysis['anniversaries'] | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

/**
 * Recomputes anniversaries (birthdays/newborns) on the client using the user's
 * local timezone by fetching a snapshot of prototypes and running
 * `analyzePrototypes` in the browser.
 *
 * Notes:
 * - This may fetch a large payload (up to 10,000 items) depending on upstream
 *   snapshot size. Use only when TZ-accurate anniversaries are required.
 * - Other analysis stats are not recomputed nor returned here — only the
 *   `anniversaries` slice is exposed for UI replacement.
 */
export function useClientAnniversaries(options?: {
  enabled?: boolean;
}): ClientAnniversariesState {
  const enabled = options?.enabled !== undefined ? options.enabled : true;
  const [state, setState] = useState<{
    anniversaries: PrototypeAnalysis['anniversaries'] | null;
    isLoading: boolean;
    error: string | null;
  }>({ anniversaries: null, isLoading: enabled, error: null });

  const run = useCallback(
    async (signal?: AbortSignal) => {
      if (!enabled) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }
      try {
        // Fetch a broad snapshot to ensure we don't miss edge cases around TZ.
        const prototypes = await getPrototypes({ limit: 10_000, offset: 0 });
        if (signal?.aborted) return;

        const analysis = analyzePrototypes(prototypes);
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
    [enabled],
  );

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run(controller.signal);
    return () => controller.abort();
  }, [run]);

  const refresh = useCallback(() => {
    if (!enabled) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    void run();
  }, [enabled, run]);

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
