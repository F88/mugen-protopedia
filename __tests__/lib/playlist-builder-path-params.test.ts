import { describe, expect, it } from 'vitest';
import { buildPlaylistUrlWithPathParams } from '@/lib/utils/playlist-builder';
import { APP_URL } from '@/lib/config/app-constants';

describe('buildPlaylistUrlWithPathParams', () => {
  it('returns path-based URL when both title and IDs are present', () => {
    const ids = [1, 2, 3];
    const title = 'My Playlist';
    const url = buildPlaylistUrlWithPathParams(ids, title);
    expect(url).toBe(`${APP_URL}/playlist/My%20Playlist/1%2C2%2C3`);
  });

  it('returns path-based URL with encoded title', () => {
    const ids = [10];
    const title = 'Title/With/Slashes';
    const url = buildPlaylistUrlWithPathParams(ids, title);
    expect(url).toBe(`${APP_URL}/playlist/Title%2FWith%2FSlashes/10`);
  });

  it('falls back to query params when title is missing', () => {
    const ids = [1, 2];
    const title = '';
    const url = buildPlaylistUrlWithPathParams(ids, title);
    expect(url).toBe(`${APP_URL}/?id=1%2C2`);
  });

  it('falls back to query params (empty string) when IDs are missing', () => {
    const ids: number[] = [];
    const title = 'Title Only';
    const url = buildPlaylistUrlWithPathParams(ids, title);
    // buildPlaylistUrl returns empty string if no IDs (and title is present but logic there might differ slightly depending on implementation details,
    // but let's check what buildPlaylistUrl does.
    // Actually buildPlaylistUrl allows title-only playlist if title is valid.
    // Let's check buildPlaylistUrl implementation again.
    // "if ((!ids || ids.length === 0) && (!title || title.length === 0)) { return ''; }"
    // "if (titleGraphemes.length > 0 ...) { params.set('title', title); }"
    // So title-only is valid for buildPlaylistUrl.
    // But buildPlaylistUrlWithPathParams requires BOTH for path-based.
    expect(url).toBe(`${APP_URL}/?title=Title+Only`);
  });

  it('returns empty string when both are missing', () => {
    const url = buildPlaylistUrlWithPathParams([], '');
    expect(url).toBe('');
  });
});
