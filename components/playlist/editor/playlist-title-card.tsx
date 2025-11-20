import { playlistTitleSchema } from '@/schemas/playlist';

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
};

export function PlaylistTitleCard({
  title,
  setTitle,
  titleError,
  setTitleError,
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
            {title.trim().length === 0 ? '(empty)' : titleError ? '❌' : '✅'}
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
          className="w-full text-sm bg-white dark:bg-zinc-900"
          placeholder="Enter playlist title"
          aria-describedby="playlist-title-help"
        />
        {titleError && (
          <p className="text-xs text-red-600 dark:text-red-400">{titleError}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setTitle('');
              setTitleError(null);
            }}
            disabled={!title}
            aria-label="Clear title"
          >
            Clear Title
          </Button>
        </div>
      </div>
    </StatusCard>
  );
}
