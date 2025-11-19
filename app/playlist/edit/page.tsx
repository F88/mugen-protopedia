/**
 * Playlist editor page entry for the App Router.
 *
 * This server component owns the layout and static metadata for `/playlist/edit`,
 * and delegates all URL-dependent client behavior (direct launch parameters,
 * playlist form interactions, etc.) to `PlaylistEditClient`.
 */
import Link from 'next/link';
import type { Metadata } from 'next';
import { Suspense } from 'react';

import { PlaylistEditClient } from '@/components/playlist-edit-client';

// Note: This page intentionally uses static `metadata` instead of
// `generateMetadata` because it does not depend on playlist queries.
export const metadata: Metadata = {
  title: 'Playlist Editor',
  description:
    'Build Mugen ProtoPedia playlist URLs from IDs, URLs, or raw text.',
};

/**
 * Playlist editor page component.
 *
 * Renders the page heading, a link back to the home view, and a Suspense
 * boundary that wraps `PlaylistEditClient`, which reads search parameters and
 * drives the playlist URL generator UI.
 */
export default function PlaylistEditPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Playlist Editor (Beta)</h1>
        <Link
          href="/"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          🏠 Back to home
        </Link>
      </div>
      <Suspense fallback={null}>
        <PlaylistEditClient />
      </Suspense>
    </main>
  );
}
