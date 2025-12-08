import { describe, expect, it } from 'vitest';
import { ProtoPediaApiError } from '@/lib/protopedia-client';

describe('ProtoPediaApiError', () => {
  describe('SDK v2.0.0 error structure', () => {
    it('should have req property with url and method', () => {
      // This test verifies that the SDK error has the expected v2.0.0 structure
      // Create an error instance that reflects the SDK structure
      const error = new ProtoPediaApiError({
        message: 'Not Found',
        req: {
          url: 'https://protopedia.net/v2/api/prototype/list',
          method: 'GET',
        },
        status: 404,
        statusText: 'Not Found',
      });

      // Verify the structure exists on the error instance
      expect(error).toBeInstanceOf(ProtoPediaApiError);
      expect(error.req).toBeDefined();
      expect(error.req.url).toBe(
        'https://protopedia.net/v2/api/prototype/list',
      );
      expect(error.req.method).toBe('GET');
      expect(error.status).toBe(404);
    });

    it('should maintain backward compatibility with status property', () => {
      // Verify that the status property is still available
      const error = new ProtoPediaApiError({
        message: 'Internal Server Error',
        req: {
          url: 'https://protopedia.net/v2/api/prototype/get',
          method: 'GET',
        },
        status: 500,
        statusText: 'Internal Server Error',
      });

      // status should still be accessible directly on the error instance
      expect(error).toBeInstanceOf(ProtoPediaApiError);
      expect(error.status).toBe(500);
    });

    it('should verify ProtoPediaApiError is exported from SDK', () => {
      // Verify that ProtoPediaApiError is properly imported from the SDK
      expect(ProtoPediaApiError).toBeDefined();
      expect(typeof ProtoPediaApiError).toBe('function');
    });
  });

  describe('error handling compatibility', () => {
    it('should have all required properties for error logging', () => {
      // Test the structure we expect to use in error handling
      const error = new ProtoPediaApiError({
        message: 'Forbidden',
        req: {
          url: 'https://protopedia.net/v2/api/prototype/list',
          method: 'POST',
        },
        status: 403,
        statusText: 'Forbidden',
      });

      // Verify we can access all properties used in error logging
      expect(error).toBeInstanceOf(ProtoPediaApiError);
      expect(error.req).toBeDefined();
      expect(error.req.url).toBeDefined();
      expect(error.req.method).toBeDefined();
      expect(error.status).toBeDefined();
      expect(error.message).toBeDefined();
    });
  });
});
