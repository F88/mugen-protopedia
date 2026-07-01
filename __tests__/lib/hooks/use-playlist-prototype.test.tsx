import { act, renderHook, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PrototypeForMpp } from '@/lib/api/prototypes';
import { usePlaylistPrototype } from '@/lib/hooks/use-playlist-prototype';

const mocks = vi.hoisted(() => ({ getPrototypeById: vi.fn() }));

vi.mock('@/app/actions/prototypes-gateway', () => ({
  getPrototypeById: mocks.getPrototypeById,
}));

describe('usePlaylistPrototype', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches a prototype successfully and updates state', async () => {
    const prototype: PrototypeForMpp = {
      id: 123,
      prototypeNm: 'Test Prototype',
      teamNm: 'Team',
      users: [],
      summary: 'desc',
      status: 1,
      releaseFlg: 1,
      createDate: '2020-01-01T00:00:00.000Z',
      updateDate: '2020-01-01T00:00:00.000Z',
      releaseDate: '2020-01-02T00:00:00.000Z',
      revision: 1,
      freeComment: '',
      viewCount: 0,
      goodCount: 0,
      commentCount: 0,
      mainUrl: 'https://example.com/image.png',
      licenseType: 0,
      thanksFlg: 0,
      systemDescription: '',
      tags: [],
      awards: [],
      events: [],
      materials: [],
    };

    mocks.getPrototypeById.mockResolvedValueOnce(prototype);

    const { result } = renderHook(() => usePlaylistPrototype());

    await act(async () => {
      const returned = await result.current.fetchPrototype(123);
      expect(returned).toEqual(prototype);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.prototype).toEqual(prototype);
    expect(mocks.getPrototypeById).toHaveBeenCalledWith(123);
  });

  it('sets prototype to null when the gateway returns undefined (not found)', async () => {
    mocks.getPrototypeById.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => usePlaylistPrototype());

    await act(async () => {
      const returned = await result.current.fetchPrototype(999);
      expect(returned).toBeUndefined();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.prototype).toBeNull();
    expect(mocks.getPrototypeById).toHaveBeenCalledWith(999);
  });

  it('propagates errors and sets error state', async () => {
    mocks.getPrototypeById.mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => usePlaylistPrototype());

    expect(result.current.isLoading).toBe(false);

    await expect(result.current.fetchPrototype(1)).rejects.toThrow('boom');

    await waitFor(() => {
      expect(result.current.error).toBe('boom');
      expect(result.current.prototype).toBeNull();
    });
  });
});
