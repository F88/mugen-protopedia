import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/utils/anniversary-nerd', () => ({
  calculateAge: vi.fn((date: string) => ({
    years: date.endsWith('2000-01-01') ? 24 : 1,
  })),
  isBirthDay: vi.fn((date: string) => date === '2000-01-01'),
  isToday: vi.fn((date: string) => date === '2025-11-28'),
}));

import { buildAnniversaries, buildAnniversarySlice } from './anniversaries';

const logger = { debug: vi.fn() };

describe('buildAnniversaries', () => {
  it('collects birthday and newborn prototypes using helpers', () => {
    const prototypes = [
      { id: 1, releaseDate: '2000-01-01', prototypeNm: 'Birthday' },
      { id: 2, releaseDate: '2025-11-28', prototypeNm: 'Today' },
      { id: 3, releaseDate: '1999-05-05', prototypeNm: 'Other' },
    ];

    const result = buildAnniversaries(prototypes, { logger });

    expect(result.birthdayPrototypes).toEqual([
      {
        id: 1,
        title: 'Birthday',
        years: 24,
        releaseDate: '2000-01-01',
      },
    ]);
    expect(result.newbornPrototypes).toEqual([
      {
        id: 2,
        title: 'Today',
        releaseDate: '2025-11-28',
      },
    ]);
    expect(logger.debug).toHaveBeenCalled();
  });

  it('filters out prototypes with undefined releaseDate', () => {
    const prototypes = [
      { id: 1, releaseDate: '2000-01-01', prototypeNm: 'Birthday' },
      { id: 2, releaseDate: undefined, prototypeNm: 'No Release' },
      { id: 3, releaseDate: '2025-11-28', prototypeNm: 'Today' },
      { id: 4, prototypeNm: 'Also No Release' },
    ];

    const result = buildAnniversaries(prototypes, { logger });

    expect(result.birthdayPrototypes).toEqual([
      {
        id: 1,
        title: 'Birthday',
        years: 24,
        releaseDate: '2000-01-01',
      },
    ]);
    expect(result.newbornPrototypes).toEqual([
      {
        id: 3,
        title: 'Today',
        releaseDate: '2025-11-28',
      },
    ]);
  });
});

describe('buildAnniversarySlice', () => {
  it('summarizes counts and keeps raw arrays', () => {
    const birthdayPrototypes = [
      { id: 1, title: 'b', years: 1, releaseDate: '2000-01-01' },
    ];
    const newbornPrototypes = [
      { id: 2, title: 'n', releaseDate: '2025-11-28' },
    ];

    const slice = buildAnniversarySlice(birthdayPrototypes, newbornPrototypes, {
      logger,
    });

    expect(slice).toEqual({
      birthdayCount: 1,
      birthdayPrototypes,
      newbornCount: 1,
      newbornPrototypes,
    });
    expect(logger.debug).toHaveBeenCalled();
  });
});
