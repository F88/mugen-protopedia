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

export type PlaylistTitleCardVariant =
  | 'default'
  | 'frame'
  | 'cyberpunk'
  | 'anime'
  | 'retro'
  | 'elegant'
  | 'space'
  | 'neon'
  | 'pastel'
  | 'monochrome'
  | 'gradient'
  | 'minimal'
  | 'glass'
  | 'sunset'
  | 'ocean'
  | 'forest';

type PlaylistTitleCardProps = {
  ids: number[];
  title?: string;
  processedCount: number;
  totalCount: number;
  className?: string;
  isPlaying?: boolean;
  isCompleted?: boolean;
  variant?: PlaylistTitleCardVariant;
  fontFamily?: 'sans' | 'serif' | 'mono';
};

const variantStyles: Record<PlaylistTitleCardVariant, string> = {
  default:
    'bg-linear-to-br from-primary/10 via-card/90 to-card/90 shadow-lg border-primary/20 backdrop-blur-sm',
  frame:
    'border-4! border-double! border-amber-600! dark:border-amber-500! shadow-2xl! shadow-amber-800/50! bg-linear-to-br! from-amber-50/30! via-card/90! to-amber-50/30! dark:from-amber-900/20! dark:via-card/90! dark:to-amber-900/20! ring-2! ring-amber-500/40! ring-offset-4! ring-offset-background!',
  cyberpunk:
    'border-2! border-cyan-500! dark:border-cyan-400! shadow-xl! shadow-cyan-500/50! bg-linear-to-br! from-purple-900/20! via-cyan-900/20! to-pink-900/20! ring-2! ring-pink-500/50! backdrop-blur-xl!',
  anime:
    'border-4! border-pink-400! dark:border-pink-300! shadow-2xl! shadow-pink-400/60! bg-linear-to-br! from-yellow-200/30! via-pink-200/30! to-purple-200/30! ring-4! ring-white/80! ring-offset-2!',
  retro:
    'border-4! border-yellow-400! dark:border-yellow-300! shadow-lg! shadow-yellow-600/40! bg-linear-to-br! from-red-400/20! via-yellow-400/20! to-blue-400/20! ring-2! ring-black/50!',
  elegant:
    'border-2! border-yellow-600! dark:border-yellow-500! shadow-2xl! shadow-yellow-800/50! bg-linear-to-br! from-yellow-50/50! via-amber-50/50! to-orange-50/50! dark:from-yellow-900/20! dark:via-amber-900/20! dark:to-orange-900/20! ring-1! ring-yellow-500/30!',
  space:
    'border-2! border-indigo-500! dark:border-indigo-400! shadow-2xl! shadow-indigo-900/60! bg-linear-to-br! from-indigo-950/40! via-purple-950/40! to-blue-950/40! ring-2! ring-indigo-400/30! backdrop-blur-sm!',
  neon: 'border-2! border-lime-400! dark:border-lime-300! shadow-xl! shadow-lime-500/60! bg-linear-to-br! from-lime-500/20! via-emerald-500/20! to-teal-500/20! ring-2! ring-lime-400/50! backdrop-blur-md!',
  pastel:
    'border-3! border-rose-200! dark:border-rose-300! shadow-lg! shadow-rose-300/40! bg-linear-to-br! from-pink-100/60! via-purple-100/60! to-blue-100/60! dark:from-pink-900/30! dark:via-purple-900/30! dark:to-blue-900/30! ring-1! ring-rose-200/60!',
  monochrome:
    'border-2! border-gray-400! dark:border-gray-500! shadow-lg! shadow-gray-500/30! bg-linear-to-br! from-gray-100/80! via-gray-200/80! to-gray-300/80! dark:from-gray-800/80! dark:via-gray-900/80! dark:to-black/80! ring-1! ring-gray-400/40!',
  gradient:
    'border-2! border-violet-400! dark:border-violet-300! shadow-2xl! shadow-violet-500/50! bg-linear-to-br! from-violet-500/30! via-fuchsia-500/30! to-pink-500/30! dark:from-violet-900/40! dark:via-fuchsia-900/40! dark:to-pink-900/40! ring-2! ring-fuchsia-400/50! backdrop-blur-lg!',
  minimal:
    'border! border-gray-300! dark:border-gray-600! shadow-sm! bg-white/95! dark:bg-gray-900/95! ring-1! ring-gray-200! dark:ring-gray-700!',
  glass:
    'border! border-white/40! dark:border-white/20! shadow-xl! shadow-black/10! bg-white/10! dark:bg-black/10! backdrop-blur-2xl! ring-1! ring-white/20!',
  sunset:
    'border-2! border-orange-500! dark:border-orange-400! shadow-2xl! shadow-orange-600/50! bg-linear-to-br! from-orange-400/30! via-red-400/30! to-pink-400/30! dark:from-orange-900/40! dark:via-red-900/40! dark:to-pink-900/40! ring-2! ring-orange-400/40!',
  ocean:
    'border-2! border-blue-400! dark:border-blue-300! shadow-xl! shadow-blue-500/50! bg-linear-to-br! from-blue-400/30! via-cyan-400/30! to-teal-400/30! dark:from-blue-900/40! dark:via-cyan-900/40! dark:to-teal-900/40! ring-2! ring-cyan-400/50! backdrop-blur-md!',
  forest:
    'border-2! border-green-500! dark:border-green-400! shadow-xl! shadow-green-600/50! bg-linear-to-br! from-green-500/30! via-emerald-500/30! to-teal-600/30! dark:from-green-900/40! dark:via-emerald-900/40! dark:to-teal-900/40! ring-2! ring-emerald-500/50!',
};

const fontFamilyStyles: Record<'sans' | 'serif' | 'mono', string> = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
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
  variant = 'default',
  fontFamily = 'sans',
}: PlaylistTitleCardProps) {
  const variantClassName = variantStyles[variant];
  const fontClassName = fontFamilyStyles[fontFamily];
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
      className={`w-fit min-w-[50%] ${fontClassName} ${variantClassName} ${className}`}
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
            <span className="text-[0.8rem] font-medium normal-case tracking-normal text-primary/60">
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
