import { useCallback, useState } from 'react';

import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';
import { getLatestPrototypeById } from '@/lib/fetcher/get-latest-prototype-by-id';
import { usePlaylistPrototype } from '@/lib/hooks/use-playlist-prototype';
import { usePrototypeSlots } from '@/lib/hooks/use-prototype-slots';
import { useRandomPrototype } from '@/lib/hooks/use-random-prototype';
import { logger } from '@/lib/logger.client';

/**
 * Subset of the slot API this hook needs. The slots themselves stay owned by the
 * page component (their other outputs feed the grid, header and playlist timer),
 * so the relevant operations are injected here.
 */
type SlotOperations = Pick<
  ReturnType<typeof usePrototypeSlots>,
  | 'appendPlaceholder'
  | 'replacePrototypeInSlot'
  | 'setSlotError'
  | 'tryIncrementInFlightRequests'
  | 'decrementInFlightRequests'
>;

type UsePrototypeFetchingParams = {
  slots: SlotOperations;
  /** Guard: random fetch is disabled while a playlist is playing. */
  isPlaylistPlaying: boolean;
  /** Called once per playlist item fetch attempt (advances the progress count). */
  onPlaylistItemProcessed: () => void;
};

type UsePrototypeFetchingResult = {
  prototypeIdError: string | null;
  fetchRandomPrototype: () => Promise<void>;
  fetchPrototypeById: (id: number) => Promise<void>;
  fetchPrototypeByIdFromInput: (input: string) => Promise<void>;
  fetchPrototypeByIdForPlaylist: (id: number) => Promise<void>;
};

/**
 * Owns the prototype-fetching concern of the home page: random fetch, fetch by
 * id (SHOW), the input-field validation wrapper, and the playlist-mode fetch.
 * The slot operations are injected; the playlist progress side effect is passed
 * in as `onPlaylistItemProcessed` so this hook stays focused on fetching.
 */
export function usePrototypeFetching({
  slots,
  isPlaylistPlaying,
  onPlaylistItemProcessed,
}: UsePrototypeFetchingParams): UsePrototypeFetchingResult {
  // Destructure the injected slot operations to stable members so the callbacks
  // below depend on the individual functions (not the `slots` object, which may
  // be a fresh literal each render).
  const {
    appendPlaceholder,
    replacePrototypeInSlot,
    setSlotError,
    tryIncrementInFlightRequests,
    decrementInFlightRequests,
  } = slots;

  const { getRandomPrototype } = useRandomPrototype();
  const { fetchPrototype: fetchPlaylistPrototype } = usePlaylistPrototype();

  const [prototypeIdError, setPrototypeIdError] = useState<string | null>(null);

  /**
   * Create a deep-cloned copy of a prototype.
   *
   * Note: This uses JSON round-trip which is sufficient for our normalized
   * data shape (plain objects). If richer types are added later, replace with
   * a safer cloning strategy.
   */
  const clonePrototype = useCallback(
    (prototype: Prototype): Prototype => JSON.parse(JSON.stringify(prototype)),
    [],
  );

  /**
   * Fetch a random prototype from the API and return a cloned instance.
   *
   * @returns cloned prototype or null when API yields no result
   */
  const getRandomPrototypeFromResults =
    useCallback(async (): Promise<Prototype | null> => {
      const prototype = await getRandomPrototype();

      if (!prototype) {
        return null;
      }

      const clonedPrototype = clonePrototype(prototype);
      logger.debug('[MugenProtoPedia]', 'Selected random prototype', {
        clonedPrototype,
      });
      return clonedPrototype;
    }, [getRandomPrototype, clonePrototype]);

  /**
   * Append a placeholder slot and populate it with a randomly fetched prototype.
   * Respects concurrency cap; removes placeholder on null result or error.
   */
  const fetchRandomPrototype = useCallback(async () => {
    if (isPlaylistPlaying) {
      logger.warn(
        '[MugenProtoPedia] Cannot fetch random prototype while playlist is playing.',
      );
      return;
    }
    if (!tryIncrementInFlightRequests()) {
      logger.warn('Maximum concurrent fetches reached.');
      return;
    }

    const slotId = appendPlaceholder();
    try {
      const prototype = await getRandomPrototypeFromResults();
      if (!prototype) {
        setSlotError(slotId, 'Failed to load.');
      } else {
        await replacePrototypeInSlot(slotId, prototype);
      }
    } catch (err) {
      logger.error('Failed to fetch prototypes.', err);
      // This app targets power users/engineers, so we prefer technical accuracy over simplified user-friendly messages.
      // "Failed to fetch" is ambiguous but technically correct for network errors (offline, DNS, etc).
      // We list possible causes to aid troubleshooting.
      let message = 'Failed to load.';
      if (err instanceof Error) {
        if (err.message === 'Failed to fetch') {
          message =
            'Failed to fetch. ' +
            'Possible causes: Offline, DNS, CORS, or Server Down.';
        } else {
          message = err.message;
        }
      }
      setSlotError(slotId, message);
    }
    // Previously a finally; the React Compiler cannot lower try/finally, so the
    // cleanup runs after the try/catch instead. The not-found early return is
    // converted to if/else so this still runs on every path (success,
    // not-found, error); the catch never returns or throws.
    decrementInFlightRequests();
  }, [
    tryIncrementInFlightRequests,
    appendPlaceholder,
    getRandomPrototypeFromResults,
    replacePrototypeInSlot,
    decrementInFlightRequests,
    isPlaylistPlaying,
    setSlotError,
  ]);

  /**
   * Fetch a prototype by explicit ID from SHOW controls (input field).
   *
   * Validates input, respects concurrency cap, and performs a one-shot
   * upstream fetch via `getLatestPrototypeById`.
   */
  const fetchPrototypeById = useCallback(
    async (id: number) => {
      logger.debug(
        '[MugenProtoPedia]',
        'Fetching latest prototype by ID (SHOW)',
        { id },
      );

      if (id < 0) {
        logger.error('Invalid prototype ID:', id);
        return;
      }

      if (!tryIncrementInFlightRequests()) {
        logger.warn('Maximum concurrent fetches reached.');
        return;
      }

      const slotId = appendPlaceholder({ expectedPrototypeId: id });
      setPrototypeIdError(null);

      try {
        const prototype = await getLatestPrototypeById(id);

        if (!prototype) {
          setPrototypeIdError('Not found.');
          setSlotError(slotId, 'Not found.');
        } else {
          const clonedPrototype = clonePrototype(prototype);
          await replacePrototypeInSlot(slotId, clonedPrototype);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch prototype.';
        setPrototypeIdError(message);
        setSlotError(slotId, message);
      }
      // finally -> post-try/catch so the React Compiler can optimize; the
      // not-found early return becomes if/else so cleanup runs on every path.
      decrementInFlightRequests();
    },
    [
      tryIncrementInFlightRequests,
      appendPlaceholder,
      setPrototypeIdError,
      setSlotError,
      clonePrototype,
      replacePrototypeInSlot,
      decrementInFlightRequests,
    ],
  );

  /**
   * Fetch a prototype by ID for PLAYLIST mode.
   *
   * Shares slot/error handling with SHOW, but uses the map-store-first
   * repository-backed `usePlaylistPrototype` and updates playlist
   * processed count.
   */
  const fetchPrototypeByIdForPlaylist = useCallback(
    async (id: number) => {
      logger.debug('[MugenProtoPedia]', 'Fetching prototype by ID (PLAYLIST)', {
        id,
      });

      if (id < 0) {
        logger.error('Invalid prototype ID:', id);
        return;
      }

      if (!tryIncrementInFlightRequests()) {
        logger.warn('Maximum concurrent fetches reached.');
        return;
      }

      const slotId = appendPlaceholder({ expectedPrototypeId: id });
      setPrototypeIdError(null);

      try {
        const prototype = await fetchPlaylistPrototype(id);
        if (!prototype) {
          setPrototypeIdError('Not found.');
          setSlotError(slotId, 'Not found.');
        } else {
          const clonedPrototype = clonePrototype(prototype);
          await replacePrototypeInSlot(slotId, clonedPrototype);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch prototype.';
        setPrototypeIdError(message);
        setSlotError(slotId, message);
      }
      // finally -> post-try/catch so the React Compiler can optimize; the
      // not-found early return becomes if/else so both the decrement and the
      // processed-count increment run on every path.
      decrementInFlightRequests();
      onPlaylistItemProcessed();
    },
    [
      tryIncrementInFlightRequests,
      appendPlaceholder,
      fetchPlaylistPrototype,
      setPrototypeIdError,
      setSlotError,
      clonePrototype,
      replacePrototypeInSlot,
      decrementInFlightRequests,
      onPlaylistItemProcessed,
    ],
  );

  const fetchPrototypeByIdFromInput = async (input: string) => {
    logger.debug(
      '[MugenProtoPedia]',
      'Fetching prototype by ID from input:',
      input,
    );

    // Validation
    const trimmed = input.trim();
    if (trimmed === '') {
      setPrototypeIdError('Please enter a prototype ID.');
      return;
    }
    const parsedId = Number.parseInt(trimmed, 10);
    if (Number.isNaN(parsedId) || parsedId < 0) {
      setPrototypeIdError('Prototype ID must be a non-negative number.');
      return;
    }
    await fetchPrototypeById(parsedId);
  };

  return {
    prototypeIdError,
    fetchRandomPrototype,
    fetchPrototypeById,
    fetchPrototypeByIdFromInput,
    fetchPrototypeByIdForPlaylist,
  };
}
