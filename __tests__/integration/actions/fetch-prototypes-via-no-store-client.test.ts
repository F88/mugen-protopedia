import { describe, it, expect } from 'vitest';
import { fetchPrototypesViaNoStoreClient } from '@/app/actions/prototypes';
import { logger } from '@/lib/logger.server';

describe('fetchPrototypesViaNoStoreClient Integration Test', () => {
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
    expect(firstPrototype.users).toEqual(['user1', 'user2']); // "user1|user2" -> ['user1', 'user2']
    expect(firstPrototype.tags).toEqual(['tag1', 'tag2']); // "user1|user2" -> ['user1', 'user2']
  });
});
