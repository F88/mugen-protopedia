import { describe, expect, it } from 'vitest';

import type { PrototypeForMpp } from '@/lib/api/prototypes';
import { buildMaterialInsights } from './build-material-insights';

const createPrototype = (
  materials: string[] = [],
  releaseDate: string = new Date().toISOString(),
): PrototypeForMpp => ({
  id: Math.random(),
  prototypeNm: 'Proto',
  tags: [],
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
  materials,
});

describe('buildMaterialInsights - The Monumental Elements', () => {
  it('ranks materials purely by total usage, regardless of temporal shape', () => {
    // "Gap" debuts early, skips a year, then dominates — it never qualifies for
    // Primordial (broken continuity) yet is by far the most used. This is the
    // exact case The Monumental Elements exists to surface (cf. M5Stack).
    const prototypes = [
      createPrototype(['Gap'], '2020-01-01T00:00:00Z'),
      // 2021 intentionally skipped for "Gap"
      ...Array.from({ length: 5 }, () =>
        createPrototype(['Gap'], '2022-01-01T00:00:00Z'),
      ),
      ...Array.from({ length: 3 }, () =>
        createPrototype(['Steady'], '2022-01-01T00:00:00Z'),
      ),
      createPrototype(['Rare'], '2022-01-01T00:00:00Z'),
    ];

    const { monumental } = buildMaterialInsights(prototypes);

    expect(monumental.map((m) => m.material)).toEqual([
      'Gap',
      'Steady',
      'Rare',
    ]);
    expect(monumental[0]).toMatchObject({
      material: 'Gap',
      count: 6,
      firstYear: 2020,
      lastYear: 2022,
    });
    // Series is aligned to the global year range (2020..2022): 1, 0 (gap), 5.
    expect(monumental[0].series).toEqual([1, 0, 5]);
  });

  it('breaks ties by earliest debut date, not material name', () => {
    const prototypes = [
      createPrototype(['Later'], '2023-06-01T00:00:00Z'),
      createPrototype(['Later'], '2023-07-01T00:00:00Z'),
      createPrototype(['Earlier'], '2023-01-01T00:00:00Z'),
      createPrototype(['Earlier'], '2023-02-01T00:00:00Z'),
    ];

    const { monumental } = buildMaterialInsights(prototypes);

    // Both have count 2; the earlier debut wins the higher slot.
    expect(monumental.map((m) => m.material)).toEqual(['Earlier', 'Later']);
  });

  it('returns an empty ranking when no material has a valid date', () => {
    const { monumental } = buildMaterialInsights([createPrototype([])]);
    expect(monumental).toEqual([]);
  });
});
