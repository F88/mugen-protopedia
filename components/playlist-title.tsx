'use client';

import React from 'react';
import { cn, truncateString } from '@/lib/utils';

type PlaylistTitleProps = {
  ids: number[];
  title?: string;
  processedCount: number;
  totalCount: number;
  className?: string;
};

export const PLAYLIST_TITLE_CONTAINER_CLASS =
  'bg-gray-100 dark:bg-gray-800 p-4 text-center';

/**
 * Renders the title of a playlist, typically used for direct launch scenarios.
 * @param directLaunchResult - The result of parsing direct launch parameters.
 * @param processedCount - The number of items processed in the playlist.
 * @param totalCount - The total number of items in the playlist.
 */
export const PLAYLIST_TITLE_MAX_LENGTH = 200;

export function PlaylistTitle({
  ids,
  title,
  processedCount,
  totalCount,
  className,
}: PlaylistTitleProps) {
  const showProgress = ids.length > 0;
  const displayedTitle = title
    ? truncateString(title, PLAYLIST_TITLE_MAX_LENGTH)
    : 'Playlist';

  return (
    <div className={cn(PLAYLIST_TITLE_CONTAINER_CLASS, className)}>
      <h1 className="text-2xl font-bold whitespace-normal wrap-break-word">
        {displayedTitle} {showProgress && `(${processedCount} / ${totalCount})`}
      </h1>
    </div>
  );
}
