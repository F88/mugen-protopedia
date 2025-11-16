/**
 * Play mode of the ProtoPedia Viewer.
 * - 'normal': Standard browsing mode.
 * - 'playlist': Playlist mode for sequential prototype viewing.
 */
export type PlayMode = 'normal' | 'playlist';

type BasePlayModeState<T extends PlayMode> = {
  playmode: T;
};

export type NormalPlayModeState = BasePlayModeState<'normal'>;

export type PlaylistPlayModeState = BasePlayModeState<'playlist'> & {
  ids: number[];
  title?: string;
};

export type PlayModeState = NormalPlayModeState | PlaylistPlayModeState;

/**
 * Control panel mode of the ProtoPedia Viewer.
 * - 'normal': Standard control panel mode.
 * - 'loadingPlaylist': Control panel mode when loading a playlist.
 */
export type ControlpanelMode = 'normal' | 'loadingPlaylist';
