// CLEAN REWRITE: grouped test suite only (previous file was corrupted by merge)
import { describe, it, expect } from 'vitest';
import { computeDocumentTitle } from '@/lib/utils/document-title';
import { APP_TITLE } from '@/lib/config/app-constants';

describe('computeDocumentTitle', () => {
  describe('mode: normal', () => {
    it('returns base title in normal mode', () => {
      expect(computeDocumentTitle({ type: 'normal' })).toBe(APP_TITLE);
    });
  });

  describe('mode: playlist', () => {
    describe('ids: empty', () => {
      it('returns playlist title with base when title non-empty', () => {
        expect(
          computeDocumentTitle({
            type: 'playlist',
            ids: [],
            title: 'My Playlist',
          }),
        ).toBe('My Playlist | ' + APP_TITLE);
      });

      it('retains leading/trailing whitespace (only emptiness trimmed)', () => {
        expect(
          computeDocumentTitle({
            type: 'playlist',
            ids: [],
            title: '  Trim Me  ',
          }),
        ).toBe('  Trim Me   | ' + APP_TITLE);
      });

      it('falls back when title is whitespace only', () => {
        expect(
          computeDocumentTitle({ type: 'playlist', ids: [], title: '   ' }),
        ).toBe(APP_TITLE);
      });
    });

    describe('ids: non-empty', () => {
      it('returns playlist title with base when title non-empty', () => {
        expect(
          computeDocumentTitle({
            type: 'playlist',
            ids: [1, 2, 3],
            title: 'My Playlist',
          }),
        ).toBe('My Playlist (3) | ' + APP_TITLE);
      });

      it('retains whitespace when title includes leading/trailing spaces', () => {
        expect(
          computeDocumentTitle({
            type: 'playlist',
            ids: [10, 11],
            title: '  Trim Me  ',
          }),
        ).toBe('  Trim Me   (2) | ' + APP_TITLE);
      });

      it('falls back when title empty string', () => {
        expect(
          computeDocumentTitle({ type: 'playlist', ids: [5], title: '' }),
        ).toBe(APP_TITLE);
      });

      it('falls back when title whitespace only', () => {
        expect(
          computeDocumentTitle({ type: 'playlist', ids: [42], title: '   ' }),
        ).toBe(APP_TITLE);
      });

      it('falls back when title undefined', () => {
        expect(
          computeDocumentTitle({
            type: 'playlist',
            ids: [1, 2],
            title: undefined,
          }),
        ).toBe(APP_TITLE);
      });

      it('large ids array does not affect title computation', () => {
        const ids = Array.from({ length: 500 }, (_, i) => i + 1);
        expect(
          computeDocumentTitle({
            type: 'playlist',
            ids,
            title: 'Bulk IDs Test',
          }),
        ).toBe(`Bulk IDs Test (500) | ${APP_TITLE}`);
      });

      it('appends count even when title is truncated', () => {
        const longTitle = 'z'.repeat(150);
        const truncated = `${'z'.repeat(100)}...`;
        expect(
          computeDocumentTitle({
            type: 'playlist',
            ids: [7, 8],
            title: longTitle,
          }),
        ).toBe(`${truncated} (2) | ${APP_TITLE}`);
      });
    });

    describe('title: truncation boundaries', () => {
      it('does not truncate when length is 99 (just below limit)', () => {
        const title99 = 'x'.repeat(99);
        expect(
          computeDocumentTitle({ type: 'playlist', ids: [], title: title99 }),
        ).toBe(`${title99} | ${APP_TITLE}`);
      });

      it('does not truncate when length exactly 100', () => {
        const hundred = 'a'.repeat(100);
        expect(
          computeDocumentTitle({ type: 'playlist', ids: [], title: hundred }),
        ).toBe(`${hundred} | ${APP_TITLE}`);
      });

      it('truncates at 101 length', () => {
        const long = 'c'.repeat(101);
        const expected = `${'c'.repeat(100)}...`;
        expect(
          computeDocumentTitle({ type: 'playlist', ids: [], title: long }),
        ).toBe(`${expected} | ${APP_TITLE}`);
      });

      it('truncates long plain title (>100)', () => {
        const long = 'b'.repeat(150);
        const expected = `${'b'.repeat(100)}...`;
        expect(
          computeDocumentTitle({ type: 'playlist', ids: [], title: long }),
        ).toBe(`${expected} | ${APP_TITLE}`);
      });

      it('truncates including leading spaces when over limit', () => {
        const spaced = '    ' + 'y'.repeat(120);
        const expectedTruncated = spaced.slice(0, 100) + '...';
        expect(
          computeDocumentTitle({ type: 'playlist', ids: [], title: spaced }),
        ).toBe(`${expectedTruncated} | ${APP_TITLE}`);
      });
    });

    describe('title: unicode & emoji', () => {
      it('handles Japanese unicode under limit', () => {
        const jp = '試作タイトル' + 'あいうえおかきくけこ';
        expect(
          computeDocumentTitle({ type: 'playlist', ids: [], title: jp }),
        ).toBe(`${jp} | ${APP_TITLE}`);
      });

      it('truncates long emoji title by grapheme count (>100 graphemes)', () => {
        const emoji = '🎉';
        const longEmojiTitle = emoji.repeat(120); // 120 graphemes
        const expected = emoji.repeat(100) + '...';
        expect(
          computeDocumentTitle({
            type: 'playlist',
            ids: [],
            title: longEmojiTitle,
          }),
        ).toBe(`${expected} | ${APP_TITLE}`);
      });

      it('does not truncate multi-codepoint emoji clusters under 100 graphemes', () => {
        const complexEmoji = '👩‍💻'; // single grapheme but multiple code points via ZWJ
        const longComplex = complexEmoji.repeat(60); // 60 graphemes (< 100)
        expect(
          computeDocumentTitle({
            type: 'playlist',
            ids: [],
            title: longComplex,
          }),
        ).toBe(`${longComplex} | ${APP_TITLE}`);
      });
    });

    describe('title: special whitespace', () => {
      it('falls back when title only has newline and tabs', () => {
        expect(
          computeDocumentTitle({ type: 'playlist', ids: [], title: '\n\t\n' }),
        ).toBe(APP_TITLE);
      });
      it('preserves internal newline characters in valid playlist title', () => {
        const multiLine = 'Line1\nLine2';
        expect(
          computeDocumentTitle({ type: 'playlist', ids: [], title: multiLine }),
        ).toBe(`${multiLine} | ${APP_TITLE}`);
      });
    });
  });
});
