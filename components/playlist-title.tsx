'use client';

import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

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
  'relative w-fit min-w-[min(100%,50vw)] max-w-full overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card text-card-foreground px-4 py-4 sm:px-6 sm:py-6 lg:px-8 text-center rounded-xl border border-border shadow-lg shadow-primary/20';

/**
 * Renders the title of a playlist, typically used for direct launch scenarios.
 * @param directLaunchResult - The result of parsing direct launch parameters.
 * @param processedCount - The number of items processed in the playlist.
 * @param totalCount - The total number of items in the playlist.
 */
export const PLAYLIST_TITLE_MAX_LENGTH = 100;

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
    : '';
  const isTitleTruncated =
    typeof title === 'string' && title.length > 0 && displayedTitle !== title;

  // const showStatusIcon = totalCount > 0;
  const showProgress = totalCount > 0;
  const clampedProcessed = Math.min(
    Math.max(processedCount, 0),
    totalCount > 0 ? totalCount : 0,
  );
  const progressValue =
    showProgress && totalCount > 0 ? (clampedProcessed / totalCount) * 100 : 0;

  const badgeText = totalCount > 0 ? 'Playlist' : 'Playlist';

  const titleSpan = (
    <span
      className="whitespace-normal wrap-break-word"
      title={isTitleTruncated ? title : undefined}
    >
      {displayedTitle}
    </span>
  );

  const titleWithTooltip = isTitleTruncated ? (
    <Tooltip>
      <TooltipTrigger asChild>{titleSpan}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs wrap-break-word text-left">
        {title}
      </TooltipContent>
    </Tooltip>
  ) : (
    titleSpan
  );

  return (
    <div className={cn(PLAYLIST_TITLE_CONTAINER_CLASS, className)}>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-center gap-4">
        {isPlaying && showProgress && (
          <Progress
            value={progressValue}
            className="h-2 w-full max-w-md bg-primary/15"
            aria-label="Playlist progress"
          />
        )}

        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">
          {badgeText}
          {totalCount > 0 && (
            <span className="text-[0.6rem] font-medium normal-case tracking-normal text-primary/60">
              {totalCount > 1 ? `${totalCount} items` : `${totalCount} item`}
            </span>
          )}
        </span>

        {displayedTitle.length > 0 && (
          <h1
            aria-label={displayedTitle}
            className="text-xl font-bold whitespace-normal wrap-break-word flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
          >
            <span className="flex flex-wrap items-center justify-center gap-3">
              {titleWithTooltip}
            </span>
          </h1>
        )}
      </div>
    </div>
  );
}
