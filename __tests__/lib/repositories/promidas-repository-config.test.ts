import { LIMIT_DATA_SIZE_BYTES } from 'promidas/store';
import { describe, expect, it } from 'vitest';

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
