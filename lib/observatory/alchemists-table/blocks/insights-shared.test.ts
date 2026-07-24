import { describe, expect, it } from 'vitest';

import { jstYear, jstYearMonth } from './insights-shared';

describe('jstYearMonth', () => {
  it('returns the JST month for a UTC timestamp', () => {
    expect(jstYearMonth('2026-07-24T06:01:07.000Z')).toBe('2026-07');
  });

  it('shifts month and year across the JST midnight boundary', () => {
    // 2026-06-30 23:30 UTC = 2026-07-01 08:30 JST
    expect(jstYearMonth('2026-06-30T23:30:00.000Z')).toBe('2026-07');
    // 2021-12-31 20:00 UTC = 2022-01-01 05:00 JST
    expect(jstYearMonth('2021-12-31T20:00:00.000Z')).toBe('2022-01');
    expect(jstYear('2021-12-31T20:00:00.000Z')).toBe(2022);
  });

  it('returns null for empty or unparseable input', () => {
    expect(jstYearMonth('')).toBeNull();
    expect(jstYearMonth('not-a-date')).toBeNull();
  });
});
