import { describe, expect, it } from 'vitest';

import { calculateCreationStreak } from './core';

describe('calculateCreationStreak', () => {
  it('returns zeros when there are no release dates', () => {
    const result = calculateCreationStreak(
      new Set(),
      new Date('2024-01-01T00:00:00Z'),
    );
    expect(result).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      longestStreakEndDate: null,
      totalActiveDays: 0,
    });
  });

  it('calculates streak metrics based on consecutive days', () => {
    const dates = new Set(['2024-01-01', '2024-01-02', '2024-01-04']);
    const result = calculateCreationStreak(
      dates,
      new Date('2024-01-03T12:00:00Z'),
    );
    expect(result).toEqual({
      currentStreak: 2,
      longestStreak: 2,
      longestStreakEndDate: '2024-01-02',
      totalActiveDays: 3,
    });
  });

  it('detects ongoing streak when last release was yesterday JST', () => {
    const dates = new Set(['2024-01-01', '2024-01-02', '2024-01-03']);
    const now = new Date('2024-01-03T10:00:00Z');
    const result = calculateCreationStreak(dates, now);
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
    expect(result.totalActiveDays).toBe(3);
  });
});
