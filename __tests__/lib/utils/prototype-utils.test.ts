import { describe, expect, it } from 'vitest';
import type { ResultOfListPrototypesApiResponse } from 'protopedia-api-v2-client';
import {
  compareById,
  getMaxPrototypeId,
  getMinPrototypeId,
  sortPrototypesById,
  buildTagLink,
  buildMaterialLink,
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

  it('encodes ampersand and equals signs separating them from query semantics', () => {
    expect(buildTagLink('A&B=1')).toBe(
      'https://protopedia.net/tag?tag=A%26B%3D1',
    );
  });

  it('encodes hash symbol', () => {
    expect(buildTagLink('proto#tag')).toBe(
      'https://protopedia.net/tag?tag=proto%23tag',
    );
  });

  it('encodes question mark to avoid creating additional query', () => {
    expect(buildTagLink('env?sensor')).toBe(
      'https://protopedia.net/tag?tag=env%3Fsensor',
    );
  });

  it('encodes percent sign', () => {
    expect(buildTagLink('100%')).toBe('https://protopedia.net/tag?tag=100%25');
  });

  it('encodes plus sign literally (URLSearchParams keeps raw + then encodes as %2B)', () => {
    expect(buildTagLink('A+B')).toBe('https://protopedia.net/tag?tag=A%2BB');
  });

  it('encodes leading, trailing, and internal spaces as +', () => {
    expect(buildTagLink('  spaced tag  ')).toBe(
      'https://protopedia.net/tag?tag=++spaced+tag++',
    );
  });

  it('returns base URL with empty tag parameter when empty string provided', () => {
    expect(buildTagLink('')).toBe('https://protopedia.net/tag?tag=');
  });

  it('encodes newline and tab characters', () => {
    expect(buildTagLink('line1\nline2\tend')).toBe(
      'https://protopedia.net/tag?tag=line1%0Aline2%09end',
    );
  });

  it('encodes emoji and mixed scripts', () => {
    expect(buildTagLink('温度🌡️')).toBe(
      'https://protopedia.net/tag?tag=%E6%B8%A9%E5%BA%A6%F0%9F%8C%A1%EF%B8%8F',
    );
  });

  it('encodes parentheses', () => {
    expect(buildTagLink('sensor (rev2)')).toBe(
      'https://protopedia.net/tag?tag=sensor+%28rev2%29',
    );
  });
});

describe('buildMaterialLink', () => {
  it('builds a material link for numeric identifiers', () => {
    expect(buildMaterialLink('1234')).toBe(
      'https://protopedia.net/material/1234',
    );
  });

  it('encodes reserved characters in material names', () => {
    expect(buildMaterialLink('sensor kit')).toBe(
      'https://protopedia.net/material/sensor%20kit',
    );
  });

  it('encodes non-ASCII characters correctly', () => {
    expect(buildMaterialLink('アイデア')).toBe(
      'https://protopedia.net/material/%E3%82%A2%E3%82%A4%E3%83%87%E3%82%A2',
    );
  });

  it('preserves and encodes leading/trailing spaces', () => {
    expect(buildMaterialLink('  board  ')).toBe(
      'https://protopedia.net/material/%20%20board%20%20',
    );
  });

  it('escapes URL-reserved characters like slash, ampersand, and hash', () => {
    expect(buildMaterialLink('temp/humidity sensor')).toBe(
      'https://protopedia.net/material/temp%2Fhumidity%20sensor',
    );
    expect(buildMaterialLink('A&B')).toBe(
      'https://protopedia.net/material/A%26B',
    );
    expect(buildMaterialLink('C# dev kit')).toBe(
      'https://protopedia.net/material/C%23%20dev%20kit',
    );
  });

  it('returns base URL with trailing slash for empty material', () => {
    expect(buildMaterialLink('')).toBe('https://protopedia.net/material/');
  });

  it('treats full URLs as plain text and encodes them', () => {
    expect(buildMaterialLink('https://example.com')).toBe(
      'https://protopedia.net/material/https%3A%2F%2Fexample.com',
    );
  });

  it('keeps leading zeros in numeric-like strings', () => {
    expect(buildMaterialLink('00123')).toBe(
      'https://protopedia.net/material/00123',
    );
  });

  it('encodes emoji and mixed scripts', () => {
    expect(buildMaterialLink('温度🌡️センサー')).toBe(
      'https://protopedia.net/material/%E6%B8%A9%E5%BA%A6%F0%9F%8C%A1%EF%B8%8F%E3%82%BB%E3%83%B3%E3%82%B5%E3%83%BC',
    );
  });

  it('encodes query-like strings', () => {
    expect(buildMaterialLink('sensor?type=env')).toBe(
      'https://protopedia.net/material/sensor%3Ftype%3Denv',
    );
  });

  it('encodes plus sign and preserves parentheses', () => {
    expect(buildMaterialLink('A+B (rev2)')).toBe(
      'https://protopedia.net/material/A%2BB%20(rev2)',
    );
  });

  it('encodes percent sign to avoid double-interpretation', () => {
    expect(buildMaterialLink('sensor%20kit')).toBe(
      'https://protopedia.net/material/sensor%2520kit',
    );
  });

  it('encodes newline and tab characters', () => {
    expect(buildMaterialLink('line1\nline2\tend')).toBe(
      'https://protopedia.net/material/line1%0Aline2%09end',
    );
  });
});
