import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Verifies the `USE_PROMIDAS_REPOSITORY` flag dispatch in
 * `app/actions/prototypes-repo.ts`: enabled -> promidas Repository,
 * disabled (default) -> legacy map-store action. Both backends are mocked so
 * the test asserts the routing, not their internals.
 */
const mocks = vi.hoisted(() => ({
  fromRepo: vi.fn(),
  fromMapStore: vi.fn(),
}));

vi.mock('@/lib/repositories/promidas-repository', () => ({
  promidasRepository: {},
  getPrototypeNamesFromRepo: mocks.fromRepo,
}));

vi.mock('@/app/actions/prototypes', () => ({
  getPrototypeNamesFromStore: mocks.fromMapStore,
}));

import { getPrototypeNamesFromStore } from '@/app/actions/prototypes-repo';

describe('prototypes-repo getPrototypeNamesFromStore (flag dispatch)', () => {
  const original = process.env.USE_PROMIDAS_REPOSITORY;

  afterEach(() => {
    vi.clearAllMocks();
    if (original === undefined) {
      delete process.env.USE_PROMIDAS_REPOSITORY;
    } else {
      process.env.USE_PROMIDAS_REPOSITORY = original;
    }
  });

  it('routes to the promidas repository when the flag is enabled', async () => {
    process.env.USE_PROMIDAS_REPOSITORY = 'true';
    mocks.fromRepo.mockResolvedValue({ 1: 'repo' });

    const result = await getPrototypeNamesFromStore([1]);

    expect(result).toEqual({ 1: 'repo' });
    expect(mocks.fromRepo).toHaveBeenCalledWith({}, [1]);
    expect(mocks.fromMapStore).not.toHaveBeenCalled();
  });

  it('delegates to the legacy map-store when the flag is disabled (default)', async () => {
    delete process.env.USE_PROMIDAS_REPOSITORY;
    mocks.fromMapStore.mockResolvedValue({ 2: 'legacy' });

    const result = await getPrototypeNamesFromStore([2]);

    expect(result).toEqual({ 2: 'legacy' });
    expect(mocks.fromMapStore).toHaveBeenCalledWith([2]);
    expect(mocks.fromRepo).not.toHaveBeenCalled();
  });
});
