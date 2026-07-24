import { describe, expect, it } from 'vitest';

import { formatInJst } from './format-jst';

describe('formatInJst', () => {
  it('formats a UTC ISO timestamp as a JST time', () => {
    // 2026-07-24T06:01:07Z = 2026-07-24 15:01:07 JST
    expect(
      formatInJst('2026-07-24T06:01:07.000Z', 'ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    ).toBe('15:01');
  });

  it('formats a UTC ISO timestamp as a JST date', () => {
    expect(
      formatInJst('2017-10-08T01:14:21.000Z', 'en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
    ).toBe('2017-10-08');
  });

  it('shifts the calendar day when JST crosses midnight', () => {
    // 2023-11-06T16:30:00Z = 2023-11-07 01:30 JST
    expect(
      formatInJst('2023-11-06T16:30:00.000Z', 'en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
    ).toBe('2023-11-07');
  });

  it('renders full date+time when no options are given', () => {
    // Assert stable substrings, not the exact string: the locale's default
    // date+time layout (separators, spacing) can drift across Node/ICU
    // versions, but the JST-converted parts themselves must be present.
    const result = formatInJst('2017-10-08T01:14:21.000Z', 'ja-JP');
    expect(result).toContain('10:14:21'); // 01:14:21 UTC + 9 h
    expect(result).toContain('2017');
  });

  it('accepts Date instances and epoch millis', () => {
    const iso = '2017-11-13T14:55:42.000Z';
    const expected = '23:55:42';
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    } as const;
    expect(formatInJst(new Date(iso), 'en-GB', options)).toBe(expected);
    expect(formatInJst(Date.parse(iso), 'en-GB', options)).toBe(expected);
  });

  it('returns null for null, undefined, and unparseable input', () => {
    expect(formatInJst(null, 'ja-JP')).toBeNull();
    expect(formatInJst(undefined, 'ja-JP')).toBeNull();
    expect(formatInJst('not-a-date', 'ja-JP')).toBeNull();
  });
});
