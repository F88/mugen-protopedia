import { act, renderHook } from '@testing-library/react';

import type { MockedFunction } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { getRandomPrototypeData } from '@/lib/fetcher/get-random-prototype';
import { useRandomPrototype } from '@/lib/hooks/use-random-prototype';

vi.mock('@/lib/fetcher/get-random-prototype');

const mockedGetRandomPrototypeData =
  getRandomPrototypeData as unknown as MockedFunction<
    typeof getRandomPrototypeData
  >;

describe('useRandomPrototype', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns a prototype and updates state on success', async () => {
    const prototype: NormalizedPrototype = {
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
    };

    mockedGetRandomPrototypeData.mockResolvedValueOnce(prototype);

    const { result } = renderHook(() => useRandomPrototype());

    await act(async () => {
      const returned = await result.current.getRandomPrototype();
      expect(returned).toEqual(prototype);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockedGetRandomPrototypeData).toHaveBeenCalledTimes(1);
  });

  it('returns null and does not set error when no prototype is available', async () => {
    mockedGetRandomPrototypeData.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useRandomPrototype());

    await act(async () => {
      const returned = await result.current.getRandomPrototype();
      expect(returned).toBeNull();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockedGetRandomPrototypeData).toHaveBeenCalledTimes(1);
  });

  it('sets error state and rethrows when fetcher throws', async () => {
    mockedGetRandomPrototypeData.mockRejectedValueOnce(
      new Error('random-failed'),
    );

    const { result } = renderHook(() => useRandomPrototype());

    expect(result.current.isLoading).toBe(false);

    await expect(
      act(async () => {
        await result.current.getRandomPrototype();
      }),
    ).rejects.toThrow('random-failed');

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('random-failed');
  });
});
