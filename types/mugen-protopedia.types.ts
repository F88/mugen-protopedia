/**
 * Play mode of the ProtoPedia Viewer.
 * - 'normal': Standard browsing mode.
 * - 'playlist': Playlist mode for sequential prototype viewing.
 */
export type PlayMode = 'normal' | 'playlist' | 'unleashed';

type BasePlayModeState<T extends PlayMode> = {
  type: T;
};

export type NormalPlayModeState = BasePlayModeState<'normal'>;

export type PlaylistPlayModeState = BasePlayModeState<'playlist'> & {
  ids: number[];
  title?: string;
};

export type UnleashedPlayModeState = BasePlayModeState<'unleashed'>;

export type PlayModeState =
  | NormalPlayModeState
  | PlaylistPlayModeState
  | UnleashedPlayModeState;

/**
 * Simulated delay range for loading prototypes.
 * - min: Minimum delay in milliseconds.
 * - max: Maximum delay in milliseconds.
 */
export type SimulatedDelayRange = { min: number; max: number };
export type SimulatedDelayRangeByMode = Record<PlayMode, SimulatedDelayRange>;

export type SimulatedDelayLevel =
  | 'NORMAL'
  | 'FASTEST'
  | 'FASTER'
  | 'FAST'
  | 'SLOW'
  // | 'SLOWER'
  // | 'SLOWEST'
  | 'UNLEASHED';
export type SimulatedDelayRangeByLevel = Record<
  SimulatedDelayLevel,
  SimulatedDelayRange
>;

/**
 * Control panel mode of the ProtoPedia Viewer.
 * - 'normal': Standard control panel mode.
 * - 'loadingPlaylist': Control panel mode when loading a playlist.
 */
export type ControlpanelMode = 'normal' | 'loadingPlaylist';
