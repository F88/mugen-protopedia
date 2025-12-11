import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { PrototypeMapStore } from '@/lib/stores/prototype-map-store';

const { stubLogger } = vi.hoisted(() => ({
  stubLogger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const { childMock } = vi.hoisted(() => ({
  childMock: vi.fn(() => stubLogger),
}));

vi.mock('@/lib/logger.server', () => ({
  logger: {
    child: childMock,
  },
}));

const createPrototype = (
  overrides: Partial<NormalizedPrototype> = {},
): NormalizedPrototype => ({
  id: overrides.id ?? 1,
  prototypeNm: 'Prototype 1',
  teamNm: 'Team A',
  users: ['User A'],
  summary: 'summary',
  systemDescription: 'system description',
  tags: [],
  materials: [],
  events: [],
  awards: [],
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

describe('PrototypeMapStore', () => {
  beforeEach(() => {
    Object.values(stubLogger).forEach((fn) => fn.mockReset());
    childMock.mockReset();
    childMock.mockImplementation(() => stubLogger);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses 30 minutes TTL by default', () => {
    const store = new PrototypeMapStore();
    const stats = store.getStats();

    expect(stats.ttlMs).toBe(30 * 60 * 1_000);
  });

  it('throws when configuring payloads larger than 30 MiB', () => {
    expect(
      () => new PrototypeMapStore({ maxPayloadSizeBytes: 31 * 1024 * 1024 }),
    ).toThrow(
      'PrototypeMapStore maxPayloadSizeBytes must be <= 30 MiB to prevent oversized payloads',
    );
  });

  it('stores prototypes when payload fits within limits', () => {
    const store = new PrototypeMapStore({ maxPayloadSizeBytes: 1024 * 1024 });
    const result = store.setAll([
      createPrototype({ id: 1 }),
      createPrototype({ id: 2 }),
    ]);

    expect(result).not.toBeNull();
    expect(store.size).toBe(2);
    expect(store.getById(1)?.id).toBe(1);
  });

  it('returns the highest prototype id when available', () => {
    const store = new PrototypeMapStore({ maxPayloadSizeBytes: 1024 * 1024 });

    expect(store.getMaxId()).toBeNull();

    store.setAll([
      createPrototype({ id: 3 }),
      createPrototype({ id: 7 }),
      createPrototype({ id: 5 }),
    ]);

    expect(store.getMaxId()).toBe(7);

    store.clear();
    expect(store.getMaxId()).toBeNull();
  });

  it('skips storing when payload exceeds limit', () => {
    const store = new PrototypeMapStore({ maxPayloadSizeBytes: 50 });
    const prototypes = [
      createPrototype({ id: 7, freeComment: 'x'.repeat(200) }),
    ];

    const result = store.setAll(prototypes);
    expect(result).toBeNull();
    expect(store.size).toBe(0);
  });

  it('reports expiration based on TTL', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
    const store = new PrototypeMapStore({
      ttlMs: 1_000,
      maxPayloadSizeBytes: 1024 * 1024,
    });
    store.setAll([createPrototype({ id: 5 })]);

    expect(store.isExpired()).toBe(false);

    vi.setSystemTime(new Date('2025-01-01T00:00:01.100Z'));
    expect(store.isExpired()).toBe(true);
  });

  it('returns random prototypes from the stored snapshot', () => {
    const store = new PrototypeMapStore({ maxPayloadSizeBytes: 1024 * 1024 });
    store.setAll([
      createPrototype({ id: 11 }),
      createPrototype({ id: 12 }),
      createPrototype({ id: 13 }),
    ]);

    const seen = new Set<number>();
    for (let index = 0; index < 10; index += 1) {
      const prototype = store.getRandom();
      expect(prototype).not.toBeNull();
      if (prototype) {
        seen.add(prototype.id);
      }
    }

    expect(seen.size).toBeGreaterThan(0);
  });

  it('prevents concurrent refresh tasks', async () => {
    const store = new PrototypeMapStore({ maxPayloadSizeBytes: 1024 * 1024 });
    const firstTask = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      store.setAll([createPrototype({ id: 90 })]);
    });
    const secondTask = vi.fn(async () => {
      store.setAll([createPrototype({ id: 91 })]);
    });

    const promise = store.runExclusive(firstTask);
    const concurrent = store.runExclusive(secondTask);

    await Promise.allSettled([promise, concurrent]);

    expect(firstTask).toHaveBeenCalledTimes(1);
    expect(secondTask).toHaveBeenCalledTimes(0);
    expect(store.getById(90)?.id).toBe(90);
  });
});
