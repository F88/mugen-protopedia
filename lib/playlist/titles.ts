import { APP_TITLE } from '@/lib/config/app-constants';

/**
 * Compute the document title of the playlist landing page
 * (`/playlist/<title>/<ids>`).
 *
 * Shared between the landing page's `generateMetadata` and the
 * playlist editor's "Playlist page" preview so the preview always
 * matches the real title tag by construction.
 *
 * Unlike `computeDocumentTitle` (the player page title), this format
 * carries no prototype count and applies no truncation.
 */
export function computePlaylistLandingTitle(title: string): string {
  return `${title} | Playlist | ${APP_TITLE}`;
}
