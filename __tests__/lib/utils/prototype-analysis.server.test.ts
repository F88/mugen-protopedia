import { describe, expect, it, vi } from 'vitest';
import type { NormalizedPrototype } from '@/lib/api/prototypes';
import {
  analyzePrototypesForServer,
  buildAnniversaryCandidates,
  extractMonthDay,
} from '@/lib/utils/prototype-analysis.server';

// Helper function to create mock prototype data
function createMockPrototype(
  overrides: Partial<NormalizedPrototype> = {},
): NormalizedPrototype {
  return {
    id: 1,
    prototypeNm: 'Test Prototype',
    summary: 'Test summary',
    status: 1,
    releaseFlg: 1,
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString(),
    releaseDate: new Date().toISOString(),
    revision: 1,
    freeComment: '',
    teamNm: 'Test Team',
    users: ['User 1'],
    tags: [],
    awards: [],
    events: [],
    materials: [],
    licenseType: 1,
    thanksFlg: 0,
    mainUrl: 'https://example.com/main.jpg',
    videoUrl: undefined,
    officialLink: undefined,
    viewCount: 0,
    goodCount: 0,
    commentCount: 0,
    ...overrides,
  };
}

function createMockLogger() {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn(() => logger),
  };
  return logger;
}

describe('extractMonthDay', () => {
  describe('valid ISO 8601 dates', () => {
    it('should extract MM-DD from ISO date string with time', () => {
      expect(extractMonthDay('2024-11-14T10:30:00Z')).toBe('11-14');
      expect(extractMonthDay('2024-01-05T00:00:00Z')).toBe('01-05');
      expect(extractMonthDay('2024-12-31T23:59:59Z')).toBe('12-31');
    });

    it('should extract MM-DD from ISO date string without time', () => {
      expect(extractMonthDay('2024-11-14')).toBe('11-14');
      expect(extractMonthDay('2024-01-05')).toBe('01-05');
    });

    it('should handle different years consistently', () => {
      expect(extractMonthDay('2020-11-14T10:00:00Z')).toBe('11-14');
      expect(extractMonthDay('2021-11-14T10:00:00Z')).toBe('11-14');
      expect(extractMonthDay('2022-11-14T10:00:00Z')).toBe('11-14');
      expect(extractMonthDay('2025-11-14T10:00:00Z')).toBe('11-14');
    });
  });

  describe('non-ISO date formats', () => {
    it('should extract MM-DD from space-separated format (Protopedia format)', () => {
      expect(extractMonthDay('2024-11-14 10:30:00.0')).toBe('11-14');
      expect(extractMonthDay('2024-01-05 00:00:00.0')).toBe('01-05');
      expect(extractMonthDay('2022-11-14 13:31:20.0')).toBe('11-14');
    });

    it('should extract MM-DD from various parseable formats', () => {
      expect(extractMonthDay('2024/11/14')).toBe('11-14');
      expect(extractMonthDay('Nov 14, 2024')).toBe('11-14');
    });
  });

  describe('Date objects', () => {
    it('should extract MM-DD from Date object', () => {
      const date1 = new Date('2024-11-14T10:30:00Z');
      const date2 = new Date('2024-01-05T00:00:00Z');
      const date3 = new Date('2024-12-31T23:59:59Z');

      expect(extractMonthDay(date1)).toBe('11-14');
      expect(extractMonthDay(date2)).toBe('01-05');
      expect(extractMonthDay(date3)).toBe('12-31');
    });

    it('should use UTC timezone for Date objects', () => {
      const date = new Date(Date.UTC(2024, 10, 14, 10, 30)); // November 14 in UTC
      expect(extractMonthDay(date)).toBe('11-14');
    });
  });

  describe('edge cases', () => {
    it('should pad single-digit months and days with zero', () => {
      expect(extractMonthDay('2024-01-01T00:00:00Z')).toBe('01-01');
      expect(extractMonthDay('2024-09-09T00:00:00Z')).toBe('09-09');
      expect(extractMonthDay('2024-02-03T00:00:00Z')).toBe('02-03');
    });

    it('should handle leap year dates', () => {
      expect(extractMonthDay('2024-02-29T00:00:00Z')).toBe('02-29');
      expect(extractMonthDay('2020-02-29T00:00:00Z')).toBe('02-29');
    });

    it('should handle year boundaries', () => {
      expect(extractMonthDay('2024-01-01T00:00:00Z')).toBe('01-01');
      expect(extractMonthDay('2024-12-31T23:59:59Z')).toBe('12-31');
    });
  });

  describe('invalid inputs', () => {
    it('should return null for invalid date strings', () => {
      expect(extractMonthDay('invalid-date')).toBeNull();
      expect(extractMonthDay('not a date')).toBeNull();
      expect(extractMonthDay('')).toBeNull();
      expect(extractMonthDay('2024-13-01')).toBeNull(); // Invalid month
    });

    it('should return null for invalid Date objects', () => {
      expect(extractMonthDay(new Date('invalid'))).toBeNull();
      expect(extractMonthDay(new Date(NaN))).toBeNull();
    });
  });

  describe('real-world examples from Protopedia', () => {
    it('should handle actual Protopedia release date format', () => {
      // Examples from the conversation context
      expect(extractMonthDay('2025-11-13 07:41:55.000')).toBe('11-13');
      expect(extractMonthDay('2025-11-13 13:31:20.000')).toBe('11-13');
      expect(extractMonthDay('2025-11-14 03:03:07.000')).toBe('11-14');
      expect(extractMonthDay('2022-11-14 10:00:00.0')).toBe('11-14');
      expect(extractMonthDay('2021-11-14 15:30:00.0')).toBe('11-14');
    });

    it('should extract consistent MM-DD across different years for anniversary matching', () => {
      const dates = [
        '2014-11-14 10:00:00.0',
        '2016-11-14 11:00:00.0',
        '2017-11-14 12:00:00.0',
        '2019-11-14 13:00:00.0',
        '2020-11-14 14:00:00.0',
        '2021-11-14 15:00:00.0',
        '2022-11-14 16:00:00.0',
        '2025-11-14 17:00:00.0',
      ];

      dates.forEach((date) => {
        expect(extractMonthDay(date)).toBe('11-14');
      });
    });
  });
});

describe('analyzePrototypesForServer - anniversaryCandidates', () => {
  describe('month-day filtering across years', () => {
    it('should include prototypes from different years with matching month-day in 3-day window', () => {
      const referenceDate = new Date('2025-11-14T12:00:00Z');

      const prototypes: NormalizedPrototype[] = [
        // Yesterday (11-13) - different years
        createMockPrototype({
          id: 1,
          releaseDate: '2020-11-13 10:00:00.0',
        }),
        createMockPrototype({
          id: 2,
          releaseDate: '2022-11-13 15:30:00.0',
        }),
        // Today (11-14) - different years
        createMockPrototype({
          id: 3,
          releaseDate: '2014-11-14 10:00:00.0',
        }),
        createMockPrototype({
          id: 4,
          releaseDate: '2021-11-14 12:00:00.0',
        }),
        createMockPrototype({
          id: 5,
          releaseDate: '2025-11-14 08:00:00.0',
        }),
        // Tomorrow (11-15) - different years
        createMockPrototype({
          id: 6,
          releaseDate: '2019-11-15 09:00:00.0',
        }),
        // Outside window
        createMockPrototype({
          id: 7,
          releaseDate: '2023-11-12 10:00:00.0',
        }),
        createMockPrototype({
          id: 8,
          releaseDate: '2023-11-16 10:00:00.0',
        }),
      ];

      const result = analyzePrototypesForServer(prototypes, { referenceDate });

      expect(result.anniversaryCandidates.mmdd).toHaveLength(6);
      expect(result.anniversaryCandidates.mmdd.map((p) => p.id).sort()).toEqual(
        [1, 2, 3, 4, 5, 6],
      );
    });

    it('should return correct metadata with 3-day UTC window', () => {
      const referenceDate = new Date('2025-11-14T12:00:00Z');
      const prototypes: NormalizedPrototype[] = [];

      const result = analyzePrototypesForServer(prototypes, { referenceDate });

      expect(result.anniversaryCandidates.metadata.computedAt).toBe(
        '2025-11-14T12:00:00.000Z',
      );
      expect(result.anniversaryCandidates.metadata.windowUTC.fromISO).toBe(
        '2025-11-13T00:00:00.000Z',
      );
      expect(result.anniversaryCandidates.metadata.windowUTC.toISO).toBe(
        '2025-11-15T23:59:59.999Z',
      );
    });

    it('should handle month boundaries correctly', () => {
      const referenceDate = new Date('2025-12-01T12:00:00Z'); // December 1st

      const prototypes: NormalizedPrototype[] = [
        // Yesterday (11-30)
        createMockPrototype({
          id: 1,
          releaseDate: '2020-11-30 10:00:00.0',
        }),
        // Today (12-01)
        createMockPrototype({
          id: 2,
          releaseDate: '2021-12-01 12:00:00.0',
        }),
        // Tomorrow (12-02)
        createMockPrototype({
          id: 3,
          releaseDate: '2022-12-02 09:00:00.0',
        }),
        // Outside window
        createMockPrototype({
          id: 4,
          releaseDate: '2023-11-29 10:00:00.0',
        }),
      ];

      const result = analyzePrototypesForServer(prototypes, { referenceDate });

      expect(result.anniversaryCandidates.mmdd).toHaveLength(3);
      expect(result.anniversaryCandidates.mmdd.map((p) => p.id).sort()).toEqual(
        [1, 2, 3],
      );
    });

    it('should handle year boundaries correctly', () => {
      const referenceDate = new Date('2025-01-01T12:00:00Z'); // January 1st

      const prototypes: NormalizedPrototype[] = [
        // Yesterday (12-31)
        createMockPrototype({
          id: 1,
          releaseDate: '2020-12-31 10:00:00.0',
        }),
        // Today (01-01)
        createMockPrototype({
          id: 2,
          releaseDate: '2021-01-01 12:00:00.0',
        }),
        // Tomorrow (01-02)
        createMockPrototype({
          id: 3,
          releaseDate: '2022-01-02 09:00:00.0',
        }),
      ];

      const result = analyzePrototypesForServer(prototypes, { referenceDate });

      expect(result.anniversaryCandidates.mmdd).toHaveLength(3);
      expect(result.anniversaryCandidates.mmdd.map((p) => p.id).sort()).toEqual(
        [1, 2, 3],
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty prototype list', () => {
      const referenceDate = new Date('2025-11-14T12:00:00Z');
      const result = analyzePrototypesForServer([], { referenceDate });

      expect(result.anniversaryCandidates.mmdd).toEqual([]);
    });

    it('should exclude prototypes with missing releaseDate', () => {
      const referenceDate = new Date('2025-11-14T12:00:00Z');

      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({
          id: 1,
          releaseDate: '2024-11-14 10:00:00.0',
        }),
        createMockPrototype({
          id: 2,
          releaseDate: '',
        }),
        createMockPrototype({
          id: 3,
          releaseDate: undefined as unknown as string,
        }),
      ];

      const result = analyzePrototypesForServer(prototypes, { referenceDate });

      expect(result.anniversaryCandidates.mmdd).toHaveLength(1);
      expect(result.anniversaryCandidates.mmdd[0].id).toBe(1);
    });

    it('should exclude prototypes with invalid releaseDate', () => {
      const referenceDate = new Date('2025-11-14T12:00:00Z');

      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({
          id: 1,
          releaseDate: '2024-11-14 10:00:00.0',
        }),
        createMockPrototype({
          id: 2,
          releaseDate: 'invalid-date',
        }),
      ];

      const result = analyzePrototypesForServer(prototypes, { referenceDate });

      expect(result.anniversaryCandidates.mmdd).toHaveLength(1);
      expect(result.anniversaryCandidates.mmdd[0].id).toBe(1);
    });
  });

  describe('candidate data structure', () => {
    it('should extract only necessary fields (id, title, releaseDate)', () => {
      const referenceDate = new Date('2025-11-14T12:00:00Z');

      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({
          id: 123,
          prototypeNm: 'Test Prototype',
          releaseDate: '2024-11-14 10:00:00.0',
          summary: 'This should not be included',
          tags: ['tag1', 'tag2'],
          awards: ['award1'],
        }),
      ];

      const result = analyzePrototypesForServer(prototypes, { referenceDate });

      expect(result.anniversaryCandidates.mmdd).toHaveLength(1);

      const candidate = result.anniversaryCandidates.mmdd[0];
      expect(candidate).toEqual({
        id: 123,
        title: 'Test Prototype',
        releaseDate: '2024-11-14 10:00:00.0',
      });

      // Ensure no extra fields
      expect(Object.keys(candidate)).toEqual(['id', 'title', 'releaseDate']);
    });
  });

  describe('realistic dataset (matching bug scenario)', () => {
    it('should return 69 candidates when 69 prototypes have 11-14 dates across different years', () => {
      const referenceDate = new Date('2025-11-14T12:00:00Z');

      const prototypes: NormalizedPrototype[] = [];

      // Year distribution from actual bug scenario
      const yearCounts = [
        { year: 2014, count: 1 },
        { year: 2016, count: 2 },
        { year: 2017, count: 1 },
        { year: 2019, count: 2 },
        { year: 2020, count: 6 },
        { year: 2021, count: 22 },
        { year: 2022, count: 34 },
        { year: 2025, count: 1 },
      ];

      let id = 1;
      yearCounts.forEach(({ year, count }) => {
        for (let i = 0; i < count; i++) {
          const hour = (10 + i) % 24;
          const minute = (i * 5) % 60;
          prototypes.push(
            createMockPrototype({
              id: id++,
              prototypeNm: `Prototype ${year}-${i}`,
              releaseDate: `${year}-11-14 ${hour
                .toString()
                .padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00.0`,
            }),
          );
        }
      });

      // Add some outside the window
      prototypes.push(
        createMockPrototype({
          id: id++,
          releaseDate: '2023-11-12 10:00:00.0',
        }),
      );
      prototypes.push(
        createMockPrototype({
          id: id++,
          releaseDate: '2023-11-16 10:00:00.0',
        }),
      );

      const result = analyzePrototypesForServer(prototypes, { referenceDate });

      // Should return exactly 69 candidates (all 11-14 dates)
      expect(result.anniversaryCandidates.mmdd).toHaveLength(69);

      // Verify distribution
      const by2014 = result.anniversaryCandidates.mmdd.filter((p) =>
        p.releaseDate.startsWith('2014-'),
      );
      const by2021 = result.anniversaryCandidates.mmdd.filter((p) =>
        p.releaseDate.startsWith('2021-'),
      );
      const by2022 = result.anniversaryCandidates.mmdd.filter((p) =>
        p.releaseDate.startsWith('2022-'),
      );

      expect(by2014).toHaveLength(1);
      expect(by2021).toHaveLength(22);
      expect(by2022).toHaveLength(34);
    });
  });
});

describe('analyzePrototypesForServer - core metrics', () => {
  it('should compute status, tag, team, and year distributions with rounded averages', () => {
    const referenceDate = new Date('2025-01-10T00:00:00Z');
    const logger = createMockLogger();

    const prototypes: NormalizedPrototype[] = [
      createMockPrototype({
        id: 1,
        status: 1,
        awards: ['Award X'],
        tags: ['Arduino', 'IoT'],
        teamNm: 'Team A',
        releaseDate: '2025-01-09T00:00:00Z',
      }),
      createMockPrototype({
        id: 2,
        status: 0,
        awards: [],
        tags: ['Arduino'],
        teamNm: 'Team B',
        releaseDate: '2025-01-08T00:00:00Z',
      }),
      createMockPrototype({
        id: 3,
        status: undefined,
        awards: undefined,
        tags: undefined,
        teamNm: '  Team A  ',
        releaseDate: '2024-12-31T00:00:00Z',
      }),
    ];

    const result = analyzePrototypesForServer(prototypes, {
      referenceDate,
      logger,
    });

    expect(logger.child).toHaveBeenCalledWith({
      action: 'analyzePrototypesForServer',
    });

    expect(result.totalCount).toBe(3);
    expect(result.statusDistribution).toEqual({ 0: 1, 1: 1, unknown: 1 });
    expect(result.prototypesWithAwards).toBe(1);
    expect(result.topTags).toEqual([
      { tag: 'Arduino', count: 2 },
      { tag: 'IoT', count: 1 },
    ]);
    expect(result.topTeams).toEqual([
      { team: 'Team A', count: 2 },
      { team: 'Team B', count: 1 },
    ]);
    expect(result.averageAgeInDays).toBe(4.33);
    expect(result.yearDistribution).toEqual({ 2024: 1, 2025: 2 });
    expect(result.analyzedAt).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  it('should log and return zeroed metrics for empty datasets', () => {
    const referenceDate = new Date('2025-11-14T12:00:00Z');
    const logger = createMockLogger();

    const result = analyzePrototypesForServer([], { referenceDate, logger });

    expect(logger.debug).toHaveBeenCalledWith(
      'No prototypes to analyze, returning empty analysis',
    );

    expect(result.totalCount).toBe(0);
    expect(result.statusDistribution).toEqual({});
    expect(result.prototypesWithAwards).toBe(0);
    expect(result.topTags).toEqual([]);
    expect(result.topTeams).toEqual([]);
    expect(result.averageAgeInDays).toBe(0);
    expect(result.yearDistribution).toEqual({});
    expect(result.anniversaryCandidates.mmdd).toEqual([]);
    expect(result.anniversaryCandidates.metadata.windowUTC).toEqual({
      fromISO: '2025-11-13T00:00:00.000Z',
      toISO: '2025-11-15T23:59:59.999Z',
    });
  });
});

describe('analyzePrototypesForServer - diagnostics and edge cases', () => {
  it('should ignore invalid or future release dates when computing average age', () => {
    const referenceDate = new Date('2025-03-10T00:00:00Z');
    const logger = createMockLogger();

    const prototypes: NormalizedPrototype[] = [
      createMockPrototype({
        id: 1,
        releaseDate: '2025-03-09T00:00:00Z',
      }),
      createMockPrototype({
        id: 2,
        releaseDate: 'invalid-date',
      }),
      createMockPrototype({
        id: 3,
        releaseDate: '2025-04-01T00:00:00Z',
      }),
    ];

    const result = analyzePrototypesForServer(prototypes, {
      referenceDate,
      logger,
    });

    // Only the first prototype should contribute (1 day old, rounded to 1)
    expect(result.averageAgeInDays).toBe(1);
  });

  it('should log dataset summary including min/max ISO dates', () => {
    const referenceDate = new Date('2025-11-14T12:00:00Z');
    const logger = createMockLogger();

    const prototypes: NormalizedPrototype[] = [
      createMockPrototype({ id: 1, releaseDate: '2023-05-01T00:00:00Z' }),
      createMockPrototype({ id: 2, releaseDate: '2022-03-15T00:00:00Z' }),
      createMockPrototype({ id: 3, releaseDate: '2024-07-20T12:34:56Z' }),
    ];

    analyzePrototypesForServer(prototypes, { referenceDate, logger });

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: expect.objectContaining({
          totalCount: 3,
          datasetMinISO: '2022-03-15T00:00:00.000Z',
          datasetMaxISO: '2024-07-20T12:34:56.000Z',
        }),
      }),
      'Server-side analysis completed (TZ-independent data only)',
    );
  });
});

describe('buildAnniversaryCandidates (direct unit tests)', () => {
  describe('3-day window calculation', () => {
    it('should build correct 3-day UTC window for middle of month', () => {
      const referenceDate = new Date('2025-11-14T15:30:45.123Z');
      const prototypes: NormalizedPrototype[] = [];

      const result = buildAnniversaryCandidates(prototypes, referenceDate);

      expect(result.metadata.computedAt).toBe('2025-11-14T15:30:45.123Z');
      expect(result.metadata.windowUTC.fromISO).toBe(
        '2025-11-13T00:00:00.000Z',
      );
      expect(result.metadata.windowUTC.toISO).toBe('2025-11-15T23:59:59.999Z');
    });

    it('should handle month boundaries (crossing from November to December)', () => {
      const referenceDate = new Date('2025-11-30T12:00:00Z');

      const result = buildAnniversaryCandidates([], referenceDate);

      expect(result.metadata.windowUTC.fromISO).toBe(
        '2025-11-29T00:00:00.000Z',
      );
      expect(result.metadata.windowUTC.toISO).toBe('2025-12-01T23:59:59.999Z');
    });

    it('should handle year boundaries (crossing from December to January)', () => {
      const referenceDate = new Date('2025-12-31T12:00:00Z');

      const result = buildAnniversaryCandidates([], referenceDate);

      expect(result.metadata.windowUTC.fromISO).toBe(
        '2025-12-30T00:00:00.000Z',
      );
      expect(result.metadata.windowUTC.toISO).toBe('2026-01-01T23:59:59.999Z');
    });

    it('should handle year boundaries (crossing from January to December)', () => {
      const referenceDate = new Date('2025-01-01T12:00:00Z');

      const result = buildAnniversaryCandidates([], referenceDate);

      expect(result.metadata.windowUTC.fromISO).toBe(
        '2024-12-31T00:00:00.000Z',
      );
      expect(result.metadata.windowUTC.toISO).toBe('2025-01-02T23:59:59.999Z');
    });

    it('should handle leap year February 29', () => {
      const referenceDate = new Date('2024-02-29T12:00:00Z');

      const result = buildAnniversaryCandidates([], referenceDate);

      expect(result.metadata.windowUTC.fromISO).toBe(
        '2024-02-28T00:00:00.000Z',
      );
      expect(result.metadata.windowUTC.toISO).toBe('2024-03-01T23:59:59.999Z');
    });
  });

  describe('month-day extraction and filtering', () => {
    it('should extract candidates by MM-DD pattern across different years', () => {
      const referenceDate = new Date('2025-06-15T12:00:00Z');

      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({ id: 1, releaseDate: '2020-06-14 10:00:00.0' }),
        createMockPrototype({ id: 2, releaseDate: '2021-06-15 11:00:00.0' }),
        createMockPrototype({ id: 3, releaseDate: '2022-06-16 12:00:00.0' }),
        createMockPrototype({ id: 4, releaseDate: '2023-06-13 09:00:00.0' }), // Outside
        createMockPrototype({ id: 5, releaseDate: '2023-06-17 13:00:00.0' }), // Outside
      ];

      const result = buildAnniversaryCandidates(prototypes, referenceDate);

      expect(result.mmdd).toHaveLength(3);
      expect(result.mmdd.map((p) => p.id).sort()).toEqual([1, 2, 3]);
    });

    it('should include same MM-DD from multiple years', () => {
      const referenceDate = new Date('2025-03-10T12:00:00Z');

      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({ id: 1, releaseDate: '2015-03-10 08:00:00.0' }),
        createMockPrototype({ id: 2, releaseDate: '2018-03-10 09:00:00.0' }),
        createMockPrototype({ id: 3, releaseDate: '2020-03-10 10:00:00.0' }),
        createMockPrototype({ id: 4, releaseDate: '2023-03-10 11:00:00.0' }),
        createMockPrototype({ id: 5, releaseDate: '2025-03-10 12:00:00.0' }),
      ];

      const result = buildAnniversaryCandidates(prototypes, referenceDate);

      expect(result.mmdd).toHaveLength(5);
      expect(result.mmdd.map((p) => p.id).sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should respect time zone independence (UTC-based extraction)', () => {
      const referenceDate = new Date('2025-08-20T23:59:59.999Z'); // End of day UTC

      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({ id: 1, releaseDate: '2024-08-20 00:00:00.0' }),
        createMockPrototype({ id: 2, releaseDate: '2024-08-20 23:59:59.999' }),
      ];

      const result = buildAnniversaryCandidates(prototypes, referenceDate);

      expect(result.mmdd).toHaveLength(2);
    });
  });

  describe('data minimization', () => {
    it('should extract only id, title, and releaseDate fields', () => {
      const referenceDate = new Date('2025-05-05T12:00:00Z');

      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({
          id: 999,
          prototypeNm: 'My Prototype',
          releaseDate: '2024-05-05 10:00:00.0',
          summary: 'Detailed summary (should be excluded)',
          tags: ['tag1', 'tag2'],
          awards: ['award1'],
          users: ['user1', 'user2'],
          teamNm: 'Team Name',
          status: 1,
        }),
      ];

      const result = buildAnniversaryCandidates(prototypes, referenceDate);

      expect(result.mmdd).toHaveLength(1);
      expect(result.mmdd[0]).toEqual({
        id: 999,
        title: 'My Prototype',
        releaseDate: '2024-05-05 10:00:00.0',
      });
      expect(Object.keys(result.mmdd[0])).toEqual([
        'id',
        'title',
        'releaseDate',
      ]);
    });

    it('should preserve exact releaseDate format', () => {
      const referenceDate = new Date('2025-07-07T12:00:00Z');

      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({
          id: 1,
          releaseDate: '2024-07-07 14:32:18.456',
        }),
        createMockPrototype({ id: 2, releaseDate: '2024-07-07T14:32:18.456Z' }),
      ];

      const result = buildAnniversaryCandidates(prototypes, referenceDate);

      expect(result.mmdd[0].releaseDate).toBe('2024-07-07 14:32:18.456');
      expect(result.mmdd[1].releaseDate).toBe('2024-07-07T14:32:18.456Z');
    });
  });

  describe('edge cases and error handling', () => {
    it('should return empty array for empty input', () => {
      const referenceDate = new Date('2025-09-09T12:00:00Z');

      const result = buildAnniversaryCandidates([], referenceDate);

      expect(result.mmdd).toEqual([]);
      expect(result.metadata.computedAt).toBeDefined();
    });

    it('should exclude prototypes with null or undefined releaseDate', () => {
      const referenceDate = new Date('2025-04-04T12:00:00Z');

      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({ id: 1, releaseDate: '2024-04-04 10:00:00.0' }),
        createMockPrototype({ id: 2, releaseDate: null as unknown as string }),
        createMockPrototype({
          id: 3,
          releaseDate: undefined as unknown as string,
        }),
        createMockPrototype({ id: 4, releaseDate: '' }),
      ];

      const result = buildAnniversaryCandidates(prototypes, referenceDate);

      expect(result.mmdd).toHaveLength(1);
      expect(result.mmdd[0].id).toBe(1);
    });

    it('should exclude prototypes with invalid releaseDate format', () => {
      const referenceDate = new Date('2025-02-02T12:00:00Z');

      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({ id: 1, releaseDate: '2024-02-02 10:00:00.0' }),
        createMockPrototype({ id: 2, releaseDate: 'not-a-date' }),
        createMockPrototype({ id: 3, releaseDate: '2024-13-02 10:00:00.0' }), // Invalid month
        createMockPrototype({ id: 4, releaseDate: '2024-02-32 10:00:00.0' }), // Invalid day
      ];

      const result = buildAnniversaryCandidates(prototypes, referenceDate);

      expect(result.mmdd).toHaveLength(1);
      expect(result.mmdd[0].id).toBe(1);
    });

    it('should handle prototypes at exact midnight boundaries', () => {
      const referenceDate = new Date('2025-10-10T12:00:00Z');

      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({ id: 1, releaseDate: '2024-10-09 00:00:00.0' }),
        createMockPrototype({
          id: 2,
          releaseDate: '2024-10-09 23:59:59.999',
        }),
        createMockPrototype({ id: 3, releaseDate: '2024-10-11 00:00:00.0' }),
        createMockPrototype({
          id: 4,
          releaseDate: '2024-10-11 23:59:59.999',
        }),
      ];

      const result = buildAnniversaryCandidates(prototypes, referenceDate);

      expect(result.mmdd).toHaveLength(4);
    });
  });

  describe('realistic data volumes', () => {
    it('should handle large dataset efficiently (1000 prototypes)', () => {
      const referenceDate = new Date('2025-06-15T12:00:00Z');
      const prototypes: NormalizedPrototype[] = [];
      const baseDate = new Date(Date.UTC(2024, 0, 1, 10, 0, 0));
      const dayMs = 24 * 60 * 60 * 1000;

      // Generate 1000 prototypes across different dates
      for (let i = 0; i < 1000; i++) {
        const date = new Date(baseDate.getTime() + i * dayMs);
        const isoDate = date.toISOString().slice(0, 10);
        prototypes.push(
          createMockPrototype({
            id: i,
            releaseDate: `${isoDate} 10:00:00.0`,
          }),
        );
      }

      const startTime = performance.now();
      const result = buildAnniversaryCandidates(prototypes, referenceDate);
      const elapsedMs = performance.now() - startTime;

      expect(elapsedMs).toBeLessThan(100); // Should complete in under 100ms
      expect(result.mmdd.length).toBeGreaterThan(0);
      expect(result.mmdd.length).toBeLessThan(100); // Only 3-day window
    });

    it('should handle scenario from bug report (69 prototypes with same MM-DD)', () => {
      const referenceDate = new Date('2025-11-14T12:00:00Z');
      const prototypes: NormalizedPrototype[] = [];

      // Replicate actual bug scenario distribution
      const yearDistribution = [
        { year: 2014, count: 1 },
        { year: 2016, count: 2 },
        { year: 2017, count: 1 },
        { year: 2019, count: 2 },
        { year: 2020, count: 6 },
        { year: 2021, count: 22 },
        { year: 2022, count: 34 },
        { year: 2025, count: 1 },
      ];

      let id = 1;
      yearDistribution.forEach(({ year, count }) => {
        for (let i = 0; i < count; i++) {
          prototypes.push(
            createMockPrototype({
              id: id++,
              prototypeNm: `11-14 Prototype from ${year} #${i + 1}`,
              releaseDate: `${year}-11-14 ${(10 + i) % 24}:${i % 60}:00.0`,
            }),
          );
        }
      });

      const result = buildAnniversaryCandidates(prototypes, referenceDate);

      expect(result.mmdd).toHaveLength(69);

      // Verify year distribution is preserved
      const by2022 = result.mmdd.filter((p) =>
        p.releaseDate.startsWith('2022-'),
      );
      expect(by2022).toHaveLength(34);

      const by2021 = result.mmdd.filter((p) =>
        p.releaseDate.startsWith('2021-'),
      );
      expect(by2021).toHaveLength(22);
    });
  });

  describe('metadata correctness', () => {
    it('should set computedAt to exact referenceDate', () => {
      const referenceDate = new Date('2025-12-25T18:45:30.789Z');

      const result = buildAnniversaryCandidates([], referenceDate);

      expect(result.metadata.computedAt).toBe('2025-12-25T18:45:30.789Z');
    });

    it('should generate consistent metadata for same referenceDate', () => {
      const referenceDate = new Date('2025-07-04T12:00:00Z');

      const result1 = buildAnniversaryCandidates([], referenceDate);
      const result2 = buildAnniversaryCandidates([], referenceDate);

      expect(result1.metadata).toEqual(result2.metadata);
    });

    it('should update metadata for different referenceDates', () => {
      const date1 = new Date('2025-01-01T00:00:00Z');
      const date2 = new Date('2025-12-31T23:59:59Z');

      const result1 = buildAnniversaryCandidates([], date1);
      const result2 = buildAnniversaryCandidates([], date2);

      expect(result1.metadata.computedAt).not.toBe(result2.metadata.computedAt);
      expect(result1.metadata.windowUTC).not.toEqual(
        result2.metadata.windowUTC,
      );
    });
  });

  describe('logging integration', () => {
    it('should log debug summary when logger is provided', () => {
      const referenceDate = new Date('2025-05-01T00:00:00Z');
      const logger = createMockLogger();

      const prototypes: NormalizedPrototype[] = [
        createMockPrototype({ id: 1, releaseDate: '2023-04-30T00:00:00Z' }),
        createMockPrototype({ id: 2, releaseDate: '2022-05-01T00:00:00Z' }),
      ];

      buildAnniversaryCandidates(prototypes, referenceDate, logger);

      expect(logger.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            computedAt: '2025-05-01T00:00:00.000Z',
          }),
          mmdd: expect.any(Array),
        }),
        'Built anniversary candidates',
      );
    });
  });
});
