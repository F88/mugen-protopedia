import { describe, it, expect } from 'vitest';

describe('Environment Variables', () => {
  it('should load variables from .env.test', () => {
    expect(process.env.PROTOPEDIA_API_V2_TOKEN).toBe(
      'test-token-from-env-file',
    );
    expect(process.env.PROTOPEDIA_API_V2_BASE_URL).toBe(
      'https://api.local.test/v2/api',
    );
    expect(process.env.PROTOPEDIA_API_V2_LOG_LEVEL).toBe('debug');
  });
});
