import { LIMIT_DATA_SIZE_BYTES } from 'promidas/store';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_REQUEST_TIMEOUT_MS } from '@/lib/protopedia-request-timeout';
import { createPromidasRepositoryConfigs } from '@/lib/repositories/promidas-repository';

/**
 * Unit tests for the synchronous config builder. Verifies the store / API
 * client / repository options the promidas Repository is built from, without
 * touching the network (no MSW needed).
 */
describe('createPromidasRepositoryConfigs', () => {
  it('caps the store size and sets a positive TTL and a logger', () => {
    const { storeConfig } = createPromidasRepositoryConfigs();

    expect(storeConfig.maxDataSizeBytes).toBe(LIMIT_DATA_SIZE_BYTES);
    expect(typeof storeConfig.ttlMs).toBe('number');
    expect(storeConfig.ttlMs).toBeGreaterThan(0);
    expect(storeConfig.logger).toBeDefined();
  });

  it.each([undefined, 'abc', '0', '30s', '1.5'])(
    'uses the default TTL when the variable is %j',
    async (value) => {
      vi.resetModules();
      vi.stubEnv('PROMIDAS_STORE_TTL_SECONDS', value);
      const { createPromidasRepositoryConfigs: createConfigs } =
        await import('@/lib/repositories/promidas-repository');

      expect(createConfigs().storeConfig.ttlMs).toBe(600_000);
      vi.unstubAllEnvs();
    },
  );

  it('uses a positive integer TTL from the variable', async () => {
    vi.resetModules();
    vi.stubEnv('PROMIDAS_STORE_TTL_SECONDS', '60');
    const { createPromidasRepositoryConfigs: createConfigs } =
      await import('@/lib/repositories/promidas-repository');

    expect(createConfigs().storeConfig.ttlMs).toBe(60_000);
    vi.unstubAllEnvs();
  });

  it('disables repository events and sets a logger', () => {
    const { repositoryConfig } = createPromidasRepositoryConfigs();

    expect(repositoryConfig.enableEvents).toBe(false);
    expect(repositoryConfig.logger).toBeDefined();
  });

  it('injects a fetch + logger into the API client and enables progress logging by default', () => {
    const { apiClientConfig } = createPromidasRepositoryConfigs();
    const clientOptions = apiClientConfig.protoPediaApiClientOptions;

    expect(clientOptions).toBeDefined();
    expect(apiClientConfig.progressLog).toBe(true);
    expect(typeof clientOptions?.fetch).toBe('function');
    expect(clientOptions?.logger).toBeDefined();
    expect(apiClientConfig.logger).toBeDefined();
  });

  it('passes the request timeout and forwards the signal unchanged', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}'));
    const clientOptions =
      createPromidasRepositoryConfigs().apiClientConfig
        .protoPediaApiClientOptions;
    const { signal } = new AbortController();

    await clientOptions?.fetch?.('https://example.com', { signal });

    expect(clientOptions?.timeoutMs).toBe(DEFAULT_REQUEST_TIMEOUT_MS);
    expect(fetchSpy.mock.calls[0][1]?.signal).toBe(signal);
    expect(fetchSpy.mock.calls[0][1]?.cache).toBe('no-store');
    fetchSpy.mockRestore();
  });

  it('honours the progressLog override', () => {
    expect(
      createPromidasRepositoryConfigs({ progressLog: false }).apiClientConfig
        .progressLog,
    ).toBe(false);
    expect(
      createPromidasRepositoryConfigs({ progressLog: true }).apiClientConfig
        .progressLog,
    ).toBe(true);
  });
});
