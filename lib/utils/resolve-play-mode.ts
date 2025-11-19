'use client';

import type {
  NormalPlayModeState,
  PlaylistPlayModeState,
  PlayModeState,
} from '@/types/mugen-protopedia.types';

import type { Result } from '@/lib/utils/result';
import type { ValidationError } from '@/lib/validation/validation';
import type { DirectLaunchParams } from '@/schemas/direct-launch';

export type ResolvePlayModeArgs = {
  directLaunchResult?: Result<DirectLaunchParams, ValidationError>;
};

export const buildNormalPlayModeState = (): NormalPlayModeState => ({
  type: 'normal',
});

export const buildPlaylistPlayModeState = (
  params: DirectLaunchParams,
): PlaylistPlayModeState => ({
  type: 'playlist',
  ids: params.ids,
  title: params.title,
});

/**
 * Resolves the play mode based on the provided direct launch parameters.
 */
export const resolvePlayMode = ({
  directLaunchResult,
}: ResolvePlayModeArgs): PlayModeState => {
  // Early return if direct launch result is missing or failed
  if (!directLaunchResult || directLaunchResult.type !== 'success') {
    return buildNormalPlayModeState();
  }

  // Determine PlayMode
  const directLaunchParams = directLaunchResult.value;
  const hasIds = directLaunchParams.ids.length > 0;
  const hasTitle =
    typeof directLaunchParams.title === 'string' &&
    directLaunchParams.title.trim().length > 0;

  // Playlist mode
  if (hasIds || hasTitle) {
    return buildPlaylistPlayModeState({
      ids: directLaunchParams.ids,
      title: directLaunchParams.title,
    });
  }

  return buildNormalPlayModeState();
};
