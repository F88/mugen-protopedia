import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_REQUEST_TIMEOUT_MS,
  getRequestTimeoutMs,
} from './protopedia-request-timeout';

describe('getRequestTimeoutMs', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns the default when the variable is not set', () => {
    vi.stubEnv('PROTOPEDIA_API_V2_TIMEOUT_MS', undefined);

    expect(getRequestTimeoutMs()).toBe(DEFAULT_REQUEST_TIMEOUT_MS);
  });

  it('returns a positive integer from the variable', () => {
    vi.stubEnv('PROTOPEDIA_API_V2_TIMEOUT_MS', '120000');

    expect(getRequestTimeoutMs()).toBe(120_000);
  });

  it.each(['', '0', '-1', '1.5', '30s', 'abc'])(
    'falls back to the default for %j',
    (value) => {
      vi.stubEnv('PROTOPEDIA_API_V2_TIMEOUT_MS', value);

      expect(getRequestTimeoutMs()).toBe(DEFAULT_REQUEST_TIMEOUT_MS);
    },
  );
});
