import React from 'react';

import { playlistTitleSchema } from '@/schemas/playlist';

import { splitGraphemes } from '@/lib/utils';

import { getIndicatorSymbol } from '@/components/playlist/editor/playlist-editor-utils';
import { StatusCard, type CardState } from '@/components/status-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


function getAggregateCardState(options: {
  hasError: boolean;
  hasAnyValid: boolean;
}): CardState {
  if (options.hasError) return 'invalid';
  if (options.hasAnyValid) return 'valid';
  return 'neutral';
}

export type PlaylistTitleCardProps = {
  title: string;
  setTitle: (value: string) => void;
  titleError: string | null;
  setTitleError: (value: string | null) => void;
  highlighted: boolean;
};

export function PlaylistTitleCard({
  title,
  setTitle,
  titleError,
  setTitleError,
  highlighted,
}: PlaylistTitleCardProps) {
  const hasTitle = title.trim().length > 0;
  const titleIsValid = hasTitle && !titleError;

  const cardState = getAggregateCardState({
    hasError: Boolean(titleError),
    hasAnyValid: titleIsValid,
  });

  return (
    <StatusCard
      title="Title of playlist"
      state={cardState}
      description={
        <p
          id="playlist-title-help"
          className="mt-1 text-xs text-muted-foreground"
        >
          Optional. Included in generated playlist URL (up to 300 characters,
          emoji supported).
        </p>
      }
      helpText={`Set an optional title for this playlist.
The title becomes part of the generated playlist URL.
You can change it any time before using the playlist.`}
    >
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
          <p className="text-xs text-red-600 dark:text-red-400">{titleError}</p>
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
    </StatusCard>
  );
}
