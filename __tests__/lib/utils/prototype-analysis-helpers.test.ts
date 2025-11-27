import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import type { NormalizedPrototype } from '@/lib/api/prototypes';
import {
  buildAnniversaries,
  buildAnniversarySlice,
  buildStatusDistribution,
  buildTopTags,
  buildTopTeams,
  buildYearDistribution,
  computeAverageAgeInDays,
  countPrototypesWithAwards,
} from '@/lib/analysis';

function createPrototype(
  overrides: Partial<NormalizedPrototype> = {},
): NormalizedPrototype {
  const nowISO = new Date().toISOString();
  return {
    id: 1,
    prototypeNm: 'Test Prototype',
    summary: 'Summary',
    status: 1,
    releaseFlg: 1,
    createDate: nowISO,
    updateDate: nowISO,
    releaseDate: nowISO,
    revision: 1,
    freeComment: '',
    teamNm: 'Team Alpha',
    users: ['Alice'],
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
  } satisfies NormalizedPrototype;
}

describe('prototype-analysis helpers', () => {
  describe('buildStatusDistribution', () => {
    it('counts statuses and falls back to unknown', () => {
      const prototypes = [
        createPrototype({ id: 1, status: 1 }),
        createPrototype({ id: 2, status: 1 }),
        createPrototype({ id: 3, status: 0 }),
        createPrototype({ id: 4, status: undefined as unknown as number }),
      ];

      const distribution = buildStatusDistribution(prototypes);

      expect(distribution).toEqual({ 0: 1, 1: 2, unknown: 1 });
    });
  });

  describe('countPrototypesWithAwards', () => {
    it('counts only prototypes that contain awards', () => {
      const prototypes = [
        createPrototype({ awards: ['Award A'] }),
        createPrototype({ awards: ['Award B', 'Award C'] }),
        createPrototype({ awards: [] }),
        createPrototype({ awards: undefined }),
      ];

      expect(countPrototypesWithAwards(prototypes)).toBe(2);
    });
  });

  describe('buildTopTags', () => {
    it('returns aggregated tag counts sorted desc', () => {
      const prototypes: NormalizedPrototype[] = [];
      for (let i = 0; i < 12; i += 1) {
        prototypes.push(
          createPrototype({
            id: i + 1,
            tags: [`tag-${i}`, `tag-${i}`, 'shared'],
          }),
        );
      }

      const { topTags, tagCounts } = buildTopTags(prototypes);

      expect(topTags).toHaveLength(13);
      expect(topTags[0]).toEqual({ tag: 'shared', count: 12 });
      expect(tagCounts['tag-0']).toBe(2);
    });

    it('limits the result to top 30 tags', () => {
      const prototypes: NormalizedPrototype[] = [];
      // Create 35 unique tags
      for (let i = 0; i < 35; i += 1) {
        prototypes.push(
          createPrototype({
            id: i + 1,
            tags: [`unique-tag-${i}`],
          }),
        );
      }

      const { topTags } = buildTopTags(prototypes);

      expect(topTags).toHaveLength(30);
    });
  });

  describe('computeAverageAgeInDays', () => {
    it('computes the average age ignoring invalid dates', () => {
      const referenceDate = new Date('2024-03-10T00:00:00Z');
      const prototypes = [
        createPrototype({ releaseDate: '2024-03-09T00:00:00Z' }),
        createPrototype({ releaseDate: '2024-03-05T00:00:00Z' }),
        createPrototype({ releaseDate: 'invalid-date' }),
      ];

      const average = computeAverageAgeInDays(prototypes, referenceDate);

      expect(average).toBeCloseTo(3, 5);
    });
  });

  describe('buildYearDistribution', () => {
    it('groups by release year and ignores invalid entries', () => {
      const prototypes = [
        createPrototype({ releaseDate: '2020-01-01T00:00:00Z' }),
        createPrototype({ releaseDate: '2020-06-01T00:00:00Z' }),
        createPrototype({ releaseDate: '2019-01-01T00:00:00Z' }),
        createPrototype({ releaseDate: 'invalid-date' }),
        createPrototype({ releaseDate: '1800-01-01T00:00:00Z' }),
      ];

      const distribution = buildYearDistribution(prototypes);

      expect(distribution).toEqual({ 2019: 1, 2020: 2 });
    });
  });

  describe('buildTopTeams', () => {
    it('normalizes whitespace and limits to top 10 teams', () => {
      const prototypes = [
        createPrototype({ teamNm: 'Team A' }),
        createPrototype({ teamNm: 'Team A ' }),
        createPrototype({ teamNm: ' Team B ' }),
        createPrototype({ teamNm: ' ' }),
        createPrototype({ teamNm: '' }),
      ];

      const { topTeams, teamCounts } = buildTopTeams(prototypes);

      expect(topTeams).toEqual([
        { team: 'Team A', count: 2 },
        { team: 'Team B', count: 1 },
      ]);
      expect(Object.keys(teamCounts)).toHaveLength(2);
    });
  });

  describe('buildAnniversaries', () => {
    const fixedNow = new Date('2024-03-10T10:00:00Z');

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(fixedNow);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('identifies birthday and newborn prototypes based on current day', () => {
      const prototypes = [
        createPrototype({
          id: 1,
          prototypeNm: 'Birthday',
          releaseDate: '2022-03-10T00:00:00Z',
        }),
        createPrototype({
          id: 2,
          prototypeNm: 'Newborn',
          releaseDate: '2024-03-10T05:00:00Z',
        }),
        createPrototype({
          id: 3,
          prototypeNm: 'Irrelevant',
          releaseDate: '2023-04-01T00:00:00Z',
        }),
      ];

      const { birthdayPrototypes, newbornPrototypes } =
        buildAnniversaries(prototypes);

      expect(birthdayPrototypes).toEqual([
        {
          id: 1,
          title: 'Birthday',
          years: 2,
          releaseDate: '2022-03-10T00:00:00Z',
        },
      ]);
      expect(newbornPrototypes).toEqual([
        {
          id: 2,
          title: 'Newborn',
          releaseDate: '2024-03-10T05:00:00Z',
        },
      ]);
    });
  });

  describe('buildAnniversarySlice', () => {
    it('summarizes birthday and newborn lists', () => {
      const slice = buildAnniversarySlice(
        [{ id: 1, title: 'Birthday', years: 4, releaseDate: '2020-01-01' }],
        [{ id: 2, title: 'Newborn', releaseDate: '2024-03-10T00:00:00Z' }],
      );

      expect(slice).toEqual({
        birthdayCount: 1,
        birthdayPrototypes: [
          { id: 1, title: 'Birthday', years: 4, releaseDate: '2020-01-01' },
        ],
        newbornCount: 1,
        newbornPrototypes: [
          { id: 2, title: 'Newborn', releaseDate: '2024-03-10T00:00:00Z' },
        ],
      });
    });
  });
});
