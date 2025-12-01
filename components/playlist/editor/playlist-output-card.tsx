import React from 'react';

import { StatusCard, type CardState } from '@/components/status-card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// import { getIndicatorSymbol } from '@/components/playlist/editor/playlist-editor-utils';

import { logger } from '@/lib/logger.client';

function getAggregateCardState(options: {
  hasError: boolean;
  hasAnyValid: boolean;
}): CardState {
  if (options.hasError) return 'invalid';
  if (options.hasAnyValid) return 'valid';
  return 'neutral';
}

export type PlaylistOutputCardProps = {
  ids: {
    idsError: string | null;
    idsText: string;
    effectiveIds: number[];
  };
  title: { title: string; titleError: string | null };
  playlistUrl: { url: string; highlighted: boolean };
  titleOfPlaylistPage: {
    title: string;
    highlighted: boolean;
  };
  canGeneratePlaylistUrl: boolean;
  onCopy: () => void;
  copyStatus: 'idle' | 'ok' | 'fail';
  hasInputError: boolean;
  shouldAutoplay: boolean;
  setShouldAutoplay: (value: boolean) => void;
};

export function PlaylistOutputCard({
  ids,
  title,
  playlistUrl,
  titleOfPlaylistPage,
  copyStatus,
  canGeneratePlaylistUrl,
  hasInputError,
  onCopy,
  shouldAutoplay,
  setShouldAutoplay,
}: PlaylistOutputCardProps) {
  const hasIds = ids.idsText.trim().length > 0 && !ids.idsError;
  const hasTitle = title.title.trim().length > 0 && !title.titleError;

  const cardState: CardState = getAggregateCardState({
    hasError:
      Boolean(ids.idsError) || Boolean(title.titleError) || hasInputError,
    hasAnyValid: hasIds || hasTitle || Boolean(playlistUrl.url),
  });

  logger.debug('playlist-output:status', {
    props: {
      playlistUrl,
      titleOfPlaylistPage,
      title,
      idsTextLength: ids.idsText.length,
      copyStatus,
      canGeneratePlaylistUrl,
      hasInputError,
      shouldAutoplay,
    },
    derived: {
      effectiveIdsLength: ids.effectiveIds.length,
      hasIds,
      hasTitle,
      cardState,
    },
  });

  return (
    <StatusCard
      title="Playlist"
      state={cardState}
      description={
        <p className="mt-1 text-xs text-muted-foreground">
          Review and use the generated playlist URL.
        </p>
      }
      helpText={`This card shows the final playlist URL.
Once available, you can copy it or open it in a new tab.
Title and IDs can be edited from the other cards above.`}
    >
      {/* <div className="flex flex-wrap items-center gap-4 text-xs">
        <span data-test-id="playlist-ids-indicator">
          IDs:{' '}
          {getIndicatorSymbol({
            hasValue: ids.idsText.trim().length > 0,
            hasError: Boolean(ids.idsError),
          })}
        </span>
        <span data-test-id="playlist-title-indicator">
          Title:{' '}
          {getIndicatorSymbol({
            hasValue: title.title.trim().length > 0,
            hasError: Boolean(title.titleError),
          })}
        </span>
      </div> */}

      <div className="flex flex-col gap-4" data-test-id="playlist-output-card">
        {titleOfPlaylistPage.title && (
          <>
            <h2
              className="text-base font-semibold"
              data-test-id="playlist-page-title-heading"
            >
              Title of page
            </h2>
            <div
              className={`flex flex-col gap-2 rounded-md border border-transparent transition-all duration-300 ${
                titleOfPlaylistPage.highlighted
                  ? 'border-border shadow-[0_0_0_3px_rgba(37,99,235,0.9)]'
                  : ''
              }`}
            >
              <code
                className="rounded bg-muted px-3 py-2 text-sm md:text-base break-all"
                data-test-id="playlist-page-title-value"
              >
                {titleOfPlaylistPage.title}
              </code>
            </div>
          </>
        )}

        {playlistUrl.url ? (
          <>
            <h2
              className="text-base font-semibold"
              data-test-id="playlist-url-heading"
            >
              URL
            </h2>
            <div
              className={`flex flex-col gap-2 rounded-md border border-transparent  transition-all duration-300 ${
                playlistUrl.highlighted
                  ? 'border-border shadow-[0_0_0_3px_rgba(37,99,235,0.9)]'
                  : ''
              }`}
            >
              <code
                className="rounded bg-muted px-3 py-2 text-sm md:text-base break-all"
                data-test-id="playlist-url-code"
              >
                {playlistUrl.url}
              </code>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoplay"
                checked={shouldAutoplay}
                onCheckedChange={(checked) =>
                  setShouldAutoplay(checked === true)
                }
              />
              <Label
                htmlFor="autoplay"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Autoplay
              </Label>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={onCopy}
                disabled={!playlistUrl.url}
              >
                Copy
              </Button>
              <a
                href={playlistUrl.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                Open
              </a>
            </div>
            {copyStatus === 'ok' && (
              <span className="text-xs text-green-600 dark:text-green-400">
                Copied!
              </span>
            )}
            {copyStatus === 'fail' && (
              <span className="text-xs text-red-600 dark:text-red-400">
                Copy failed
              </span>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              No playlist URL yet.
            </p>
            {!canGeneratePlaylistUrl && (
              <p className="text-xs font-medium text-blue-500 dark:text-blue-300">
                Enter a valid title or at least one valid prototype ID to
                generate a playlist URL.
              </p>
            )}
          </div>
        )}
      </div>
    </StatusCard>
  );
}
