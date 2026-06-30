import { act, renderHook, waitFor } from '@testing-library/react';

import type { MockedFunction } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getRandomPrototype } from '@/app/actions/prototypes-gateway';
import type { PrototypeForMpp } from '@/lib/api/prototypes';
import { useRandomPrototype } from '@/lib/hooks/use-random-prototype';

vi.mock('@/app/actions/prototypes-gateway');

const mockedGetRandomPrototype =
  getRandomPrototype as unknown as MockedFunction<typeof getRandomPrototype>;

describe('useRandomPrototype', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns a prototype and updates state on success', async () => {
    const prototype: PrototypeForMpp = {
      id: 1,
      prototypeNm: 'Random Prototype',
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

    mockedGetRandomPrototype.mockResolvedValueOnce(prototype);

    const { result } = renderHook(() => useRandomPrototype());

    await act(async () => {
      const returned = await result.current.getRandomPrototype();
      expect(returned).toEqual(prototype);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockedGetRandomPrototype).toHaveBeenCalledTimes(1);
  });

  it('returns null and does not set error when no prototype is available', async () => {
    mockedGetRandomPrototype.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useRandomPrototype());

    await act(async () => {
      const returned = await result.current.getRandomPrototype();
      expect(returned).toBeNull();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockedGetRandomPrototype).toHaveBeenCalledTimes(1);
  });

  it('sets error state and rethrows when fetcher throws', async () => {
    mockedGetRandomPrototype.mockRejectedValueOnce(new Error('random-failed'));

    const { result } = renderHook(() => useRandomPrototype());

    expect(result.current.isLoading).toBe(false);

    await expect(result.current.getRandomPrototype()).rejects.toThrow(
      'random-failed',
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('random-failed');
    });
  });
});
