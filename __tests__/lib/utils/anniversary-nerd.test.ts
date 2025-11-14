import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  calculateAge,
  isBirthDay,
  isToday,
} from '@/lib/utils/anniversary-nerd';

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

describe('calculateAge', () => {
  it('returns years, months, and days for a past date', () => {
    expect(calculateAge('1995-06-15')).toStrictEqual({
      years: 4,
      months: 6,
      days: 17,
    });
  });

  it('adjusts when current day is before the birth day in the month', () => {
    expect(calculateAge('1999-12-30')).toStrictEqual({
      years: 0,
      months: 0,
      days: 2,
    });
  });

  it('returns zeros when date is invalid', () => {
    expect(calculateAge('invalid')).toStrictEqual({
      years: 0,
      months: 0,
      days: 0,
    });
  });

  it('supports numeric timestamps', () => {
    const timestamp = new Date('1988-08-20T00:00:00Z').valueOf();
    expect(calculateAge(timestamp)).toStrictEqual({
      years: 11,
      months: 4,
      days: 12,
    });
  });

  it('handles leap day birthdays correctly', () => {
    expect(calculateAge('1996-02-29')).toStrictEqual({
      years: 3,
      months: 10,
      days: 3,
    });
  });
});

describe('isBirthDay', () => {
  it('returns true when today matches the birthday', () => {
    expect(isBirthDay('2000-01-01')).toBe(true);
  });

  it('returns false when today does not match the birthday', () => {
    expect(isBirthDay('2000-01-02')).toBe(false);
  });

  it('treats Feb 29 birthdays as Feb 28 in non-leap years', () => {
    vi.setSystemTime(new Date('2001-02-28T00:00:00Z'));
    expect(isBirthDay('1996-02-29')).toBe(true);
  });

  it('returns false for Feb 29 birthdays on non-matching days', () => {
    vi.setSystemTime(new Date('2001-02-27T00:00:00Z'));
    expect(isBirthDay('1996-02-29T00:00:00Z')).toBe(false);
  });

  it('returns true for Feb 29 birthdays on leap days', () => {
    vi.setSystemTime(new Date('2000-02-29T00:00:00Z'));
    expect(isBirthDay('1992-02-29')).toBe(true);
  });

  it('returns false when date is invalid', () => {
    expect(isBirthDay('invalid-date')).toBe(false);
  });
});

describe('isToday', () => {
  it('returns true when date is today (same year, month, and day)', () => {
    expect(isToday('2000-01-01')).toBe(true);
  });

  it('returns false when date is different year', () => {
    expect(isToday('1999-01-01')).toBe(false);
    expect(isToday('2001-01-01')).toBe(false);
  });

  it('returns false when date is different month', () => {
    expect(isToday('2000-02-01')).toBe(false);
    expect(isToday('2000-12-01')).toBe(false);
  });

  it('returns false when date is different day', () => {
    expect(isToday('2000-01-02')).toBe(false);
    expect(isToday('2000-01-31')).toBe(false);
  });

  it('returns true for different times on the same day', () => {
    expect(isToday('2000-01-01T12:00:00Z')).toBe(true);
    expect(isToday('2000-01-01T23:59:59Z')).toBe(true);
  });

  it('does not treat previous local day as today even if the UTC day matches', () => {
    vi.setSystemTime(new Date('2025-11-14T15:30:00Z'));
    expect(isToday('2025-11-14T03:03:07Z')).toBe(false);
  });

  it('returns false when date is invalid', () => {
    expect(isToday('invalid-date')).toBe(false);
  });

  it('supports numeric timestamps', () => {
    const timestamp = new Date('2000-01-01T12:00:00Z').valueOf();
    expect(isToday(timestamp)).toBe(true);
  });
});
