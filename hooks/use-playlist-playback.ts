import { useEffect, useRef, type Dispatch } from 'react';

import { logger } from '@/lib/logger.client';
import { getRandomPlaylistStyle } from '@/lib/utils/playlist-style';
import type {
  PlayModeState,
  SimulatedDelayLevel,
} from '@/types/mugen-protopedia.types';

import { getDefaultSimulatedDelayLevelForPlayMode } from '@/app/mugen-protopedia-utils';

import type {
  PlaylistPlaybackAction,
  PlaylistPlaybackState,
} from './use-playlist-playback-state';

/**
 * Interval between fetching prototypes in playlist mode (ms).
 */
const PLAYLIST_FETCH_INTERVAL_MS = 1_000;

type UsePlaylistPlaybackParams = {
  /** Current play mode; the orchestration only acts while in `playlist` mode. */
  playModeState: PlayModeState;
  /** Playback state machine state (only `isPlaying` is read here). */
  state: PlaylistPlaybackState;
  /** Stable dispatcher for the playback state machine. */
  dispatch: Dispatch<PlaylistPlaybackAction>;
  /** Owned by the parent; reset to the play mode's default on every mode change. */
  changeDelayLevel: (
    action:
      | SimulatedDelayLevel
      | ((prev: SimulatedDelayLevel) => SimulatedDelayLevel),
  ) => void;
  /** Playlist-mode fetcher from `usePrototypeFetching` (injected to break the cycle). */
  fetchPrototypeByIdForPlaylist: (id: number) => Promise<void>;
  /** Slot concurrency signal: whether another fetch may start now. */
  canFetchMorePrototypes: boolean;
  /** Slot concurrency signal: number of in-flight fetches. */
  inFlightRequests: number;
};

/**
 * Owns the playlist playback orchestration of the home page: the ref-backed
 * queue/signature/timeout coordination and the two effects that drive it.
 *
 * It runs *after* `usePrototypeFetching` so it can receive
 * `fetchPrototypeByIdForPlaylist`; it drives the playback state via the stable
 * `dispatch` it is handed, which is why the state itself can be declared earlier
 * (and fed back into `usePrototypeFetching`) without a circular dependency. The
 * queue/signature/timeout stay refs because they are written from effects and
 * read by the timer loop — writing them during render would be an anti-pattern.
 * Lives in `hooks/` (no data-layer import; the fetcher is injected).
 */
export function usePlaylistPlayback({
  playModeState,
  state,
  dispatch,
  changeDelayLevel,
  fetchPrototypeByIdForPlaylist,
  canFetchMorePrototypes,
  inFlightRequests,
}: UsePlaylistPlaybackParams): void {
  const playlistQueueRef = useRef<number[]>([]);
  const lastProcessedPlaylistSignatureRef = useRef<string | null>(null);
  const playlistProcessingTimeoutRef = useRef<number | null>(null);

  // Depend on `isPlaying` only (not the whole `state` object): the timer effect
  // below must NOT re-run when `processedCount` changes, or each ITEM_PROCESSED
  // would tear down and reschedule the loop mid-flight.
  const { isPlaying } = state;

  // Prepare the playlist queue when entering playlist mode with new parameters.
  // This effect imperatively initializes the ref-backed playback machine
  // (playlistQueueRef / lastProcessedPlaylistSignatureRef are read by the
  // timer-based playback effect below) and resets playback state in response to
  // playModeState. It legitimately stays an effect: a render-time version would
  // write refs during render. Unlike the previous setter-based version, it
  // dispatches reducer actions, so no `set-state-in-effect` disable is needed.
  useEffect(() => {
    logger.debug(
      '[MugenProtoPedia]',
      'Processing play mode state change:',
      playModeState,
    );

    const delayLevel = getDefaultSimulatedDelayLevelForPlayMode(
      playModeState['type'],
    );
    changeDelayLevel(delayLevel);

    // If not in playlist mode, reset playlist state
    if (playModeState.type !== 'playlist') {
      lastProcessedPlaylistSignatureRef.current = null;
      playlistQueueRef.current = [];
      dispatch({ type: 'NON_PLAYLIST_MODE' });
    }

    switch (playModeState.type) {
      case 'normal':
        logger.debug('[MugenProtoPedia]', 'Switched to normal play mode');
        break;

      case 'playlist':
        logger.debug('[MugenProtoPedia]', 'Switched to playlist play mode');
        const { ids, title } = playModeState;
        if (ids.length === 0) {
          lastProcessedPlaylistSignatureRef.current = null;
          playlistQueueRef.current = [];
          dispatch({ type: 'PLAYLIST_EMPTY' });
          return;
        }

        const signature = `${ids.join(',')}|${title ?? ''}`;
        if (lastProcessedPlaylistSignatureRef.current === signature) {
          return;
        }

        logger.debug(
          { ids, title },
          '[MugenProtoPedia]',
          'Starting playlist playback',
        );
        lastProcessedPlaylistSignatureRef.current = signature;
        playlistQueueRef.current = [...ids];

        // Pick a fresh random style/font for the playlist title card when a
        // (non-empty) playlist starts. The signature dedup above means this
        // fires on the same new-playlist-start moments as before. Computed here
        // (impure) and passed to the reducer so the reducer stays pure.
        const playlistStyle = getRandomPlaylistStyle();
        dispatch({
          type: 'PLAYLIST_STARTED',
          variant: playlistStyle.variant,
          fontFamily: playlistStyle.fontFamily,
        });
    }
  }, [playModeState, changeDelayLevel, dispatch]);

  // Process the playlist queue while in playlist mode
  useEffect(() => {
    if (playlistProcessingTimeoutRef.current !== null) {
      window.clearTimeout(playlistProcessingTimeoutRef.current);
      playlistProcessingTimeoutRef.current = null;
    }

    if (playModeState.type !== 'playlist') {
      return undefined;
    }

    if (!isPlaying) {
      return undefined;
    }

    const processNext = () => {
      playlistProcessingTimeoutRef.current = null;

      // Check if queue is empty
      if (playlistQueueRef.current.length === 0) {
        if (inFlightRequests === 0) {
          logger.debug('[MugenProtoPedia]', 'Playlist playback completed');
          dispatch({ type: 'COMPLETED' });
        }
        return;
      }

      // Concurrency check: if we cannot fetch now, retry later
      if (!canFetchMorePrototypes) {
        logger.warn(
          'Cannot fetch more prototypes while playlist is playing. Retry in ' +
            PLAYLIST_FETCH_INTERVAL_MS +
            'ms' +
            ' for processing next id',
        );
        playlistProcessingTimeoutRef.current = window.setTimeout(
          processNext,
          PLAYLIST_FETCH_INTERVAL_MS,
        );
        return;
      }

      // Next ID to process
      const id = playlistQueueRef.current.shift();
      logger.debug('[MugenProtoPedia]', 'Processing playlist ID:', id);

      if (id !== undefined) {
        void fetchPrototypeByIdForPlaylist(id);

        playlistProcessingTimeoutRef.current = window.setTimeout(
          processNext,
          PLAYLIST_FETCH_INTERVAL_MS,
        );
      }
    };

    playlistProcessingTimeoutRef.current = window.setTimeout(processNext, 0);

    return () => {
      if (playlistProcessingTimeoutRef.current !== null) {
        window.clearTimeout(playlistProcessingTimeoutRef.current);
        playlistProcessingTimeoutRef.current = null;
      }
    };
  }, [
    playModeState,
    isPlaying,
    canFetchMorePrototypes,
    inFlightRequests,
    fetchPrototypeByIdForPlaylist,
    dispatch,
  ]);
}
