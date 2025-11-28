import { describe, expect, it } from 'vitest';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { buildCoreSummaries } from './build-core-summaries';

const toIso = (input: string) => new Date(input).toISOString();

const createPrototype = (
  overrides: Partial<NormalizedPrototype> = {},
): NormalizedPrototype => ({
  id: overrides.id ?? 1,
  prototypeNm: overrides.prototypeNm ?? 'Proto',
  tags: overrides.tags ?? [],
  teamNm: overrides.teamNm ?? 'Team',
  users: overrides.users ?? ['User'],
  summary: overrides.summary ?? '',
  status: overrides.status ?? 1,
  releaseFlg: overrides.releaseFlg ?? 1,
  createId: overrides.createId ?? 1,
  createDate: overrides.createDate ?? toIso('2024-11-01T00:00:00Z'),
  updateId: overrides.updateId ?? 1,
  updateDate: overrides.updateDate ?? toIso('2024-11-04T00:00:00Z'),
  releaseDate: overrides.releaseDate ?? toIso('2024-11-03T00:00:00Z'),
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

describe('buildCoreSummaries', () => {
  it('aggregates statuses, awards, and average age', () => {
    const prototypes = [
      createPrototype({ id: 1, status: 2, awards: ['A'] }),
      createPrototype({
        id: 2,
        status: 2,
        releaseDate: toIso('2024-11-02T00:00:00Z'),
      }),
      createPrototype({ id: 3, status: 3, releaseDate: 'invalid-date' }),
    ];

    const referenceDate = new Date('2024-11-05T00:00:00Z');
    const summaries = buildCoreSummaries(prototypes, { referenceDate });

    expect(summaries.statusDistribution).toEqual({ '2': 2, '3': 1 });
    expect(summaries.prototypesWithAwards).toBe(1);
    expect(summaries.validAgeSampleCount).toBe(2);
    expect(summaries.averageAgeInDays).toBeCloseTo(2.5);
  });

  it('handles empty prototype list', () => {
    const summaries = buildCoreSummaries([], { referenceDate: new Date() });
    expect(summaries).toEqual({
      statusDistribution: {},
      prototypesWithAwards: 0,
      averageAgeInDays: 0,
      validAgeSampleCount: 0,
    });
  });
});
