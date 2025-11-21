import { describe, expect, it } from 'vitest';

import {
  extractPrototypeUrls,
  normalizeIdsFromUrls,
  isPrototypeUrl,
  parsePrototypeIdLines,
  sortIdsWithDuplicates,
  deduplicateIdsPreserveOrder,
  buildPlaylistUrl,
  extractPageTitle,
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

    it('resolves relative href values against baseUrl and filters by isPrototypeUrl', () => {
      const raw = [
        '<a href="/prototype/1">one</a>',
        '<a href="prototype/2">two</a>',
        '<a href="../prototype/3?foo=bar">three</a>',
        '<a href="https://example.com/prototype/999">external</a>',
      ].join('\n');

      const result = extractPrototypeUrls(
        raw,
        'https://protopedia.net/some/page',
      );

      // `prototype/2` resolves to `https://protopedia.net/some/prototype/2`,
      // which does not satisfy `isPrototypeUrl` (path must be `/prototype/<id>`),
      // so only the first and third links are kept.
      expect(result).toEqual([
        'https://protopedia.net/prototype/1',
        'https://protopedia.net/prototype/3?foo=bar',
      ]);
    });

    it('ignores HTML <base> tag and uses provided baseUrl for relative href resolution', () => {
      const raw = [
        '<head>',
        '<base href="https://evil.example/">',
        '</head>',
        '<body>',
        '<a href="/prototype/1">one</a>',
        '<a href="prototype/2">two</a>',
        '<a href="../prototype/3">three</a>',
        '</body>',
      ].join('\n');

      const result = extractPrototypeUrls(
        raw,
        'https://protopedia.net/some/page',
      );

      // The <base> tag is intentionally ignored; only baseUrl is used.
      // So relative hrefs resolve under https://protopedia.net/, and after
      // filtering via isPrototypeUrl, only /prototype/1 and /prototype/3
      // are kept.
      expect(result).toEqual([
        'https://protopedia.net/prototype/1',
        'https://protopedia.net/prototype/3',
      ]);
    });
  });

  describe('normalizeIdsFromUrls', () => {
    it('extracts numeric IDs from prototype URLs, keeping duplicates and order', () => {
      const urls = [
        'https://protopedia.net/prototype/1',
        'https://protopedia.net/prototype/1',
        'https://www.protopedia.net/prototype/42',
        'https://protopedia.net/prototype/7?foo=bar',
        'https://example.com/not-protopedia/123',
      ];

      const result = normalizeIdsFromUrls(urls);

      // `normalizeIdsFromUrls` only considers URLs that satisfy `isPrototypeUrl`,
      // so subdomains like `www.protopedia.net` are ignored. Duplicates are
      // preserved and order is kept.
      expect(result).toEqual([1, 1, 7]);
    });

    it('ignores invalid and negative prototype IDs while keeping valid duplicates', () => {
      const urls = [
        'https://protopedia.net/prototype/0',
        'https://protopedia.net/prototype/-1',
        'https://protopedia.net/prototype/10?foo=bar',
        'https://protopedia.net/prototype/abc',
        'https://protopedia.net/prototype/10#section',
      ];

      const result = normalizeIdsFromUrls(urls);

      // -1 and non-numeric IDs are ignored; 10 is preserved twice.
      expect(result).toEqual([0, 10, 10]);
    });

    it('returns empty array for empty input', () => {
      expect(normalizeIdsFromUrls([])).toEqual([]);
    });

    it('ignores URLs that fail isPrototypeUrl, including those with leading/trailing whitespace', () => {
      const urls = [
        ' https://protopedia.net/prototype/1',
        'https://protopedia.net/prototype/2 ',
        '\nhttps://protopedia.net/prototype/3',
      ];

      const result = normalizeIdsFromUrls(urls);

      // None of the URLs strictly satisfy isPrototypeUrl because of whitespace
      expect(result).toEqual([]);
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
      {
        input: ' 1 ',
        expected: [],
      },
      {
        input: '１',
        expected: [],
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

  describe('extractPageTitle', () => {
    it('extracts title content from HTML', () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>My Page Title</title>
          </head>
          <body></body>
        </html>
      `;
      expect(extractPageTitle(html)).toBe('My Page Title');
    });

    it('trims whitespace from extracted title', () => {
      const html = '<title>  Trim Me  </title>';
      expect(extractPageTitle(html)).toBe('Trim Me');
    });

    it('returns null if no title tag is found', () => {
      const html = '<div>No title here</div>';
      expect(extractPageTitle(html)).toBeNull();
    });

    it('returns empty string if title tag is empty', () => {
      const html = '<title></title>';
      expect(extractPageTitle(html)).toBe('');
    });

    it('returns empty string if title tag contains only whitespace', () => {
      const html = '<title>   </title>';
      expect(extractPageTitle(html)).toBe('');
    });

    it('is case insensitive for tag name', () => {
      const html = '<TITLE>UPPERCASE</TITLE>';
      expect(extractPageTitle(html)).toBe('UPPERCASE');
    });

    it('handles attributes on title tag', () => {
      const html = '<title lang="en">With Attributes</title>';
      expect(extractPageTitle(html)).toBe('With Attributes');
    });

    it('handles multiline title content', () => {
      const html = `
        <title>
          Line 1
          Line 2
        </title>
      `;
      // Note: The regex captures [\s\S]*? so it includes newlines.
      // The .trim() only removes leading/trailing whitespace of the whole block.
      // It does NOT collapse internal whitespace.
      const extracted = extractPageTitle(html);
      expect(extracted).toContain('Line 1');
      expect(extracted).toContain('Line 2');
    });

    it('decodes HTML entities', () => {
      const html = '<title>A &amp; B</title>';
      expect(extractPageTitle(html)).toBe('A & B');
    });

    it('decodes numeric character references', () => {
      const html = '<title>&#169; 2025</title>';
      expect(extractPageTitle(html)).toBe('© 2025');
    });

    it('decodes named character references', () => {
      const html = '<title>Foo &mdash; Bar</title>';
      expect(extractPageTitle(html)).toBe('Foo — Bar');
    });

    it('decodes mixed entities', () => {
      const html =
        '<title>&lt;div&gt; &quot;quoted&quot; &apos;single&apos;</title>';
      expect(extractPageTitle(html)).toBe('<div> "quoted" \'single\'');
    });
  });
});
