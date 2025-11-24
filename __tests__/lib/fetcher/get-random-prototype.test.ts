import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchRandomPrototype,
  getRandomPrototypeFromMapOrFetch,
} from '@/app/actions/prototypes';
import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { getRandomPrototypeData } from '@/lib/fetcher/get-random-prototype';
import { logger } from '@/lib/logger.client';
import { constructDisplayMessage } from '@/lib/network-utils';

vi.mock('@/app/actions/prototypes', () => ({
  fetchRandomPrototype: vi.fn(),
  getRandomPrototypeFromMapOrFetch: vi.fn(),
}));

vi.mock('@/lib/logger.client', () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock('@/lib/network-utils', () => ({
  constructDisplayMessage: vi.fn(),
}));

const getRandomPrototypeFromMapOrFetchMock =
  getRandomPrototypeFromMapOrFetch as unknown as ReturnType<typeof vi.fn>;
const fetchRandomPrototypeMock = fetchRandomPrototype as unknown as ReturnType<
  typeof vi.fn
>;
const loggerErrorMock = logger.error as unknown as ReturnType<typeof vi.fn>;
const constructDisplayMessageMock =
  constructDisplayMessage as unknown as ReturnType<typeof vi.fn>;

const createPrototype = (
  overrides: Partial<NormalizedPrototype> = {},
): NormalizedPrototype => ({
  id: 1,
  prototypeNm: 'Prototype 1',
  teamNm: 'Team A',
  users: ['User A'],
  status: 1,
  releaseFlg: 1,
  createDate: '2024-01-01',
  updateDate: '2024-01-02',
  releaseDate: '2024-01-03',
  revision: 1,
  freeComment: 'comment',
  viewCount: 0,
  goodCount: 0,
  commentCount: 0,
  mainUrl: 'https://example.com',
  licenseType: 1,
  thanksFlg: 0,
  ...overrides,
});

describe('getRandomPrototypeData', () => {
  beforeEach(() => {
    getRandomPrototypeFromMapOrFetchMock.mockReset();
    fetchRandomPrototypeMock.mockReset();
    loggerErrorMock.mockReset();
    constructDisplayMessageMock.mockReset();
  });

  it('returns map-store result when available', async () => {
    const prototype = createPrototype({ id: 10 });

    getRandomPrototypeFromMapOrFetchMock.mockResolvedValue({
      ok: true,
      data: prototype,
    });

    const result = await getRandomPrototypeData();

    expect(result).toEqual(prototype);
    expect(getRandomPrototypeFromMapOrFetchMock).toHaveBeenCalled();
    expect(fetchRandomPrototypeMock).not.toHaveBeenCalled();
    expect(loggerErrorMock).not.toHaveBeenCalled();
  });

  it('returns null when map-store returns 404', async () => {
    getRandomPrototypeFromMapOrFetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      error: 'Not Found',
    });

    const result = await getRandomPrototypeData();

    expect(result).toBeNull();
    expect(fetchRandomPrototypeMock).not.toHaveBeenCalled();
  });

  it('falls back to fetchRandomPrototype on 503 from map-store', async () => {
    const prototype = createPrototype({ id: 20 });

    getRandomPrototypeFromMapOrFetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      error: 'Service Unavailable',
    });

    fetchRandomPrototypeMock.mockResolvedValue({
      ok: true,
      data: prototype,
    });

    const result = await getRandomPrototypeData();

    expect(result).toEqual(prototype);
    expect(fetchRandomPrototypeMock).toHaveBeenCalledWith({
      limit: 500,
      offset: 0,
    });
  });

  it('throws when map-store fails with non-503 error', async () => {
    getRandomPrototypeFromMapOrFetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      error: 'Internal Error',
    });

    constructDisplayMessageMock.mockReturnValue('Map error');

    await expect(getRandomPrototypeData()).rejects.toThrow('Map error');

    expect(constructDisplayMessageMock).toHaveBeenCalledWith({
      ok: false,
      status: 500,
      error: 'Internal Error',
    });

    expect(loggerErrorMock).toHaveBeenCalledWith(
      'getRandomPrototypeData failed via map fetch',
      {
        status: 500,
        message: 'Map error',
      },
    );
    expect(fetchRandomPrototypeMock).not.toHaveBeenCalled();
  });

  it('throws when fallback fetchRandomPrototype fails', async () => {
    getRandomPrototypeFromMapOrFetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      error: 'Service Unavailable',
    });

    fetchRandomPrototypeMock.mockResolvedValue({
      ok: false,
      status: 502,
      error: 'Bad Gateway',
    });

    constructDisplayMessageMock.mockReturnValue('Fallback error');

    await expect(getRandomPrototypeData()).rejects.toThrow('Fallback error');

    expect(constructDisplayMessageMock).toHaveBeenCalledWith({
      ok: false,
      status: 502,
      error: 'Bad Gateway',
    });

    expect(loggerErrorMock).toHaveBeenCalledWith(
      'getRandomPrototypeData failed via fallback fetch',
      {
        status: 502,
        message: 'Fallback error',
      },
    );
  });
});
