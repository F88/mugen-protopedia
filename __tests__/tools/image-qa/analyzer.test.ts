/**
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import { join } from 'path';
import {
  analyzeImage,
  validateImage,
  validateDimensions,
} from '@/tools/image-qa/analyzer';
import type { ThresholdConfig } from '@/tools/image-qa/types';

const fixturesDir = join(process.cwd(), 'tools/fixtures/images');

describe('Image Analyzer', () => {
  describe('analyzeImage', () => {
    it('should analyze a good image correctly', async () => {
      const stats = await analyzeImage(join(fixturesDir, 'icon-512x512.png'));

      expect(stats.width).toBe(512);
      expect(stats.height).toBe(512);
      expect(stats.channels).toBe(4);
      expect(stats.hasAlpha).toBe(true);
      expect(stats.brightness.mean).toBeGreaterThan(0);
      expect(stats.brightness.mean).toBeLessThan(1);
      expect(stats.contrast.variance).toBeGreaterThan(0);
    });

    it('should detect dark image', async () => {
      const stats = await analyzeImage(
        join(fixturesDir, 'icon-192x192-dark.png'),
      );

      expect(stats.brightness.mean).toBeLessThan(0.1);
    });

    it('should detect bright image', async () => {
      const stats = await analyzeImage(
        join(fixturesDir, 'icon-192x192-bright.png'),
      );

      expect(stats.brightness.mean).toBeGreaterThan(0.9);
    });

    it('should detect low contrast image', async () => {
      const stats = await analyzeImage(
        join(fixturesDir, 'icon-128x128-flat.png'),
      );

      expect(stats.contrast.variance).toBeLessThan(0.01);
    });

    it('should detect high transparency', async () => {
      const stats = await analyzeImage(
        join(fixturesDir, 'icon-256x256-transparent.png'),
      );

      expect(stats.alpha).toBeDefined();
      expect(stats.alpha!.mean).toBeGreaterThan(0.5);
    });

    it('should handle image with proper contrast', async () => {
      const stats = await analyzeImage(join(fixturesDir, 'icon-192x192.png'));

      expect(stats.brightness.mean).toBeGreaterThan(0.1);
      expect(stats.brightness.mean).toBeLessThan(0.9);
      expect(stats.contrast.variance).toBeGreaterThan(0.01);
    });
  });

  describe('validateImage', () => {
    it('should pass validation for good image', async () => {
      const stats = await analyzeImage(join(fixturesDir, 'icon-512x512.png'));
      const thresholds: ThresholdConfig = {
        brightness: {
          mean: { min: 0.1, max: 0.9 },
        },
        contrast: {
          minVariance: 0.01,
        },
      };

      const { errors } = validateImage(stats, thresholds);

      expect(errors.length).toBe(0);
    });

    it('should fail validation for dark image', async () => {
      const stats = await analyzeImage(
        join(fixturesDir, 'icon-192x192-dark.png'),
      );
      const thresholds: ThresholdConfig = {
        brightness: {
          mean: { min: 0.1, max: 0.9 },
        },
      };

      const { errors } = validateImage(stats, thresholds);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].type).toBe('brightness');
      expect(errors[0].message).toContain('too dark');
    });

    it('should fail validation for bright image', async () => {
      const stats = await analyzeImage(
        join(fixturesDir, 'icon-192x192-bright.png'),
      );
      const thresholds: ThresholdConfig = {
        brightness: {
          mean: { min: 0.1, max: 0.9 },
        },
      };

      const { errors } = validateImage(stats, thresholds);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].type).toBe('brightness');
      expect(errors[0].message).toContain('too bright');
    });

    it('should fail validation for low contrast image', async () => {
      const stats = await analyzeImage(
        join(fixturesDir, 'icon-128x128-flat.png'),
      );
      const thresholds: ThresholdConfig = {
        contrast: {
          minVariance: 0.01,
        },
      };

      const { errors } = validateImage(stats, thresholds);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].type).toBe('contrast');
      expect(errors[0].message).toContain('Low contrast');
    });

    it('should fail validation for high transparency', async () => {
      const stats = await analyzeImage(
        join(fixturesDir, 'icon-256x256-transparent.png'),
      );
      const thresholds: ThresholdConfig = {
        alpha: {
          maxMeanTransparency: 0.5,
          allowFullyTransparent: false,
        },
      };

      const { errors } = validateImage(stats, thresholds);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].type).toBe('transparency');
    });
  });

  describe('validateDimensions', () => {
    it('should validate correct dimensions from pattern', async () => {
      const stats = await analyzeImage(join(fixturesDir, 'icon-512x512.png'));
      const errors = validateDimensions(stats, 'icon-512x512.png', {
        pattern: 'icon-(\\d+)x(\\d+)',
      });

      expect(errors.length).toBe(0);
    });

    it('should detect dimension mismatch from pattern', async () => {
      const stats = await analyzeImage(
        join(fixturesDir, 'icon-512x512-wrong.png'),
      );
      const errors = validateDimensions(stats, 'icon-512x512-wrong.png', {
        pattern: 'icon-(\\d+)x(\\d+)',
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].type).toBe('dimensions');
      expect(errors[0].message).toContain('512x512');
      expect(errors[0].message).toContain('200x200');
    });

    it('should validate exact dimensions', async () => {
      const stats = await analyzeImage(join(fixturesDir, 'icon-192x192.png'));
      const errors = validateDimensions(stats, 'icon-192x192.png', {
        expected: { width: 192, height: 192 },
      });

      expect(errors.length).toBe(0);
    });

    it('should detect exact dimension mismatch', async () => {
      const stats = await analyzeImage(
        join(fixturesDir, 'icon-512x512-wrong.png'),
      );
      const errors = validateDimensions(stats, 'icon-512x512-wrong.png', {
        expected: { width: 512, height: 512 },
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].type).toBe('dimensions');
    });
  });
});
