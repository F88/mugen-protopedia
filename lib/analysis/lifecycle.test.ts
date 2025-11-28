import { describe, expect, it } from 'vitest';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import {
  createLifecycleMomentContext,
  createPrototypeLifecycleContext,
} from './lifecycle';

const toIso = (date: string) => new Date(date).toISOString();

describe('createLifecycleMomentContext', () => {
  it('returns null for invalid input', () => {
    expect(createLifecycleMomentContext('invalid-date')).toBeNull();
  });

  it('normalizes timestamps into JST-based fields', () => {
    const iso = toIso('2024-11-28T15:00:00Z');
    const moment = createLifecycleMomentContext(iso);
    expect(moment).toMatchObject({
      iso,
      yyyymmdd: '2024-11-29',
      mmdd: '11-29',
      weekday: 5,
      hour: 0,
    });
    expect(moment?.timestampMs).toBe(new Date(iso).getTime());
  });
});

describe('createPrototypeLifecycleContext', () => {
  const basePrototype: NormalizedPrototype = {
    id: 1,
    prototypeNm: 'Example',
    tags: [],
    teamNm: 'Team',
    users: ['User'],
    summary: 'summary',
    status: 1,
    releaseFlg: 1,
    createId: 1,
    createDate: toIso('2024-11-01T00:00:00Z'),
    updateId: 2,
    updateDate: toIso('2024-11-05T00:00:00Z'),
    releaseDate: toIso('2024-11-03T00:00:00Z'),
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
  };

  it('returns null when release date is invalid', () => {
    const context = createPrototypeLifecycleContext({
      ...basePrototype,
      releaseDate: 'invalid',
    });
    expect(context).toBeNull();
  });

  it('provides lifecycle fields with JST normalization', () => {
    const context = createPrototypeLifecycleContext(basePrototype);
    expect(context).not.toBeNull();
    expect(context?.create?.yyyymmdd).toBe('2024-11-01');
    expect(context?.release.yyyymmdd).toBe('2024-11-03');
    expect(context?.update?.yyyymmdd).toBe('2024-11-05');
    expect(context?.sunset).toBeUndefined();
  });

  it('derives sunset when status is retired', () => {
    const context = createPrototypeLifecycleContext({
      ...basePrototype,
      status: 4,
    });
    expect(context?.sunset?.yyyymmdd).toBe('2024-11-05');
  });
});
