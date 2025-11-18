import { splitGraphemes, truncateString } from '@/lib/utils';
import { describe, expect, it } from 'vitest';

describe('truncateString', () => {
  it('should return the original string if its length is less than maxLength', () => {
    expect(truncateString('hello', 10)).toBe('hello');
  });

  it('should return the original string if its length is equal to maxLength', () => {
    expect(truncateString('hello', 5)).toBe('hello');
  });

  it('should truncate the string and append ellipsis if its length is greater than maxLength', () => {
    expect(truncateString('hello world', 5)).toBe('hello...');
  });

  it('should handle empty string', () => {
    expect(truncateString('', 5)).toBe('');
  });

  it('should handle maxLength of 0', () => {
    expect(truncateString('hello', 0)).toBe('...');
  });

  it('should handle maxLength less than 0 (should still truncate to 0 and add ellipsis)', () => {
    expect(truncateString('hello', -1)).toBe('...');
  });

  it('should handle long string and large maxLength', () => {
    const longString = 'a'.repeat(100);
    expect(truncateString(longString, 90)).toBe(`${'a'.repeat(90)}...`);
  });

  it('should handle string that becomes exactly maxLength after truncation', () => {
    expect(truncateString('abcdefg', 4)).toBe('abcd...');
  });

  it('should treat emoji as single graphemes when truncating', () => {
    const emojiString = '😀😃😄😁';
    expect(truncateString(emojiString, 2)).toBe('😀😃...');
  });

  it('should return only ellipsis when maxLength is negative and string is empty', () => {
    expect(truncateString('', -5)).toBe('...');
  });
});

describe('splitGraphemes', () => {
  it('splits simple ASCII strings into individual characters', () => {
    expect(splitGraphemes('abc')).toEqual(['a', 'b', 'c']);
  });

  it('treats emoji as single graphemes in the best-effort fallback', () => {
    const result = splitGraphemes('😀😃');
    expect(result).toEqual(['😀', '😃']);
  });

  it('handles empty string', () => {
    expect(splitGraphemes('')).toEqual([]);
  });

  it('does not split surrogate pairs incorrectly', () => {
    // Musical symbol G clef (U+1D11E) is a surrogate pair.
    const gClef = '\uD834\uDD1E';
    const result = splitGraphemes(gClef);
    expect(result).toEqual([gClef]);
  });

  it('best-effort handles ZWJ emoji sequences as multiple graphemes in fallback', () => {
    // Family: man, woman, girl (👨‍👩‍👧) uses ZWJ sequences.
    const familyEmoji = '👨\u200D👩\u200D👧';
    const result = splitGraphemes(familyEmoji);
    // We only assert that it does not throw and returns non-empty array.
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
