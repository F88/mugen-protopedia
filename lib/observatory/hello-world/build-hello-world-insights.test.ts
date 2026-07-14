import { describe, expect, it } from 'vitest';

import type { PrototypeForMpp } from '@/lib/api/prototypes';
import { buildMaternityHospital } from '@/lib/analysis/batch';
import { buildHelloWorldInsights } from './build-hello-world-insights';

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

describe('buildHelloWorldInsights', () => {
  const now = new Date('2024-01-15T03:00:00Z');
  const prototypes = [
    createPrototype({
      id: 1,
      tags: ['AI'],
      materials: ['Arduino'],
      events: ['GameJam'],
      releaseDate: iso('2023-07-07T03:00:00Z'),
    }),
    createPrototype({
      id: 2,
      tags: ['Art'],
      materials: ['Arduino', 'Servo'],
      releaseDate: iso('2024-01-01T03:00:00Z'),
    }),
  ];

  it('composes all fields the Hello World page consumes', () => {
    const result = buildHelloWorldInsights(prototypes, now);

    // Advanced (spread) fields.
    expect(result).toHaveProperty('firstPenguins');
    expect(result).toHaveProperty('earlyAdopters');
    expect(result).toHaveProperty('laborOfLove');
    expect(result).toHaveProperty('starAlignments');
    expect(result).toHaveProperty('anniversaryEffect');
    expect(result).toHaveProperty('powerOfDeadlines');
    expect(result).toHaveProperty('weekendWarrior');
    expect(result).toHaveProperty('holyDay');
    expect(result).toHaveProperty('longTermEvolution');
    expect(result).toHaveProperty('evolutionSpan');
    expect(result).toHaveProperty('maternityHospital');

    // Shared distributions / materials / streak / candidates.
    expect(result.releaseTimeDistribution.hour).toHaveLength(24);
    expect(result.updateTimeDistribution.hour).toHaveLength(24);
    expect(result.releaseDateDistribution.month).toHaveLength(12);
    expect(result.updateDateDistribution.month).toHaveLength(12);
    expect(result.topMaterials.length).toBeGreaterThan(0);
    expect(result.yearlyTopMaterials).toBeTypeOf('object');
    expect(result.creationStreak).toHaveProperty('longestStreak');
    expect(result.anniversaryCandidates).toHaveProperty('mmdd');
  });

  it('maternityHospital matches the standalone home builder', () => {
    const result = buildHelloWorldInsights(prototypes, now);
    expect(result.maternityHospital).toEqual(
      buildMaternityHospital(prototypes),
    );
  });
});
