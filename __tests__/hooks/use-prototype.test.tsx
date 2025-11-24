import { act, renderHook } from '@testing-library/react';

import type { MockedFunction } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { getPrototype } from '@/lib/fetcher/get-prototype';
import { usePrototype } from '@/lib/hooks/use-prototype';

vi.mock('@/lib/fetcher/get-prototype');

const mockedGetPrototype = getPrototype as unknown as MockedFunction<
  typeof getPrototype
>;

describe('usePrototype', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns null prototype and no loading state when id is not provided', () => {
    const { result } = renderHook(() => usePrototype());

    expect(result.current.prototype).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches prototype via fetchPrototype and updates cache when id matches', async () => {
    const prototype: NormalizedPrototype = {
      id: 42,
      prototypeNm: 'Answer',
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

    mockedGetPrototype.mockResolvedValue(prototype);

    const { result } = renderHook(() => usePrototype({ id: 42 }));

    await act(async () => {
      const returned = await result.current.fetchPrototype(42);
      expect(returned).toEqual(prototype);
    });

    expect(result.current.prototype).toEqual(prototype);
    expect(result.current.error).toBeNull();
    expect(mockedGetPrototype).toHaveBeenCalledWith(42);
  });

  it('does not update local prototype when fetching a different id', async () => {
    const prototype: NormalizedPrototype = {
      id: 7,
      prototypeNm: 'Seven',
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

    mockedGetPrototype.mockResolvedValue(prototype);

    const { result } = renderHook(() => usePrototype({ id: 1 }));

    await act(async () => {
      const returned = await result.current.fetchPrototype(7);
      expect(returned).toEqual(prototype);
    });

    // Local prototype should not be updated because the hook is bound to id=1
    expect(result.current.prototype).toBeNull();
  });

  it('sets error when fetchPrototype throws', async () => {
    mockedGetPrototype.mockRejectedValue(new Error('failed'));

    const { result } = renderHook(() => usePrototype({ id: 3 }));

    expect(result.current.error).toBeNull();

    await expect(
      act(async () => {
        await result.current.fetchPrototype(3);
      }),
    ).rejects.toThrow('failed');

    expect(result.current.error).toBe('failed');
  });
});
