import { describe, expect, it } from 'vitest';

import type { PrototypeForMpp } from '@/lib/api/prototypes';
import { buildTagAnalytics, buildTopTagsInRange } from './build-tag-analytics';

const createPrototype = (
  tags: string[] = [],
  releaseDate: string = new Date().toISOString(),
): PrototypeForMpp => ({
  id: Math.random(),
  prototypeNm: 'Proto',
  tags,
  teamNm: 'Team',
  users: ['User'],
  summary: '',
  status: 1,
  releaseFlg: 1,
  createId: 1,
  createDate: releaseDate,
  updateId: 1,
  updateDate: releaseDate,
  releaseDate: releaseDate,
  revision: 1,
  awards: [],
  freeComment: '',
  systemDescription: '',
  viewCount: 0,
  goodCount: 0,
  commentCount: 0,
  videoUrl: undefined,
  mainUrl: 'https://example.com',
  relatedLink: undefined,
  relatedLink2: undefined,
  relatedLink3: undefined,
  relatedLink4: undefined,
  relatedLink5: undefined,
  licenseType: 0,
  thanksFlg: 0,
  events: [],
  officialLink: undefined,
  materials: [],
});

describe('buildTagAnalytics', () => {
  it('counts tags and returns sorted top list', () => {
    const prototypes = [
      createPrototype(['A', 'B']),
      createPrototype(['A']),
      createPrototype(),
    ];

    const analytics = buildTagAnalytics(prototypes);

    expect(analytics.tagCounts).toEqual({ A: 2, B: 1 });
    expect(analytics.topTags[0]).toEqual({ tag: 'A', count: 2 });
  });
});

describe('buildTopTagsInRange', () => {
  it('counts every prototype when no bounds are given (all-time)', () => {
    const prototypes = [
      createPrototype(['A', 'B'], '2023-01-01T00:00:00Z'),
      createPrototype(['A', 'C'], '2024-01-01T00:00:00Z'),
    ];

    const result = buildTopTagsInRange(prototypes);

    expect(result).toEqual([
      { tag: 'A', count: 2 },
      { tag: 'B', count: 1 },
      { tag: 'C', count: 1 },
    ]);
  });

  it('includes only prototypes whose date is within [from, to] (inclusive)', () => {
    const prototypes = [
      createPrototype(['Old'], '2023-01-01T00:00:00Z'),
      createPrototype(['EdgeFrom'], '2024-06-01T00:00:00Z'),
      createPrototype(['Inside'], '2024-06-15T00:00:00Z'),
      createPrototype(['EdgeTo'], '2024-06-30T00:00:00Z'),
      createPrototype(['Future'], '2024-07-01T00:00:00Z'),
    ];

    const result = buildTopTagsInRange(prototypes, {
      from: new Date('2024-06-01T00:00:00Z'),
      to: new Date('2024-06-30T00:00:00Z'),
    });

    expect(result).toEqual([
      { tag: 'EdgeFrom', count: 1 },
      { tag: 'Inside', count: 1 },
      { tag: 'EdgeTo', count: 1 },
    ]);
  });

  it('supports an open-ended upper bound (from only): releaseDate >= from', () => {
    const prototypes = [
      createPrototype(['Old'], '2023-01-01T00:00:00Z'),
      createPrototype(['Recent'], '2024-06-15T00:00:00Z'),
    ];

    const result = buildTopTagsInRange(prototypes, {
      from: new Date('2024-01-01T00:00:00Z'),
    });

    expect(result).toEqual([{ tag: 'Recent', count: 1 }]);
  });

  it('supports an open-ended lower bound (to only): releaseDate <= to (inclusive)', () => {
    const prototypes = [
      createPrototype(['Ancient'], '2020-01-01T00:00:00Z'),
      createPrototype(['EdgeTo'], '2024-06-30T00:00:00Z'),
      createPrototype(['Future'], '2024-07-01T00:00:00Z'),
    ];

    const result = buildTopTagsInRange(prototypes, {
      to: new Date('2024-06-30T00:00:00Z'),
    });

    expect(result).toEqual([
      { tag: 'Ancient', count: 1 },
      { tag: 'EdgeTo', count: 1 },
    ]);
  });

  it('excludes a prototype missing the selected date field, without falling back to createDate', () => {
    const releaseless = {
      ...createPrototype(['FromCreate'], '2024-06-15T00:00:00Z'),
      releaseDate: null,
      createDate: '2024-06-15T00:00:00Z',
    } as unknown as PrototypeForMpp;

    const result = buildTopTagsInRange([releaseless], {
      from: new Date('2024-06-01T00:00:00Z'),
      to: new Date('2024-06-30T00:00:00Z'),
    });

    expect(result).toEqual([]);
  });

  it('respects the limit option', () => {
    const prototypes = [
      createPrototype(['A', 'A', 'B', 'C']),
      createPrototype(['A', 'B']),
    ];

    const result = buildTopTagsInRange(prototypes, { limit: 2 });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ tag: 'A', count: 3 });
    expect(result[1]).toEqual({ tag: 'B', count: 2 });
  });
});
