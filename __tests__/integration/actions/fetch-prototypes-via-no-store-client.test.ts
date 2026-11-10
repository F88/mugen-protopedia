import { afterEach, describe, it, expect, vi } from 'vitest';
import { fetchPrototypesViaNoStoreClient } from '@/app/actions/prototypes';
import { logger } from '@/lib/logger.server';

describe('fetchPrototypesViaNoStoreClient Integration Test', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(['TimeoutError', 'AbortError'])(
    'should map %s to a 504 response',
    async (name) => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(
        new DOMException('Request failed', name),
      );

      const result = await fetchPrototypesViaNoStoreClient({ limit: 10 });

      expect(result).toEqual({
        ok: false,
        status: 504,
        error: 'Upstream request timed out',
      });
    },
  );

  it('should return 500 when a successful response is not valid JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<html>maintenance</html>', { status: 200 }),
    );

    const result = await fetchPrototypesViaNoStoreClient({ limit: 10 });

    expect(result).toMatchObject({ ok: false, status: 500 });
  });

  it('should keep the HTTP status of an error response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 404 }),
    );

    const result = await fetchPrototypesViaNoStoreClient({ limit: 10 });

    expect(result).toMatchObject({ ok: false, status: 404 });
  });

  it('should fetch and normalize prototypes from snapshot via MSW', async () => {
    // Call the server action
    const result = await fetchPrototypesViaNoStoreClient({
      limit: 10,
    });

    // Verify success
    expect(result.ok).toBe(true);
    if (!result.ok) return; // Type guard

    // Verify data structure
    expect(result.data).toBeDefined();
    expect(result.data.length).toBeGreaterThan(0);

    // Verify content matches snapshot (mocks/snapshots/test/prototypes.json)
    const firstPrototype = result.data[0];
    logger.debug({ firstPrototype }, 'First prototype from action (no-store):');

    expect(firstPrototype.id).toBe(1001);
    expect(firstPrototype.prototypeNm).toBe('Test Prototype 1');
    expect(firstPrototype.teamNm).toBe('Test Team');

    // Verify normalization (e.g. camelCase keys, parsed dates if applicable)
    // The snapshot has "prototypeNm", "teamNm" which match the normalized type
    // Check a field that might be transformed or just passed through
    expect(firstPrototype.users).toEqual(['user1@id1', 'user2@id2']); // "user1@id1|user2@id2" -> ['user1@id1', 'user2@id2']
    expect(firstPrototype.tags).toEqual(['tag1', 'tag2']); // "tag1|tag2" -> ['tag1', 'tag2']
  });
});
