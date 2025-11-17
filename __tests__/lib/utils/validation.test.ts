import { describe, expect, it } from 'vitest';

import { parseDirectLaunchParams } from '@/lib/utils/validation';
import type { DirectLaunchParams } from '@/lib/utils/validation';

const expectSuccess = (
  result: ReturnType<typeof parseDirectLaunchParams>,
): DirectLaunchParams => {
  expect(result.type).toBe('success');

  if (result.type !== 'success') {
    throw new Error('Expected success result');
  }

  return result.value;
};

const expectFailure = (
  result: ReturnType<typeof parseDirectLaunchParams>,
  expectedMessage?: string,
) => {
  expect(result.type).toBe('failure');

  if (expectedMessage) {
    // expect(result.error.errors).toContain(expectedMessage);
    expect(result.type === 'failure' ? result.error.errors : []).toContain(
      expectedMessage,
    );
  }
};

describe('parseDirectLaunchParams', () => {
  describe('ids', () => {
    it('parses a comma-separated list', () => {
      const params = new URLSearchParams('id=1,2,3');
      const value = expectSuccess(parseDirectLaunchParams(params));

      expect(value.ids).toEqual([1, 2, 3]);
    });

    it('parses multiple id parameters', () => {
      const params = new URLSearchParams('id=1&id=2&id=4');
      const value = expectSuccess(parseDirectLaunchParams(params));

      expect(value.ids).toEqual([1, 2, 4]);
    });

    it('returns an empty list when no id parameter is present', () => {
      const value = expectSuccess(
        parseDirectLaunchParams(new URLSearchParams('title=Only%20Title')),
      );

      expect(value.ids).toEqual([]);
    });

    it('returns an empty list when id parameter contains only separators', () => {
      const params = new URLSearchParams('id=,,,');
      const value = expectSuccess(parseDirectLaunchParams(params));

      expect(value.ids).toEqual([]);
    });

    it('rejects non-numeric tokens', () => {
      const params = new URLSearchParams('id=1,abc,2');
      const result = parseDirectLaunchParams(params);

      expectFailure(result, 'IDs must contain only digits and commas.');
    });

    it('rejects tokens containing internal whitespace', () => {
      const params = new URLSearchParams('id=1%202');
      const result = parseDirectLaunchParams(params);

      expectFailure(result, 'IDs must contain only digits and commas.');
    });

    it('rejects tokens with leading or trailing whitespace', () => {
      const params = new URLSearchParams('id=%201');
      const result = parseDirectLaunchParams(params);

      expectFailure(result, 'IDs must contain only digits and commas.');
    });

    it('rejects tokens separated by comma and space', () => {
      const params = new URLSearchParams('id=1,%202');
      const result = parseDirectLaunchParams(params);

      expectFailure(result, 'IDs must contain only digits and commas.');
    });

    it('rejects negative numbers', () => {
      const params = new URLSearchParams('id=-1,2');
      const result = parseDirectLaunchParams(params);

      expectFailure(result, 'IDs must contain only digits and commas.');
    });

    it('rejects non-finite values', () => {
      const params = new URLSearchParams('id=1,Infinity,2');
      const result = parseDirectLaunchParams(params);

      expectFailure(result, 'IDs must contain only digits and commas.');
    });
  });

  describe('title', () => {
    it('parses a title when present', () => {
      const params = new URLSearchParams('title=Another%20Title');
      const value = expectSuccess(parseDirectLaunchParams(params));

      expect(value.title).toBe('Another Title');
    });

    it('treats an empty title as empty string', () => {
      const params = new URLSearchParams('title=');
      const value = expectSuccess(parseDirectLaunchParams(params));

      expect(value.title).toBe('');
    });

    it('allows whitespace only titles', () => {
      const params = new URLSearchParams('title=   ');
      const value = expectSuccess(parseDirectLaunchParams(params));

      expect(value.title).toBe('   ');
    });

    it('omits the title when the parameter is missing', () => {
      const params = new URLSearchParams('id=1,2,3');
      const value = expectSuccess(parseDirectLaunchParams(params));

      expect(value.title).toBeUndefined();
    });

    it('rejects titles longer than 300 characters', () => {
      const longTitle = 'a'.repeat(301);
      const params = new URLSearchParams(`title=${longTitle}`);
      const result = parseDirectLaunchParams(params);

      expectFailure(result, 'Title must be 300 characters or less.');
    });
  });

  describe('combined parameters', () => {
    it('parses ids and title together', () => {
      const params = new URLSearchParams('id=1,2,3&title=My%20Playlist');
      const value = expectSuccess(parseDirectLaunchParams(params));

      expect(value.ids).toEqual([1, 2, 3]);
      expect(value.title).toBe('My Playlist');
    });

    it('rejects when both ids and title are invalid', () => {
      const longTitle = 'a'.repeat(301);
      const params = new URLSearchParams(`id=1,a,3&title=${longTitle}`);
      const result = parseDirectLaunchParams(params);

      expectFailure(result);

      if (result.type === 'failure') {
        expect(result.error.errors).toEqual(
          expect.arrayContaining([
            'IDs must contain only digits and commas.',
            'Title must be 300 characters or less.',
          ]),
        );
      }
    });

    it('handles completely empty parameters', () => {
      const value = expectSuccess(
        parseDirectLaunchParams(new URLSearchParams('')),
      );

      expect(value.ids).toEqual([]);
      expect(value.title).toBeUndefined();
    });
  });
});
