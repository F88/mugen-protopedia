import { describe, expect, it } from 'vitest';

import type { Result } from '@/lib/utils/result';
import { resolvePlayMode } from '@/lib/utils/resolve-play-mode';
import type {
  DirectLaunchParams,
  ValidationError,
} from '@/lib/utils/validation';

const successResult = (
  value: DirectLaunchParams,
): Result<DirectLaunchParams, ValidationError> => ({
  type: 'success',
  value,
});

const failureResult = (
  errors: string[],
): Result<DirectLaunchParams, ValidationError> => ({
  type: 'failure',
  error: {
    status: 'error',
    errors,
  },
});

describe('resolvePlayMode', () => {
  it('returns playlist mode when direct launch provides ids', () => {
    const directLaunchResult = successResult({
      ids: [1, 2],
      title: 'Playlist',
    });

    const playMode = resolvePlayMode({
      directLaunchResult,
    });

    expect(playMode).toEqual({
      type: 'playlist',
      ids: [1, 2],
      title: 'Playlist',
    });
  });

  it('falls back to normal mode when playlist has no ids', () => {
    const directLaunchResult = successResult({ ids: [], title: 'Empty' });

    const playMode = resolvePlayMode({
      directLaunchResult,
    });

    expect(playMode).toEqual({ type: 'normal' });
  });

  it('falls back to normal mode when direct launch fails', () => {
    const directLaunchResult = failureResult(['IDs must contain only digits']);

    const playMode = resolvePlayMode({
      directLaunchResult,
    });

    expect(playMode).toEqual({ type: 'normal' });
  });

  it('returns normal mode when direct launch result is missing', () => {
    const playMode = resolvePlayMode({});

    expect(playMode).toEqual({ type: 'normal' });
  });

  it('returns playlist mode without a title when none is provided', () => {
    const ids = [7, 8, 9];
    const directLaunchResult = successResult({ ids });

    const playMode = resolvePlayMode({
      directLaunchResult,
    });

    expect(playMode).toEqual({
      type: 'playlist',
      ids,
      title: undefined,
    });
  });

  it('reuses the ids array from the direct launch result', () => {
    const ids = [10, 11];
    const directLaunchResult = successResult({ ids, title: 'Reusable' });

    const playMode = resolvePlayMode({
      directLaunchResult,
    });

    if (playMode.type !== 'playlist') {
      throw new Error('Expected playlist mode');
    }

    expect(playMode.ids).toBe(ids);
  });
});
