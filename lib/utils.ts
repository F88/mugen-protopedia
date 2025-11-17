import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

  // Prefer grapheme-aware segmentation when available to avoid breaking emoji/ZWJ sequences
  const splitIntoGraphemes = (input: string): string[] => {
    try {
      // Intl.Segmenter is available in Node 20+ and modern browsers
      if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
        const segmenter = new (Intl as any).Segmenter(undefined, {
          granularity: 'grapheme',
        });
        // segmenter.segment returns an iterable of { segment, index, isWordLike }
        return Array.from(segmenter.segment(input), (s: any) => s.segment);
      }
    } catch {
      // ignore and fall back
    }
    // Fallback: code point split (does not perfectly handle ZWJ clusters but avoids surrogate splits)
    return Array.from(input);
  };

  const graphemes = splitIntoGraphemes(str);
  if (graphemes.length <= maxLength) {
    return str;
  }
  return `${graphemes.slice(0, maxLength).join('')}...`;
}
