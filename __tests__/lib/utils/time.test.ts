import { describe, expect, it } from 'vitest';
import { JST_OFFSET_MS, normalizeProtoPediaTimestamp } from '@/lib/utils/time';

const HOURS_9_IN_MS = 9 * 60 * 60 * 1000;

describe('normalizeProtoPediaTimestamp', () => {
  describe('JST_OFFSET_MS', () => {
    it('matches a nine-hour offset in milliseconds', () => {
      expect(JST_OFFSET_MS).toBe(HOURS_9_IN_MS);
    });

    it('equals 32400000 milliseconds', () => {
      expect(JST_OFFSET_MS).toBe(32400000);
    });
  });

  describe('Null', () => {
    it('returns null for null input', () => {
      expect(normalizeProtoPediaTimestamp(null)).toBeNull();
    });

    it('never returns undefined for null input', () => {
      const result = normalizeProtoPediaTimestamp(null);
      expect(result).not.toBeUndefined();
    });
  });

  describe('Undefined', () => {
    it('returns null for undefined input', () => {
      expect(normalizeProtoPediaTimestamp(undefined)).toBeNull();
    });

    it('never returns undefined for undefined input', () => {
      const result = normalizeProtoPediaTimestamp(undefined);
      expect(result).not.toBeUndefined();
    });
  });

  describe('Empty string', () => {
    it('returns null for empty string', () => {
      expect(normalizeProtoPediaTimestamp('')).toBeNull();
    });

    it('returns null for whitespace-only strings', () => {
      expect(normalizeProtoPediaTimestamp('   ')).toBeNull();
      expect(normalizeProtoPediaTimestamp('\t')).toBeNull();
      expect(normalizeProtoPediaTimestamp('\n')).toBeNull();
      expect(normalizeProtoPediaTimestamp('\n\t  ')).toBeNull();
      expect(normalizeProtoPediaTimestamp('  \r\n  ')).toBeNull();
    });

    it('trims leading and trailing whitespace before validation', () => {
      // Valid after trimming
      expect(normalizeProtoPediaTimestamp('  2025-11-14 12:03:07.0  ')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
      expect(normalizeProtoPediaTimestamp('\t2025-11-14 12:03:07.0\n')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
    });
  });

  describe('Never in Type (number, boolean, ...)', () => {
    it('rejects completely invalid formats', () => {
      expect(normalizeProtoPediaTimestamp('nonsense')).toBeNull();
      expect(normalizeProtoPediaTimestamp('hello world')).toBeNull();
      expect(normalizeProtoPediaTimestamp('123456')).toBeNull();
      expect(normalizeProtoPediaTimestamp('true')).toBeNull();
      expect(normalizeProtoPediaTimestamp('false')).toBeNull();
    });

    it('rejects date-only formats', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14')).toBeNull();
      expect(normalizeProtoPediaTimestamp('2025/11/14')).toBeNull();
    });

    it('rejects time-only formats', () => {
      expect(normalizeProtoPediaTimestamp('12:03:07')).toBeNull();
      expect(normalizeProtoPediaTimestamp('12:03:07.0')).toBeNull();
    });

    it('rejects wrong date separators', () => {
      expect(normalizeProtoPediaTimestamp('2025/11/14 12:03:07')).toBeNull();
      expect(normalizeProtoPediaTimestamp('2025.11.14 12:03:07')).toBeNull();
      expect(normalizeProtoPediaTimestamp('20251114 12:03:07')).toBeNull();
    });

    it('rejects wrong time separators', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14 12.03.07')).toBeNull();
      expect(normalizeProtoPediaTimestamp('2025-11-14 120307')).toBeNull();
    });

    it('rejects missing padding in date', () => {
      expect(normalizeProtoPediaTimestamp('2025-1-5 12:03:07')).toBeNull();
      expect(normalizeProtoPediaTimestamp('2025-11-4 12:03:07')).toBeNull();
      expect(normalizeProtoPediaTimestamp('25-11-14 12:03:07')).toBeNull();
    });

    it('rejects missing padding in time', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14 1:2:3')).toBeNull();
      expect(normalizeProtoPediaTimestamp('2025-11-14 12:3:7')).toBeNull();
      expect(normalizeProtoPediaTimestamp('2025-11-14 12:03:7')).toBeNull();
    });

    it('rejects malformed fractional seconds', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14 12:03:07.')).toBeNull();
      expect(
        normalizeProtoPediaTimestamp('2025-11-14 12:03:07.abc'),
      ).toBeNull();
      expect(
        normalizeProtoPediaTimestamp('2025-11-14 12:03:07.xyz'),
      ).toBeNull();
    });

    it('rejects malformed offset annotations', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07+9')).toBeNull();
      expect(
        normalizeProtoPediaTimestamp('2025-11-14T12:03:07+09:'),
      ).toBeNull();
      expect(
        normalizeProtoPediaTimestamp('2025-11-14T12:03:07+--9'),
      ).toBeNull();
      expect(
        normalizeProtoPediaTimestamp('2025-11-14T12:03:07+AB:CD'),
      ).toBeNull();
    });
  });

  describe('ProtoPedia timestamps (JST timestamps without offsets)', () => {
    it('converts standard ProtoPedia format to UTC', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14 12:03:07.0')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2017-11-13 20:23:16.0')).toBe(
        '2017-11-13T11:23:16.000Z',
      );
    });

    it('accepts ISO T separator instead of space', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07.0')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
    });

    it('subtracts 9 hours for JST to UTC conversion', () => {
      // 12:00 JST → 03:00 UTC (same day)
      expect(normalizeProtoPediaTimestamp('2025-11-14 12:00:00')).toBe(
        '2025-11-14T03:00:00.000Z',
      );
      // 09:00 JST → 00:00 UTC (same day, at midnight)
      expect(normalizeProtoPediaTimestamp('2025-11-14 09:00:00')).toBe(
        '2025-11-14T00:00:00.000Z',
      );
      // 08:59 JST → 23:59 UTC (previous day)
      expect(normalizeProtoPediaTimestamp('2025-11-14 08:59:59')).toBe(
        '2025-11-13T23:59:59.000Z',
      );
      // 00:00 JST → 15:00 UTC (previous day)
      expect(normalizeProtoPediaTimestamp('2025-11-14 00:00:00')).toBe(
        '2025-11-13T15:00:00.000Z',
      );
    });

    it('handles fractional seconds with various precision', () => {
      // No fractional seconds
      expect(normalizeProtoPediaTimestamp('2025-11-14 12:03:07')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
      // 1 digit - pad to 3
      expect(normalizeProtoPediaTimestamp('2025-03-05 01:02:03.5')).toBe(
        '2025-03-04T16:02:03.500Z',
      );
      // 2 digits - pad to 3
      expect(normalizeProtoPediaTimestamp('2025-03-05 01:02:03.05')).toBe(
        '2025-03-04T16:02:03.050Z',
      );
      // 3 digits - use as-is
      expect(normalizeProtoPediaTimestamp('2025-03-05 01:02:03.007')).toBe(
        '2025-03-04T16:02:03.007Z',
      );
      // 4+ digits - truncate to 3
      expect(normalizeProtoPediaTimestamp('2025-03-05 01:02:03.4567')).toBe(
        '2025-03-04T16:02:03.456Z',
      );
      expect(
        normalizeProtoPediaTimestamp('2025-03-05 01:02:03.123456789'),
      ).toBe('2025-03-04T16:02:03.123Z');
    });

    it('handles zero fractional seconds correctly', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14 12:03:07.0')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-11-14 12:03:07.00')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-11-14 12:03:07.000')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
    });

    it('handles full range of valid times', () => {
      // Start of day
      expect(normalizeProtoPediaTimestamp('2025-01-01 00:00:00.000')).toBe(
        '2024-12-31T15:00:00.000Z',
      );
      // End of day
      expect(normalizeProtoPediaTimestamp('2025-12-31 23:59:59.999')).toBe(
        '2025-12-31T14:59:59.999Z',
      );
      // Noon
      expect(normalizeProtoPediaTimestamp('2025-06-15 12:00:00.000')).toBe(
        '2025-06-15T03:00:00.000Z',
      );
    });
  });

  describe('ISO 8601', () => {
    it('handles UTC timestamps with Z suffix', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14T03:03:07Z')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-11-14T03:03:07.0Z')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
    });

    it('handles positive offset with colon (+HH:MM)', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07+09:00')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-11-14T15:30:00+05:30')).toBe(
        '2025-11-14T10:00:00.000Z',
      );
    });

    it('handles positive offset without colon (+HHMM)', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07+0900')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-11-14T15:30:00+0530')).toBe(
        '2025-11-14T10:00:00.000Z',
      );
    });

    it('handles negative offsets with colon (-HH:MM)', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07-05:00')).toBe(
        '2025-11-14T17:03:07.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07-08:00')).toBe(
        '2025-11-14T20:03:07.000Z',
      );
    });

    it('handles negative offsets without colon (-HHMM)', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07-0330')).toBe(
        '2025-11-14T15:33:07.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07-0800')).toBe(
        '2025-11-14T20:03:07.000Z',
      );
    });

    it('handles offsets with non-zero minutes', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07+09:30')).toBe(
        '2025-11-14T02:33:07.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07-07:45')).toBe(
        '2025-11-14T19:48:07.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07+04:45')).toBe(
        '2025-11-14T07:18:07.000Z',
      );
    });

    it('handles extreme offsets', () => {
      // UTC+14 (furthest ahead)
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07+14:00')).toBe(
        '2025-11-13T22:03:07.000Z',
      );
      // UTC-12 (furthest behind)
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07-12:00')).toBe(
        '2025-11-15T00:03:07.000Z',
      );
    });
  });

  describe('Invalid as Date and Time', () => {
    it('rolls over out-of-range months', () => {
      // Month 13 → next year January
      expect(normalizeProtoPediaTimestamp('2025-13-01 00:00:00')).toBe(
        '2025-12-31T15:00:00.000Z',
      );
      // Month 00 → previous year December
      expect(normalizeProtoPediaTimestamp('2025-00-01 00:00:00')).toBe(
        '2024-11-30T15:00:00.000Z',
      );
    });

    it('rolls over out-of-range days', () => {
      // Day 32 in December → next month
      expect(normalizeProtoPediaTimestamp('2025-12-32 00:00:00')).toBe(
        '2025-12-31T15:00:00.000Z',
      );
      // Day 00 → previous month last day
      expect(normalizeProtoPediaTimestamp('2025-03-00 00:00:00')).toBe(
        '2025-02-27T15:00:00.000Z',
      );
    });

    it('rolls over out-of-range hours', () => {
      // Hour 24 → next day 00:00
      expect(normalizeProtoPediaTimestamp('2025-12-01 24:00:00')).toBe(
        '2025-12-01T15:00:00.000Z',
      );
      // Hour 25 → next day 01:00
      expect(normalizeProtoPediaTimestamp('2025-12-01 25:00:00')).toBe(
        '2025-12-01T16:00:00.000Z',
      );
    });

    it('rolls over out-of-range minutes', () => {
      // Minute 60 → next hour
      expect(normalizeProtoPediaTimestamp('2025-12-01 23:60:00')).toBe(
        '2025-12-01T15:00:00.000Z',
      );
      // Minute 120 is invalid (3 digits) → null
      expect(normalizeProtoPediaTimestamp('2025-12-01 22:120:00')).toBeNull();
    });

    it('rolls over out-of-range seconds', () => {
      // Second 60 → next minute
      expect(normalizeProtoPediaTimestamp('2025-12-01 23:59:60')).toBe(
        '2025-12-01T15:00:00.000Z',
      );
      // Second 120 is invalid (3 digits) → null
      expect(normalizeProtoPediaTimestamp('2025-12-01 23:58:120')).toBeNull();
    });

    it('handles leap year edge cases', () => {
      // Valid leap year date
      expect(normalizeProtoPediaTimestamp('2024-02-29 00:00:00')).toBe(
        '2024-02-28T15:00:00.000Z',
      );
      // Invalid leap year date (non-leap year) → rolls to March 1
      expect(normalizeProtoPediaTimestamp('2025-02-29 00:00:00')).toBe(
        '2025-02-28T15:00:00.000Z',
      );
    });
  });

  describe('Edge case', () => {
    it('handles year boundaries', () => {
      // Last moment of year
      expect(normalizeProtoPediaTimestamp('2025-12-31 23:59:59.999')).toBe(
        '2025-12-31T14:59:59.999Z',
      );
      // First moment of year
      expect(normalizeProtoPediaTimestamp('2025-01-01 00:00:00.000')).toBe(
        '2024-12-31T15:00:00.000Z',
      );
    });

    it('handles date crossing due to JST offset', () => {
      // JST midnight → UTC previous day 15:00
      expect(normalizeProtoPediaTimestamp('2025-11-14 00:00:00')).toBe(
        '2025-11-13T15:00:00.000Z',
      );
      // JST 08:59 → UTC previous day 23:59
      expect(normalizeProtoPediaTimestamp('2025-11-14 08:59:59')).toBe(
        '2025-11-13T23:59:59.000Z',
      );
      // JST 09:00 → UTC same day 00:00
      expect(normalizeProtoPediaTimestamp('2025-11-14 09:00:00')).toBe(
        '2025-11-14T00:00:00.000Z',
      );
    });

    it('handles extreme year values', () => {
      // Unix epoch start
      expect(normalizeProtoPediaTimestamp('1970-01-01 09:00:00')).toBe(
        '1970-01-01T00:00:00.000Z',
      );
      // Far future
      expect(normalizeProtoPediaTimestamp('2099-12-31 23:59:59.999')).toBe(
        '2099-12-31T14:59:59.999Z',
      );
      // Early 20th century
      expect(normalizeProtoPediaTimestamp('1900-01-01 09:00:00.0')).toBe(
        '1900-01-01T00:00:00.000Z',
      );
    });

    it('handles month boundaries with varying days', () => {
      // January (31 days)
      expect(normalizeProtoPediaTimestamp('2025-01-31 23:59:59')).toBe(
        '2025-01-31T14:59:59.000Z',
      );
      // February non-leap (28 days)
      expect(normalizeProtoPediaTimestamp('2025-02-28 23:59:59')).toBe(
        '2025-02-28T14:59:59.000Z',
      );
      // February leap (29 days)
      expect(normalizeProtoPediaTimestamp('2024-02-29 23:59:59')).toBe(
        '2024-02-29T14:59:59.000Z',
      );
      // April (30 days)
      expect(normalizeProtoPediaTimestamp('2025-04-30 23:59:59')).toBe(
        '2025-04-30T14:59:59.000Z',
      );
    });

    it('handles precision at millisecond boundaries', () => {
      expect(normalizeProtoPediaTimestamp('2025-06-15 12:00:00.000')).toBe(
        '2025-06-15T03:00:00.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-06-15 12:00:00.001')).toBe(
        '2025-06-15T03:00:00.001Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-06-15 12:00:00.999')).toBe(
        '2025-06-15T03:00:00.999Z',
      );
    });
  });
});

//
