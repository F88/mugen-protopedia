import { http, HttpResponse } from 'msw';
import { describe, it, expect, vi } from 'vitest';

import {
  buildPromidasRepository,
  PromidasBackedRepository,
} from '@/lib/repositories/promidas-repository';
import { server } from '@/mocks/server';

/**
 * Integration tests (#181): exercise PromidasBackedRepository end-to-end via MSW
 * (the injected no-store fetch hits `globalThis.fetch`, intercepted by
 * `mocks/handlers.ts` serving `mocks/snapshots/test/prototypes.json`).
 *
 * Each test builds a fresh repo + reader so the in-memory snapshot does not
 * carry across tests. `progressLog: false` avoids promidas's progress tracking,
 * which reads `response.body.getReader()` (unimplemented by the jsdom/MSW test
 * responses).
 */
const newRepo = () => buildPromidasRepository({ progressLog: false });

describe('PromidasBackedRepository.getAllPrototypes (MSW)', () => {
  it('sets up the snapshot on cold start and returns normalized data', async () => {
    const reader = new PromidasBackedRepository(newRepo());

    const result = await reader.getAllPrototypes();

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
    const repo = newRepo();
    const reader = new PromidasBackedRepository(repo);

    await reader.getAllPrototypes();
    expect(repo.getStats().cachedAt).not.toBeNull();

    const second = await reader.getAllPrototypes();
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

    const reader = new PromidasBackedRepository(newRepo());
    const result = await reader.getAllPrototypes();

    expect(result.ok).toBe(false);
    if (result.ok) return; // Type guard
    expect(result.status).toBe(500);
    expect(typeof result.error).toBe('string');
    expect(result.error.length).toBeGreaterThan(0);
  });
});

describe('PromidasBackedRepository.getPrototypeNames (MSW)', () => {
  it('returns {} for empty ids without touching the snapshot', async () => {
    const reader = new PromidasBackedRepository(newRepo());
    expect(await reader.getPrototypeNames([])).toEqual({});
  });

  it('resolves names for known ids from a populated snapshot, omitting missing', async () => {
    const repo = newRepo();
    await repo.setupSnapshot({ limit: 10_000, offset: 0 });
    const reader = new PromidasBackedRepository(repo);

    const names = await reader.getPrototypeNames([1001, 9999]);

    expect(names[1001]).toBe('Test Prototype 1');
    expect(names[9999]).toBeUndefined(); // missing id omitted (sparse)
  });

  it('awaits setup on a cold snapshot and resolves names on the first call', async () => {
    // Fresh repo (cold): the first lookup blocks on setupSnapshot, then resolves.
    const reader = new PromidasBackedRepository(newRepo());
    const names = await reader.getPrototypeNames([1001]);
    expect(names[1001]).toBe('Test Prototype 1');
  });

  it('omits an out-of-range id the snapshot rejects, without failing the batch', async () => {
    const repo = newRepo();
    await repo.setupSnapshot({ limit: 10_000, offset: 0 });
    const reader = new PromidasBackedRepository(repo);

    // 11111111111111112 is beyond Number.MAX_SAFE_INTEGER; promidas throws on it.
    const outOfRange = 11_111_111_111_111_112;
    const names = await reader.getPrototypeNames([1001, outOfRange]);

    expect(names[1001]).toBe('Test Prototype 1'); // valid id still resolved
    expect(names[outOfRange]).toBeUndefined(); // rejected id omitted, no throw
  });

  it('dedupes repeated ids', async () => {
    const repo = newRepo();
    await repo.setupSnapshot({ limit: 10_000, offset: 0 });
    const reader = new PromidasBackedRepository(repo);

    const names = await reader.getPrototypeNames([1001, 1001, 1001]);

    expect(names).toEqual({ 1001: 'Test Prototype 1' });
  });

  it('omits invalid ids (non-integer, negative, zero, NaN) without throwing', async () => {
    const repo = newRepo();
    await repo.setupSnapshot({ limit: 10_000, offset: 0 });
    const reader = new PromidasBackedRepository(repo);

    const names = await reader.getPrototypeNames([
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
    const repo = newRepo();
    await repo.setupSnapshot({ limit: 10_000, offset: 0 });
    const reader = new PromidasBackedRepository(repo);

    const names = await reader.getPrototypeNames([-1, 0, 1.5, Number.NaN]);

    expect(names).toEqual({});
  });
});

describe('PromidasBackedRepository.getMaxPrototypeId (MSW)', () => {
  it('returns the max id from a populated snapshot', async () => {
    const repo = newRepo();
    await repo.setupSnapshot({ limit: 10_000, offset: 0 });
    const reader = new PromidasBackedRepository(repo);

    // Test snapshot holds ids 1001 and 1002.
    expect(await reader.getMaxPrototypeId()).toBe(1002);
  });

  it('blocks on cold start and returns the real max on the first call', async () => {
    // Fresh repo (cold): block-on-cold setup runs, then analyzePrototypes
    // returns the real max (test snapshot holds 1001 and 1002) — NOT null.
    const reader = new PromidasBackedRepository(newRepo());
    expect(await reader.getMaxPrototypeId()).toBe(1002);
  });

  it('returns null when the cold-start setup fails (5xx)', async () => {
    server.use(
      http.get('*/v2/api/prototype/list', () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    );

    const reader = new PromidasBackedRepository(newRepo());
    expect(await reader.getMaxPrototypeId()).toBeNull();
  });
});

describe('PromidasBackedRepository snapshot lifecycle (MSW)', () => {
  it('coalesces concurrent cold reads onto a single setupSnapshot', async () => {
    const repo = newRepo();
    const setupSpy = vi.spyOn(repo, 'setupSnapshot');
    const reader = new PromidasBackedRepository(repo);

    // Three different reads fire concurrently against a cold snapshot.
    await Promise.all([
      reader.getAllPrototypes(),
      reader.getMaxPrototypeId(),
      reader.getPrototypeNames([1001]),
    ]);

    // Single-flight: they share one setup instead of each calling setupSnapshot.
    expect(setupSpy).toHaveBeenCalledTimes(1);
  });
});
