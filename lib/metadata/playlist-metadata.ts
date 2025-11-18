import type { Metadata, ResolvingMetadata } from 'next';

import { APP_TITLE, APP_URL } from '@/lib/config/app-constants';
import { computeDocumentTitle } from '@/lib/utils/document-title';
import { parseDirectLaunchParams } from '@/lib/utils/validation';
import type { PlayModeState } from '@/types/mugen-protopedia.types';

export type SearchParams = Record<string, string | string[] | undefined>;

export const buildURLSearchParams = (
  searchParams?: SearchParams,
): URLSearchParams => {
  const params = new URLSearchParams();

  if (!searchParams) {
    return params;
  }

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== undefined) {
          params.append(key, entry);
        }
      });
      continue;
    }

    if (typeof value === 'string') {
      params.append(key, value);
    }
  }

  return params;
};

export const buildPlaylistTitleFromSearchParams = (
  resolved: SearchParams | undefined,
): string => {
  const params = buildURLSearchParams(resolved);
  const directLaunchResult = parseDirectLaunchParams(params);

  if (directLaunchResult.type !== 'success') {
    return APP_TITLE;
  }

  const { ids, title } = directLaunchResult.value;
  const hasPlaylistIds = ids.length > 0;
  const hasPlaylistTitle = typeof title === 'string' && title.trim().length > 0;

  if (!hasPlaylistIds && !hasPlaylistTitle) {
    return APP_TITLE;
  }

  const playlistState: PlayModeState = {
    type: 'playlist',
    ids,
    title,
  };

  return computeDocumentTitle(playlistState);
};

export const buildPlaylistMetadata = async (
  searchParams: Promise<SearchParams>,
  parent: ResolvingMetadata,
): Promise<Metadata> => {
  const resolved = await searchParams;
  const title = buildPlaylistTitleFromSearchParams(resolved);
  const params = buildURLSearchParams(resolved);
  const pathWithQuery = params.toString() ? `/?${params.toString()}` : '/';
  const absoluteUrl = new URL(pathWithQuery, APP_URL).toString();
  const hasQuery = params.toString().length > 0;

  const parentMetadata = await parent;
  const parentOpenGraph = parentMetadata.openGraph ?? {};
  const parentTwitter = parentMetadata.twitter ?? {};
  const parentAlternates = parentMetadata.alternates ?? {};

  return {
    title,
    alternates: {
      ...parentAlternates,
      canonical: hasQuery ? absoluteUrl : APP_URL,
    },
    openGraph: {
      ...parentOpenGraph,
      title,
      url: absoluteUrl,
    },
    twitter: {
      ...parentTwitter,
      title,
    },
  };
};
