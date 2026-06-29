import { useReducer, type Dispatch } from 'react';

import type { PlaylistTitleCardVariant } from '@/components/playlist/playlist-title';
import type { PlaylistFontFamily } from '@/lib/utils/playlist-style';

/**
 * Playlist playback state machine.
 *
 * Collapses the formerly separate `isPlaylistPlaying` / `isPlaylistCompleted` /
 * `processedCount` state (plus the random title-card style) into a single
 * reducer. Modeling the orchestration as a reducer is what lets the playback
 * effects (which need `fetchPrototypeByIdForPlaylist`, only available after
 * `usePrototypeFetching`) drive state that is declared earlier than that hook:
 * `dispatch` is stable and position-independent, so the timer effect can update
 * state without the page re-introducing the circular dependency. It also removes
 * the block `eslint-disable react-hooks/set-state-in-effect` the imperative
 * setters required (see #158).
 */
export type PlaylistPlaybackState = {
  /** Whether the playlist is actively fetching items. */
  isPlaying: boolean;
  /** Whether the playlist has finished (queue drained, no in-flight requests). */
  isCompleted: boolean;
  /** Number of playlist items whose fetch has been attempted. */
  processedCount: number;
  /** Random title-card variant, chosen once when a new playlist starts. */
  variant: PlaylistTitleCardVariant;
  /** Random title-card font family, chosen once when a new playlist starts. */
  fontFamily: PlaylistFontFamily;
};

export type PlaylistPlaybackAction =
  /** Entered (or stayed in) a non-playlist mode. Resets all playback flags. */
  | { type: 'NON_PLAYLIST_MODE' }
  /**
   * Entered playlist mode but the id list is empty. Resets `isPlaying` and
   * `processedCount` only; `isCompleted` is intentionally left untouched to
   * preserve the original effect's behavior.
   */
  | { type: 'PLAYLIST_EMPTY' }
  /** A new (deduped) playlist started. The random style is computed by the
   * caller (impure) and passed in so the reducer stays pure. */
  | {
      type: 'PLAYLIST_STARTED';
      variant: PlaylistTitleCardVariant;
      fontFamily: PlaylistFontFamily;
    }
  /** One playlist item fetch attempt finished. */
  | { type: 'ITEM_PROCESSED' }
  /** Queue drained and no in-flight requests: playback completed. */
  | { type: 'COMPLETED' };

export const initialPlaylistPlaybackState: PlaylistPlaybackState = {
  isPlaying: false,
  isCompleted: false,
  processedCount: 0,
  variant: 'default',
  fontFamily: 'sans',
};

export function playlistPlaybackReducer(
  state: PlaylistPlaybackState,
  action: PlaylistPlaybackAction,
): PlaylistPlaybackState {
  switch (action.type) {
    case 'NON_PLAYLIST_MODE':
      return {
        ...state,
        isPlaying: false,
        isCompleted: false,
        processedCount: 0,
      };
    case 'PLAYLIST_EMPTY':
      // isCompleted deliberately untouched (matches the original effect).
      return { ...state, isPlaying: false, processedCount: 0 };
    case 'PLAYLIST_STARTED':
      return {
        ...state,
        isPlaying: true,
        isCompleted: false,
        processedCount: 0,
        variant: action.variant,
        fontFamily: action.fontFamily,
      };
    case 'ITEM_PROCESSED':
      return { ...state, processedCount: state.processedCount + 1 };
    case 'COMPLETED':
      return { ...state, isPlaying: false, isCompleted: true };
    default:
      return state;
  }
}

export type UsePlaylistPlaybackStateResult = {
  state: PlaylistPlaybackState;
  dispatch: Dispatch<PlaylistPlaybackAction>;
};

/**
 * Thin wrapper around the playlist playback reducer. Lives in `hooks/` (not
 * `lib/hooks/`) because it does not touch the data layer; it is consumed early
 * in the page so its stable `dispatch` can be driven by the later playback hook.
 */
export function usePlaylistPlaybackState(): UsePlaylistPlaybackStateResult {
  const [state, dispatch] = useReducer(
    playlistPlaybackReducer,
    initialPlaylistPlaybackState,
  );
  return { state, dispatch };
}
