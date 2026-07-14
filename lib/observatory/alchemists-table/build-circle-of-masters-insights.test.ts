import { describe, expect, it } from 'vitest';

import type { PrototypeForMpp } from '@/lib/api/prototypes';
import { buildCircleOfMastersInsights } from './build-circle-of-masters-insights';
import { buildCircleInsights } from './build-circle-insights';
import { buildUserInsights } from './blocks/build-user-insights';
import { buildPioneerMaterialsByUser } from './build-chronicles-insights';

const createPrototype = (
  overrides: Partial<PrototypeForMpp> = {},
): PrototypeForMpp => ({
  id: 0,
  prototypeNm: 'Proto',
  tags: [],
  teamNm: '',
  users: ['User'],
  summary: '',
  status: 1,
  releaseFlg: 1,
  createId: 1,
  createDate: '2020-06-01T00:00:00Z',
  updateId: 1,
  updateDate: '2020-06-01T00:00:00Z',
  releaseDate: '2020-06-01T00:00:00Z',
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
  ...overrides,
});

// One eligible maker (>= minWorks of 5) using materials, plus a lighter maker,
// so the seats actually populate and the parity check is not vacuous.
const prototypes: PrototypeForMpp[] = [
  ...Array.from({ length: 6 }, (_, i) =>
    createPrototype({
      id: i + 1,
      users: ['Alice'],
      materials: ['M5Stack', 'Arduino'],
      releaseDate: `2020-0${i + 1}-01T00:00:00Z`,
    }),
  ),
  createPrototype({
    id: 7,
    users: ['Bob'],
    materials: ['ChatGPT'],
    releaseDate: '2023-01-01T00:00:00Z',
  }),
];

describe('buildCircleOfMastersInsights', () => {
  it('matches composing the underlying blocks with the Circle seat tuning', () => {
    // Drift guard: the facade must stay equivalent to the manual composition it
    // replaced in the repository (minWorks 5 / rateFloor 5 / podium 20).
    const manual = buildCircleInsights(buildUserInsights(prototypes), {
      pioneerMaterialsByUser: buildPioneerMaterialsByUser(prototypes),
      minWorks: 5,
      rateFloor: 5,
      podium: 20,
    });

    expect(buildCircleOfMastersInsights(prototypes)).toEqual(manual);
  });

  it('produces a non-empty seating for eligible makers', () => {
    const insights = buildCircleOfMastersInsights(prototypes);

    // Alice has 6 works (>= minWorks), so she is seated somewhere.
    expect(insights.polymath.length).toBeGreaterThan(0);
  });
});
