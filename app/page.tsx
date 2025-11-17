/**
 * @file Next.js App Router page entry that renders the client HomeContent component
 * and sets dynamic metadata based on direct launch query parameters.
 */

import type { Metadata, ResolvingMetadata } from 'next';
import { Suspense } from 'react';

import { HomeContent } from './home-content';

import { APP_TITLE, APP_URL } from '@/lib/config/app-constants';
import { computeDocumentTitle } from '@/lib/utils/document-title';
import { parseDirectLaunchParams } from '@/lib/utils/validation';
import type { PlayModeState } from '@/types/mugen-protopedia.types';

type SearchParams = Record<string, string | string[] | undefined>;

//

const DEFAULT_TITLE = APP_TITLE;

const buildURLSearchParams = (searchParams?: SearchParams): URLSearchParams => {
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

const buildTitleFromSearchParams = (
  resolved: SearchParams | undefined,
): string => {
  const params = buildURLSearchParams(resolved);
  const directLaunchResult = parseDirectLaunchParams(params);

  if (directLaunchResult.type !== 'success') {
    return DEFAULT_TITLE;
  }

  const { ids, title } = directLaunchResult.value;
  const hasPlaylistIds = ids.length > 0;
  const hasPlaylistTitle = typeof title === 'string' && title.trim().length > 0;

  if (!hasPlaylistIds && !hasPlaylistTitle) {
    return DEFAULT_TITLE;
  }

  const playlistState: PlayModeState = {
    type: 'playlist',
    ids,
    title,
  };

  return computeDocumentTitle(playlistState);
};

export async function generateMetadata(
  {
    searchParams,
  }: {
    searchParams: Promise<SearchParams>;
  },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const resolved = await searchParams;
  const title = buildTitleFromSearchParams(resolved);
  const params = buildURLSearchParams(resolved);
  const pathWithQuery = params.toString() ? `/?${params.toString()}` : '/';
  const absoluteUrl = new URL(pathWithQuery, APP_URL).toString();
  const hasQuery = params.toString().length > 0;

  // Note on merging:
  // Metadata objects are shallowly merged. Defining `openGraph` (or `twitter`)
  // at this level replaces the parent's entire object. To preserve fields like
  // siteName, images, and card settings, extend from the parent metadata.
  const parentMetadata = await parent;
  const parentOpenGraph = parentMetadata.openGraph ?? {};
  const parentTwitter = parentMetadata.twitter ?? {};
  const parentAlternates = parentMetadata.alternates ?? {};

  return {
    title,
    // Align canonical with the concrete content URL when query exists.
    // This helps search engines disambiguate versions. Preserve other alternates.
    alternates: {
      ...parentAlternates,
      canonical: hasQuery ? absoluteUrl : APP_URL,
    },
    openGraph: {
      ...parentOpenGraph,
      title,
      // Provide absolute URL to ensure override of layout-level value
      url: absoluteUrl,
    },
    twitter: {
      ...parentTwitter,
      title,
    },
  };
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
