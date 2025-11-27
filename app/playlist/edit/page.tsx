/**
 * @file Playlist Editor Page
 * @description
 *   The playlist URL generator/editor interface for the Mugen ProtoPedia application.
 *   This page features a distinctive parchment/cyber aesthetic with retro typography,
 *   creating a unique blend of analog and digital themes for playlist URL editing.
 *
 *   - Visual theme: Vintage parchment (light mode) meets cyber grid (dark mode)
 *   - Typography: Seymour One font for a bold, retro display feel
 *   - Grid pattern: Sepia brown lines (light) / Matrix-style green lines (dark)
 *   - PlaylistEditClient: Handles all URL-dependent client behavior and form interactions
 *   - Responsive layout with theme toggle and navigation controls
 */
import type { Metadata } from 'next';
import { Seymour_One } from 'next/font/google';

import { Suspense } from 'react';

import {
  buildURLSearchParams,
  type SearchParams,
} from '@/lib/metadata/playlist-metadata';

import { MugenProtoPediaHomeButton } from '@/components/mugen-pp-top-button';
import { PlaylistEditClient } from '@/components/playlist/editor/playlist-edit-client';
import { ThemeToggle } from '@/components/theme-toggle';

const seymourFont = Seymour_One({
  weight: '400',
  subsets: ['latin'],
});

// Note: This page intentionally uses static `metadata` instead of
// `generateMetadata` because it does not depend on playlist queries.
export const metadata: Metadata = {
  title: 'Playlist Editor',
  description:
    'Build Mugen ProtoPedia playlist URLs from IDs, URLs, or raw text.',
};

interface PlaylistEditPageProps {
  searchParams: Promise<SearchParams>;
}

/**
 * PlaylistEditPage component
 *
 * Renders the playlist editor dashboard with a unique parchment/cyber-themed aesthetic.
 *
 * ## Theme-specific styling
 * - **Light mode:** Vintage parchment background (#e8dcc8) with sepia brown grid lines
 * - **Dark mode:** Deep sepia background (#1a1512) with Matrix-style green grid lines
 * - **Typography:** Seymour One - bold, rounded retro display font
 * - **Grid pattern:** 40px × 40px repeating grid for a notebook/technical drawing aesthetic
 *
 * ## Design philosophy
 * Combines analog (vintage parchment, old documents) and digital (cyber grid, Matrix aesthetic)
 * to create a time-traveling feel appropriate for archiving and cataloging prototypes.
 *
 * - PlaylistEditClient: Main form component for playlist URL generation
 * - ThemeToggle: Theme switcher control
 * - MugenProtoPediaHomeButton: Navigation back to home
 */
export default async function PlaylistEditPage(props: PlaylistEditPageProps) {
  const searchParams = await props.searchParams;
  const query = buildURLSearchParams(searchParams);

  const href = query.toString().length > 0 ? `/?${query.toString()}` : '/';

  const mainClassName = [
    seymourFont.className,
    'min-h-screen',
    'bg-[#e8dcc8] dark:bg-[#1a1512]',
    'text-gray-900 dark:text-gray-100 transition-colors',
    'mx-auto flex w-full max-w-full flex-col gap-6 p-6',
    // Grid lines: sepia brown for light, green for dark
    '[background-image:linear-gradient(rgba(139,115,85,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(139,115,85,0.15)_1px,transparent_1px)]',
    'dark:[background-image:linear-gradient(rgba(34,197,94,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.25)_1px,transparent_1px)]',
    '[background-size:40px_40px,40px_40px]',
  ].join(' ');

  return (
    <main className={mainClassName}>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Playlist Editor (Beta)</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* <Link
            href={href}
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            🏠 Back to home
          </Link> */}
          <MugenProtoPediaHomeButton link={href} />
          <ThemeToggle />
        </div>
      </div>
      <Suspense fallback={null}>
        <PlaylistEditClient />
      </Suspense>
    </main>
  );
}
