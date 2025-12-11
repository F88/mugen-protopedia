import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { checkNotableHighlights } from '@/lib/utils/prototype-highlights';
import type { NotableHighlights } from '@/lib/utils/prototype-highlights';

const createPrototype = (
  overrides: Partial<NormalizedPrototype> = {},
): NormalizedPrototype => ({
  id: 1,
  prototypeNm: 'Prototype',
  teamNm: 'Team',
  users: [],
  summary: 'summary',
  systemDescription: 'system description',
  tags: [],
  materials: [],
  events: [],
  awards: [],
  status: 1,
  releaseFlg: 1,
  createDate: '2024-01-01',
  updateDate: '2024-01-02',
  releaseDate: '2024-01-03',
  revision: 1,
  freeComment: '',
  viewCount: 0,
  goodCount: 0,
  commentCount: 0,
  mainUrl: 'https://example.com',
  licenseType: 1,
  thanksFlg: 0,
  ...overrides,
});

const createDefaultHighlights = (): NotableHighlights => ({
  hasAwards: false,
  hasViewMilestone: false,
  hasGoodMilestone: false,
  hasCommentMilestone: false,
  isBirthDay: false,
});

describe('checkNotableHighlights', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false when prototype lacks highlights', () => {
    const prototype = createPrototype();
    expect(checkNotableHighlights(prototype)).toStrictEqual(
      createDefaultHighlights(),
    );
  });

  it('returns true when awards include non-empty entry', () => {
    const prototype = createPrototype({ awards: ['  Grand Prize  '] });
    expect(checkNotableHighlights(prototype)).toStrictEqual({
      ...createDefaultHighlights(),
      hasAwards: true,
    });
  });

  it('returns true when view count reaches milestone', () => {
    const prototype = createPrototype({ viewCount: 1_000 });
    expect(checkNotableHighlights(prototype)).toStrictEqual({
      ...createDefaultHighlights(),
      hasViewMilestone: true,
    });
  });

  it('returns true when good count reaches milestone', () => {
    const prototype = createPrototype({ goodCount: 10 });
    expect(checkNotableHighlights(prototype)).toStrictEqual({
      ...createDefaultHighlights(),
      hasGoodMilestone: true,
    });
  });

  it('returns true when comment count reaches milestone', () => {
    const prototype = createPrototype({ commentCount: 5 });
    expect(checkNotableHighlights(prototype)).toStrictEqual({
      ...createDefaultHighlights(),
      hasCommentMilestone: true,
    });
  });

  it('returns true when release date matches current day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-10T00:00:00Z'));

    const prototype = createPrototype({ releaseDate: '2020-05-10' });
    expect(checkNotableHighlights(prototype)).toStrictEqual({
      ...createDefaultHighlights(),
      isBirthDay: true,
    });
  });

  it('ignores empty awards after trimming', () => {
    const prototype = createPrototype({ awards: ['   '] });
    expect(checkNotableHighlights(prototype)).toStrictEqual(
      createDefaultHighlights(),
    );
  });
});
