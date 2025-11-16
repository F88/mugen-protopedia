'use client';

import type {
  NormalPlayModeState,
  PlaylistPlayModeState,
  PlayModeState,
} from '@/types/mugen-protopedia.types';

import type { Result } from '@/lib/utils/result';
import type {
  DirectLaunchParams,
  ValidationError,
} from '@/lib/utils/validation';
import { logger } from '../logger.client';

export type ResolvePlayModeArgs = {
  directLaunchResult?: Result<DirectLaunchParams, ValidationError>;
};

export const buildNormalPlayModeState = (): NormalPlayModeState => ({
  playmode: 'normal',
});

export const buildPlaylistPlayModeState = (
  params: DirectLaunchParams,
): PlaylistPlayModeState => ({
  playmode: 'playlist',
  ids: params.ids,
  title: params.title,
});

export const resolvePlayMode = ({
  directLaunchResult,
}: ResolvePlayModeArgs): PlayModeState => {
  logger.debug({ directLaunchResult }, 'Resolving play mode');

  // Early return if direct launch result is missing or failed
  if (!directLaunchResult || directLaunchResult.type !== 'success') {
    return buildNormalPlayModeState();
  }

  // Determine PlayMode
  const directLaunchParams = directLaunchResult.value;

  if (directLaunchParams.ids.length > 0) {
    return buildPlaylistPlayModeState({
      ids: directLaunchParams.ids,
      title: directLaunchParams.title,
    });
  }

  return buildNormalPlayModeState();
};
