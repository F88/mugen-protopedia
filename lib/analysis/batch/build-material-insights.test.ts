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

describe('buildMaterialInsights - yearly / monthly top materials', () => {
  it('ranks each year independently of the all-time totals', () => {
    const prototypes = [
      // 2020: A x5, B x1  -> A leads 2020 (and is the all-time leader: A=6, B=4)
      ...Array.from({ length: 5 }, () =>
        createPrototype(['A'], '2020-05-01T00:00:00Z'),
      ),
      createPrototype(['B'], '2020-06-01T00:00:00Z'),
      // 2021: B x3, A x1  -> B leads 2021 even though A leads overall
      ...Array.from({ length: 3 }, () =>
        createPrototype(['B'], '2021-05-01T00:00:00Z'),
      ),
      createPrototype(['A'], '2021-06-01T00:00:00Z'),
    ];

    const { yearlyTopMaterials } = buildMaterialInsights(prototypes);

    expect(yearlyTopMaterials['2020'].map((m) => m.material)).toEqual([
      'A',
      'B',
    ]);
    expect(yearlyTopMaterials['2020'][0]).toEqual({ material: 'A', count: 5 });
    // Independence: B tops 2021 despite A being the all-time leader.
    expect(yearlyTopMaterials['2021'].map((m) => m.material)).toEqual([
      'B',
      'A',
    ]);
  });

  it('ranks each month independently, keyed by YYYY-MM', () => {
    const prototypes = [
      ...Array.from({ length: 2 }, () =>
        createPrototype(['A'], '2022-03-10T00:00:00Z'),
      ),
      createPrototype(['B'], '2022-03-20T00:00:00Z'),
      createPrototype(['A'], '2022-04-05T00:00:00Z'),
      ...Array.from({ length: 2 }, () =>
        createPrototype(['B'], '2022-04-15T00:00:00Z'),
      ),
    ];

    const { monthlyTopMaterials } = buildMaterialInsights(prototypes);

    expect(monthlyTopMaterials['2022-03'].map((m) => m.material)).toEqual([
      'A',
      'B',
    ]);
    expect(monthlyTopMaterials['2022-04'].map((m) => m.material)).toEqual([
      'B',
      'A',
    ]);
  });

  it('breaks per-period ties by earliest debut date, not material name', () => {
    // Both have count 1 in 2023; "Zeta" debuted before "Alpha".
    const prototypes = [
      createPrototype(['Zeta'], '2023-01-01T00:00:00Z'),
      createPrototype(['Alpha'], '2023-02-01T00:00:00Z'),
    ];

    const { yearlyTopMaterials } = buildMaterialInsights(prototypes);

    expect(yearlyTopMaterials['2023'].map((m) => m.material)).toEqual([
      'Zeta',
      'Alpha',
    ]);
  });
});
