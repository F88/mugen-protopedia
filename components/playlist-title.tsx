'use client';

import React from 'react';
import { cn, truncateString } from '@/lib/utils';

type PlaylistTitleProps = {
  ids: number[];
  title?: string;
  processedCount: number;
  totalCount: number;
  className?: string;
  isPlaying?: boolean;
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
  // ids,
  title,
  processedCount,
  totalCount,
  className,
  isPlaying = false,
}: PlaylistTitleProps) {
  const displayedTitle = title
    ? truncateString(title, PLAYLIST_TITLE_MAX_LENGTH)
    : 'Playlist';
  const statusText = (() => {
    if (isPlaying) {
      return '▶️';
    }

    if (totalCount > 0) {
      return processedCount >= totalCount ? '📋' : '⏸️';
    }

    return '❓';
  })();

  const progressText = isPlaying
    ? `(${processedCount} / ${totalCount})`
    : `(${totalCount})`;

  return (
    <div className={cn(PLAYLIST_TITLE_CONTAINER_CLASS, className)}>
      <h1
        aria-label={displayedTitle}
        className="text-2xl font-bold whitespace-normal wrap-break-word flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
      >
        <span className="flex items-center gap-2">
          <span className="whitespace-nowrap">{statusText}</span>
          <span className="whitespace-normal wrap-break-word">
            {displayedTitle}
          </span>
          {progressText && (
            <span className="text-base font-medium text-muted-foreground whitespace-nowrap">
              {progressText}
            </span>
          )}
        </span>
      </h1>
    </div>
  );
}
