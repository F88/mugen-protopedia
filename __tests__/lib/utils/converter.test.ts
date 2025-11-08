import { describe, expect, it } from 'vitest';
import { splitPipeSeparatedString } from '@/lib/utils/converter';

describe('splitPipeSeparatedString', () => {
  it('returns empty array when input is empty', () => {
    expect(splitPipeSeparatedString('')).toStrictEqual([]);
  });

  it('returns single value when no delimiter present', () => {
    expect(splitPipeSeparatedString('Solo Award')).toStrictEqual(['Solo Award']);
  });

  it('preserves empty segments', () => {
    expect(splitPipeSeparatedString('First||Third')).toStrictEqual(['First', '', 'Third']);
  });

  it('splits pipe separated values', () => {
    const input = 'Award One | Award Two | Award Three';
    expect(splitPipeSeparatedString(input)).toStrictEqual([
      'Award One',
      'Award Two',
      'Award Three',
    ]);
  });
});
