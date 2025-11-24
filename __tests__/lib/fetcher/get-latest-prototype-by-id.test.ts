import { describe, expect, it, vi, beforeEach } from 'vitest';

import { fetchPrototypesViaNoStoreClient } from '@/app/actions/prototypes';
import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { getLatestPrototypeById } from '@/lib/fetcher/get-latest-prototype-by-id';
import { logger } from '@/lib/logger.client';
import { constructDisplayMessage } from '@/lib/network-utils';

vi.mock('@/app/actions/prototypes', () => ({
  fetchPrototypesViaNoStoreClient: vi.fn(),
}));

vi.mock('@/lib/logger.client', () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock('@/lib/network-utils', () => ({
  constructDisplayMessage: vi.fn(),
}));

const fetchPrototypesViaNoStoreClientMock =
  fetchPrototypesViaNoStoreClient as unknown as ReturnType<typeof vi.fn>;

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

describe('getLatestPrototypeById', () => {
  beforeEach(() => {
    fetchPrototypesViaNoStoreClientMock.mockReset();
    loggerErrorMock.mockReset();
    constructDisplayMessageMock.mockReset();
  });

  it('returns the first prototype when data is non-empty', async () => {
    const prototype = createPrototype({ id: 42 });

    fetchPrototypesViaNoStoreClientMock.mockResolvedValue({
      ok: true,
      data: [prototype],
    });

    const result = await getLatestPrototypeById(42);

    expect(result).toEqual(prototype);
    expect(fetchPrototypesViaNoStoreClientMock).toHaveBeenCalledWith({
      prototypeId: 42,
      limit: 1,
      offset: 0,
    });
    expect(loggerErrorMock).not.toHaveBeenCalled();
  });

  it('returns null when data array is empty', async () => {
    fetchPrototypesViaNoStoreClientMock.mockResolvedValue({
      ok: true,
      data: [],
    });

    const result = await getLatestPrototypeById(9999);

    expect(result).toBeNull();
    expect(fetchPrototypesViaNoStoreClientMock).toHaveBeenCalledWith({
      prototypeId: 9999,
      limit: 1,
      offset: 0,
    });
  });

  it('throws an error when the server action fails', async () => {
    constructDisplayMessageMock.mockReturnValue('Something went wrong');

    fetchPrototypesViaNoStoreClientMock.mockResolvedValue({
      ok: false,
      status: 503,
      error: 'Service Unavailable',
    });

    await expect(getLatestPrototypeById(1)).rejects.toThrow(
      'Something went wrong',
    );

    expect(constructDisplayMessageMock).toHaveBeenCalledWith({
      ok: false,
      status: 503,
      error: 'Service Unavailable',
    });

    expect(loggerErrorMock).toHaveBeenCalledWith(
      'Failed to fetch prototype via server function',
      {
        id: 1,
        status: 503,
        message: 'Something went wrong',
      },
    );
  });
});
