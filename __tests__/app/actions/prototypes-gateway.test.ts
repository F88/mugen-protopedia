import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Verifies the `USE_PROMIDAS_REPOSITORY` flag dispatch in
 * `app/actions/prototypes-gateway.ts`: enabled -> promidas Repository,
 * disabled (default) -> legacy map-store action. Both backends are mocked so
 * the tests assert the routing, not their internals.
 */
const mocks = vi.hoisted(() => ({
  namesFromRepo: vi.fn(),
  namesFromMapStore: vi.fn(),
  allFromRepo: vi.fn(),
  allFromMapStore: vi.fn(),
  maxFromRepo: vi.fn(),
  maxFromMapStore: vi.fn(),
}));

vi.mock('@/lib/repositories/promidas-repository', () => ({
  promidasBackedRepository: {
    getPrototypeNames: mocks.namesFromRepo,
    getAllPrototypes: mocks.allFromRepo,
    getMaxPrototypeId: mocks.maxFromRepo,
  },
}));

vi.mock('@/app/actions/prototypes', () => ({
  getPrototypeNamesFromStore: mocks.namesFromMapStore,
  getAllPrototypesFromMapOrFetch: mocks.allFromMapStore,
  getMaxPrototypeId: mocks.maxFromMapStore,
}));

import {
  getAllPrototypes,
  getMaxPrototypeId,
  getPrototypeNames,
} from '@/app/actions/prototypes-gateway';

describe('prototypes-gateway flag dispatch', () => {
  const original = process.env.USE_PROMIDAS_REPOSITORY;

  afterEach(() => {
    vi.clearAllMocks();
    if (original === undefined) {
      delete process.env.USE_PROMIDAS_REPOSITORY;
    } else {
      process.env.USE_PROMIDAS_REPOSITORY = original;
    }
  });

  describe('getPrototypeNames', () => {
    it('routes to the promidas repository when the flag is enabled', async () => {
      process.env.USE_PROMIDAS_REPOSITORY = 'true';
      mocks.namesFromRepo.mockResolvedValue({ 1: 'repo' });

      const result = await getPrototypeNames([1]);

      expect(result).toEqual({ 1: 'repo' });
      expect(mocks.namesFromRepo).toHaveBeenCalledWith([1]);
      expect(mocks.namesFromMapStore).not.toHaveBeenCalled();
    });

    it('delegates to the legacy map-store when the flag is disabled (default)', async () => {
      delete process.env.USE_PROMIDAS_REPOSITORY;
      mocks.namesFromMapStore.mockResolvedValue({ 2: 'legacy' });

      const result = await getPrototypeNames([2]);

      expect(result).toEqual({ 2: 'legacy' });
      expect(mocks.namesFromMapStore).toHaveBeenCalledWith([2]);
      expect(mocks.namesFromRepo).not.toHaveBeenCalled();
    });
  });

  describe('getAllPrototypes', () => {
    it('routes to the promidas repository when the flag is enabled', async () => {
      process.env.USE_PROMIDAS_REPOSITORY = 'true';
      mocks.allFromRepo.mockResolvedValue({ ok: true, data: ['repo'] });

      const result = await getAllPrototypes();

      expect(result).toEqual({ ok: true, data: ['repo'] });
      expect(mocks.allFromRepo).toHaveBeenCalledWith();
      expect(mocks.allFromMapStore).not.toHaveBeenCalled();
    });

    it('delegates to the legacy map-store when the flag is disabled (default)', async () => {
      delete process.env.USE_PROMIDAS_REPOSITORY;
      mocks.allFromMapStore.mockResolvedValue({ ok: true, data: ['legacy'] });

      const result = await getAllPrototypes();

      expect(result).toEqual({ ok: true, data: ['legacy'] });
      expect(mocks.allFromMapStore).toHaveBeenCalledWith();
      expect(mocks.allFromRepo).not.toHaveBeenCalled();
    });
  });

  describe('getMaxPrototypeId', () => {
    it('routes to the promidas repository when the flag is enabled', async () => {
      process.env.USE_PROMIDAS_REPOSITORY = 'true';
      mocks.maxFromRepo.mockResolvedValue(1002);

      const result = await getMaxPrototypeId();

      expect(result).toBe(1002);
      expect(mocks.maxFromRepo).toHaveBeenCalledWith();
      expect(mocks.maxFromMapStore).not.toHaveBeenCalled();
    });

    it('delegates to the legacy map-store when the flag is disabled (default)', async () => {
      delete process.env.USE_PROMIDAS_REPOSITORY;
      mocks.maxFromMapStore.mockResolvedValue(7926);

      const result = await getMaxPrototypeId();

      expect(result).toBe(7926);
      expect(mocks.maxFromMapStore).toHaveBeenCalledWith();
      expect(mocks.maxFromRepo).not.toHaveBeenCalled();
    });
  });
});
