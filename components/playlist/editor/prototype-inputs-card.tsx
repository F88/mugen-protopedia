'use client';

import React, { useMemo } from 'react';

import { StatusCard, type CardState } from '@/components/status-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import {
  getInputStatusClasses,
  getIndicatorSymbol,
} from '@/components/playlist/editor/playlist-editor-utils';

import { logger } from '@/lib/logger.client';
import {
  deduplicateIdsOnly,
  normalizeIdsFromUrls,
  parsePrototypeIdLines,
  sortLinesNumeric,
} from '@/lib/utils/playlist-builder';

import {
  prototypeIdTextSchema,
  prototypeUrlsTextSchema,
} from '@/schemas/playlist';

type PrototypeUrlsInputProps = {
  text: string;
  error: string | null;
  highlighted: boolean;
  urlsCount: number;
  onChange: (value: string) => void;
  onClear: () => void;
};

/**
 * Input component for Prototype URLs.
 * Allows users to paste multiple ProtoPedia URLs (one per line).
 *
 * @param props.text - The current text value of the input.
 * @param props.error - Error message to display, if any.
 * @param props.highlighted - Whether the input should be visually highlighted.
 * @param props.urlsCount - The number of valid URLs detected in the input.
 * @param props.onChange - Callback fired when the input text changes.
 * @param props.onClear - Callback fired when the "Clear" button is clicked.
 */
function PrototypeUrlsInput({
  text,
  error,
  highlighted,
  urlsCount,
  onChange,
  onClear,
}: PrototypeUrlsInputProps) {
  const hasValue = text.trim().length > 0;
  const hasError = Boolean(error);
  const isValid = hasValue && !hasError;

  return (
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
          {getIndicatorSymbol({
            hasValue,
            hasError,
          })}
        </span>
      </div>
      <Textarea
        id="playlist-urls"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        className={`text-xs font-mono bg-white dark:bg-zinc-900 ${getInputStatusClasses(
          {
            highlighted,
            hasError,
            isValid,
          },
        )}`}
        placeholder={'Paste prototype URLs here (one per line).'}
        aria-describedby="playlist-urls-help"
      />
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        Characters: {text.length.toLocaleString()} / 10,000
      </p>
      <p className="text-xs text-muted-foreground">
        URLs detected: {urlsCount}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="destructive"
          onClick={onClear}
          disabled={!text}
          aria-label="Clear URLs"
        >
          Clear
        </Button>
      </div>
      <p id="playlist-urls-help" className="text-xs text-muted-foreground">
        Editing updates IDs unless manually overridden.
      </p>
    </div>
  );
}

type PrototypeIdsInputProps = {
  text: string;
  error: string | null;
  highlighted: boolean;
  effectiveIdsCount: number;
  urlsCount: number;
  hasUrlsError: boolean;
  onChange: (value: string) => void;
  onRegenerate: () => void;
  onSort: () => void;
  onDeduplicate: () => void;
  onClear: () => void;
};

/**
 * Input component for Prototype IDs.
 * Provides direct text editing and helper actions.
 *
 * Interaction behaviors:
 * 1. Direct Edit (onChange): Updates value and triggers validation.
 * 2. Regenerate: Replaces value with IDs from URLs and triggers validation.
 * 3. Sort: Reorders lines numerically. Does NOT trigger validation (preserves errors).
 * 4. Deduplicate: Removes duplicate numeric IDs. Triggers validation (may resolve count errors).
 * 5. Clear: Empties input and clears errors.
 *
 * @param props.text - The current text value of the input.
 * @param props.error - Error message to display, if any.
 * @param props.highlighted - Whether the input should be visually highlighted.
 * @param props.effectiveIdsCount - The count of valid IDs currently parsed.
 * @param props.urlsCount - The number of URLs detected (used for Regenerate button state).
 * @param props.hasUrlsError - Whether the URLs input has an error (used for Regenerate button state).
 * @param props.onChange - Callback for direct text editing.
 * @param props.onRegenerate - Callback to overwrite IDs from URLs.
 * @param props.onSort - Callback to sort lines numerically.
 * @param props.onDeduplicate - Callback to remove duplicate IDs.
 * @param props.onClear - Callback to clear the input.
 */
function PrototypeIdsInput({
  text,
  error,
  highlighted,
  effectiveIdsCount,
  urlsCount,
  hasUrlsError,
  onChange,
  onRegenerate,
  onSort,
  onDeduplicate,
  onClear,
}: PrototypeIdsInputProps) {
  const hasValue = text.trim().length > 0;
  const hasError = Boolean(error);
  const isValid = hasValue && !hasError;

  return (
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
          {getIndicatorSymbol({
            hasValue,
            hasError,
          })}
        </span>
      </div>
      <Textarea
        id="playlist-ids"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        className={`text-xs font-mono bg-white dark:bg-zinc-900 ${getInputStatusClasses(
          {
            highlighted,
            hasError,
            isValid,
          },
        )}`}
        placeholder={'Enter one numeric ID per line'}
        aria-describedby="playlist-ids-help"
      />
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        Characters: {text.length.toLocaleString()} / 1,000
      </p>
      <p className="text-xs text-muted-foreground">
        Effective IDs: {effectiveIdsCount.toLocaleString()} / 100{' '}
        {effectiveIdsCount === 1 ? 'item' : 'items'}
      </p>
      <div className="flex flex-wrap gap-2">
        {/* Regenerate from URLs */}
        <Button
          type="button"
          variant="default"
          onClick={onRegenerate}
          disabled={urlsCount === 0 || hasUrlsError}
          aria-label="Regenerate IDs from Prototype URLs"
        >
          Regenerate from URLs
        </Button>

        {/* Sort IDs */}
        <Button
          type="button"
          variant="default"
          onClick={onSort}
          disabled={!text}
          aria-label="Sort IDs ascending"
        >
          Sort IDs
        </Button>

        {/* Deduplicate IDs */}
        <Button
          type="button"
          variant="default"
          onClick={onDeduplicate}
          disabled={!text}
          aria-label="Remove duplicate IDs"
        >
          Deduplicate IDs
        </Button>

        {/* Clear IDs */}
        <Button
          type="button"
          variant="destructive"
          onClick={onClear}
          disabled={!text}
          aria-label="Clear manual IDs"
        >
          Clear
        </Button>
      </div>
      <p id="playlist-ids-help" className="text-xs text-muted-foreground">
        Manual override. Each non-empty line must contain digits only. Invalid
        lines are ignored. Editing freezes auto update until URLs change.
      </p>
    </div>
  );
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

/**
 * Card component for managing prototype inputs (URLs and IDs).
 * Provides two synchronized input methods:
 * 1. Prototype URLs: Paste URLs to automatically extract IDs.
 * 2. Prototype IDs: Manually enter or edit numeric IDs.
 *
 * Handles validation, sorting, deduplication, and synchronization between the two inputs.
 *
 * @param props.ids - State and handlers for the IDs input.
 * @param props.urls - State and handlers for the URLs input.
 * @param props.lastDriver - Tracks which input was last edited ('urls' or 'ids') to determine the effective source of truth.
 * @param props.setLastDriver - Callback to update the last driver state.
 */
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

  const validateIds = (value: string): string | null => {
    if (!value) return null;

    const result = prototypeIdTextSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues[0]?.message ?? null;
    }

    const parsedIds = parsePrototypeIdLines(value);
    if (parsedIds.length > 100) {
      return 'You can use up to 100 prototype IDs per playlist.';
    }

    return null;
  };

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
      helpText={`Use this card to control which prototypes are in the playlist.
You can paste ProtoPedia URLs or enter numeric IDs directly.
Edits here drive the effective list of prototype IDs used downstream.`}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <PrototypeUrlsInput
          text={urls.text}
          error={urls.error}
          highlighted={urls.highlighted}
          urlsCount={urlsArray.length}
          onChange={(nextValue) => {
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
          onClear={() => {
            urls.setText('');
            urls.setError(null);
            setLastDriver('urls');
          }}
        />
        <PrototypeIdsInput
          text={ids.text}
          error={ids.error}
          highlighted={ids.highlighted}
          effectiveIdsCount={effectiveIds.length}
          urlsCount={urlsArray.length}
          hasUrlsError={!!urls.error}
          onChange={(nextValue) => {
            ids.setText(nextValue);
            ids.setError(validateIds(nextValue));
            setLastDriver('ids');
          }}
          onRegenerate={() => {
            const idsFromUrls = normalizeIdsFromUrls(urlsArray);
            const nextValue = idsFromUrls.join('\n');
            ids.setText(nextValue);
            ids.setError(validateIds(nextValue));
            setLastDriver('ids');
          }}
          onSort={() => {
            const lines = ids.text.split(/\r?\n|\r/);
            const sorted = sortLinesNumeric(lines);
            ids.setText(sorted.join('\n'));
          }}
          onDeduplicate={() => {
            const lines = ids.text.split(/\r?\n|\r/);
            const deduped = deduplicateIdsOnly(lines);
            const nextValue = deduped.join('\n');
            ids.setText(nextValue);
            ids.setError(validateIds(nextValue));
            setLastDriver('ids');
          }}
          onClear={() => {
            ids.setText('');
            ids.setError(null);
            setLastDriver('ids');
          }}
        />
      </div>
    </StatusCard>
  );
}
