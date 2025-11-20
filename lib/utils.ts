import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Splits a string into user-perceived characters (grapheme clusters).
 *
 * Prefers `Intl.Segmenter` when available to avoid breaking emoji/ZWJ
 * sequences. Falls back to code point splitting when not available.
 */
export function splitGraphemes(input: string): string[] {
  try {
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const SegmenterCtor = (
        Intl as unknown as {
          Segmenter: typeof Intl.Segmenter;
        }
      ).Segmenter;
      const segmenter = new SegmenterCtor(undefined, {
        granularity: 'grapheme',
      });
      const segments = segmenter.segment(input);
      return Array.from(segments, (s) => s.segment);
    }
  } catch {
    // ignore and fall back
  }

  // Fallback: code point split (does not perfectly handle ZWJ clusters
  // but avoids surrogate splits).
  return Array.from(input);
}

/**
 * Truncates a string to a specified maximum length and appends an ellipsis if truncated.
 * @param str The string to truncate.
 * @param maxLength The maximum length of the string.
 * @returns The truncated string with an ellipsis, or the original string if it's within the limit.
 */
export function truncateString(str: string, maxLength: number): string {
  // Normalize non-positive limits: always return only ellipsis when truncation is requested
  if (maxLength <= 0) {
    return '...';
  }

  const graphemes = splitGraphemes(str);
  if (graphemes.length <= maxLength) {
    return str;
  }
  return `${graphemes.slice(0, maxLength).join('')}...`;
}
