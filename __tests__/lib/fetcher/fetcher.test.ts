import { describe, expect, it, beforeEach, vi } from 'vitest';
import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { getPrototypes } from '@/lib/fetcher/get-prototypes';
import type { InMemoryPrototypeRepository } from '@/lib/repositories/testing/in-memory-prototype-repository';

const { debugMock } = vi.hoisted(() => ({
  debugMock: vi.fn(),
}));

const { repoState } = vi.hoisted(() => ({
  repoState: {
    instance: undefined as InMemoryPrototypeRepository | undefined,
  },
}));

function getRepo(): InMemoryPrototypeRepository {
  const repo = repoState.instance;
  if (!repo) {
    throw new Error('In-memory prototype repository is not initialized');
  }
  return repo;
}

vi.mock('@/lib/logger.client', () => ({
  logger: {
    debug: debugMock,
  },
}));

vi.mock('@/lib/repositories/prototype-repository', async () => {
  const { createInMemoryPrototypeRepository } = await import(
    '@/lib/repositories/testing/in-memory-prototype-repository'
  );
  const repo = createInMemoryPrototypeRepository();
  repoState.instance = repo;
  return {
    prototypeRepository: repo.repository,
  };
});

describe('getPrototypes', () => {
  beforeEach(() => {
    debugMock.mockReset();
    const repo = getRepo();
    repo.setPrototypes([]);
    repo.setTsv('');
  });

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

  it('returns prototypes using provided pagination params', async () => {
    const prototypes = [
      createPrototype({ id: 41 }),
      createPrototype({ id: 42 }),
      createPrototype({ id: 43 }),
    ];
    const repo = getRepo();
    repo.setPrototypes(prototypes);
    const listSpy = vi.spyOn(repo.repository, 'list');

    const limit = 1;
    const offset = 1;
    const result = await getPrototypes({ limit, offset });

    expect(result).toStrictEqual(prototypes.slice(offset, offset + limit));
    expect(listSpy).toHaveBeenCalledWith({ limit, offset });
    expect(debugMock).toHaveBeenCalledWith('getPrototypes called', {
      limit,
      offset,
    });
    listSpy.mockRestore();
  });

  it('falls back to default limit when params omitted', async () => {
    const prototypes = [createPrototype({ id: 2 })];
    const repo = getRepo();
    repo.setPrototypes(prototypes);
    const listSpy = vi.spyOn(repo.repository, 'list');

    const result = await getPrototypes({});

    expect(result).toStrictEqual(prototypes);
    expect(listSpy).toHaveBeenCalledWith({ limit: 10, offset: 0 });
    expect(debugMock).toHaveBeenCalledWith('getPrototypes called', {
      limit: 10,
      offset: 0,
    });
    listSpy.mockRestore();
  });

  it('propagates repository errors', async () => {
    const error = new Error('Repository failure');
    const repo = getRepo();
    const listSpy = vi.spyOn(repo.repository, 'list').mockRejectedValue(error);

    await expect(getPrototypes({ limit: 5, offset: 1 })).rejects.toThrow(error);
    expect(listSpy).toHaveBeenCalledWith({ limit: 5, offset: 1 });
    listSpy.mockRestore();
  });
});
