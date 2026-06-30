import { http, HttpResponse } from 'msw';
import { describe, it, expect } from 'vitest';

import {
  buildPromidasRepository,
  getAllPrototypesFromRepo,
  getPrototypeNamesFromRepo,
} from '@/lib/repositories/promidas-repository';
import { server } from '@/mocks/server';

/**
 * SPIKE integration tests (#181): exercise the promidas Repository end-to-end
 * via MSW (the injected no-store fetch hits `globalThis.fetch`, intercepted
 * by `mocks/handlers.ts` serving `mocks/snapshots/test/prototypes.json`).
 *
 * Each test builds a fresh repository so the in-memory snapshot does not carry
 * across tests.
 */
describe('promidas Repository spike (MSW)', () => {
  it('sets up the snapshot on cold start and returns normalized data', async () => {
    const repo = buildPromidasRepository({ progressLog: false });

    const result = await getAllPrototypesFromRepo(repo);

    expect(result.ok).toBe(true);
    if (!result.ok) return; // Type guard

    expect(result.data.length).toBe(2);
    const first = result.data.find((p) => p.id === 1001);
    expect(first).toBeDefined();
    expect(first?.prototypeNm).toBe('Test Prototype 1');
    // promidas normalization: pipe-separated -> arrays
    expect(first?.users).toEqual(['user1', 'user2']);
    expect(first?.tags).toEqual(['tag1', 'tag2']);
  });

  it('serves the cached snapshot on a second read (no re-setup needed)', async () => {
    const repo = buildPromidasRepository({ progressLog: false });

    await getAllPrototypesFromRepo(repo);
    const stats = repo.getStats();
    expect(stats.cachedAt).not.toBeNull();

    const second = await getAllPrototypesFromRepo(repo);
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.data.length).toBe(2);
  });

  it('maps a cold-start setup failure (5xx) to a failure Result', async () => {
    server.use(
      http.get('*/v2/api/prototype/list', () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    );

    const repo = buildPromidasRepository({ progressLog: false });
    const result = await getAllPrototypesFromRepo(repo);

    expect(result.ok).toBe(false);
    if (result.ok) return; // Type guard
    expect(result.status).toBe(500);
    expect(typeof result.error).toBe('string');
    expect(result.error.length).toBeGreaterThan(0);
  });
});

describe('getPrototypeNamesFromRepo (MSW)', () => {
  it('returns {} for empty ids without touching the snapshot', async () => {
    const repo = buildPromidasRepository({ progressLog: false });
    expect(await getPrototypeNamesFromRepo(repo, [])).toEqual({});
  });

  it('resolves names for known ids from a populated snapshot, omitting missing', async () => {
    const repo = buildPromidasRepository({ progressLog: false });
    await repo.setupSnapshot({ limit: 10_000, offset: 0 });

    const names = await getPrototypeNamesFromRepo(repo, [1001, 9999]);

    expect(names[1001]).toBe('Test Prototype 1');
    expect(names[9999]).toBeUndefined(); // missing id omitted (sparse)
  });

  it('awaits setup on a cold snapshot and resolves names on the first call', async () => {
    const repo = buildPromidasRepository({ progressLog: false });
    // Fresh repo (cold): the first lookup blocks on setupSnapshot, then resolves.
    const names = await getPrototypeNamesFromRepo(repo, [1001]);
    expect(names[1001]).toBe('Test Prototype 1');
  });

  it('omits an out-of-range id the snapshot rejects, without failing the batch', async () => {
    const repo = buildPromidasRepository({ progressLog: false });
    await repo.setupSnapshot({ limit: 10_000, offset: 0 });

    // 11111111111111112 is beyond Number.MAX_SAFE_INTEGER; promidas throws on it.
    const outOfRange = 11_111_111_111_111_112;
    const names = await getPrototypeNamesFromRepo(repo, [1001, outOfRange]);

    expect(names[1001]).toBe('Test Prototype 1'); // valid id still resolved
    expect(names[outOfRange]).toBeUndefined(); // rejected id omitted, no throw
  });

  it('dedupes repeated ids', async () => {
    const repo = buildPromidasRepository({ progressLog: false });
    await repo.setupSnapshot({ limit: 10_000, offset: 0 });

    const names = await getPrototypeNamesFromRepo(repo, [1001, 1001, 1001]);

    expect(names).toEqual({ 1001: 'Test Prototype 1' });
  });

  it('omits invalid ids (non-integer, negative, zero, NaN) without throwing', async () => {
    const repo = buildPromidasRepository({ progressLog: false });
    await repo.setupSnapshot({ limit: 10_000, offset: 0 });

    const names = await getPrototypeNamesFromRepo(repo, [
      1001,
      1.5,
      -5,
      0,
      Number.NaN,
    ]);

    // Only the valid, present id resolves; every invalid id is omitted and the
    // batch never rejects.
    expect(names).toEqual({ 1001: 'Test Prototype 1' });
  });

  it('returns {} when every id is invalid (no throw)', async () => {
    const repo = buildPromidasRepository({ progressLog: false });
    await repo.setupSnapshot({ limit: 10_000, offset: 0 });

    const names = await getPrototypeNamesFromRepo(
      repo,
      [-1, 0, 1.5, Number.NaN],
    );

    expect(names).toEqual({});
  });
});
