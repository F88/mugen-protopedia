'use client';

import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

import { truncateString } from '@/lib/utils';

type PlaylistTitleCardProps = {
  ids: number[];
  title?: string;
  processedCount: number;
  totalCount: number;
  className?: string;
  isPlaying?: boolean;
  isCompleted?: boolean;
};

function getProgressValue({
  isCompleted,
  showProgress,
  clampedProcessed,
  totalCount,
}: {
  isCompleted: boolean;
  showProgress: boolean;
  clampedProcessed: number;
  totalCount: number;
}): number {
  if (isCompleted) {
    return 100;
  }
  if (!showProgress || totalCount <= 0) {
    return 0;
  }
  return (clampedProcessed / totalCount) * 100;
}

export const PLAYLIST_TITLE_MAX_LENGTH = 100;

export function PlaylistTitleCard({
  title,
  processedCount,
  totalCount,
  className,
  isPlaying = false,
  isCompleted = false,
}: PlaylistTitleCardProps) {
  const displayedTitle = title
    ? truncateString(title, PLAYLIST_TITLE_MAX_LENGTH)
    : '';
  const hasTitle = displayedTitle.length > 0;
  const isTitleTruncated =
    typeof title === 'string' && title.length > 0 && displayedTitle !== title;

  const showProgress = totalCount > 0;
  const clampedProcessed = Math.min(
    Math.max(processedCount, 0),
    totalCount > 0 ? totalCount : 0,
  );

  const progressValue = getProgressValue({
    clampedProcessed,
    totalCount,
    showProgress,
    isCompleted,
  });

  const shouldRenderProgress = showProgress && isPlaying;

  const badgeText = totalCount > 0 ? 'Playlist' : 'Playlist';
  const headingLabel = hasTitle ? displayedTitle : 'Playlist';

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
    <Card
      className={`w-fit min-w-[50%] bg-linear-to-br from-primary/10 via-card/90 to-card/90 shadow-lg border-primary/20 backdrop-blur-sm ${className}`}
    >
      <CardContent className="flex flex-col items-center gap-4 text-center">
        {shouldRenderProgress && (
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

        {hasTitle && (
          <h1
            aria-label={headingLabel}
            className="text-xl font-bold whitespace-normal wrap-break-word flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
          >
            <span className="flex flex-wrap items-center justify-center gap-3">
              {hasTitle ? titleWithTooltip : headingLabel}
            </span>
          </h1>
        )}
      </CardContent>
    </Card>
  );
}
