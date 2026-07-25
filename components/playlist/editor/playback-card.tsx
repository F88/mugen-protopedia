import React from 'react';

import { TargetPagePanel } from '@/components/playlist/editor/target-page-panel';
import { StatusCard, type CardState } from '@/components/status-card';

import { logger } from '@/lib/logger.client';

function getAggregateCardState(options: {
  hasError: boolean;
  hasAnyValid: boolean;
}): CardState {
  if (options.hasError) return 'invalid';
  if (options.hasAnyValid) return 'valid';
  return 'neutral';
}

export type PlaybackCardProps = {
  ids: {
    idsError: string | null;
    idsText: string;
    effectiveIds: number[];
  };
  title: { title: string; titleError: string | null };
  /** The playback page preview; empty strings while it cannot be built. */
  page: { title: string; url: string };
  highlighted: { title: boolean; url: boolean };
  canGeneratePlaylistUrl: boolean;
  hasInputError: boolean;
};

export function PlaybackCard({
  ids,
  title,
  page,
  highlighted,
  canGeneratePlaylistUrl,
  hasInputError,
}: PlaybackCardProps) {
  const hasIds = ids.idsText.trim().length > 0 && !ids.idsError;
  const hasTitle = title.title.trim().length > 0 && !title.titleError;

  const cardState: CardState = getAggregateCardState({
    hasError:
      Boolean(ids.idsError) || Boolean(title.titleError) || hasInputError,
    hasAnyValid: hasIds || hasTitle || page.url.length > 0,
  });

  logger.debug('playback-card:status', {
    props: {
      page,
      title,
      idsTextLength: ids.idsText.length,
      canGeneratePlaylistUrl,
      hasInputError,
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
      title="Playback"
      state={cardState}
      description={
        <p className="mt-1 text-xs text-muted-foreground">
          Starts playing the list immediately.
        </p>
      }
      helpText={`This card shows the playback page (/?id=...&title=...),
which starts playing the list as soon as it is opened. It works
with IDs only, a title only, or both.
Title and IDs can be edited from the cards above.`}
    >
      <div className="flex flex-col gap-4" data-test-id="playback-card">
        {page.url.length > 0 ? (
          <TargetPagePanel
            pageTitle={page.title}
            url={page.url}
            highlighted={highlighted}
            testIds={{
              title: 'playback-title-value',
              url: 'playback-url-code',
            }}
          />
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
