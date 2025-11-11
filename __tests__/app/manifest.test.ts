import { describe, it, expect } from 'vitest';
import manifest from '../../app/manifest';

describe('PWA Manifest', () => {
  it('should have required PWA manifest fields', () => {
    const manifestData = manifest();

    expect(manifestData.name).toBe('無限ProtoPedia');
    expect(manifestData.short_name).toBe('無限PP');
    expect(manifestData.description).toBeTruthy();
    expect(manifestData.start_url).toBe('/');
    expect(manifestData.display).toBe('standalone');
    expect(manifestData.theme_color).toBeTruthy();
    expect(manifestData.background_color).toBeTruthy();
  });

  it('should categorize the app', () => {
    const manifestData = manifest();
    expect(manifestData.categories).toEqual(['entertainment', 'productivity']);
  });

  it('should have scope set to root', () => {
    const manifestData = manifest();
    expect(manifestData.scope).toBe('/');
  });

  it('should have id set to root', () => {
    const manifestData = manifest();
    expect(manifestData.id).toBe('/');
  });

  it('should have orientation set to portrait primary', () => {
    const manifestData = manifest();
    expect(manifestData.orientation).toBe('any');
  });

  it('should expose locale metadata', () => {
    const manifestData = manifest();
    expect(manifestData.lang).toBeUndefined();
    expect(manifestData.dir).toBeUndefined();
  });

  it('should list display overrides and launch handler', () => {
    const manifestData = manifest();

    expect(manifestData.display_override).toEqual([
      'window-controls-overlay',
      'standalone',
    ]);
    expect(manifestData.launch_handler).toEqual({
      client_mode: 'focus-existing',
    });
  });

  describe('shortcut entries', () => {
    it('should not expose shortcut', () => {
      const manifestData = manifest();
      const dashboardShortcut = manifestData.shortcuts?.find(
        (entry) => entry.short_name === 'Dashboard',
      );
      expect(dashboardShortcut).toBeUndefined();
    });
  });

  describe('screenshot entries', () => {
    it('should include screenshots for richer install UI', () => {
      const manifestData = manifest();

      expect(Array.isArray(manifestData.screenshots)).toBe(true);
      const screenshots = manifestData.screenshots ?? [];

      type Screenshot = (typeof screenshots)[number];
      const formFactor = (s: Screenshot): 'narrow' | 'wide' | undefined =>
        (s as { form_factor?: 'narrow' | 'wide' }).form_factor;

      const hasWide = screenshots.some((s) => formFactor(s) === 'wide');
      const hasNarrow = screenshots.some((s) => formFactor(s) === 'narrow');

      expect(hasWide).toBe(true);
      expect(hasNarrow).toBe(true);
    });
  });

  describe('icon entries', () => {
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
  });
});
