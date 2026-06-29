import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePlaylistPlayback } from '@/hooks/use-playlist-playback';
import {
  usePlaylistPlaybackState,
  type PlaylistPlaybackState,
} from '@/hooks/use-playlist-playback-state';
import type {
  PlayModeState,
  SimulatedDelayLevel,
} from '@/types/mugen-protopedia.types';

/**
 * Wire the real reducer to the orchestration hook, mirroring the page's setup.
 * Using the real `usePlaylistPlaybackState` (rather than a spy dispatch) lets the
 * timer effect observe `isPlaying` flipping through `PLAYLIST_STARTED`, exactly
 * as it does in `MugenProtoPedia`.
 */
type HarnessProps = {
  playModeState: PlayModeState;
  changeDelayLevel: (
    action:
      | SimulatedDelayLevel
      | ((prev: SimulatedDelayLevel) => SimulatedDelayLevel),
  ) => void;
  fetchPrototypeByIdForPlaylist: (id: number) => Promise<void>;
  canFetchMorePrototypes: boolean;
  inFlightRequests: number;
};

function useHarness(props: HarnessProps): PlaylistPlaybackState {
  const { state, dispatch } = usePlaylistPlaybackState();
  usePlaylistPlayback({
    playModeState: props.playModeState,
    state,
    dispatch,
    changeDelayLevel: props.changeDelayLevel,
    fetchPrototypeByIdForPlaylist: props.fetchPrototypeByIdForPlaylist,
    canFetchMorePrototypes: props.canFetchMorePrototypes,
    inFlightRequests: props.inFlightRequests,
  });
  return state;
}

const PLAYLIST_FETCH_INTERVAL_MS = 1_000;

describe('usePlaylistPlayback', () => {
  // Stable spies (defined once) so the effect dependency arrays do not change
  // across rerenders.
  const changeDelayLevel = vi.fn();
  const fetchPrototypeByIdForPlaylist = vi.fn<(id: number) => Promise<void>>();

  const baseProps = (
    overrides: Partial<HarnessProps> = {},
  ): HarnessProps => ({
    playModeState: { type: 'playlist', ids: [11, 22], title: 'T' },
    changeDelayLevel,
    fetchPrototypeByIdForPlaylist,
    canFetchMorePrototypes: true,
    inFlightRequests: 0,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    fetchPrototypeByIdForPlaylist.mockResolvedValue(undefined);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resets the delay level to the play mode default on mode change', () => {
    renderHook(useHarness, {
      initialProps: baseProps({ playModeState: { type: 'normal' } }),
    });

    // Default for non-playlist modes is NORMAL.
    expect(changeDelayLevel).toHaveBeenCalledWith('NORMAL');
    expect(fetchPrototypeByIdForPlaylist).not.toHaveBeenCalled();
  });

  it('seeds the queue and dispatches playlist items at the fetch interval', async () => {
    renderHook(useHarness, { initialProps: baseProps() });

    // First item is dispatched on the initial 0ms tick.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(fetchPrototypeByIdForPlaylist).toHaveBeenNthCalledWith(1, 11);

    // The next item follows after the inter-fetch interval.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(PLAYLIST_FETCH_INTERVAL_MS);
    });
    expect(fetchPrototypeByIdForPlaylist).toHaveBeenNthCalledWith(2, 22);
  });

  it('completes once the queue drains with no in-flight requests', async () => {
    const { result } = renderHook(useHarness, { initialProps: baseProps() });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0); // fetch 11
      await vi.advanceTimersByTimeAsync(PLAYLIST_FETCH_INTERVAL_MS); // fetch 22
      await vi.advanceTimersByTimeAsync(PLAYLIST_FETCH_INTERVAL_MS); // drain -> complete
    });

    expect(fetchPrototypeByIdForPlaylist).toHaveBeenCalledTimes(2);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isCompleted).toBe(true);
    // processedCount is advanced by `onPlaylistItemProcessed` inside
    // usePrototypeFetching, not by this orchestration hook, so the injected
    // fetcher spy leaves it at 0 here.
    expect(result.current.processedCount).toBe(0);
  });

  it('does not re-seed the queue for an equivalent playlist (signature dedup)', async () => {
    const { rerender } = renderHook(useHarness, {
      initialProps: baseProps(),
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(PLAYLIST_FETCH_INTERVAL_MS);
      await vi.advanceTimersByTimeAsync(PLAYLIST_FETCH_INTERVAL_MS);
    });
    expect(fetchPrototypeByIdForPlaylist).toHaveBeenCalledTimes(2);

    // A fresh object with the same ids/title has the same signature, so the
    // queue-prep effect must early-return and not restart playback.
    await act(async () => {
      rerender(
        baseProps({ playModeState: { type: 'playlist', ids: [11, 22], title: 'T' } }),
      );
      await vi.advanceTimersByTimeAsync(PLAYLIST_FETCH_INTERVAL_MS);
    });
    expect(fetchPrototypeByIdForPlaylist).toHaveBeenCalledTimes(2);
  });

  it('marks an empty playlist as not playing without fetching', () => {
    const { result } = renderHook(useHarness, {
      initialProps: baseProps({
        playModeState: { type: 'playlist', ids: [], title: 'empty' },
      }),
    });

    expect(result.current.isPlaying).toBe(false);
    expect(fetchPrototypeByIdForPlaylist).not.toHaveBeenCalled();
    expect(changeDelayLevel).toHaveBeenCalledWith('NORMAL');
  });

  it('retries instead of fetching while concurrency is saturated', async () => {
    const { rerender } = renderHook(useHarness, {
      initialProps: baseProps({ canFetchMorePrototypes: false }),
    });

    // No fetch while saturated, even across several intervals.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(PLAYLIST_FETCH_INTERVAL_MS);
    });
    expect(fetchPrototypeByIdForPlaylist).not.toHaveBeenCalled();

    // Once capacity frees up, the loop resumes fetching. The rerender must be in
    // its own act so the timer effect's passive cleanup/re-run (which schedules
    // the fresh 0ms processNext) flushes before the timers are advanced.
    await act(async () => {
      rerender(baseProps({ canFetchMorePrototypes: true }));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(PLAYLIST_FETCH_INTERVAL_MS);
    });
    expect(fetchPrototypeByIdForPlaylist).toHaveBeenCalledWith(11);
  });
});
