import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  FetchPrototypeByIdResult,
  FetchPrototypesResult,
  FetchRandomPrototypeResult,
} from '@/types/prototype-api.types';
import {
  getAllPrototypesFromMapOrFetch,
  getPrototypeByIdFromMapOrFetch,
  getRandomPrototypeFromMapOrFetch,
} from '@/app/actions/prototypes';
import { prototypeMapStore } from '@/lib/stores/prototype-map-store';

vi.mock('@/lib/stores/prototype-map-store', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/stores/prototype-map-store')>();

  return {
    ...actual,
    prototypeMapStore: {
      getById: vi.fn(),
      getRandom: vi.fn(),
      getSnapshot: vi.fn(),
      isRefreshInFlight: vi.fn(),
      runExclusive: vi.fn(async (task: () => Promise<void>) => {
        await task();
      }),
    },
  };
});

const prototypeMapStoreMock = prototypeMapStore as unknown as {
  getById: ReturnType<typeof vi.fn>;
  getRandom: ReturnType<typeof vi.fn>;
  getSnapshot: ReturnType<typeof vi.fn>;
  isRefreshInFlight: ReturnType<typeof vi.fn>;
};

// Mock schedulePrototypeMapRefresh and runPrototypeMapRefresh via module factory.
const schedulePrototypeMapRefreshMock = vi.fn();
// use loose typing to avoid coupling tests to implementation details
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const runPrototypeMapRefreshMock: any = vi.fn();

vi.mock('@/app/actions/prototypes', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/app/actions/prototypes')>();

  return {
    ...actual,
    // Internal helpers we want to spy on in a white-box fashion.
    // They are not exported in the real module; for testing we
    // override the module scope references used by public functions.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schedulePrototypeMapRefresh: (...args: any[]) =>
      schedulePrototypeMapRefreshMock(...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    runPrototypeMapRefresh: (...args: any[]) =>
      runPrototypeMapRefreshMock(...args),
  };
});

describe('prototypes actions map-store integration', () => {
  beforeEach(() => {
    prototypeMapStoreMock.getById.mockReset();
    prototypeMapStoreMock.getRandom.mockReset();
    prototypeMapStoreMock.getSnapshot.mockReset();
    prototypeMapStoreMock.isRefreshInFlight.mockReset();
    schedulePrototypeMapRefreshMock.mockReset();
    runPrototypeMapRefreshMock.mockReset();
  });

  describe('getPrototypeByIdFromMapOrFetch', () => {
    it('returns 400-style error for invalid id', async () => {
      const result = (await getPrototypeByIdFromMapOrFetch(
        'invalid',
      )) as Extract<FetchPrototypeByIdResult, { ok: false }>;

      expect(result.ok).toBe(false);
      expect(result.status).toBe(400);
    });

    it('returns cached prototype and schedules refresh when snapshot expired', async () => {
      const prototype = {
        id: 1,
        prototypeNm: 'Test',
      } as unknown as { id: number; prototypeNm: string };

      prototypeMapStoreMock.getById.mockReturnValue(prototype);
      prototypeMapStoreMock.getSnapshot.mockReturnValue({
        data: [prototype],
        cachedAt: new Date(),
        isExpired: true,
      });

      const result = await getPrototypeByIdFromMapOrFetch('1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.id).toBe(1);
      }
      expect(schedulePrototypeMapRefreshMock).toHaveBeenCalledWith(
        expect.any(Object),
        'ttl-expired-on-id-hit',
      );
    });

    it('skips refresh and returns 404 when snapshot is non-empty and not expired', async () => {
      prototypeMapStoreMock.getById.mockReturnValue(undefined);
      prototypeMapStoreMock.getSnapshot.mockReturnValue({
        data: [{ id: 1 }],
        cachedAt: new Date(),
        isExpired: false,
      });

      const result = (await getPrototypeByIdFromMapOrFetch('9999')) as Extract<
        FetchPrototypeByIdResult,
        { ok: false }
      >;

      expect(result.ok).toBe(false);
      expect(result.status).toBe(404);
      expect(runPrototypeMapRefreshMock).not.toHaveBeenCalled();
    });

    it('attempts refresh and returns 404 when refreshed snapshot still missing id', async () => {
      prototypeMapStoreMock.getById.mockReturnValueOnce(undefined);
      prototypeMapStoreMock.getSnapshot.mockReturnValueOnce({
        data: [],
        cachedAt: null,
        isExpired: true,
      });

      runPrototypeMapRefreshMock.mockResolvedValue({ ok: true, data: [] });

      // After refresh, map-store is still empty
      prototypeMapStoreMock.getById.mockReturnValueOnce(undefined);
      prototypeMapStoreMock.getSnapshot.mockReturnValueOnce({
        data: [],
        cachedAt: new Date(),
        isExpired: false,
      });

      const result = (await getPrototypeByIdFromMapOrFetch('123')) as Extract<
        FetchPrototypeByIdResult,
        { ok: false }
      >;
      expect(result.ok).toBe(false);
    });

    it('returns 503 when map remains unavailable after refresh failure', async () => {
      prototypeMapStoreMock.getById.mockReturnValue(undefined);
      prototypeMapStoreMock.getSnapshot.mockReturnValue({
        data: [],
        cachedAt: null,
        isExpired: true,
      });

      runPrototypeMapRefreshMock.mockResolvedValue(null);
      prototypeMapStoreMock.getSnapshot.mockReturnValueOnce({
        data: [],
        cachedAt: null,
        isExpired: true,
      });

      const result = (await getPrototypeByIdFromMapOrFetch('456')) as Extract<
        FetchPrototypeByIdResult,
        { ok: false }
      >;

      expect(result.ok).toBe(false);
      expect(result.status).toBe(503);
    });
  });

  describe('getAllPrototypesFromMapOrFetch', () => {
    it('returns snapshot directly when non-empty and not expired', async () => {
      const snapshotData = [{ id: 1 }, { id: 2 }];

      prototypeMapStoreMock.getSnapshot.mockReturnValue({
        data: snapshotData,
        cachedAt: new Date(),
        isExpired: false,
      });

      const result = (await getAllPrototypesFromMapOrFetch()) as Extract<
        FetchPrototypesResult,
        { ok: true }
      >;

      expect(result.ok).toBe(true);
      expect(result.data).toEqual(snapshotData);
      expect(schedulePrototypeMapRefreshMock).not.toHaveBeenCalled();
    });

    it('returns snapshot and schedules refresh when expired', async () => {
      const snapshotData = [{ id: 1 }];

      prototypeMapStoreMock.getSnapshot.mockReturnValue({
        data: snapshotData,
        cachedAt: new Date(),
        isExpired: true,
      });

      const result = (await getAllPrototypesFromMapOrFetch()) as Extract<
        FetchPrototypesResult,
        { ok: true }
      >;

      expect(result.ok).toBe(true);
      expect(result.data).toEqual(snapshotData);
      expect(schedulePrototypeMapRefreshMock).toHaveBeenCalledWith(
        expect.any(Object),
        'ttl-expired',
      );
    });
  });

  describe('getRandomPrototypeFromMapOrFetch', () => {
    it('returns random prototype from snapshot and schedules refresh when expired', async () => {
      const randomPrototype = {
        id: 10,
        prototypeNm: 'Random',
      } as unknown as { id: number; prototypeNm: string };

      prototypeMapStoreMock.getSnapshot.mockReturnValue({
        data: [randomPrototype],
        cachedAt: new Date(),
        isExpired: true,
      });
      prototypeMapStoreMock.getRandom.mockReturnValue(randomPrototype);

      const result = (await getRandomPrototypeFromMapOrFetch()) as Extract<
        FetchRandomPrototypeResult,
        { ok: true }
      >;

      expect(result.ok).toBe(true);
      expect(result.data.id).toBe(10);
      expect(schedulePrototypeMapRefreshMock).toHaveBeenCalledWith(
        expect.any(Object),
        'ttl-expired-on-random-hit',
      );
    });

    it('attempts refresh and returns 404 when no prototypes remain', async () => {
      prototypeMapStoreMock.getSnapshot.mockReturnValueOnce({
        data: [],
        cachedAt: null,
        isExpired: true,
      });
      prototypeMapStoreMock.getRandom.mockReturnValueOnce(null);

      runPrototypeMapRefreshMock.mockResolvedValue({ ok: true, data: [] });

      prototypeMapStoreMock.getRandom.mockReturnValueOnce(null);
      prototypeMapStoreMock.getSnapshot.mockReturnValueOnce({
        data: [],
        cachedAt: new Date(),
        isExpired: false,
      });

      const result = (await getRandomPrototypeFromMapOrFetch()) as Extract<
        FetchRandomPrototypeResult,
        { ok: false }
      >;

      expect(result.ok).toBe(false);
    });
  });
});
