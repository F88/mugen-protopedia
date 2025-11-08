import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { formatAgeFromDate, formatDateForDisplay } from '@/lib/utils/format';

const fixedNow = new Date('2000-01-01T00:00:00Z');

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(fixedNow);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.setSystemTime(fixedNow);
});

afterAll(() => {
  vi.useRealTimers();
});

describe('formatDateForDisplay', () => {
  it('returns ISO date string when given a valid date string', () => {
    expect(formatDateForDisplay('2024-03-15T09:30:00Z')).toBe('2024-03-15');
  });

  it('returns ISO date string when given a timestamp', () => {
    const timestamp = new Date('2023-12-01T00:00:00Z').valueOf();
    expect(formatDateForDisplay(timestamp)).toBe('2023-12-01');
  });

  it('returns original value when date is invalid', () => {
    expect(formatDateForDisplay('not-a-date')).toBe('not-a-date');
  });
});

describe('formatAgeFromDate', () => {
  it('calculates age in years and months when the current day is past the birth day', () => {
    expect(formatAgeFromDate('1995-06-15')).toBe('4歳 6ヶ月');
  });

  it('handles partial months by not counting the current month if the day has not passed', () => {
    expect(formatAgeFromDate('1999-12-30')).toBe('0歳 0ヶ月');
  });

  it('returns empty string for invalid dates', () => {
    expect(formatAgeFromDate('invalid-date')).toBe('');
  });

  it('supports numeric timestamps', () => {
    const timestamp = new Date('1994-01-15T00:00:00Z').valueOf();
    expect(formatAgeFromDate(timestamp)).toBe('5歳 11ヶ月');
  });

  it('omits months when includeMonths option is false', () => {
    expect(formatAgeFromDate('1980-04-10', { includeMonths: false })).toBe('19歳');
  });
});
