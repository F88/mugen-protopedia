/**
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import { formatTextReport, formatJsonReport } from '@/tools/image-qa/formatter';
import type { QAReport } from '@/tools/image-qa/types';

describe('Formatter', () => {
  const mockReport: QAReport = {
    timestamp: '2024-01-01T00:00:00.000Z',
    totalImages: 2,
    passed: 1,
    failed: 1,
    summary: {
      errors: 1,
      warnings: 1,
    },
    results: [
      {
        path: 'test/good.png',
        valid: true,
        errors: [],
        warnings: [
          {
            type: 'brightness',
            message: 'Minor brightness issue',
          },
        ],
        stats: {
          path: 'test/good.png',
          width: 512,
          height: 512,
          channels: 4,
          hasAlpha: true,
          brightness: { mean: 0.5, min: 0.1, max: 0.9 },
          contrast: { variance: 0.05, stdDev: 0.22 },
        },
      },
      {
        path: 'test/bad.png',
        valid: false,
        errors: [
          {
            type: 'brightness',
            message: 'Image too dark',
            severity: 'error',
          },
        ],
        warnings: [],
        stats: {
          path: 'test/bad.png',
          width: 256,
          height: 256,
          channels: 3,
          hasAlpha: false,
          brightness: { mean: 0.05, min: 0.0, max: 0.1 },
          contrast: { variance: 0.001, stdDev: 0.03 },
        },
      },
    ],
  };

  describe('formatTextReport', () => {
    it('should format report as text', () => {
      const text = formatTextReport(mockReport);

      expect(text).toContain('IMAGE QA REPORT');
      expect(text).toContain('Total Images: 2');
      expect(text).toContain('Passed: 1');
      expect(text).toContain('Failed: 1');
      expect(text).toContain('Errors: 1');
      expect(text).toContain('Warnings: 1');
    });

    it('should list failed images', () => {
      const text = formatTextReport(mockReport);

      expect(text).toContain('FAILED IMAGES');
      expect(text).toContain('test/bad.png');
      expect(text).toContain('Image too dark');
    });

    it('should list warnings for passed images', () => {
      const text = formatTextReport(mockReport);

      expect(text).toContain('PASSED WITH WARNINGS');
      expect(text).toContain('test/good.png');
      expect(text).toContain('Minor brightness issue');
    });

    it('should show success message when all pass', () => {
      const successReport: QAReport = {
        ...mockReport,
        passed: 2,
        failed: 0,
        summary: { errors: 0, warnings: 0 },
        results: mockReport.results.map((r) => ({
          ...r,
          valid: true,
          errors: [],
          warnings: [],
        })),
      };

      const text = formatTextReport(successReport);

      expect(text).toContain('All images passed validation!');
    });
  });

  describe('formatJsonReport', () => {
    it('should format report as JSON', () => {
      const json = formatJsonReport(mockReport);
      const parsed = JSON.parse(json);

      expect(parsed.totalImages).toBe(2);
      expect(parsed.passed).toBe(1);
      expect(parsed.failed).toBe(1);
      expect(parsed.results).toHaveLength(2);
    });

    it('should be valid JSON', () => {
      const json = formatJsonReport(mockReport);
      expect(() => JSON.parse(json)).not.toThrow();
    });
  });
});
