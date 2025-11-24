/**
 * Play mode of the ProtoPedia Viewer.
 * - 'normal': Standard browsing mode.
 * - 'playlist': Playlist mode for sequential prototype viewing.
 */
export type PlayMode = 'normal' | 'playlist' | 'unleashed' | 'joe';

type BasePlayModeState<T extends PlayMode> = {
  type: T;
};

export type NormalPlayModeState = BasePlayModeState<'normal'>;

export type PlaylistPlayModeState = BasePlayModeState<'playlist'> & {
  ids: number[];
  title?: string;
};

export type UnleashedPlayModeState = BasePlayModeState<'unleashed'>;
export type JoePlayModeState = BasePlayModeState<'joe'>;

export type PlayModeState =
  | NormalPlayModeState
  | PlaylistPlayModeState
  | UnleashedPlayModeState
  | JoePlayModeState;

export type SimulatedDelayRange = { min: number; max: number };
export type SimulatedDelayRangeByMode = Record<PlayMode, SimulatedDelayRange>;

/**
 * Control panel mode of the ProtoPedia Viewer.
 * - 'normal': Standard control panel mode.
 * - 'loadingPlaylist': Control panel mode when loading a playlist.
 */
export type ControlpanelMode = 'normal' | 'loadingPlaylist';
