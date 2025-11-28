import { describe, expect, it } from 'vitest';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { buildMaterialAnalytics } from './build-material-analytics';

const createPrototype = (materials: string[] = []): NormalizedPrototype => ({
  id: Math.random(),
  prototypeNm: 'Proto',
  tags: [],
  teamNm: 'Team',
  users: ['User'],
  summary: '',
  status: 1,
  releaseFlg: 1,
  createId: 1,
  createDate: new Date().toISOString(),
  updateId: 1,
  updateDate: new Date().toISOString(),
  releaseDate: new Date().toISOString(),
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

describe('buildMaterialAnalytics', () => {
  it('aggregates material usage counts and top materials', () => {
    const prototypes = [
      createPrototype(['A', 'B']),
      createPrototype(['A', 'C']),
      createPrototype(),
    ];

    const analytics = buildMaterialAnalytics(prototypes);

    expect(analytics.materialCounts).toEqual({ A: 2, B: 1, C: 1 });
    expect(analytics.topMaterials[0]).toEqual({ material: 'A', count: 2 });
  });
});
