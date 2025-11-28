import { describe, expect, it } from 'vitest';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { buildAdvancedAnalysis } from './build-advanced-analysis';

const iso = (value: string) => new Date(value).toISOString();

const createPrototype = (
  overrides: Partial<NormalizedPrototype>,
): NormalizedPrototype => ({
  id: overrides.id ?? 1,
  prototypeNm: overrides.prototypeNm ?? 'Prototype',
  tags: overrides.tags ?? [],
  teamNm: overrides.teamNm ?? 'Team',
  users: overrides.users ?? ['Creator'],
  summary: overrides.summary ?? '',
  status: overrides.status ?? 1,
  releaseFlg: overrides.releaseFlg ?? 1,
  createId: overrides.createId ?? 1,
  createDate: overrides.createDate ?? iso('2023-01-01T00:00:00Z'),
  updateId: overrides.updateId ?? 1,
  updateDate: overrides.updateDate ?? iso('2023-01-02T00:00:00Z'),
  releaseDate: overrides.releaseDate ?? iso('2023-01-03T00:00:00Z'),
  revision: overrides.revision ?? 1,
  awards: overrides.awards ?? [],
  freeComment: overrides.freeComment ?? '',
  systemDescription: overrides.systemDescription ?? '',
  viewCount: overrides.viewCount ?? 0,
  goodCount: overrides.goodCount ?? 0,
  commentCount: overrides.commentCount ?? 0,
  videoUrl: overrides.videoUrl,
  mainUrl: overrides.mainUrl ?? 'https://example.com',
  relatedLink: overrides.relatedLink,
  relatedLink2: overrides.relatedLink2,
  relatedLink3: overrides.relatedLink3,
  relatedLink4: overrides.relatedLink4,
  relatedLink5: overrides.relatedLink5,
  licenseType: overrides.licenseType ?? 0,
  thanksFlg: overrides.thanksFlg ?? 0,
  events: overrides.events ?? [],
  officialLink: overrides.officialLink,
  materials: overrides.materials ?? [],
});

describe('buildAdvancedAnalysis', () => {
  it('aggregates advanced insights across prototypes', () => {
    const prototypes: NormalizedPrototype[] = [
      createPrototype({
        id: 1,
        prototypeNm: 'First Light',
        teamNm: 'Team One',
        users: ['Alice'],
        tags: ['AI', 'Fun'],
        createDate: iso('2023-12-30T00:00:00Z'),
        releaseDate: iso('2023-12-31T15:00:00Z'),
        updateDate: iso('2024-01-05T00:00:00Z'),
        events: ['GameJam'],
      }),
      createPrototype({
        id: 2,
        prototypeNm: 'Early Bird',
        teamNm: 'Team Two',
        users: ['Bob'],
        tags: ['AI', 'Robotics'],
        createDate: iso('2021-07-06T15:00:00Z'),
        releaseDate: iso('2023-07-06T15:00:00Z'),
        updateDate: iso('2023-07-07T15:00:00Z'),
        events: [],
      }),
      createPrototype({
        id: 3,
        prototypeNm: 'Art Spark',
        teamNm: '',
        users: ['Charlie'],
        tags: ['Art'],
        createDate: iso('2023-07-01T15:00:00Z'),
        releaseDate: iso('2023-07-06T15:00:00Z'),
        updateDate: iso('2023-07-06T15:00:00Z'),
        events: ['GameJam', 'Expo'],
      }),
      createPrototype({
        id: 4,
        prototypeNm: 'Noon Build',
        teamNm: 'Team Four',
        users: ['Dana'],
        tags: ['Art'],
        createDate: iso('2023-07-15T03:00:00Z'),
        releaseDate: iso('2023-08-01T03:00:00Z'),
        updateDate: iso('2023-08-10T03:00:00Z'),
        events: [],
      }),
    ];

    const result = buildAdvancedAnalysis(prototypes, [
      { tag: 'AI', count: 10 },
      { tag: 'Art', count: 5 },
    ]);

    expect(result.firstPenguins[0]).toMatchObject({
      year: 2024,
      prototype: {
        id: 1,
        title: 'First Light',
        releaseDate: iso('2023-12-31T15:00:00Z'),
        user: 'Team One',
      },
    });
    expect(result.firstPenguins[1]).toMatchObject({
      year: 2023,
      prototype: {
        id: 2,
        title: 'Early Bird',
      },
    });

    expect(result.starAlignments).toHaveLength(1);
    expect(result.starAlignments[0].timestamp).toBe(
      iso('2023-07-06T15:00:00Z'),
    );
    expect(result.starAlignments[0].prototypes.map((p) => p.id)).toEqual([
      2, 3,
    ]);

    expect(result.anniversaryEffect[0]).toMatchObject({
      name: 'Tanabata',
      count: 2,
    });
    expect(result.anniversaryEffect[1]).toMatchObject({
      name: "New Year's Day",
      count: 1,
    });

    expect(result.earlyAdopters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tag: 'AI', prototypeId: 2 }),
        expect.objectContaining({ tag: 'Art', prototypeId: 3 }),
      ]),
    );

    expect(result.laborOfLove.longestGestation[0].id).toBe(2);
    expect(result.laborOfLove.distribution['Over 1 year']).toBe(1);
    expect(result.laborOfLove.distribution['1 week - 1 month']).toBe(1);
    expect(result.laborOfLove.distribution['Less than 1 week']).toBe(2);

    expect(result.maternityHospital.topEvents[0]).toMatchObject({
      event: 'GameJam',
      count: 2,
    });
    expect(result.maternityHospital.independentRatio).toBeCloseTo(0.5, 5);

    expect(result.powerOfDeadlines.spikes[0]).toMatchObject({
      date: '2023-07-07',
      count: 2,
      score: 2,
    });

    expect(result.weekendWarrior).toMatchObject({
      totalWeekendCount: 1,
    });
    expect(result.weekendWarrior.weekendHourlyCounts[54]).toBe(1);

    expect(result.holyDay.topDays[0]).toMatchObject({
      date: '07-07',
      count: 2,
    });

    expect(result.longTermEvolution.longestMaintenance[0].id).toBe(4);
    expect(result.longTermEvolution.averageMaintenanceDays).toBeCloseTo(
      14 / 3,
      5,
    );
    expect(result.longTermEvolution.maintenanceRatio).toBeCloseTo(0.75, 5);
  });
});
