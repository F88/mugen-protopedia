import { describe, expect, it } from 'vitest';
import {
  JST_OFFSET_MS,
  normalizeProtoPediaTimestamp,
  parseAsIso8601,
  parseAsProtoPediaTimestamp,
} from '@/lib/utils/time';

const HOURS_9_IN_MS = 9 * 60 * 60 * 1000;

describe('Time utilities', () => {
  describe('parseAsProtoPediaTimestamp', () => {
    it('returns undefined for null', () => {
      // @ts-expect-error Testing runtime behavior
      expect(parseAsProtoPediaTimestamp(null)).toBeUndefined();
    });

    it('returns undefined for undefined', () => {
      // @ts-expect-error Testing runtime behavior
      expect(parseAsProtoPediaTimestamp(undefined)).toBeUndefined();
    });

    it('parses valid JST timestamp to UTC', () => {
      expect(parseAsProtoPediaTimestamp('2025-11-14 12:03:07.0')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
    });

    it('returns undefined for invalid format', () => {
      expect(parseAsProtoPediaTimestamp('invalid')).toBeUndefined();
    });

    it('returns undefined for ISO 8601 with offset', () => {
      expect(
        parseAsProtoPediaTimestamp('2025-11-14T12:03:07Z'),
      ).toBeUndefined();
    });
  });

  describe('parseAsIso8601', () => {
    it('returns undefined for null', () => {
      // @ts-expect-error Testing runtime behavior
      expect(parseAsIso8601(null)).toBeUndefined();
    });

    it('returns undefined for undefined', () => {
      // @ts-expect-error Testing runtime behavior
      expect(parseAsIso8601(undefined)).toBeUndefined();
    });

    it('parses UTC timestamp with Z suffix', () => {
      expect(parseAsIso8601('2025-11-14T03:03:07Z')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
    });

    it('parses timestamp with positive offset', () => {
      expect(parseAsIso8601('2025-11-14T12:03:07+09:00')).toBe(
        '2025-11-14T03:03:07.000Z',
      );
    });

    it('parses timestamp with negative offset', () => {
      expect(parseAsIso8601('2025-11-14T12:03:07-05:00')).toBe(
        '2025-11-14T17:03:07.000Z',
      );
    });

    it('returns undefined for timestamp without offset', () => {
      expect(parseAsIso8601('2025-11-14T12:03:07')).toBeUndefined();
    });

    it('returns undefined for invalid format', () => {
      expect(parseAsIso8601('invalid')).toBeUndefined();
    });
  });

  describe('normalizeProtoPediaTimestamp', () => {
    describe('JST_OFFSET_MS', () => {
      it('matches a nine-hour offset in milliseconds', () => {
        expect(JST_OFFSET_MS).toBe(HOURS_9_IN_MS);
      });

      it('equals 32400000 milliseconds', () => {
        expect(JST_OFFSET_MS).toBe(32400000);
      });
    });

    describe('Valid value', () => {
      describe('ProtoPedia timestamps (JST timestamps without offsets)', () => {
        it('converts standard ProtoPedia format to UTC', () => {
          expect(normalizeProtoPediaTimestamp('2025-11-14 12:03:07.0')).toBe(
            '2025-11-14T03:03:07.000Z',
          );
          expect(normalizeProtoPediaTimestamp('2017-11-13 20:23:16.0')).toBe(
            '2017-11-13T11:23:16.000Z',
          );
        });

        it('subtracts 9 hours for JST to UTC conversion', () => {
          // 12:00 JST → 03:00 UTC (same day)
          expect(normalizeProtoPediaTimestamp('2025-11-14 12:00:00.0')).toBe(
            '2025-11-14T03:00:00.000Z',
          );
          // 09:00 JST → 00:00 UTC (same day, at midnight)
          expect(normalizeProtoPediaTimestamp('2025-11-14 09:00:00.0')).toBe(
            '2025-11-14T00:00:00.000Z',
          );
          // 08:59 JST → 23:59 UTC (previous day)
          expect(normalizeProtoPediaTimestamp('2025-11-14 08:59:59.0')).toBe(
            '2025-11-13T23:59:59.000Z',
          );
          // 00:00 JST → 15:00 UTC (previous day)
          expect(normalizeProtoPediaTimestamp('2025-11-14 00:00:00.0')).toBe(
            '2025-11-13T15:00:00.000Z',
          );
        });

        it('handles fractional seconds with various precision', () => {
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
          expect(
            normalizeProtoPediaTimestamp('2025-11-14T12:03:07+09:00'),
          ).toBe('2025-11-14T03:03:07.000Z');
          expect(
            normalizeProtoPediaTimestamp('2025-11-14T15:30:00+05:30'),
          ).toBe('2025-11-14T10:00:00.000Z');
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
          expect(
            normalizeProtoPediaTimestamp('2025-11-14T12:03:07-05:00'),
          ).toBe('2025-11-14T17:03:07.000Z');
          expect(
            normalizeProtoPediaTimestamp('2025-11-14T12:03:07-08:00'),
          ).toBe('2025-11-14T20:03:07.000Z');
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
          expect(
            normalizeProtoPediaTimestamp('2025-11-14T12:03:07+09:30'),
          ).toBe('2025-11-14T02:33:07.000Z');
          expect(
            normalizeProtoPediaTimestamp('2025-11-14T12:03:07-07:45'),
          ).toBe('2025-11-14T19:48:07.000Z');
          expect(
            normalizeProtoPediaTimestamp('2025-11-14T12:03:07+04:45'),
          ).toBe('2025-11-14T07:18:07.000Z');
        });

        it('handles extreme offsets', () => {
          // UTC+14 (furthest ahead)
          expect(
            normalizeProtoPediaTimestamp('2025-11-14T12:03:07+14:00'),
          ).toBe('2025-11-13T22:03:07.000Z');
          // UTC-12 (furthest behind)
          expect(
            normalizeProtoPediaTimestamp('2025-11-14T12:03:07-12:00'),
          ).toBe('2025-11-15T00:03:07.000Z');
        });
      });

      describe('Null', () => {
        it('returns null for null input', () => {
          expect(normalizeProtoPediaTimestamp(null)).toBeNull();
        });
      });

      describe('Undefined', () => {
        it('returns undefined for undefined input', () => {
          expect(normalizeProtoPediaTimestamp(undefined)).toBeUndefined();
        });
      });
    });

    describe('Invalid value', () => {
      describe('Empty string', () => {
        it('returns empty string as-is', () => {
          expect(normalizeProtoPediaTimestamp('')).toBe('');
        });

        it('returns whitespace-only strings as-is', () => {
          expect(normalizeProtoPediaTimestamp('   ')).toBe('   ');
          expect(normalizeProtoPediaTimestamp('\t')).toBe('\t');
          expect(normalizeProtoPediaTimestamp('\n')).toBe('\n');
          expect(normalizeProtoPediaTimestamp('\n\t  ')).toBe('\n\t  ');
          expect(normalizeProtoPediaTimestamp('  \r\n  ')).toBe('  \r\n  ');
        });

        it('does not trim whitespace - returns invalid strings as-is', () => {
          expect(
            normalizeProtoPediaTimestamp('  2025-11-14 12:03:07.0  '),
          ).toBe('  2025-11-14 12:03:07.0  ');
          expect(
            normalizeProtoPediaTimestamp('\t2025-11-14 12:03:07.0\n'),
          ).toBe('\t2025-11-14 12:03:07.0\n');
        });
      });

      describe('Never in Type (number, boolean, ...)', () => {
        it('returns completely invalid formats as-is', () => {
          expect(normalizeProtoPediaTimestamp('nonsense')).toBe('nonsense');
          expect(normalizeProtoPediaTimestamp('hello world')).toBe(
            'hello world',
          );
          expect(normalizeProtoPediaTimestamp('123456')).toBe('123456');
          expect(normalizeProtoPediaTimestamp('true')).toBe('true');
          expect(normalizeProtoPediaTimestamp('false')).toBe('false');
        });

        it('returns date-only formats as-is', () => {
          expect(normalizeProtoPediaTimestamp('2025-11-14')).toBe('2025-11-14');
          expect(normalizeProtoPediaTimestamp('2025/11/14')).toBe('2025/11/14');
        });

        it('returns time-only formats as-is', () => {
          expect(normalizeProtoPediaTimestamp('12:03:07')).toBe('12:03:07');
          expect(normalizeProtoPediaTimestamp('12:03:07.0')).toBe('12:03:07.0');
        });

        it('returns wrong date separators as-is', () => {
          expect(normalizeProtoPediaTimestamp('2025/11/14 12:03:07')).toBe(
            '2025/11/14 12:03:07',
          );
          expect(normalizeProtoPediaTimestamp('2025.11.14 12:03:07')).toBe(
            '2025.11.14 12:03:07',
          );
          expect(normalizeProtoPediaTimestamp('20251114 12:03:07')).toBe(
            '20251114 12:03:07',
          );
        });

        it('returns wrong time separators as-is', () => {
          expect(normalizeProtoPediaTimestamp('2025-11-14 12.03.07')).toBe(
            '2025-11-14 12.03.07',
          );
          expect(normalizeProtoPediaTimestamp('2025-11-14 120307')).toBe(
            '2025-11-14 120307',
          );
        });

        it('returns missing padding in date as-is', () => {
          expect(normalizeProtoPediaTimestamp('2025-1-5 12:03:07')).toBe(
            '2025-1-5 12:03:07',
          );
          expect(normalizeProtoPediaTimestamp('2025-11-4 12:03:07')).toBe(
            '2025-11-4 12:03:07',
          );
          expect(normalizeProtoPediaTimestamp('25-11-14 12:03:07')).toBe(
            '25-11-14 12:03:07',
          );
        });

        it('returns missing padding in time as-is', () => {
          expect(normalizeProtoPediaTimestamp('2025-11-14 1:2:3')).toBe(
            '2025-11-14 1:2:3',
          );
          expect(normalizeProtoPediaTimestamp('2025-11-14 12:3:7')).toBe(
            '2025-11-14 12:3:7',
          );
          expect(normalizeProtoPediaTimestamp('2025-11-14 12:03:7')).toBe(
            '2025-11-14 12:03:7',
          );
        });

        it('returns malformed fractional seconds as-is', () => {
          expect(normalizeProtoPediaTimestamp('2025-11-14 12:03:07.')).toBe(
            '2025-11-14 12:03:07.',
          );
          expect(normalizeProtoPediaTimestamp('2025-11-14 12:03:07.abc')).toBe(
            '2025-11-14 12:03:07.abc',
          );
          expect(normalizeProtoPediaTimestamp('2025-11-14 12:03:07.xyz')).toBe(
            '2025-11-14 12:03:07.xyz',
          );
        });

        it('returns malformed offset annotations as-is', () => {
          expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07+9')).toBe(
            '2025-11-14T12:03:07+9',
          );
          expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07+09:')).toBe(
            '2025-11-14T12:03:07+09:',
          );
          expect(normalizeProtoPediaTimestamp('2025-11-14T12:03:07+--9')).toBe(
            '2025-11-14T12:03:07+--9',
          );
          expect(
            normalizeProtoPediaTimestamp('2025-11-14T12:03:07+AB:CD'),
          ).toBe('2025-11-14T12:03:07+AB:CD');
        });
      });

      describe('Invalid as Date and Time', () => {
        it('rolls over out-of-range months', () => {
          // Month 13 → returned as-is (no fractional seconds)
          expect(normalizeProtoPediaTimestamp('2025-13-01 00:00:00')).toBe(
            '2025-13-01 00:00:00',
          );
          // Month 00 → returned as-is (no fractional seconds)
          expect(normalizeProtoPediaTimestamp('2025-00-01 00:00:00')).toBe(
            '2025-00-01 00:00:00',
          );
        };);

        it('rolls over out-of-range days', () => {
          // Day 32 in December → returned as-is (no fractional seconds)
          expect(normalizeProtoPediaTimestamp('2025-12-32 00:00:00')).toBe(
            '2025-12-32 00:00:00',
          );
          // Day 00 → returned as-is (no fractional seconds)
          expect(normalizeProtoPediaTimestamp('2025-03-00 00:00:00')).toBe(
            '2025-03-00 00:00:00',
          );
        };);

        it('rolls over out-of-range hours', () => {
          // Hour 24 → returned as-is (no fractional seconds)
          expect(normalizeProtoPediaTimestamp('2025-12-01 24:00:00')).toBe(
            '2025-12-01 24:00:00',
          );
          // Hour 25 → returned as-is (no fractional seconds)
          expect(normalizeProtoPediaTimestamp('2025-12-01 25:00:00')).toBe(
            '2025-12-01 25:00:00',
          );
        };);

        it('rolls over out-of-range minutes', () => {
          // Minute 60 → returned as-is (no fractional seconds)
          expect(normalizeProtoPediaTimestamp('2025-12-01 23:60:00')).toBe(
            '2025-12-01 23:60:00',
          );
          // Minute 120 is invalid (3 digits) → returns as-is
          expect(normalizeProtoPediaTimestamp('2025-12-01 22:120:00')).toBe(
            '2025-12-01 22:120:00',
          );
        };);

        it('rolls over out-of-range seconds', () => {
          // Second 60 → returned as-is (no fractional seconds)
          expect(normalizeProtoPediaTimestamp('2025-12-01 23:59:60')).toBe(
            '2025-12-01 23:59:60',
          );
          // Second 120 is invalid (3 digits) → returns as-is
          expect(normalizeProtoPediaTimestamp('2025-12-01 23:58:120')).toBe(
            '2025-12-01 23:58:120',
          );
        };);

        it('handles leap year edge cases', () => {
          // Valid leap year date → returned as-is (no fractional seconds)
          expect(normalizeProtoPediaTimestamp('2024-02-29 00:00:00')).toBe(
            '2024-02-29 00:00:00',
          );
          // Invalid leap year date (non-leap year) → returned as-is (no fractional seconds)
          expect(normalizeProtoPediaTimestamp('2025-02-29 00:00:00')).toBe(
            '2025-02-29 00:00:00',
          );
        };);
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
        // JST midnight → returned as-is (no fractional seconds)
        expect(normalizeProtoPediaTimestamp('2025-11-14 00:00:00')).toBe(
          '2025-11-14 00:00:00',
        );
        // JST 08:59 → returned as-is (no fractional seconds)
        expect(normalizeProtoPediaTimestamp('2025-11-14 08:59:59')).toBe(
          '2025-11-14 08:59:59',
        );
        // JST 09:00 → returned as-is (no fractional seconds)
        expect(normalizeProtoPediaTimestamp('2025-11-14 09:00:00')).toBe(
          '2025-11-14 09:00:00',
        );
      };);

      it('handles extreme year values', () => {
        // Unix epoch start → returned as-is (no fractional seconds)
        expect(normalizeProtoPediaTimestamp('1970-01-01 09:00:00')).toBe(
          '1970-01-01 09:00:00',
        );
        // Far future
        expect(normalizeProtoPediaTimestamp('2099-12-31 23:59:59.999')).toBe(
          '2099-12-31T14:59:59.999Z',
        );
        // Early 20th century
        expect(normalizeProtoPediaTimestamp('1900-01-01 09:00:00.0')).toBe(
          '1900-01-01T00:00:00.000Z',
        );
      };);

      it('handles month boundaries with varying days', () => {
        // January (31 days) → returned as-is (no fractional seconds)
        expect(normalizeProtoPediaTimestamp('2025-01-31 23:59:59')).toBe(
          '2025-01-31 23:59:59',
        );
        // February non-leap (28 days) → returned as-is (no fractional seconds)
        expect(normalizeProtoPediaTimestamp('2025-02-28 23:59:59')).toBe(
          '2025-02-28 23:59:59',
        );
        // February leap (29 days) → returned as-is (no fractional seconds)
        expect(normalizeProtoPediaTimestamp('2024-02-29 23:59:59')).toBe(
          '2024-02-29 23:59:59',
        );
        // April (30 days) → returned as-is (no fractional seconds)
        expect(normalizeProtoPediaTimestamp('2025-04-30 23:59:59')).toBe(
          '2025-04-30 23:59:59',
        );
      };);

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
});
