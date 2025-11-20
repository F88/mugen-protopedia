import { useMemo } from 'react';

import { logger } from '@/lib/logger.client';
import {
  deduplicateIdsPreserveOrder,
  normalizeIdsFromUrls,
  parsePrototypeIdLines,
  sortIdsWithDuplicates,
} from '@/lib/utils/playlist-builder';

import {
  prototypeIdTextSchema,
  prototypeUrlsTextSchema,
} from '@/schemas/playlist';

import { StatusCard, type CardState } from '@/components/status-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

function getInputStatusClasses(options: {
  highlighted: boolean;
  hasError: boolean;
  isValid: boolean;
}) {
  if (options.highlighted) {
    return 'border-4 !border-yellow-400 dark:!border-yellow-500';
  }
  if (options.hasError) {
    return 'border-4 !border-red-500 dark:!border-red-400';
  }
  if (options.isValid) {
    return 'border-4 !border-emerald-500 dark:!border-emerald-400';
  }
  return '';
}

function getAggregateCardState(options: {
  hasError: boolean;
  hasAnyValid: boolean;
}): CardState {
  if (options.hasError) return 'invalid';
  if (options.hasAnyValid) return 'valid';
  return 'neutral';
}

export type LastDriver = 'urls' | 'ids' | null;

export type PrototypeInputsCardProps = {
  ids: {
    text: string;
    setText: (value: string) => void;
    error: string | null;
    setError: (value: string | null) => void;
    highlighted: boolean;
  };
  urls: {
    text: string;
    setText: (value: string) => void;
    error: string | null;
    setError: (value: string | null) => void;
    highlighted: boolean;
  };
  lastDriver: LastDriver;
  setLastDriver: (value: LastDriver) => void;
};

export function PrototypeInputsCard({
  urls,
  ids,
  lastDriver,
  setLastDriver,
}: PrototypeInputsCardProps) {
  const urlsArray = useMemo(() => {
    return urls.text
      .split(/\n+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }, [urls.text]);
  const manualIds = useMemo(() => parsePrototypeIdLines(ids.text), [ids.text]);
  const autoIds = useMemo(() => normalizeIdsFromUrls(urlsArray), [urlsArray]);
  const effectiveIds = lastDriver === 'ids' ? manualIds : autoIds;

  const hasUrls = urls.text.trim().length > 0;
  const urlsIsValid = hasUrls && !urls.error;
  const hasIds = ids.text.trim().length > 0;
  const idsIsValid = hasIds && !ids.error;

  const hasAnyError = Boolean(urls.error) || Boolean(ids.error);
  const hasAnyValid = urlsIsValid || idsIsValid;
  const cardState: CardState = getAggregateCardState({
    hasError: hasAnyError,
    hasAnyValid,
  });

  logger.debug('playlist-inputs:status', {
    urls: {
      highlighted: urls.highlighted,
      textLength: urls.text.length,
      hasError: Boolean(urls.error),
      isValid: urlsIsValid,
    },
    ids: {
      highlighted: ids.highlighted,
      textLength: ids.text.length,
      hasError: Boolean(ids.error),
      isValid: idsIsValid,
    },
    derived: {
      hasAnyError,
      hasAnyValid,
      cardState,
    },
  });

  return (
    <StatusCard
      title="Prototype IDs Inputs"
      state={cardState}
      description={
        <>
          <p className="mt-1 text-xs text-muted-foreground">
            Enter the IDs of the prototypes you want in this playlist.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            You can paste ProtoPedia prototype page URLs or numeric prototype
            IDs to build the list of IDs.
          </p>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="playlist-urls" className="text-sm font-medium">
              Prototype URLs (editable)
            </label>
            <span
              className="text-xs"
              aria-live="polite"
              data-test-id="urls-indicator"
            >
              {urls.text.trim().length === 0
                ? '(empty)'
                : urls.error
                  ? '❌'
                  : '✅'}
            </span>
          </div>
          <Textarea
            id="playlist-urls"
            value={urls.text}
            onChange={(e) => {
              const nextValue = e.target.value;
              urls.setText(nextValue);
              const result = prototypeUrlsTextSchema.safeParse(nextValue);
              if (!result.success) {
                const firstIssue = result.error.issues[0];
                urls.setError(firstIssue?.message ?? null);
                ids.setText('');
              } else {
                urls.setError(null);
              }
              setLastDriver('urls');
            }}
            className={`text-xs font-mono bg-white dark:bg-zinc-900 ${getInputStatusClasses(
              {
                highlighted: urls.highlighted,
                hasError: Boolean(urls.error),
                isValid: urlsIsValid,
              },
            )}`}
            placeholder={'Paste prototype URLs here (one per line).'}
            aria-describedby="playlist-urls-help"
          />
          {urls.error && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {urls.error}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            URLs detected: {urlsArray.length}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                urls.setText('');
                urls.setError(null);
                setLastDriver('urls');
              }}
              disabled={!urls.text}
              aria-label="Clear URLs"
            >
              Clear URLs
            </Button>
          </div>
          <p id="playlist-urls-help" className="text-xs text-muted-foreground">
            Editing updates IDs unless manually overridden.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="playlist-ids" className="text-sm font-medium">
              Prototype IDs (editable)
            </label>
            <span
              className="text-xs"
              aria-live="polite"
              data-test-id="ids-indicator"
            >
              {ids.text.trim().length === 0
                ? '(empty)'
                : ids.error
                  ? '❌'
                  : '✅'}
            </span>
          </div>
          <Textarea
            id="playlist-ids"
            value={ids.text}
            onChange={(e) => {
              const nextValue = e.target.value;
              ids.setText(nextValue);
              const result = prototypeIdTextSchema.safeParse(nextValue);
              if (!result.success) {
                const firstIssue = result.error.issues[0];
                ids.setError(firstIssue?.message ?? null);
              } else {
                const parsedIds = parsePrototypeIdLines(nextValue);
                if (parsedIds.length > 100) {
                  ids.setError(
                    'You can use up to 100 prototype IDs per playlist.',
                  );
                } else {
                  ids.setError(null);
                }
              }
              setLastDriver('ids');
            }}
            className={`text-xs font-mono bg-white dark:bg-zinc-900 ${getInputStatusClasses(
              {
                highlighted: ids.highlighted,
                hasError: Boolean(ids.error),
                isValid: idsIsValid,
              },
            )}`}
            placeholder={'Enter one numeric ID per line'}
            aria-describedby="playlist-ids-help"
          />
          {ids.error && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {ids.error}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const idsFromUrls = normalizeIdsFromUrls(urlsArray);
                ids.setText(idsFromUrls.join('\n'));
                ids.setError(null);
                setLastDriver('ids');
              }}
              disabled={urlsArray.length === 0 || !!urls.error}
              aria-label="Regenerate IDs from Prototype URLs"
            >
              Regenerate from URLs
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Effective IDs: {effectiveIds.length}{' '}
            {effectiveIds.length === 1 ? 'item' : 'items'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                ids.setText('');
                ids.setError(null);
                setLastDriver('ids');
              }}
              disabled={!ids.text}
              aria-label="Clear manual IDs"
            >
              Clear IDs
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const parsed = parsePrototypeIdLines(ids.text);
                if (parsed.length === 0) return;
                const sorted = sortIdsWithDuplicates(parsed);
                ids.setText(sorted.join('\n'));
                setLastDriver('ids');
              }}
              disabled={!ids.text.trim() || !!ids.error}
              aria-label="Sort IDs ascending"
            >
              Sort IDs
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const parsed = parsePrototypeIdLines(ids.text);
                if (parsed.length === 0) return;
                const deduped = deduplicateIdsPreserveOrder(parsed);
                ids.setText(deduped.join('\n'));
                setLastDriver('ids');
              }}
              disabled={!ids.text.trim() || !!ids.error}
              aria-label="Remove duplicate IDs"
            >
              Deduplicate IDs
            </Button>
          </div>
          <p id="playlist-ids-help" className="text-xs text-muted-foreground">
            Manual override. Each non-empty line must contain digits only.
            Invalid lines are ignored. Editing freezes auto update until URLs
            change.
          </p>
        </div>
      </div>
    </StatusCard>
  );
}
