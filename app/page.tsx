/**
 * @file Next.js App Router page entry that renders the client HomeContent component
 * and sets dynamic metadata based on direct launch query parameters.
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';

import { HomeContent } from './home-content';

import { APP_TITLE } from '@/lib/config/app-constants';
import { computeDocumentTitle } from '@/lib/utils/document-title';
import { parseDirectLaunchParams } from '@/lib/utils/validation';
import type { PlayModeState } from '@/types/mugen-protopedia.types';

type SearchParams = Record<string, string | string[] | undefined>;

const isPromise = <T,>(value: unknown): value is Promise<T> =>
  value instanceof Promise;

type GenerateMetadataParams = {
  searchParams?: SearchParams;
};

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

export async function generateMetadata({
  searchParams,
}: GenerateMetadataParams & {
  searchParams?: SearchParams | Promise<SearchParams>;
}): Promise<Metadata> {
  const resolved = isPromise<SearchParams>(searchParams)
    ? await searchParams
    : (searchParams as SearchParams | undefined);
  const title = buildTitleFromSearchParams(resolved);

  return {
    title,
    openGraph: {
      title,
    },
    twitter: {
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
