/**
 * @fileoverview Hook for retrieving playlist prototypes via repository.
 *
 * This hook is dedicated to ID-based fetching in playlist mode.
 * - It resolves ids through `getPrototypeById` (the prototypes gateway), which
 *   reads the promidas snapshot or the legacy map-store depending on the
 *   `USE_PROMIDAS_REPOSITORY` flag.
 */
'use client';

import { useCallback, useState } from 'react';

import { getPrototypeById } from '@/app/actions/prototypes-gateway';
import type { PrototypeForMpp } from '@/lib/api/prototypes';

type UsePlaylistPrototypeResult = {
  /** Latest prototype data fetched for playlist, or null if none. */
  prototype: PrototypeForMpp | null;
  /** Normalized error message for the last fetch, if any. */
  error: string | null;
  /** Indicates that a fetch is currently in progress. */
  isLoading: boolean;
  /**
   * Imperative accessor for fetching arbitrary prototype IDs for playlist.
   * Returns `undefined` when the prototype cannot be found (for example,
   * when the repository resolves a 404).
   */
  fetchPrototype: (prototypeId: number) => Promise<PrototypeForMpp | undefined>;
};

/**
 * Hook for consuming playlist prototypes via map-store-first repository API.
 *
 * - Internal state is kept local to playlist processing; no global SWR cache
 *   is used.
 * - Only error and loading state are exposed to the UI (especially for
 *   playlist UX), while the caller is responsible for how the data is
 *   rendered.
 */
export function usePlaylistPrototype(): UsePlaylistPrototypeResult {
  const [prototype, setPrototype] = useState<PrototypeForMpp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPrototype = useCallback(
    async (prototypeId: number): Promise<PrototypeForMpp | undefined> => {
      setIsLoading(true);
      setError(null);

      // try/catch without a finally: the React Compiler cannot lower a
      // TryStatement with a finalizer, so setIsLoading(false) is set on both
      // the success and error paths instead of in a finally block.
      try {
        const result = await getPrototypeById(prototypeId);

        if (result) {
          setPrototype(result);
        } else {
          setPrototype(null);
        }

        setIsLoading(false);
        return result;
      } catch (caught) {
        const message =
          caught instanceof Error
            ? caught.message
            : 'Failed to fetch prototype.';
        setError(message);
        setIsLoading(false);
        throw caught;
      }
    },
    [],
  );

  return {
    prototype,
    error,
    isLoading,
    fetchPrototype,
  };
}
