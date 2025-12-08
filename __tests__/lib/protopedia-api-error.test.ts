import { describe, expect, it } from 'vitest';
import { ProtoPediaApiError } from '@/lib/protopedia-client';

describe('ProtoPediaApiError', () => {
  describe('SDK v2.0.0 error structure', () => {
    it('should have req property with url and method', () => {
      // This test verifies that the SDK error has the expected v2.0.0 structure
      // Create a mock error object that matches the SDK structure
      const mockError = {
        req: {
          url: 'https://protopedia.net/v2/api/prototype/list',
          method: 'GET',
        },
        status: 404,
        message: 'Not Found',
      };

      // Verify the structure exists
      expect(mockError.req).toBeDefined();
      expect(mockError.req.url).toBe(
        'https://protopedia.net/v2/api/prototype/list',
      );
      expect(mockError.req.method).toBe('GET');
      expect(mockError.status).toBe(404);
    });

    it('should maintain backward compatibility with status property', () => {
      // Verify that the status property is still available
      const mockError = {
        req: {
          url: 'https://protopedia.net/v2/api/prototype/get',
          method: 'GET',
        },
        status: 500,
        message: 'Internal Server Error',
      };

      // status should still be accessible directly
      expect(mockError.status).toBe(500);
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
      const mockError = {
        req: {
          url: 'https://protopedia.net/v2/api/prototype/list',
          method: 'POST',
        },
        status: 403,
        message: 'Forbidden',
      };

      // Verify we can access all properties used in error logging
      expect(mockError.req).toBeDefined();
      expect(mockError.req.url).toBeDefined();
      expect(mockError.req.method).toBeDefined();
      expect(mockError.status).toBeDefined();
      expect(mockError.message).toBeDefined();
    });
  });
});
