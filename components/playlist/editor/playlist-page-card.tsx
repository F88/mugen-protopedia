import React from 'react';

import { playlistTitleSchema } from '@/schemas/playlist';

import { splitGraphemes } from '@/lib/utils';

import { getIndicatorSymbol } from '@/components/playlist/editor/playlist-editor-utils';
import { TargetPagePanel } from '@/components/playlist/editor/target-page-panel';
import { StatusCard, type CardState } from '@/components/status-card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function getAggregateCardState(options: {
  hasError: boolean;
  hasAnyValid: boolean;
}): CardState {
  if (options.hasError) return 'invalid';
  if (options.hasAnyValid) return 'valid';
  return 'neutral';
}

export type PlaylistPageCardProps = {
  title: string;
  setTitle: (value: string) => void;
  titleError: string | null;
  setTitleError: (value: string | null) => void;
  highlighted: boolean;
  /** The landing page ("Playlist page") preview; empty strings while it
   * cannot be built (missing title or IDs). */
  page: { title: string; url: string };
  pageHighlighted: { title: boolean; url: boolean };
  shouldAutoplay: boolean;
  setShouldAutoplay: (value: boolean) => void;
};

export function PlaylistPageCard({
  title,
  setTitle,
  titleError,
  setTitleError,
  highlighted,
  page,
  pageHighlighted,
  shouldAutoplay,
  setShouldAutoplay,
}: PlaylistPageCardProps) {
  const hasTitle = title.trim().length > 0;
  const titleIsValid = hasTitle && !titleError;

  const cardState = getAggregateCardState({
    hasError: Boolean(titleError),
    hasAnyValid: titleIsValid,
  });

  return (
    <StatusCard
      title="Playlist page"
      state={cardState}
      description={
        <p
          id="playlist-title-help"
          className="mt-1 text-xs text-muted-foreground"
        >
          Landing page with a start button. The playlist title becomes part of
          its URL (up to 300 characters, emoji supported).
        </p>
      }
      helpText={`This card owns everything about the playlist landing page
(/playlist/<title>/<ids>): the title input, the page title, the URL
and the Autoplay option. The page exists only when both a title and
at least one prototype ID are set. With Autoplay enabled the URL
gets ?autoplay=true and the page skips its start button, going
straight to playback.`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="playlist-title" className="text-sm font-medium">
              Playlist Title
            </label>
            <span
              className="text-xs"
              aria-live="polite"
              data-test-id="title-indicator"
            >
              {getIndicatorSymbol({
                hasValue: title.trim().length > 0,
                hasError: Boolean(titleError),
              })}
            </span>
          </div>
          <Input
            id="playlist-title"
            type="text"
            value={title}
            onChange={(e) => {
              const nextValue = e.target.value;
              setTitle(nextValue);
              const result = playlistTitleSchema.safeParse(nextValue);
              if (!result.success) {
                const firstIssue = result.error.issues[0];
                setTitleError(firstIssue?.message ?? null);
              } else {
                setTitleError(null);
              }
            }}
            className={`w-full text-sm bg-white dark:bg-zinc-900 ${
              highlighted
                ? 'border-4 border-yellow-400! dark:border-yellow-500!'
                : titleError
                  ? 'border-4 border-red-500! dark:border-red-400!'
                  : titleIsValid
                    ? 'border-4 border-emerald-500! dark:border-emerald-400!'
                    : ''
            }`}
            placeholder="Enter playlist title"
            aria-describedby="playlist-title-help"
          />
          {titleError && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {titleError}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Characters: {splitGraphemes(title).length.toLocaleString()} / 300
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setTitle('');
                setTitleError(null);
              }}
              disabled={!title}
              aria-label="Clear title"
            >
              Clear
            </Button>
          </div>
        </div>

        {page.url.length > 0 ? (
          <TargetPagePanel
            pageTitle={page.title}
            url={page.url}
            highlighted={pageHighlighted}
            testIds={{
              title: 'playlist-page-title-value',
              url: 'playlist-page-url-code',
            }}
          >
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoplay"
                checked={shouldAutoplay}
                onCheckedChange={(checked) =>
                  setShouldAutoplay(checked === true)
                }
                className="border-blue-600! dark:border-blue-400!"
              />
              <Label
                htmlFor="autoplay"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Autoplay
              </Label>
            </div>
          </TargetPagePanel>
        ) : (
          <p
            className="text-xs font-medium text-blue-500 dark:text-blue-300"
            data-test-id="playlist-page-hint"
          >
            {title.trim().length === 0
              ? 'Set a playlist title to enable this page.'
              : 'Add at least one prototype ID to enable this page.'}
          </p>
        )}
      </div>
    </StatusCard>
  );
}
