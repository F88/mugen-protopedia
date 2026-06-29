import { describe, it, expect } from 'vitest';

import { fetchPrototypesViaPromidasNoStoreClient } from '@/app/actions/prototypes-direct';

/**
 * Integration test for the promidas-backed no-store path (#138).
 *
 * Exercises the real client: the server action delegates to the promidas
 * `ProtopediaApiCustomClient`, whose injected no-store `fetch` hits
 * `globalThis.fetch`, which MSW intercepts (see `mocks/handlers.ts` +
 * `vitest.setup.mjs`) and serves from `mocks/snapshots/test/prototypes.json`.
 * This verifies that the switch actually fetches and normalizes via promidas,
 * not just that it type-checks.
 */
describe('fetchPrototypesViaPromidasNoStoreClient Integration Test (MSW)', () => {
  it('fetches and normalizes prototypes from the snapshot via promidas', async () => {
    const result = await fetchPrototypesViaPromidasNoStoreClient({ limit: 10 });

    expect(result.ok).toBe(true);
    if (!result.ok) return; // Type guard

    expect(result.data.length).toBeGreaterThan(0);

    const first = result.data[0];
    expect(first.id).toBe(1001);
    expect(first.prototypeNm).toBe('Test Prototype 1');
    expect(first.teamNm).toBe('Test Team');

    // promidas normalization: pipe-separated strings -> trimmed arrays
    expect(first.users).toEqual(['user1', 'user2']);
    expect(first.tags).toEqual(['tag1', 'tag2']);
  });

  it('filters by prototypeId for the SHOW / by-id path', async () => {
    const result = await fetchPrototypesViaPromidasNoStoreClient({
      prototypeId: 1001,
      limit: 1,
      offset: 0,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return; // Type guard

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.id).toBe(1001);
  });
});
