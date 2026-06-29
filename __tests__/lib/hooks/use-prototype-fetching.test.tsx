import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePrototypeFetching } from '@/lib/hooks/use-prototype-fetching';

// Controllable mocks for the data-layer fetchers the hook owns internally.
const {
  mockGetRandomPrototype,
  mockFetchPlaylistPrototype,
  mockGetLatestPrototypeById,
} = vi.hoisted(() => ({
  mockGetRandomPrototype: vi.fn(),
  mockFetchPlaylistPrototype: vi.fn(),
  mockGetLatestPrototypeById: vi.fn(),
}));

vi.mock('@/lib/hooks/use-random-prototype', () => ({
  useRandomPrototype: () => ({ getRandomPrototype: mockGetRandomPrototype }),
}));
vi.mock('@/lib/hooks/use-playlist-prototype', () => ({
  usePlaylistPrototype: () => ({ fetchPrototype: mockFetchPlaylistPrototype }),
}));
vi.mock('@/lib/fetcher/get-latest-prototype-by-id', () => ({
  getLatestPrototypeById: mockGetLatestPrototypeById,
}));

const makeSlots = () => ({
  appendPlaceholder: vi.fn(() => 1),
  replacePrototypeInSlot: vi.fn().mockResolvedValue(undefined),
  setSlotError: vi.fn(),
  tryIncrementInFlightRequests: vi.fn(() => true),
  decrementInFlightRequests: vi.fn(),
});

const render = (
  overrides: { isPlaylistPlaying?: boolean } = {},
  slots = makeSlots(),
) => {
  const onPlaylistItemProcessed = vi.fn();
  const view = renderHook(() =>
    usePrototypeFetching({
      slots,
      isPlaylistPlaying: overrides.isPlaylistPlaying ?? false,
      onPlaylistItemProcessed,
    }),
  );
  return { ...view, slots, onPlaylistItemProcessed };
};

const SAMPLE = { id: 1 };

describe('usePrototypeFetching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchRandomPrototype', () => {
    it('fills a slot on success', async () => {
      mockGetRandomPrototype.mockResolvedValue(SAMPLE);
      const { result, slots } = render();

      await act(async () => {
        await result.current.fetchRandomPrototype();
      });

      expect(slots.appendPlaceholder).toHaveBeenCalledTimes(1);
      expect(slots.replacePrototypeInSlot).toHaveBeenCalledTimes(1);
      expect(slots.setSlotError).not.toHaveBeenCalled();
      expect(slots.decrementInFlightRequests).toHaveBeenCalledTimes(1);
    });

    it('marks the slot failed when the API yields nothing', async () => {
      mockGetRandomPrototype.mockResolvedValue(null);
      const { result, slots } = render();

      await act(async () => {
        await result.current.fetchRandomPrototype();
      });

      expect(slots.setSlotError).toHaveBeenCalledWith(1, 'Failed to load.');
      expect(slots.decrementInFlightRequests).toHaveBeenCalledTimes(1);
    });

    it('is a no-op while a playlist is playing', async () => {
      const { result, slots } = render({ isPlaylistPlaying: true });

      await act(async () => {
        await result.current.fetchRandomPrototype();
      });

      expect(slots.tryIncrementInFlightRequests).not.toHaveBeenCalled();
      expect(slots.appendPlaceholder).not.toHaveBeenCalled();
    });

    it('is a no-op when the concurrency cap is reached', async () => {
      const slots = makeSlots();
      slots.tryIncrementInFlightRequests.mockReturnValue(false);
      const { result } = render({}, slots);

      await act(async () => {
        await result.current.fetchRandomPrototype();
      });

      expect(slots.appendPlaceholder).not.toHaveBeenCalled();
    });

    it('still decrements in-flight and expands the message when the fetch throws', async () => {
      mockGetRandomPrototype.mockRejectedValue(new Error('Failed to fetch'));
      const { result, slots } = render();

      await act(async () => {
        await result.current.fetchRandomPrototype();
      });

      // The "Failed to fetch" message is expanded with likely causes.
      expect(slots.setSlotError).toHaveBeenCalledWith(
        1,
        expect.stringContaining('Possible causes'),
      );
      // Critical: the in-flight counter is released even on error.
      expect(slots.decrementInFlightRequests).toHaveBeenCalledTimes(1);
    });

    it('uses the raw error message for non-"Failed to fetch" errors', async () => {
      mockGetRandomPrototype.mockRejectedValue(new Error('boom'));
      const { result, slots } = render();

      await act(async () => {
        await result.current.fetchRandomPrototype();
      });

      expect(slots.setSlotError).toHaveBeenCalledWith(1, 'boom');
    });
  });

  describe('fetchPrototypeById', () => {
    it('fills the slot and clears the error on success', async () => {
      mockGetLatestPrototypeById.mockResolvedValue({ id: 5 });
      const { result, slots } = render();

      await act(async () => {
        await result.current.fetchPrototypeById(5);
      });

      expect(slots.replacePrototypeInSlot).toHaveBeenCalledTimes(1);
      expect(result.current.prototypeIdError).toBeNull();
    });

    it('reports "Not found." when the id is missing', async () => {
      mockGetLatestPrototypeById.mockResolvedValue(null);
      const { result, slots } = render();

      await act(async () => {
        await result.current.fetchPrototypeById(5);
      });

      expect(result.current.prototypeIdError).toBe('Not found.');
      expect(slots.setSlotError).toHaveBeenCalledWith(1, 'Not found.');
    });

    it('reports the error and still decrements in-flight when the fetch throws', async () => {
      mockGetLatestPrototypeById.mockRejectedValue(new Error('boom'));
      const { result, slots } = render();

      await act(async () => {
        await result.current.fetchPrototypeById(5);
      });

      expect(result.current.prototypeIdError).toBe('boom');
      expect(slots.decrementInFlightRequests).toHaveBeenCalledTimes(1);
    });

    it('ignores a negative id without touching slots', async () => {
      const { result, slots } = render();

      await act(async () => {
        await result.current.fetchPrototypeById(-1);
      });

      expect(slots.tryIncrementInFlightRequests).not.toHaveBeenCalled();
      expect(slots.appendPlaceholder).not.toHaveBeenCalled();
    });
  });

  describe('fetchPrototypeByIdFromInput', () => {
    it('rejects empty input', async () => {
      const { result } = render();

      await act(async () => {
        await result.current.fetchPrototypeByIdFromInput('   ');
      });

      expect(result.current.prototypeIdError).toBe(
        'Please enter a prototype ID.',
      );
      expect(mockGetLatestPrototypeById).not.toHaveBeenCalled();
    });

    it('rejects non-numeric input', async () => {
      const { result } = render();

      await act(async () => {
        await result.current.fetchPrototypeByIdFromInput('abc');
      });

      expect(result.current.prototypeIdError).toBe(
        'Prototype ID must be a non-negative number.',
      );
      expect(mockGetLatestPrototypeById).not.toHaveBeenCalled();
    });

    it('delegates a valid id to the fetch', async () => {
      mockGetLatestPrototypeById.mockResolvedValue({ id: 42 });
      const { result } = render();

      await act(async () => {
        await result.current.fetchPrototypeByIdFromInput('42');
      });

      expect(mockGetLatestPrototypeById).toHaveBeenCalledWith(42);
    });
  });

  describe('fetchPrototypeByIdForPlaylist', () => {
    it('advances the playlist progress count on each attempt', async () => {
      mockFetchPlaylistPrototype.mockResolvedValue({ id: 7 });
      const { result, slots, onPlaylistItemProcessed } = render();

      await act(async () => {
        await result.current.fetchPrototypeByIdForPlaylist(7);
      });

      expect(slots.replacePrototypeInSlot).toHaveBeenCalledTimes(1);
      expect(slots.decrementInFlightRequests).toHaveBeenCalledTimes(1);
      expect(onPlaylistItemProcessed).toHaveBeenCalledTimes(1);
    });

    // Playlist completion depends on every item advancing the count and
    // releasing the in-flight slot, even when the item is missing or errors.
    it('still advances progress and decrements on a missing id', async () => {
      mockFetchPlaylistPrototype.mockResolvedValue(null);
      const { result, slots, onPlaylistItemProcessed } = render();

      await act(async () => {
        await result.current.fetchPrototypeByIdForPlaylist(7);
      });

      expect(result.current.prototypeIdError).toBe('Not found.');
      expect(onPlaylistItemProcessed).toHaveBeenCalledTimes(1);
      expect(slots.decrementInFlightRequests).toHaveBeenCalledTimes(1);
    });

    it('still advances progress and decrements when the fetch throws', async () => {
      mockFetchPlaylistPrototype.mockRejectedValue(new Error('down'));
      const { result, slots, onPlaylistItemProcessed } = render();

      await act(async () => {
        await result.current.fetchPrototypeByIdForPlaylist(7);
      });

      expect(slots.decrementInFlightRequests).toHaveBeenCalledTimes(1);
      expect(onPlaylistItemProcessed).toHaveBeenCalledTimes(1);
    });

    it('ignores a negative id without touching slots or progress', async () => {
      const { result, slots, onPlaylistItemProcessed } = render();

      await act(async () => {
        await result.current.fetchPrototypeByIdForPlaylist(-1);
      });

      expect(slots.tryIncrementInFlightRequests).not.toHaveBeenCalled();
      expect(slots.appendPlaceholder).not.toHaveBeenCalled();
      expect(onPlaylistItemProcessed).not.toHaveBeenCalled();
    });

    it('is a no-op when the concurrency cap is reached', async () => {
      const slots = makeSlots();
      slots.tryIncrementInFlightRequests.mockReturnValue(false);
      const { result, onPlaylistItemProcessed } = render({}, slots);

      await act(async () => {
        await result.current.fetchPrototypeByIdForPlaylist(7);
      });

      expect(slots.appendPlaceholder).not.toHaveBeenCalled();
      expect(onPlaylistItemProcessed).not.toHaveBeenCalled();
    });
  });
});
