import { describe, it, expect } from 'vitest';
import { protopediaNoStoreClient } from '@/lib/protopedia-client';
import { logger } from '@/lib/logger.server';

describe('Snapshot Integration Test (NoStore)', () => {
  it('should load prototypes from the snapshot via MSW using no-store client', async () => {
    // Fetch prototypes using the no-store client
    // This request should also be intercepted by MSW and return data from mocks/snapshots/test/prototypes.json
    const response = await protopediaNoStoreClient.listPrototypes({
      limit: 10,
    });

    // Verify that we got results
    expect(response.results).toBeDefined();
    expect(response.results?.length).toBeGreaterThan(0);

    // Verify the content matches the snapshot (mocks/snapshots/test/prototypes.json)
    const firstPrototype = response.results![0];
    logger.debug(
      { firstPrototype },
      'First prototype from snapshot (no-store):',
    );
    expect(firstPrototype.id).toBe(1001);
    expect(firstPrototype.prototypeNm).toBe('Test Prototype 1');
    expect(firstPrototype.teamNm).toBe('Test Team');
  });
});
