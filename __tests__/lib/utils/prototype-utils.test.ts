import { describe, expect, it } from 'vitest';
import type { ResultOfListPrototypesApiResponse } from 'protopedia-api-v2-client';
import {
  compareById,
  getMaxPrototypeId,
  getMinPrototypeId,
  sortPrototypesById,
  buildTagLink,
} from '@/lib/utils/prototype-utils';

const createPrototype = (id: unknown): ResultOfListPrototypesApiResponse =>
  ({ id }) as ResultOfListPrototypesApiResponse;

describe('compareById', () => {
  it('orders records in ascending order by default', () => {
    const first = { id: 1 };
    const second = { id: 3 };

    expect(compareById(first, second)).toBeLessThan(0);
    expect(compareById(second, first)).toBeGreaterThan(0);
  });

  it('orders records in descending order when requested', () => {
    const first = { id: 1 };
    const second = { id: 3 };

    expect(compareById(first, second, 'desc')).toBeGreaterThan(0);
    expect(compareById(second, first, 'desc')).toBeLessThan(0);
  });

  it('pushes records without numeric ids to the end', () => {
    const withId: { id?: number | null } = { id: 1 };
    const withoutId: { id?: number | null } = { id: null };

    expect(compareById(withId, withoutId)).toBeLessThan(0);
    expect(compareById(withoutId, withId)).toBeGreaterThan(0);
  });
});

describe('sortPrototypesById', () => {
  it('returns a new sorted array without mutating the input', () => {
    const prototypes = [{ id: 3 }, { id: 1 }, { id: 2 }];

    const sorted = sortPrototypesById(prototypes);

    expect(sorted.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(prototypes.map((item) => item.id)).toEqual([3, 1, 2]);
  });
});

describe('getMinPrototypeId', () => {
  it('returns the smallest numeric id ignoring null or non-numeric values', () => {
    const prototypes = [
      createPrototype(5),
      createPrototype('2'),
      createPrototype(null),
      createPrototype('not-a-number'),
    ];

    expect(getMinPrototypeId(prototypes)).toBe(2);
  });

  it('returns undefined when no numeric ids exist', () => {
    const prototypes = [createPrototype(null), createPrototype(undefined)];

    expect(getMinPrototypeId(prototypes)).toBeUndefined();
  });
});

describe('getMaxPrototypeId', () => {
  it('returns the largest numeric id ignoring null or non-numeric values', () => {
    const prototypes = [
      createPrototype(5),
      createPrototype('12'),
      createPrototype(null),
      createPrototype('6'),
    ];

    expect(getMaxPrototypeId(prototypes)).toBe(12);
  });

  it('returns undefined when no numeric ids exist', () => {
    const prototypes = [createPrototype(null), createPrototype(undefined)];

    expect(getMaxPrototypeId(prototypes)).toBeUndefined();
  });
});
describe('buildTagLink', () => {
  it('returns a URL with the provided tag value encoded', () => {
    expect(buildTagLink('アイデア')).toBe(
      'https://protopedia.net/tag?tag=%E3%82%A2%E3%82%A4%E3%83%87%E3%82%A2',
    );
  });

  it('handles values requiring encoding and preserves base', () => {
    expect(buildTagLink('foo bar')).toBe(
      'https://protopedia.net/tag?tag=foo+bar',
    );
  });
});
