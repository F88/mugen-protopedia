import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  APP_TITLE,
  APP_DESCRIPTION,
  APP_URL,
  APP_OG_IMAGE,
} from '@/lib/config/app-constants';

describe('metadata builders', () => {
  const originalEnv = process.env.GOOGLE_SITE_VERIFICATION_TOKEN;
  const restoreEnv = () => {
    if (originalEnv === undefined) {
      delete process.env.GOOGLE_SITE_VERIFICATION_TOKEN;
    } else {
      process.env.GOOGLE_SITE_VERIFICATION_TOKEN = originalEnv;
    }
  };

  beforeEach(() => {
    restoreEnv();
    vi.resetModules();
  });

  afterEach(() => {
    restoreEnv();
  });

  const loadMetadata = async () => import('@/lib/config/metadata');

  it('buildBaseMetadata returns expected core fields', async () => {
    const { buildBaseMetadata } = await loadMetadata();
    const metadata = buildBaseMetadata();
    expect(metadata.title).toBe(APP_TITLE);
    expect(metadata.description).toBe(APP_DESCRIPTION);
    expect(metadata.applicationName).toBe(APP_TITLE);
    expect(metadata.alternates?.canonical).toBe(APP_URL);

    const ogImages = metadata.openGraph?.images;
    const firstOgImage = Array.isArray(ogImages) ? ogImages[0] : ogImages;
    let ogImageUrl: string | undefined;
    if (typeof firstOgImage === 'string') {
      ogImageUrl = firstOgImage;
    } else if (firstOgImage instanceof URL) {
      ogImageUrl = firstOgImage.href;
    } else if (firstOgImage) {
      const value = firstOgImage.url;
      ogImageUrl = value instanceof URL ? value.href : value;
    }
    expect(metadata.openGraph?.siteName).toBe(APP_TITLE);
    expect(ogImageUrl).toBe(APP_OG_IMAGE);

    const twitterImages = metadata.twitter?.images;
    const firstTwitterImage = Array.isArray(twitterImages)
      ? twitterImages[0]
      : twitterImages;
    let twitterImageUrl: string | undefined;
    if (typeof firstTwitterImage === 'string') {
      twitterImageUrl = firstTwitterImage;
    } else if (firstTwitterImage instanceof URL) {
      twitterImageUrl = firstTwitterImage.href;
    } else if (firstTwitterImage) {
      const value = firstTwitterImage.url;
      twitterImageUrl = value instanceof URL ? value.href : value;
    }
    expect(twitterImageUrl).toBe(APP_OG_IMAGE);
  });

  it('includes google verification when env var set', async () => {
    process.env.GOOGLE_SITE_VERIFICATION_TOKEN = 'dummy-token';
    const { buildBaseMetadata } = await loadMetadata();
    const metadata = buildBaseMetadata();
    expect(metadata.verification?.google).toBe('dummy-token');
  });

  it('omits google verification when env var absent', async () => {
    delete process.env.GOOGLE_SITE_VERIFICATION_TOKEN;
    const { buildBaseMetadata } = await loadMetadata();
    const metadata = buildBaseMetadata();
    expect(metadata.verification?.google).toBeUndefined();
  });

  it('buildViewport returns themeColor array', async () => {
    const { buildViewport } = await loadMetadata();
    const viewport = buildViewport();
    expect(viewport.themeColor).toBeDefined();
    const themeColors = Array.isArray(viewport.themeColor)
      ? viewport.themeColor
      : [viewport.themeColor];
    expect(themeColors.length).toBe(2);
  });
});
