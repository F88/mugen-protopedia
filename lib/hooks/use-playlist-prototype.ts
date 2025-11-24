/**
 * @fileoverview Hook for retrieving playlist prototypes via repository.
 *
 * This hook is dedicated to ID-based fetching in playlist mode.
 * - It uses `prototypeRepository.getByPrototypeId` to prefer the
 *   `prototypeMapStore` snapshot and fall back to the ProtoPedia API
 *   when necessary.
 * - Unlike the SHOW button use case via `usePrototype`, this hook does
 *   not use SWR caching.
 */
'use client';

import { useCallback, useState } from 'react';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { prototypeRepository } from '@/lib/repositories/prototype-repository';

type UsePlaylistPrototypeResult = {
  /** Latest prototype data fetched for playlist, or null if none. */
  prototype: NormalizedPrototype | null;
  /** Normalized error message for the last fetch, if any. */
  error: string | null;
  /** Indicates that a fetch is currently in progress. */
  isLoading: boolean;
  /**
   * Imperative accessor for fetching arbitrary prototype IDs for playlist.
   * Returns `undefined` when the prototype cannot be found (for example,
   * when the repository resolves a 404).
   */
  fetchPrototype: (
    prototypeId: number,
  ) => Promise<NormalizedPrototype | undefined>;
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
  const [prototype, setPrototype] = useState<NormalizedPrototype | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPrototype = useCallback(
    async (prototypeId: number): Promise<NormalizedPrototype | undefined> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await prototypeRepository.getByPrototypeId(prototypeId);

        if (result) {
          setPrototype(result);
        } else {
          setPrototype(null);
        }

        return result;
      } catch (caught) {
        const message =
          caught instanceof Error
            ? caught.message
            : 'Failed to fetch prototype.';
        setError(message);
        throw caught;
      } finally {
        setIsLoading(false);
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
