'use client';

import type {
  NormalPlayModeState,
  PlaylistPlayModeState,
  PlayModeState,
} from '@/types/mugen-protopedia.types';

import type { Result } from '@/lib/utils/result';
import type { ValidationError } from '@/lib/validation/validation';
import type { DirectLaunchParams } from '@/schemas/direct-launch';
import { logger } from '../logger.client';

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

export const buildUnleashedPlayModeState = (): PlayModeState => ({
  type: 'unleashed',
});

export const buildDevPlayModeState = (): PlayModeState => ({
  type: 'dev',
});

/**
 * Resolves the play mode based on the provided direct launch parameters.
 */
export const resolvePlayMode = ({
  directLaunchResult,
}: ResolvePlayModeArgs): PlayModeState => {
  // testing unleashed mode
  // return buildUnleashedPlayModeState();

  // Early return if direct launch result is missing or failed
  if (!directLaunchResult || directLaunchResult.type !== 'success') {
    return buildNormalPlayModeState();
  }

  // Determine PlayMode
  const directLaunchParams = directLaunchResult.value;
  logger.debug('directLaunchParams:', directLaunchParams);

  // Unleashed mode
  if (directLaunchParams.unleashed != null) {
    return buildUnleashedPlayModeState();
  }

  // Playlist mode
  const hasIds = directLaunchParams.ids.length > 0;
  const hasTitle =
    typeof directLaunchParams.title === 'string' &&
    directLaunchParams.title.trim().length > 0;
  if (hasIds || hasTitle) {
    return buildPlaylistPlayModeState({
      ids: directLaunchParams.ids,
      title: directLaunchParams.title,
    });
  }

  return buildNormalPlayModeState();
};
