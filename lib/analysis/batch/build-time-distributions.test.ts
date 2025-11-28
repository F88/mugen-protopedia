import { describe, expect, it } from 'vitest';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { buildTimeDistributions } from './build-time-distributions';

const iso = (value: string) => new Date(value).toISOString();

const createPrototype = (
  overrides: Partial<NormalizedPrototype>,
): NormalizedPrototype => ({
  id: overrides.id ?? 1,
  prototypeNm: overrides.prototypeNm ?? 'Prototype',
  tags: overrides.tags ?? [],
  teamNm: overrides.teamNm ?? 'Team',
  users: overrides.users ?? ['User'],
  summary: overrides.summary ?? '',
  status: overrides.status ?? 1,
  releaseFlg: overrides.releaseFlg ?? 1,
  createId: overrides.createId ?? 1,
  createDate: overrides.createDate ?? iso('2023-07-01T00:00:00Z'),
  updateId: overrides.updateId ?? 1,
  updateDate: overrides.updateDate ?? iso('2023-07-02T00:00:00Z'),
  releaseDate: overrides.releaseDate ?? iso('2023-07-03T00:00:00Z'),
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

describe('buildTimeDistributions', () => {
  it('bucketizes create, release, and update activity in JST', () => {
    const prototypes: NormalizedPrototype[] = [
      createPrototype({
        id: 1,
        prototypeNm: 'Sunrise',
        teamNm: 'Alpha',
        users: ['Alice'],
        createDate: iso('2023-07-01T00:00:00Z'),
        releaseDate: iso('2023-07-02T03:00:00Z'),
        updateDate: iso('2023-07-03T12:00:00Z'),
      }),
      createPrototype({
        id: 2,
        prototypeNm: 'Starlight',
        teamNm: 'Bravo',
        users: ['Bob'],
        createDate: iso('2023-07-05T15:00:00Z'),
        releaseDate: iso('2023-07-06T15:00:00Z'),
        updateDate: '',
      }),
    ];

    const result = buildTimeDistributions(prototypes);

    expect(result.createTimeDistribution.dayOfWeek[6]).toBe(1);
    expect(result.createTimeDistribution.dayOfWeek[4]).toBe(1);
    expect(result.createTimeDistribution.hour[9]).toBe(1);
    expect(result.createTimeDistribution.hour[0]).toBe(1);
    expect(result.createTimeDistribution.heatmap[6][9]).toBe(1);
    expect(result.createTimeDistribution.heatmap[4][0]).toBe(1);

    expect(result.releaseTimeDistribution.dayOfWeek[0]).toBe(1);
    expect(result.releaseTimeDistribution.dayOfWeek[5]).toBe(1);
    expect(result.releaseTimeDistribution.hour[12]).toBe(1);
    expect(result.releaseTimeDistribution.hour[0]).toBe(1);
    expect(result.releaseDateDistribution.month[6]).toBe(2);
    expect(result.releaseDateDistribution.year[2023]).toBe(2);
    expect(result.releaseDateDistribution.daily[2023][7][2]).toBe(1);
    expect(result.releaseDateDistribution.daily[2023][7][7]).toBe(1);

    expect(result.updateTimeDistribution.dayOfWeek[1]).toBe(1);
    expect(result.updateTimeDistribution.hour[21]).toBe(1);
    expect(result.updateTimeDistribution.heatmap[1][21]).toBe(1);
    expect(result.updateDateDistribution.month[6]).toBe(1);
    expect(result.updateDateDistribution.year[2023]).toBe(1);
    expect(result.updateDateDistribution.daily[2023][7][3]).toBe(1);
  });
});
