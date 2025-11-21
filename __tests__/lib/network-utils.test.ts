import { describe, it, expect } from 'vitest';
import {
  constructDisplayMessage,
  resolveErrorMessage,
} from '@/lib/network-utils';
import type { NetworkFailure } from '@/types/prototype-api.types';

describe('resolveErrorMessage', () => {
  it('returns the message from an Error object', () => {
    const error = new Error('Something went wrong');
    expect(resolveErrorMessage(error)).toBe('Something went wrong');
  });

  it('returns the string itself if input is a non-empty string', () => {
    expect(resolveErrorMessage('Error string')).toBe('Error string');
  });

  it('returns "Unknown error occurred." for empty strings', () => {
    expect(resolveErrorMessage('')).toBe('Unknown error occurred.');
  });

  it('returns "Unknown error occurred." for non-Error objects', () => {
    expect(resolveErrorMessage({ foo: 'bar' })).toBe('Unknown error occurred.');
  });

  it('returns "Unknown error occurred." for null or undefined', () => {
    expect(resolveErrorMessage(null)).toBe('Unknown error occurred.');
    expect(resolveErrorMessage(undefined)).toBe('Unknown error occurred.');
  });

  it('returns "Unknown error occurred." for other falsy values like 0 or false', () => {
    expect(resolveErrorMessage(0)).toBe('Unknown error occurred.');
    expect(resolveErrorMessage(false)).toBe('Unknown error occurred.');
  });
});

describe('constructDisplayMessage', () => {
  describe('when only status and error are provided', () => {
    it('returns the resolved error message if no details are provided', () => {
      const failure: NetworkFailure = {
        status: 500,
        error: 'Internal Server Error',
      };
      expect(constructDisplayMessage(failure)).toBe(
        'Internal Server Error (500)',
      );
    });

    it('returns the resolved error message if details is an empty object', () => {
      const failure: NetworkFailure = {
        status: 500,
        error: 'Internal Server Error',
        details: {},
      };
      expect(constructDisplayMessage(failure)).toBe(
        'Internal Server Error (500)',
      );
    });
  });

  describe('when details are provided', () => {
    it('prepends statusText to the message if not already present', () => {
      const failure: NetworkFailure = {
        status: 400,
        error: 'Invalid ID parameter',
        details: {
          statusText: 'Bad Request',
        },
      };
      expect(constructDisplayMessage(failure)).toBe(
        'Bad Request: Invalid ID parameter (400)',
      );
    });

    it('does not prepend statusText if the message already starts with it', () => {
      const failure: NetworkFailure = {
        status: 400,
        error: 'Bad Request: Invalid ID parameter',
        details: {
          statusText: 'Bad Request',
        },
      };
      expect(constructDisplayMessage(failure)).toBe(
        'Bad Request: Invalid ID parameter (400)',
      );
    });

    it('uses code as prefix if statusText is missing', () => {
      const failure: NetworkFailure = {
        status: 500,
        error: 'Connection refused',
        details: {
          code: 'ECONNREFUSED',
        },
      };
      expect(constructDisplayMessage(failure)).toBe(
        'ECONNREFUSED: Connection refused (500)',
      );
    });

    it('handles generic message with code prefix', () => {
      const failure: NetworkFailure = {
        status: 500,
        error: 'Internal Server Error',
        details: {
          code: 'INTERNAL_ERROR',
        },
      };
      expect(constructDisplayMessage(failure)).toBe(
        'INTERNAL_ERROR: Internal Server Error (500)',
      );
    });

    it('prefers statusText over code as prefix', () => {
      const failure: NetworkFailure = {
        status: 503,
        error: 'Service Unavailable',
        details: {
          statusText: 'Service Unavailable',
          code: '503_SERVICE_UNAVAILABLE',
        },
      };
      expect(constructDisplayMessage(failure)).toBe(
        'Service Unavailable (503)',
      );

      const failure2: NetworkFailure = {
        status: 503,
        error: 'Backend is down',
        details: {
          statusText: 'Service Unavailable',
          code: '503_ERR',
        },
      };
      expect(constructDisplayMessage(failure2)).toBe(
        'Service Unavailable: Backend is down (503)',
      );
    });

    it('prepends statusText even if message starts with code', () => {
      const failure: NetworkFailure = {
        status: 503,
        error: '503_ERR: Backend is down',
        details: {
          statusText: 'Service Unavailable',
          code: '503_ERR',
        },
      };
      expect(constructDisplayMessage(failure)).toBe(
        'Service Unavailable: 503_ERR: Backend is down (503)',
      );
    });

    it('prepends prefix even if message contains it but does not start with it', () => {
      const failure: NetworkFailure = {
        status: 400,
        error: 'The error is Bad Request due to invalid syntax',
        details: {
          statusText: 'Bad Request',
        },
      };
      expect(constructDisplayMessage(failure)).toBe(
        'Bad Request: The error is Bad Request due to invalid syntax (400)',
      );
    });

    it('returns the message as is if it is exactly equal to the prefix', () => {
      const failure: NetworkFailure = {
        status: 404,
        error: 'Not Found',
        details: {
          statusText: 'Not Found',
        },
      };
      expect(constructDisplayMessage(failure)).toBe('Not Found (404)');
    });

    it('handles empty statusText and code gracefully', () => {
      const failure: NetworkFailure = {
        status: 500,
        error: 'Some error',
        details: {
          statusText: '',
          code: '',
        },
      };
      expect(constructDisplayMessage(failure)).toBe('Some error (500)');
    });

    it('prefixes "Unknown error occurred." if error resolves to default', () => {
      const failure: NetworkFailure = {
        status: 500,
        error: null,
        details: {
          statusText: 'Server Error',
        },
      };
      expect(constructDisplayMessage(failure)).toBe(
        'Server Error: Unknown error occurred. (500)',
      );
    });
  });
});
