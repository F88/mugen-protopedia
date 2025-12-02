import { describe, it, expect } from 'vitest';
import { protopediaForceCacheClient } from '@/lib/protopedia-client';
import { logger } from '@/lib/logger.server';

describe('Snapshot Integration Test', () => {
  it('should load prototypes from the snapshot via MSW', async () => {
    // Fetch prototypes using the client
    // This request should be intercepted by MSW and return data from mocks/snapshots/prototypes.json
    const response = await protopediaForceCacheClient.listPrototypes({
      limit: 10,
    });

    // Verify that we got results
    expect(response.results).toBeDefined();
    expect(response.results?.length).toBe(2);

    // Verify the content matches the snapshot (mocks/snapshots/test/prototypes.json)
    const firstPrototype = response.results![0];
    logger.debug({ firstPrototype }, 'First prototype from snapshot:');
    expect(firstPrototype.id).toBe(1001);
    expect(firstPrototype.prototypeNm).toBe('Test Prototype 1');
    expect(firstPrototype.teamNm).toBe('Test Team');
    expect(firstPrototype.users).toEqual('user1|user2');
  });
});
