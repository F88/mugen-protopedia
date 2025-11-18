/**
 * Home page entry for the App Router.
 *
 * This server module wires the root `/` route to the `MugenProtoPedia`
 * client component and provides dynamic metadata based on playlist-related
 * query parameters via `generateMetadata`.
 */
import type { Metadata, ResolvingMetadata } from 'next';
import { Suspense } from 'react';

import { MugenProtoPedia } from './mugen-protopedia';
import { buildPlaylistMetadata } from '@/lib/metadata/playlist-metadata';
import type { SearchParams } from '@/lib/metadata/playlist-metadata';

// Note: This page uses dynamic `generateMetadata` because the
// home view depends on playlist-related query parameters.
export async function generateMetadata(
  {
    searchParams,
  }: {
    searchParams: Promise<SearchParams>;
  },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return buildPlaylistMetadata(searchParams, parent);
}

/**
 * Home page component.
 *
 * Renders the main `MugenProtoPedia` client experience inside a Suspense
 * boundary. All interactive behavior (play modes, scrolling, playlist
 * playback, etc.) is encapsulated within `MugenProtoPedia`.
 */
export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <MugenProtoPedia />
    </Suspense>
  );
}
