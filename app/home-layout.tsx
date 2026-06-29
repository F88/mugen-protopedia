/**
 * @file Top-level layout shell for the home route.
 *
 * Owns the page-level `<main>` container (background + min height) so the
 * route, rather than the interactive `MugenProtoPedia` client component, owns
 * the layout shell — mirroring how `PlaylistEditPage` owns its own `<main>`.
 *
 * This is a plain presentational wrapper with no hooks, so it works as a server
 * component (used by `app/page.tsx`) and can also wrap the home view in
 * Storybook.
 */
import type { ReactNode } from 'react';

export function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {children}
    </main>
  );
}
