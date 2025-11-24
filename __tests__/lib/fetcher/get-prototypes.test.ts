import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { getPrototypes } from '@/lib/fetcher/get-prototypes';
import { logger } from '@/lib/logger.client';
import { prototypeRepository } from '@/lib/repositories/prototype-repository';

vi.mock('@/lib/logger.client', () => ({
  logger: {
    debug: vi.fn(),
  },
}));

vi.mock('@/lib/repositories/prototype-repository', () => ({
  prototypeRepository: {
    list: vi.fn(),
  },
}));

const loggerDebugMock = logger.debug as unknown as ReturnType<typeof vi.fn>;
const listMock = prototypeRepository.list as unknown as ReturnType<
  typeof vi.fn
>;

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

describe('getPrototypes', () => {
  beforeEach(() => {
    listMock.mockReset();
    loggerDebugMock.mockReset();
  });

  it('calls repository.list with provided params and returns result', async () => {
    const prototypes = [
      createPrototype({ id: 41 }),
      createPrototype({ id: 42 }),
    ];
    listMock.mockResolvedValue(prototypes);

    const result = await getPrototypes({ limit: 5, offset: 10 });

    expect(result).toStrictEqual(prototypes);
    expect(listMock).toHaveBeenCalledWith({
      limit: 5,
      offset: 10,
      prototypeId: undefined,
    });
    expect(loggerDebugMock).toHaveBeenCalledWith('getPrototypes called', {
      limit: 5,
      offset: 10,
      prototypeId: undefined,
    });
  });

  it('uses default limit when not provided', async () => {
    const prototypes = [createPrototype({ id: 2 })];
    listMock.mockResolvedValue(prototypes);

    const result = await getPrototypes({});

    expect(result).toStrictEqual(prototypes);
    expect(listMock).toHaveBeenCalledWith({
      limit: 10,
      offset: 0,
      prototypeId: undefined,
    });
    expect(loggerDebugMock).toHaveBeenCalledWith('getPrototypes called', {
      limit: 10,
      offset: 0,
      prototypeId: undefined,
    });
  });

  it('propagates repository errors', async () => {
    const error = new Error('Repository failure');
    listMock.mockRejectedValue(error);

    await expect(
      getPrototypes({ limit: 5, offset: 1, prototypeId: 123 }),
    ).rejects.toThrow(error);

    expect(listMock).toHaveBeenCalledWith({
      limit: 5,
      offset: 1,
      prototypeId: 123,
    });
  });
});
