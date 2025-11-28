import { describe, expect, it } from 'vitest';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import {
  buildDateBasedPrototypeInsights,
  createDateBasedPrototypeInsights,
  trackDateBasedPrototypeInsights,
} from './collect-unique-release-dates';

const toIso = (input: string) => new Date(input).toISOString();

const createPrototype = (
  overrides: Partial<NormalizedPrototype>,
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
  updateDate: overrides.updateDate ?? toIso('2024-11-02T00:00:00Z'),
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

describe('trackDateBasedPrototypeInsights', () => {
  it('tracks keys into the matching set', () => {
    const insights = createDateBasedPrototypeInsights();
    trackDateBasedPrototypeInsights(
      insights,
      {
        iso: toIso('2024-11-01T00:00:00Z'),
        timestampMs: Date.parse('2024-11-01T00:00:00Z'),
        year: 2024,
        mmdd: '11-01',
        yyyymmdd: '2024-11-01',
        weekday: 5,
        hour: 9,
      },
      'create',
    );
    expect(insights.uniqueCreateDates.has('2024-11-01')).toBe(true);
  });
});

describe('buildDateBasedPrototypeInsights', () => {
  it('collects unique dates for create, update, and release', () => {
    const insights = buildDateBasedPrototypeInsights([
      createPrototype({
        id: 1,
        createDate: toIso('2024-11-01T00:00:00Z'),
        updateDate: toIso('2024-11-02T00:00:00Z'),
        releaseDate: toIso('2024-11-03T00:00:00Z'),
      }),
      createPrototype({
        id: 2,
        createDate: toIso('2024-11-01T12:00:00Z'),
        updateDate: toIso('2024-11-02T12:00:00Z'),
        releaseDate: toIso('2024-11-03T12:00:00Z'),
      }),
    ]);

    expect(insights.uniqueCreateDates.size).toBe(1);
    expect(insights.uniqueUpdateDates.size).toBe(1);
    expect(insights.uniqueReleaseDates.size).toBe(1);
    expect(insights.uniqueReleaseDates.has('2024-11-03')).toBe(true);
  });
});
