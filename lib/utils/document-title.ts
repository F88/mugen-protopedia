import type { PlayModeState } from '@/types/mugen-protopedia.types';

import { APP_TITLE } from '@/lib/config/app-constants';

import { truncateString } from '../utils';

/**
 * Compute the document title based on current play mode.
 * - Playlist mode with a non-empty title -> "<playlist title> | <APP_TITLE>".
 * - Otherwise returns the base APP_TITLE.
 */
export function computeDocumentTitle(playMode: PlayModeState): string {
  if (playMode.type === 'normal') {
    return APP_TITLE;
  } else if (playMode.type === 'playlist') {
    if (
      typeof playMode.title === 'string' &&
      playMode.title.trim().length > 0
    ) {
      const title = truncateString(playMode.title, 100);
      const count = playMode.ids.length;
      const out = count > 0 ? `${title} (${count})` : title;
      return `${out} | ${APP_TITLE}`;
    }
  }
  return APP_TITLE;
}
