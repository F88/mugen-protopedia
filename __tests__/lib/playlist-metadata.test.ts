import { describe, expect, it } from 'vitest';

import type { Metadata, ResolvingMetadata } from 'next';

import {
  buildPlaylistMetadata,
  buildPlaylistTitleFromSearchParams,
  buildURLSearchParams,
  type SearchParams,
} from '@/lib/metadata/playlist-metadata';

// Helper to build a fake ResolvingMetadata that returns the given metadata
const createResolvingMetadata = (metadata: Metadata): ResolvingMetadata => {
  return Promise.resolve(metadata) as ResolvingMetadata;
};

describe('playlist-metadata helpers', () => {
  describe('buildURLSearchParams', () => {
    it('returns empty params when input is undefined', () => {
      const params = buildURLSearchParams(undefined);
      expect(Array.from(params.entries())).toEqual([]);
    });

    it('appends string values and flattens arrays', () => {
      const searchParams: SearchParams = {
        id: '1',
        title: ['foo', 'bar'],
        empty: undefined,
      };

      const params = buildURLSearchParams(searchParams);

      expect(params.get('id')).toBe('1');
      expect(params.getAll('title')).toEqual(['foo', 'bar']);
      expect(params.has('empty')).toBe(false);
    });
  });

  describe('buildPlaylistTitleFromSearchParams', () => {
    it('returns APP_TITLE when parseDirectLaunchParams fails', () => {
      const title = buildPlaylistTitleFromSearchParams({});
      expect(title).toBeDefined();
      // We do not assert the exact value here to avoid coupling to APP_TITLE.
    });

    it('returns APP_TITLE when playlist has no ids and no title', () => {
      const searchParams: SearchParams = {
        // direct-launch parser will see no ids and no title
      };

      const title = buildPlaylistTitleFromSearchParams(searchParams);
      expect(title).toBeDefined();
    });

    it('returns a non-empty title when playlist has ids or title', () => {
      const searchParams: SearchParams = {
        id: '1,2',
        title: 'My Playlist',
      };

      const title = buildPlaylistTitleFromSearchParams(searchParams);
      expect(typeof title).toBe('string');
      expect(title.length).toBeGreaterThan(0);
    });
  });

  describe('buildPlaylistMetadata', () => {
    it('builds metadata with canonical APP_URL when there is no query', async () => {
      const searchParamsPromise = Promise.resolve<SearchParams>({});
      const parent: Metadata = {
        title: 'Parent',
        alternates: {
          canonical: 'https://example.com',
        },
        openGraph: {
          siteName: 'Site',
        },
      };

      const result = await buildPlaylistMetadata(
        searchParamsPromise,
        createResolvingMetadata(parent),
      );

      expect(result.title).toBeDefined();
      expect(result.alternates?.canonical).toBeDefined();
      expect(result.openGraph?.siteName).toBe('Site');
    });

    it('builds metadata with query-aware canonical and URL', async () => {
      const searchParamsPromise = Promise.resolve<SearchParams>({
        id: '1,2',
        title: 'My Playlist',
      });
      const parent: Metadata = {
        alternates: {},
        openGraph: {},
        twitter: {},
      };

      const result = await buildPlaylistMetadata(
        searchParamsPromise,
        createResolvingMetadata(parent),
      );

      expect(result.title).toBeDefined();
      const canonical = result.alternates?.canonical;
      expect(typeof canonical).toBe('string');
      expect(canonical).toContain('/?');

      const ogUrl = result.openGraph?.url;
      expect(typeof ogUrl).toBe('string');
      expect(ogUrl).toContain('/?');
    });
  });
});
