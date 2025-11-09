import { describe, it, expect } from 'vitest';
import manifest from '../../app/manifest';

describe('PWA Manifest', () => {
  it('should have required PWA manifest fields', () => {
    const manifestData = manifest();

    // Check essential fields
    expect(manifestData.name).toBe('無限ProtoPedia');
    expect(manifestData.short_name).toBe('∞PP');
    expect(manifestData.description).toBeTruthy();
    expect(manifestData.start_url).toBe('/');
    expect(manifestData.display).toBe('standalone');
    expect(manifestData.theme_color).toBeTruthy();
    expect(manifestData.background_color).toBeTruthy();
  });

  it('should have required icon sizes (192x192 and 512x512)', () => {
    const manifestData = manifest();

    const icon192 = manifestData.icons?.find((icon) =>
      icon.sizes?.includes('192x192'),
    );
    const icon512 = manifestData.icons?.find((icon) =>
      icon.sizes?.includes('512x512'),
    );

    expect(icon192).toBeTruthy();
    expect(icon512).toBeTruthy();
  });

  it('should have maskable icons for better app integration', () => {
    const manifestData = manifest();

    const maskableIcons = manifestData.icons?.filter((icon) =>
      icon.purpose?.includes('maskable'),
    );

    expect(maskableIcons).toBeTruthy();
    expect(maskableIcons!.length).toBeGreaterThan(0);
  });

  it('should have proper icon types', () => {
    const manifestData = manifest();

    manifestData.icons?.forEach((icon) => {
      expect(icon.type).toBe('image/png');
      expect(icon.src).toMatch(/^\/icons\//);
    });
  });

  it('should have orientation set', () => {
    const manifestData = manifest();

    expect(manifestData.orientation).toBe('portrait-primary');
  });

  it('should have scope set to root', () => {
    const manifestData = manifest();

    expect(manifestData.scope).toBe('/');
  });

  it('should include screenshots for richer install UI', () => {
    const manifestData = manifest();

    expect(Array.isArray(manifestData.screenshots)).toBe(true);
    const screenshots = manifestData.screenshots ?? [];

    type Screenshot = (typeof screenshots)[number];
    const formFactor = (s: Screenshot): 'narrow' | 'wide' | undefined =>
      (s as { form_factor?: 'narrow' | 'wide' }).form_factor;

    // at least one wide (desktop)
    const hasWide = screenshots.some((s) => formFactor(s) === 'wide');
    // and at least one that is narrow (mobile)
    const hasNarrow = screenshots.some((s) => formFactor(s) === 'narrow');

    expect(hasWide).toBe(true);
    expect(hasNarrow).toBe(true);
  });
});
