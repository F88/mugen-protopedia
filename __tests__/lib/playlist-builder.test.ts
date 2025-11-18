import { describe, expect, it } from 'vitest';

import {
  extractPrototypeUrls,
  normalizeIdsFromUrls,
  isPrototypeUrl,
  parsePrototypeIdLines,
  sortIdsWithDuplicates,
  deduplicateIdsPreserveOrder,
  buildPlaylistUrl,
} from '@/lib/utils/playlist-builder';

describe('playlist-builder ID utilities', () => {
  describe('isPrototypeUrl', () => {
    it.each([
      'https://protopedia.net/prototype/1',
      'https://protopedia.net/prototype/7?foo=bar#section',
    ])('returns true for %s', (input) => {
      expect(isPrototypeUrl(input)).toBe(true);
    });

    it.each([
      '',
      'example.com/prototype/1',
      'http://protopedia.net/prototype/123',
      'https://www.protopedia.net/prototype/42',
      'https://protopedia.net/',
      'https://protopedia.net/prototype/abc',
      'https://protopedia.net/prototype/123/extra/path',
      ' https://protopedia.net/prototype/1',
      'https://protopedia.net/prototype/1 ',
    ])('returns false for %s', (input) => {
      expect(isPrototypeUrl(input)).toBe(false);
    });
  });

  describe('extractPrototypeUrls', () => {
    it('extracts unique prototype URLs in appearance order', () => {
      const raw = [
        'prefix https://protopedia.net/prototype/1 middle',
        'duplicate https://protopedia.net/prototype/1',
        'and https://protopedia.net/prototype/42?foo=bar suffix',
        'and http://protopedia.net/prototype/99 (http should be ignored)',
        'and https://www.protopedia.net/prototype/123 (subdomain should be ignored)',
      ].join('\n');

      const result = extractPrototypeUrls(raw);

      expect(result).toEqual([
        'https://protopedia.net/prototype/1',
        'https://protopedia.net/prototype/42?foo=bar',
      ]);
    });

    it('returns empty array for empty or non-matching input', () => {
      expect(extractPrototypeUrls('')).toEqual([]);
      expect(extractPrototypeUrls('no prototype urls here')).toEqual([]);
    });
  });

  describe('normalizeIdsFromUrls', () => {
    it('extracts unique numeric IDs from prototype URLs', () => {
      const urls = [
        'https://protopedia.net/prototype/1',
        'https://protopedia.net/prototype/1',
        'https://www.protopedia.net/prototype/42',
        'https://protopedia.net/prototype/7?foo=bar',
        'https://example.com/not-protopedia/123',
      ];

      const result = normalizeIdsFromUrls(urls);

      // `normalizeIdsFromUrls` only considers URLs that satisfy `isPrototypeUrl`,
      // so subdomains like `www.protopedia.net` are ignored.
      expect(result).toEqual([1, 7]);
    });

    it('ignores invalid and negative prototype IDs but keeps first valid ones', () => {
      const urls = [
        'https://protopedia.net/prototype/0',
        'https://protopedia.net/prototype/-1',
        'https://protopedia.net/prototype/10?foo=bar',
        'https://protopedia.net/prototype/abc',
        'https://protopedia.net/prototype/10#section',
      ];

      const result = normalizeIdsFromUrls(urls);

      // -1 and non-numeric IDs are ignored; 10 appears only once.
      expect(result).toEqual([0, 10]);
    });
  });

  describe('parsePrototypeIdLines', () => {
    it.each<{
      input: string;
      expected: number[];
    }>([
      {
        input: '',
        expected: [],
      },
      {
        input: '\n',
        expected: [],
      },
      {
        input: '1',
        expected: [1],
      },
      {
        input: '1\n2\n3',
        expected: [1, 2, 3],
      },
      {
        input: '1\r2\r3',
        expected: [1, 2, 3],
      },
      {
        input: '1\r\n2\r\n3',
        expected: [1, 2, 3],
      },
      {
        input: '1\n\n2',
        expected: [1, 2],
      },
      {
        input: '1\r\r2',
        expected: [1, 2],
      },
      {
        input: '1\r\n\r\n2',
        expected: [1, 2],
      },
      {
        input: '001\n42',
        expected: [1, 42],
      },
      {
        input: '1\nabc\n2',
        expected: [1, 2],
      },
      {
        input: '0',
        expected: [0],
      },
      {
        input: '   ',
        expected: [],
      },
      {
        input: '12345678901234567890',
        expected: [12345678901234567890],
      },
    ])(
      'parses valid numeric lines and ignores others: %j',
      ({ input, expected }) => {
        const result = parsePrototypeIdLines(input);
        expect(result).toEqual(expected);
      },
    );
  });

  describe('sortIdsWithDuplicates', () => {
    it('sortIdsWithDuplicates sorts numerically but keeps duplicates', () => {
      const input = [1, 5, 2, 5];
      const result = sortIdsWithDuplicates(input);
      expect(result).toEqual([1, 2, 5, 5]);
    });

    it('returns a new array and does not mutate original', () => {
      const input = [3, 2, 1];
      const copy = [...input];

      const result = sortIdsWithDuplicates(input);

      expect(result).toEqual([1, 2, 3]);
      expect(input).toEqual(copy);
    });
  });

  describe('deduplicateIdsPreserveOrder', () => {
    it('deduplicateIdsPreserveOrder removes duplicates but preserves first occurrence order', () => {
      const input = [1, 5, 2, 5, 2];
      const result = deduplicateIdsPreserveOrder(input);
      expect(result).toEqual([1, 5, 2]);
    });

    it('returns empty array when input is empty', () => {
      expect(deduplicateIdsPreserveOrder([])).toEqual([]);
    });
  });

  describe('buildPlaylistUrl', () => {
    it.each([
      {
        ids: [1, 42],
        title: ' My Playlist ',
        expectedId: '1,42',
        expectedTitle: ' My Playlist ',
      },
      {
        ids: [99],
        title: 'single',
        expectedId: '99',
        expectedTitle: 'single',
      },
    ])(
      'includes id and title query params when provided: %j',
      ({ ids, title, expectedId, expectedTitle }) => {
        const result = buildPlaylistUrl(ids, title);

        // Only assert on the query part to avoid depending on APP_URL
        const url = new URL(result);
        expect(url.searchParams.get('id')).toBe(expectedId);
        expect(url.searchParams.get('title')).toBe(expectedTitle);
      },
    );

    it('omits title parameter when title is an empty string', () => {
      const result = buildPlaylistUrl([7], '');
      const url = new URL(result);
      expect(url.searchParams.get('id')).toBe('7');
      expect(url.searchParams.has('title')).toBe(false);
    });

    it('omits id parameter when ids array is empty but keeps title', () => {
      const result = buildPlaylistUrl([], ' Title Only ');
      const url = new URL(result);
      expect(url.searchParams.has('id')).toBe(false);
      expect(url.searchParams.get('title')).toBe(' Title Only ');
    });

    it('returns empty string when both ids and title are empty', () => {
      const result = buildPlaylistUrl([], '');
      expect(result).toBe('');
    });

    it('omits title parameter when title exceeds max length', () => {
      const longTitle = 'a'.repeat(301);
      const result = buildPlaylistUrl([1], longTitle);
      const url = new URL(result);
      expect(url.searchParams.get('id')).toBe('1');
      expect(url.searchParams.has('title')).toBe(false);
    });

    it('includes title parameter when title is exactly max length', () => {
      const title = 'a'.repeat(300);
      const result = buildPlaylistUrl([1], title);
      const url = new URL(result);
      expect(url.searchParams.get('id')).toBe('1');
      expect(url.searchParams.get('title')).toBe(title);
    });

    it('preserves duplicate IDs in the id query parameter', () => {
      const result = buildPlaylistUrl([1, 1, 2], 'dup');
      const url = new URL(result);
      expect(url.searchParams.get('id')).toBe('1,1,2');
      expect(url.searchParams.get('title')).toBe('dup');
    });

    it('filters out invalid or negative IDs before building URL', () => {
      const result = buildPlaylistUrl([1, -1, 2.5, 3], 'valid');
      const url = new URL(result);
      expect(url.searchParams.get('id')).toBe('1,3');
      expect(url.searchParams.get('title')).toBe('valid');
    });

    it('treats emoji as single graphemes for title length limit', () => {
      const singleEmoji = '😀';
      const titleWithinLimit = singleEmoji.repeat(300);
      const titleExceedingLimit = singleEmoji.repeat(301);

      const withinResult = buildPlaylistUrl([1], titleWithinLimit);
      const withinUrl = new URL(withinResult);
      expect(withinUrl.searchParams.get('title')).toBe(titleWithinLimit);

      const exceedingResult = buildPlaylistUrl([1], titleExceedingLimit);
      const exceedingUrl = new URL(exceedingResult);
      expect(exceedingUrl.searchParams.has('title')).toBe(false);
    });
  });
});
