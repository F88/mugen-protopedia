import { describe, expect, it } from 'vitest';
import { JST_OFFSET_MS, normalizeProtoPediaTimestamp } from '@/lib/utils/time';

const HOURS_9_IN_MS = 9 * 60 * 60 * 1000;

describe('normalizeProtoPediaTimestamp', () => {
  describe('JST timestamps without offsets', () => {
    it('converts ProtoPedia JST timestamps without offsets into UTC ISO strings', () => {
      const result = normalizeProtoPediaTimestamp('2025-11-14 12:03:07.0');

      expect(result).toBe('2025-11-14T03:03:07.000Z');
    });

    it('accepts ISO style separators without spaces', () => {
      const result = normalizeProtoPediaTimestamp('2025-11-14T12:03:07');

      expect(result).toBe('2025-11-14T03:03:07.000Z');
    });

    it('trims leading and trailing whitespace before parsing', () => {
      const result = normalizeProtoPediaTimestamp('  2025-11-14 12:03:07.0  ');

      expect(result).toBe('2025-11-14T03:03:07.000Z');
    });
  });

  describe('fractional seconds precision', () => {
    it('preserves precision up to milliseconds', () => {
      const result = normalizeProtoPediaTimestamp('2025-03-05 01:02:03.4567');

      expect(result).toBe('2025-03-04T16:02:03.456Z');
    });

    it('pads fractional seconds shorter than three digits', () => {
      expect(normalizeProtoPediaTimestamp('2025-03-05 01:02:03.5')).toBe(
        '2025-03-04T16:02:03.500Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-03-05 01:02:03.05')).toBe(
        '2025-03-04T16:02:03.050Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-03-05 01:02:03.007')).toBe(
        '2025-03-04T16:02:03.007Z',
      );
    });

    it('rejects malformed fractional seconds', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14 12:03:07.')).toBeNull();
      expect(
        normalizeProtoPediaTimestamp('2025-11-14 12:03:07.abc'),
      ).toBeNull();
    });

    it('handles timestamps without fractional seconds', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14 12:03:07')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
    });

    it('pads zero milliseconds correctly', () => {
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

    it('truncates fractional seconds longer than three digits', () => {
      expect(normalizeProtoPediaTimestamp('2025-03-05 01:02:03.456789')).toBe(
        '2025-03-04T16:02:03.456Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-03-05 01:02:03.1234')).toBe(
        '2025-03-04T16:02:03.123Z',
      );
    });
  });

  describe('offset-aware timestamps', () => {
    it('passes through offset-aware timestamps', () => {
      const withOffset = normalizeProtoPediaTimestamp(
        '2025-11-14T12:03:07+09:00',
      );
      const utcTagged = normalizeProtoPediaTimestamp('2025-11-14T03:03:07Z');

      expect(withOffset).toBe('2025-11-14T03:03:07.000Z');
      expect(utcTagged).toBe('2025-11-14T03:03:07.000Z');
    });

    it('accepts offset-aware timestamps with compact offset syntax', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07+0900')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07-0330')).toBe(
        '2025-11-14T15:33:07.000Z',
      );
    });

    it('handles negative offsets correctly', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07-05:00')).toBe(
        '2025-11-14T17:03:07.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07-08:00')).toBe(
        '2025-11-14T20:03:07.000Z',
      );
    });

    it('supports offsets with non-zero minutes', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07+09:30')).toBe(
        '2025-11-14T02:33:07.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07-07:45')).toBe(
        '2025-11-14T19:48:07.000Z',
      );
    });
  });

  describe('invalid input handling', () => {
    it('returns null for empty, null, or invalid values', () => {
      expect(normalizeProtoPediaTimestamp(null)).toBeNull();
      expect(normalizeProtoPediaTimestamp(undefined)).toBeNull();
      expect(normalizeProtoPediaTimestamp('')).toBeNull();
      expect(normalizeProtoPediaTimestamp('nonsense')).toBeNull();
      expect(normalizeProtoPediaTimestamp('2025-11-14')).toBeNull();
      expect(normalizeProtoPediaTimestamp('2025/11/14 12:03:07')).toBeNull();
    });

    it('gracefully handles whitespace-only input', () => {
      expect(normalizeProtoPediaTimestamp('   ')).toBeNull();
      expect(normalizeProtoPediaTimestamp('\n\t')).toBeNull();
    });

    it('rolls over out-of-range date and time components per JS semantics', () => {
      expect(normalizeProtoPediaTimestamp('2025-13-01 00:00:00')).toBe(
        '2025-12-31T15:00:00.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-00-01 00:00:00')).toBe(
        '2024-11-30T15:00:00.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-12-32 00:00:00')).toBe(
        '2025-12-31T15:00:00.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-12-01 24:00:00')).toBe(
        '2025-12-01T15:00:00.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-12-01 23:60:00')).toBe(
        '2025-12-01T15:00:00.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-12-01 23:59:60')).toBe(
        '2025-12-01T15:00:00.000Z',
      );
    });

    it('handles single-digit padding in input', () => {
      expect(normalizeProtoPediaTimestamp('2025-01-05 01:02:03')).toBe(
        '2025-01-04T16:02:03.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-1-5 1:2:3')).toBeNull();
    });

    it('rejects malformed offset annotations', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07+9')).toBeNull();
      expect(
        normalizeProtoPediaTimestamp('2025-11-14T12:03:07+09:'),
      ).toBeNull();
      expect(
        normalizeProtoPediaTimestamp('2025-11-14T12:03:07+--9'),
      ).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('handles leap year dates correctly', () => {
      expect(normalizeProtoPediaTimestamp('2024-02-29 00:00:00')).toBe(
        '2024-02-28T15:00:00.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-02-29 00:00:00')).toBe(
        '2025-02-28T15:00:00.000Z',
      );
    });

    it('handles boundary time values', () => {
      expect(normalizeProtoPediaTimestamp('2025-01-01 00:00:00')).toBe(
        '2024-12-31T15:00:00.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-12-31 23:59:59.999')).toBe(
        '2025-12-31T14:59:59.999Z',
      );
    });

    it('handles midnight JST crossing date boundaries', () => {
      expect(normalizeProtoPediaTimestamp('2025-11-14 00:00:00')).toBe(
        '2025-11-13T15:00:00.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-11-14 08:59:59')).toBe(
        '2025-11-13T23:59:59.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2025-11-14 09:00:00')).toBe(
        '2025-11-14T00:00:00.000Z',
      );
    });

    it('handles extreme year values', () => {
      expect(normalizeProtoPediaTimestamp('1970-01-01 09:00:00')).toBe(
        '1970-01-01T00:00:00.000Z',
      );
      expect(normalizeProtoPediaTimestamp('2099-12-31 23:59:59.999')).toBe(
        '2099-12-31T14:59:59.999Z',
      );
    });
  });
});

describe('JST_OFFSET_MS', () => {
  it('matches a nine-hour offset in milliseconds', () => {
    expect(JST_OFFSET_MS).toBe(HOURS_9_IN_MS);
  });
});
