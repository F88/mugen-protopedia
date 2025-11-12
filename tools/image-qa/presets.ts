import type { Preset } from './types.js';

/**
 * Preset configurations for common image validation scenarios
 */

export const presets: Record<string, Preset> = {
  'pwa-icons': {
    name: 'pwa-icons',
    description: 'Strict validation for PWA icons (dimensions, transparency)',
    config: {
      include: ['public/icons/**/*.png'],
      exclude: ['public/icons/**/*-maskable.png'], // Maskable icons can have transparency
      thresholds: {
        brightness: {
          mean: { min: 0.1, max: 0.9 }, // Normalized 0-1
        },
        contrast: {
          minVariance: 0.005, // Lowered to allow simple logo designs
        },
        alpha: {
          maxMeanTransparency: 0.5, // Max 50% average transparency
          allowFullyTransparent: false,
        },
        dimensions: {
          pattern: 'icon-(\\d+)x(\\d+)', // Extract WxH from filename
        },
      },
      severity: 'error',
    },
  },
  ogp: {
    name: 'ogp',
    description: 'Validation for Open Graph Protocol images',
    config: {
      include: ['public/og-*.png', 'public/images/og-*.png'],
      exclude: [],
      thresholds: {
        brightness: {
          mean: { min: 0.2, max: 0.8 }, // Not too dark or bright
        },
        contrast: {
          minVariance: 0.02,
        },
        dimensions: {
          expected: { width: 1200, height: 630 }, // Standard OG size
        },
      },
      severity: 'warning',
    },
  },
  screenshots: {
    name: 'screenshots',
    description: 'Validation for application screenshots',
    config: {
      include: ['public/screenshots/**/*.png'],
      exclude: [],
      thresholds: {
        brightness: {
          mean: { min: 0.15, max: 0.85 },
        },
        contrast: {
          minVariance: 0.015,
        },
      },
      severity: 'warning',
    },
  },
};
