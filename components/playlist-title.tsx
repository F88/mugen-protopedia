'use client';

import React from 'react';
import { cn, truncateString } from '@/lib/utils';

import { ListVideo } from 'lucide-react';

type PlaylistTitleProps = {
  ids: number[];
  title?: string;
  processedCount: number;
  totalCount: number;
  className?: string;
  isPlaying?: boolean;
};

export const PLAYLIST_TITLE_CONTAINER_CLASS =
  'w-fit max-w-full bg-card text-card-foreground p-4 text-center rounded-lg border border-border';

/**
 * Renders the title of a playlist, typically used for direct launch scenarios.
 * @param directLaunchResult - The result of parsing direct launch parameters.
 * @param processedCount - The number of items processed in the playlist.
 * @param totalCount - The total number of items in the playlist.
 */
export const PLAYLIST_TITLE_MAX_LENGTH = 200;

type ProgressTextParams = {
  isPlaying: boolean;
  processedCount: number;
  totalCount: number;
};

function getProgressText({
  isPlaying,
  processedCount,
  totalCount,
}: ProgressTextParams): string {
  if (totalCount <= 0) {
    return '';
  }

  if (isPlaying) {
    return `(${processedCount} / ${totalCount})`;
  }

  return `(${totalCount})`;
}

export function PlaylistTitle({
  // ids,
  title,
  processedCount,
  totalCount,
  className,
  isPlaying = false,
}: PlaylistTitleProps) {
  console.debug('PlaylistTitle', {
    title,
    processedCount,
    totalCount,
    isPlaying,
  });

  const displayedTitle = title
    ? truncateString(title, PLAYLIST_TITLE_MAX_LENGTH)
    : 'Playlist';

  // const statusText = (() => {
  //   if (isPlaying) {
  //     return '▶️';
  //   }

  //   if (totalCount > 0) {
  //     return processedCount >= totalCount ? '📋' : '⏸️';
  //   }

  //   return '❓';
  // })();

  const statusIcon = (() => {
    const baseIcon = (
      <ListVideo
        aria-hidden="true"
        className="w-6 h-6"
        data-testid="playlist-status-icon"
      />
    );

    if (isPlaying) {
      return baseIcon;
    }

    if (totalCount > 0) {
      return baseIcon;
    }

    return baseIcon;
  })();

  const progressText = getProgressText({
    isPlaying,
    processedCount,
    totalCount,
  });

  return (
    <div className={cn(PLAYLIST_TITLE_CONTAINER_CLASS, className, 'mx-auto')}>
      <h1
        aria-label={displayedTitle}
        className="text-2xl font-bold whitespace-normal wrap-break-word flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
      >
        <span className="flex items-center gap-2">
          {totalCount > 0 && (
            <span className="whitespace-normal wrap-break-word">
              {statusIcon}
              {/* {statusText} */}
            </span>
          )}
          <span className="whitespace-normal wrap-break-word">
            {displayedTitle}
          </span>
          {progressText && (
            <span className="whitespace-nowrap text-muted-foreground ">
              {progressText}
            </span>
          )}
        </span>
      </h1>
    </div>
  );
}
