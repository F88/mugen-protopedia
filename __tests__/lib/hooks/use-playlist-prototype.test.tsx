import { act, renderHook, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { usePlaylistPrototype } from '@/lib/hooks/use-playlist-prototype';
import { prototypeRepository } from '@/lib/repositories/prototype-repository';

vi.mock('@/lib/repositories/prototype-repository');

const mockedRepository = prototypeRepository as unknown as {
  getByPrototypeId: ReturnType<typeof vi.fn>;
};

describe('usePlaylistPrototype', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches a prototype successfully and updates state', async () => {
    const prototype: NormalizedPrototype = {
      id: 123,
      prototypeNm: 'Test Prototype',
      teamNm: 'Team',
      users: [],
      summary: 'desc',
      systemDescription: 'system description',
      tags: [],
      materials: [],
      events: [],
      awards: [],
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
    };

    mockedRepository.getByPrototypeId = vi
      .fn()
      .mockResolvedValueOnce(prototype);

    const { result } = renderHook(() => usePlaylistPrototype());

    await act(async () => {
      const returned = await result.current.fetchPrototype(123);
      expect(returned).toEqual(prototype);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.prototype).toEqual(prototype);
    expect(mockedRepository.getByPrototypeId).toHaveBeenCalledWith(123);
  });

  it('sets prototype to null when repository returns undefined', async () => {
    mockedRepository.getByPrototypeId = vi
      .fn()
      .mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => usePlaylistPrototype());

    await act(async () => {
      const returned = await result.current.fetchPrototype(999);
      expect(returned).toBeUndefined();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.prototype).toBeNull();
    expect(mockedRepository.getByPrototypeId).toHaveBeenCalledWith(999);
  });

  it('propagates errors and sets error state', async () => {
    mockedRepository.getByPrototypeId = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => usePlaylistPrototype());

    expect(result.current.isLoading).toBe(false);

    await expect(result.current.fetchPrototype(1)).rejects.toThrow('boom');

    await waitFor(() => {
      expect(result.current.error).toBe('boom');
      expect(result.current.prototype).toBeNull();
    });
  });
});
