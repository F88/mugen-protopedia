import { truncateString } from '@/lib/utils';
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
});
