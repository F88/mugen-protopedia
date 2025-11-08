import { describe, it, expect } from 'vitest';
import { createProtoPediaClient } from 'protopedia-api-v2-client';

// Run this live test only when explicitly enabled and with a real token set.
const hasRealToken =
  !!process.env.PROTOPEDIA_API_V2_TOKEN &&
  process.env.PROTOPEDIA_API_V2_TOKEN !== 'test' &&
  process.env.PROTOPEDIA_API_V2_TOKEN !== 'your_token_here';
const liveEnabled = process.env.RUN_LIVE_API_TESTS === '1' && hasRealToken;

const describeIf = liveEnabled ? describe : describe.skip;

describeIf('ProtoPedia live API', () => {
  it('listPrototypes returns an array and prints a sample', async () => {
    const client = createProtoPediaClient({
      token: process.env.PROTOPEDIA_API_V2_TOKEN!,
      // baseUrl: 'https://protopedia.net/v2/api',
      // fetch: globalThis.fetch,
      // logLevel: 'error',
      logLevel: 'debug',
    });

    try {
      // Fetch a tiny page to keep it fast and deterministic
      const data = await client.listPrototypes({ limit: 1, offset: 0 });
      // Output the raw payload for manual inspection (kept small)
      console.log('Live listPrototypes payload:', JSON.stringify(data, null, 2));

      expect(Array.isArray(data?.results)).toBe(true);
    } catch (error) {
      console.error('Error during live API test:', error);
      console.error('-'.repeat(60));
      console.dir(error, { depth: null });
      console.error('-'.repeat(60));
      throw error;
    }
  }, 30_000);
});

// If not enabled, provide a helpful hint in CI logs.
if (!liveEnabled) {
  console.info(
    '[live-test skipped] Set RUN_LIVE_API_TESTS=1 and PROTOPEDIA_API_V2_TOKEN to run live API test.',
  );
}
