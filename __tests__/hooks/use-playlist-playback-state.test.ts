import { describe, expect, it } from 'vitest';

import {
  initialPlaylistPlaybackState,
  playlistPlaybackReducer,
  type PlaylistPlaybackState,
} from '@/hooks/use-playlist-playback-state';

describe('playlistPlaybackReducer', () => {
  const playing: PlaylistPlaybackState = {
    isPlaying: true,
    isCompleted: false,
    processedCount: 3,
    variant: 'cyberpunk',
    fontFamily: 'serif',
  };

  it('NON_PLAYLIST_MODE resets all playback flags', () => {
    const completed: PlaylistPlaybackState = {
      ...playing,
      isPlaying: false,
      isCompleted: true,
    };

    const next = playlistPlaybackReducer(completed, {
      type: 'NON_PLAYLIST_MODE',
    });

    expect(next.isPlaying).toBe(false);
    expect(next.isCompleted).toBe(false);
    expect(next.processedCount).toBe(0);
    // Style is intentionally preserved across mode changes.
    expect(next.variant).toBe('cyberpunk');
    expect(next.fontFamily).toBe('serif');
  });

  it('PLAYLIST_EMPTY resets isPlaying and processedCount but leaves isCompleted untouched', () => {
    const completed: PlaylistPlaybackState = {
      ...playing,
      isPlaying: false,
      isCompleted: true,
      processedCount: 5,
    };

    const next = playlistPlaybackReducer(completed, { type: 'PLAYLIST_EMPTY' });

    expect(next.isPlaying).toBe(false);
    expect(next.processedCount).toBe(0);
    // The original effect did NOT reset isCompleted on the empty-playlist path.
    expect(next.isCompleted).toBe(true);
  });

  it('PLAYLIST_STARTED begins playback and applies the supplied random style', () => {
    const next = playlistPlaybackReducer(
      { ...playing, processedCount: 9, isCompleted: true },
      { type: 'PLAYLIST_STARTED', variant: 'neon', fontFamily: 'mono' },
    );

    expect(next.isPlaying).toBe(true);
    expect(next.isCompleted).toBe(false);
    expect(next.processedCount).toBe(0);
    expect(next.variant).toBe('neon');
    expect(next.fontFamily).toBe('mono');
  });

  it('ITEM_PROCESSED increments only processedCount', () => {
    const next = playlistPlaybackReducer(playing, { type: 'ITEM_PROCESSED' });

    expect(next.processedCount).toBe(4);
    expect(next.isPlaying).toBe(true);
    expect(next.isCompleted).toBe(false);
  });

  it('COMPLETED stops playback and marks completion', () => {
    const next = playlistPlaybackReducer(playing, { type: 'COMPLETED' });

    expect(next.isPlaying).toBe(false);
    expect(next.isCompleted).toBe(true);
    // processedCount is preserved so the title card keeps the final count.
    expect(next.processedCount).toBe(3);
  });

  it('has sane initial state', () => {
    expect(initialPlaylistPlaybackState).toEqual({
      isPlaying: false,
      isCompleted: false,
      processedCount: 0,
      variant: 'default',
      fontFamily: 'sans',
    });
  });
});
