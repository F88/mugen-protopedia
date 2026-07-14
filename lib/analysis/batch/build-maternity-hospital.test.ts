import { describe, expect, it } from 'vitest';

import type { PrototypeForMpp } from '@/lib/api/prototypes';
import { buildAdvancedAnalysis } from './build-advanced-analysis';
import { buildMaternityHospital } from './build-maternity-hospital';

const iso = (value: string) => new Date(value).toISOString();

const createPrototype = (
  overrides: Partial<PrototypeForMpp>,
): PrototypeForMpp => ({
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

describe('buildMaternityHospital', () => {
  const prototypes: PrototypeForMpp[] = [
    createPrototype({ id: 1, events: ['GameJam'] }),
    createPrototype({ id: 2, events: ['GameJam', 'Hackathon'] }),
    createPrototype({ id: 3, events: [] }), // independent
    createPrototype({ id: 4, events: ['Hackathon'] }),
    // Invalid (empty) releaseDate -> excluded from the denominator and counts.
    createPrototype({ id: 5, events: ['GameJam'], releaseDate: '' }),
  ];

  it('counts events and the independent ratio over release-valid prototypes', () => {
    const result = buildMaternityHospital(prototypes);

    expect(result.topEvents).toEqual([
      { event: 'GameJam', count: 2 },
      { event: 'Hackathon', count: 2 },
    ]);
    // 4 release-valid prototypes, 1 without events -> 1/4.
    expect(result.independentRatio).toBeCloseTo(0.25, 5);
  });

  it('excludes prototypes without a valid releaseDate', () => {
    const result = buildMaternityHospital(prototypes);
    // The id:5 prototype (no releaseDate) must not add its GameJam event.
    const gameJam = result.topEvents.find((e) => e.event === 'GameJam');
    expect(gameJam?.count).toBe(2);
  });

  it('matches buildAdvancedAnalysis.maternityHospital exactly (no drift)', () => {
    const standalone = buildMaternityHospital(prototypes);
    const advanced = buildAdvancedAnalysis(prototypes, []).maternityHospital;
    expect(standalone).toEqual(advanced);
  });
});
