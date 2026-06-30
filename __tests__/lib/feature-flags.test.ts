import { afterEach, describe, expect, it } from 'vitest';

import { isPromidasRepositoryEnabled } from '@/lib/feature-flags';

describe('isPromidasRepositoryEnabled', () => {
  const original = process.env.USE_PROMIDAS_REPOSITORY;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.USE_PROMIDAS_REPOSITORY;
    } else {
      process.env.USE_PROMIDAS_REPOSITORY = original;
    }
  });

  it('returns false when unset', () => {
    delete process.env.USE_PROMIDAS_REPOSITORY;
    expect(isPromidasRepositoryEnabled()).toBe(false);
  });

  it('returns true only for the exact string "true"', () => {
    process.env.USE_PROMIDAS_REPOSITORY = 'true';
    expect(isPromidasRepositoryEnabled()).toBe(true);
  });

  it('returns false for any other value (strict: not "1", "TRUE", etc.)', () => {
    for (const value of ['1', '0', 'false', 'TRUE', 'True', 'yes', '']) {
      process.env.USE_PROMIDAS_REPOSITORY = value;
      expect(
        isPromidasRepositoryEnabled(),
        `value=${JSON.stringify(value)}`,
      ).toBe(false);
    }
  });
});
