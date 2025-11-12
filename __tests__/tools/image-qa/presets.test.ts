/**
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import { getPreset } from '@/tools/image-qa/runner';
import { presets } from '@/tools/image-qa/presets';

describe('Presets', () => {
  it('should have pwa-icons preset', () => {
    expect(presets['pwa-icons']).toBeDefined();
    expect(presets['pwa-icons'].name).toBe('pwa-icons');
    expect(
      presets['pwa-icons'].config.thresholds.dimensions?.pattern,
    ).toBeDefined();
  });

  it('should have ogp preset', () => {
    expect(presets.ogp).toBeDefined();
    expect(presets.ogp.config.thresholds.dimensions?.expected).toEqual({
      width: 1200,
      height: 630,
    });
  });

  it('should have screenshots preset', () => {
    expect(presets.screenshots).toBeDefined();
  });

  it('should get preset by name', () => {
    const config = getPreset('pwa-icons');
    expect(config).toBeDefined();
    expect(config.include).toContain('public/icons/**/*.png');
  });

  it('should throw error for unknown preset', () => {
    expect(() => getPreset('unknown')).toThrow('Unknown preset');
  });
});
