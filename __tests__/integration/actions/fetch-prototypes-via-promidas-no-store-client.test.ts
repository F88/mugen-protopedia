import { http, HttpResponse } from 'msw';
import { describe, it, expect } from 'vitest';

import { fetchPrototypesViaPromidasNoStoreClient } from '@/app/actions/prototypes-direct';
import { server } from '@/mocks/server';

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

  it('returns an empty data array for an unknown prototypeId (not found)', async () => {
    // The MSW handler filters by prototypeId, so an unknown id yields no
    // results. getLatestPrototypeById turns this empty array into `null`.
    const result = await fetchPrototypesViaPromidasNoStoreClient({
      prototypeId: 999_999,
      limit: 1,
      offset: 0,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return; // Type guard
    expect(result.data).toHaveLength(0);
  });

  it('maps an upstream 5xx error to a failure Result with the HTTP status', async () => {
    // Override the handler for this test; vitest.setup resets handlers afterEach.
    server.use(
      http.get('*/v2/api/prototype/list', () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    );

    const result = await fetchPrototypesViaPromidasNoStoreClient({
      prototypeId: 6563,
      limit: 1,
      offset: 0,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return; // Type guard
    expect(result.status).toBe(500);
    expect(typeof result.error).toBe('string');
  });

  it('caps limit at the safe maximum on the upstream request', async () => {
    let requestedLimit: string | null = null;
    server.use(
      http.get('*/v2/api/prototype/list', ({ request }) => {
        requestedLimit = new URL(request.url).searchParams.get('limit');
        return HttpResponse.json({ results: [] });
      }),
    );

    await fetchPrototypesViaPromidasNoStoreClient({ limit: 999_999 });

    expect(requestedLimit).toBe('10000');
  });
});
