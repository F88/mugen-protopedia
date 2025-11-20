import { logger } from '@/lib/logger.client';

import { StatusCard, type CardState } from '@/components/status-card';
import { Button } from '@/components/ui/button';

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
  title: {
    title: string;
    titleError: string | null;
  };
  playlist: {
    playlistUrl: string;
    pageTitle: string;
  };
  canGeneratePlaylistUrl: boolean;
  onCopy: () => void;
  copyStatus: 'idle' | 'ok' | 'fail';
  hasInputError: boolean;
  highlighted: boolean;
};

export function PlaylistOutputCard({
  ids,
  title,
  playlist,
  copyStatus,
  canGeneratePlaylistUrl,
  highlighted,
  hasInputError,
  onCopy,
}: PlaylistOutputCardProps) {
  const hasIds = ids.idsText.trim().length > 0 && !ids.idsError;
  const hasTitle = title.title.trim().length > 0 && !title.titleError;

  const cardState: CardState = getAggregateCardState({
    hasError:
      Boolean(ids.idsError) || Boolean(title.titleError) || hasInputError,
    hasAnyValid: hasIds || hasTitle || Boolean(playlist.playlistUrl),
  });

  logger.debug('playlist-output:status', {
    props: {
      playlist: {
        playlistUrl: playlist.playlistUrl,
        pageTitle: playlist.pageTitle,
      },
      title,
      idsTextLength: ids.idsText.length,
      copyStatus,
      canGeneratePlaylistUrl,
      playlistHighlighted: highlighted,
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
    <StatusCard title="Playlist" state={cardState} description={null}>
      <div
        className={
          highlighted
            ? 'flex flex-col gap-2 border border-border shadow-[0_0_0_3px_rgba(37,99,235,0.9)] rounded-md p-3 transition-all duration-300'
            : 'flex flex-col gap-2'
        }
      >
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span data-test-id="playlist-ids-indicator">
            IDs:{' '}
            {ids.idsText.trim().length === 0
              ? '(empty)'
              : ids.idsError
                ? '❌'
                : '✅'}
          </span>
          <span data-test-id="playlist-title-indicator">
            Title:{' '}
            {title.title.trim().length === 0
              ? '(empty)'
              : title.titleError
                ? '❌'
                : '✅'}
          </span>
        </div>
        <h2 className="text-lg font-semibold">Playlist URL</h2>
        {playlist.playlistUrl ? (
          <div className="flex flex-col gap-4">
            <code className="rounded bg-muted px-3 py-2 text-xs break-all">
              {playlist.playlistUrl}
            </code>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={onCopy}
                disabled={!playlist.playlistUrl}
              >
                Copy
              </Button>
              <a
                href={playlist.playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
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
            <p className="text-xs text-muted-foreground">
              Title: {title.title || '(none)'}
            </p>
            <p className="text-xs text-muted-foreground">
              IDs used: {ids.effectiveIds.length} ({ids.effectiveIds.join(', ')}
              )
            </p>
            {playlist.pageTitle && (
              <p className="text-xs text-muted-foreground">
                Page title: {playlist.pageTitle}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              No playlist URL yet.
            </p>
            {!canGeneratePlaylistUrl && (
              <p className="text-xs text-red-600 dark:text-red-400">
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
