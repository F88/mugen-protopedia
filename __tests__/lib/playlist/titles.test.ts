import { describe, expect, it } from 'vitest';

import { APP_TITLE } from '@/lib/config/app-constants';
import { computePlaylistLandingTitle } from '@/lib/playlist/titles';

describe('computePlaylistLandingTitle', () => {
  it('formats as "<title> | Playlist | <APP_TITLE>"', () => {
    expect(computePlaylistLandingTitle('My Playlist')).toBe(
      `My Playlist | Playlist | ${APP_TITLE}`,
    );
  });

  it('keeps symbols and multibyte characters as-is', () => {
    expect(computePlaylistLandingTitle('F10 | ProtoPedia')).toBe(
      `F10 | ProtoPedia | Playlist | ${APP_TITLE}`,
    );
    expect(computePlaylistLandingTitle('夏の作品集 🎉')).toBe(
      `夏の作品集 🎉 | Playlist | ${APP_TITLE}`,
    );
  });

  it('does not truncate long titles (unlike the player page title)', () => {
    const longTitle = 'x'.repeat(150);
    expect(computePlaylistLandingTitle(longTitle)).toBe(
      `${longTitle} | Playlist | ${APP_TITLE}`,
    );
  });

  it('survives the URL encode/decode round trip for titles containing percent sequences', () => {
    // The landing page decodes its path param with decodeURIComponent;
    // titles containing raw % sequences must come back unchanged.
    const trickyTitles = ['50%OFF', 'a%2Cb', '100%25 done'];
    for (const title of trickyTitles) {
      const roundTripped = decodeURIComponent(encodeURIComponent(title));
      expect(computePlaylistLandingTitle(roundTripped)).toBe(
        computePlaylistLandingTitle(title),
      );
    }
  });
});
