'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import useSWRMutation from 'swr/mutation';

import { getPrototypeNamesFromStore } from '@/app/actions/prototypes';
import { scrapePageHtml } from '@/app/actions/scrape';

import type { PlayModeState } from '@/types/mugen-protopedia.types';

import type { DirectLaunchParams } from '@/schemas/direct-launch';
import {
  playlistTitleSchema,
  prototypeIdTextSchema,
  prototypeUrlsTextSchema,
} from '@/schemas/playlist';

import { logger } from '@/lib/logger.client';
import { computeDocumentTitle } from '@/lib/utils/document-title';
import {
  buildPlaylistUrl,
  deduplicateIdsPreserveOrder,
  extractPrototypeUrls,
  normalizeIdsFromUrls,
  parsePrototypeIdLines,
  sortIdsWithDuplicates,
} from '@/lib/utils/playlist-builder';
import { isAllowedProtopediaScrapeUrl } from '@/lib/utils/url-allowlist';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { CircleCheck, CircleHelp, CircleX } from 'lucide-react';

type LastDriver = 'urls' | 'ids' | null;

type CardState = 'invalid' | 'valid' | 'neutral';

function extractTitleFromPageTitle(html: string): string {
  if (!html) return '';
  try {
    const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const rawTitle = match?.[1]?.trim() ?? '';
    return rawTitle;
  } catch (error) {
    logger.debug('extractTitleFromPageTitle:error', {
      error:
        error instanceof Error
          ? { name: error.name, message: error.message }
          : error,
    });
    return '';
  }
}

function isAllowedUrlForClient(rawUrl: string): boolean {
  return isAllowedProtopediaScrapeUrl(rawUrl);
}

function getAggregateCardState(options: {
  hasError: boolean;
  hasAnyValid: boolean;
}): CardState {
  if (options.hasError) return 'invalid';
  if (options.hasAnyValid) return 'valid';
  return 'neutral';
}

function getInputStatusClasses(options: {
  highlighted: boolean;
  hasError: boolean;
  isValid: boolean;
}) {
  // NOTE:
  // Playlist editor experimental UI (summer 2025).
  // We intentionally use `!border-*` here so that state
  // borders (highlight / error / valid) always win over
  // base textarea border styles.
  if (options.highlighted) {
    // highlight state: yellow border (background stays default)
    return 'border-4 !border-yellow-400 dark:!border-yellow-500';
  }
  if (options.hasError) {
    // invalid state: use red-ish border (background stays default)
    return 'border-4 !border-red-500 dark:!border-red-400';
  }
  if (options.isValid) {
    // valid state: use green-ish border (background stays default)
    return 'border-4 !border-emerald-500 dark:!border-emerald-400';
  }
  // neutral state: no extra background; use default textarea styles
  return '';
}

type StatusCardProps = {
  title: string;
  state: CardState;
  description?: React.ReactNode;
  children: React.ReactNode;
};

function StatusCard({ title, state, description, children }: StatusCardProps) {
  const cardClassName =
    state === 'invalid'
      ? 'w-full p-4 border-4 !border-red-500/70 bg-red-800/10'
      : state === 'valid'
        ? 'w-full p-4 border-4 !border-emerald-500/70 bg-emerald-800/10'
        : 'w-full p-4 border-4 border-border';

  return (
    <Card className={cardClassName}>
      <CardHeader className="flex items-start justify-between gap-2">
        <div>
          <CardTitle>{title}</CardTitle>
          {description}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {state === 'invalid' && (
            <CircleX className="h-8 w-8 text-red-500" aria-hidden="true" />
          )}
          {state === 'valid' && (
            <CircleCheck
              className="h-8 w-8 text-emerald-500"
              aria-hidden="true"
            />
          )}
          {state === 'neutral' && (
            <CircleHelp className="h-8 w-8 text-slate-400" aria-hidden="true" />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">{children}</CardContent>
    </Card>
  );
}

type PrototypeInputsCardProps = {
  ids: {
    text: string;
    setText: (value: string) => void;
    highlighted: boolean;
    error: string | null;
    setError: (value: string | null) => void;
  };
  urls: {
    text: string;
    setText: (value: string) => void;
    highlighted: boolean;
    error: string | null;
    setError: (value: string | null) => void;
  };
  page: {
    url: string;
    setUrl: (value: string) => void;
    error: string | null;
    setError: (value: string | null) => void;
  };
  lastDriver: LastDriver;
  setLastDriver: (value: LastDriver) => void;
  isFetchingPage: boolean;
  onFetchFromPage: () => void;
};

function PrototypeInputsCard({
  urls,
  ids,
  page,
  lastDriver,
  setLastDriver,
  isFetchingPage,
  onFetchFromPage,
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
      hasError: Boolean(urls.error),
      isValid: urlsIsValid,
      length: urls.text.length,
    },
    ids: {
      highlighted: ids.highlighted,
      hasError: Boolean(ids.error),
      isValid: idsIsValid,
      length: ids.text.length,
    },
    cards: {
      inputs: cardState,
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
          <div className="mt-3 flex flex-col gap-2">
            <label
              htmlFor="source-page-url"
              className="text-xs font-medium text-muted-foreground"
            >
              Page URL (helper for Prototype URLs)
            </label>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <Input
                id="source-page-url"
                type="url"
                value={page.url}
                onChange={(e) => {
                  page.setUrl(e.target.value);
                  if (page.error) {
                    page.setError(null);
                  }
                }}
                className="w-full text-xs"
                placeholder="Paste a page URL to fetch ProtoPedia URLs into this box"
                aria-describedby="source-page-url-help"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={onFetchFromPage}
                disabled={isFetchingPage}
                aria-label="Fetch prototype URLs from page"
              >
                {isFetchingPage ? 'Fetching…' : 'Fetch from page'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  page.setUrl('');
                  page.setError(null);
                }}
                disabled={page.url.length === 0 && !page.error}
                aria-label="Clear page URL"
              >
                Clear URL
              </Button>
            </div>
            {page.error && (
              <div className="flex flex-col gap-0.5 text-xs leading-relaxed text-red-600 dark:text-red-400">
                {page.error.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            )}
            <p
              id="source-page-url-help"
              className="text-xs text-muted-foreground"
            >
              First tries client fetch (may fail due to CORS in browser), then
              falls back to server-side fetch. Extracted ProtoPedia prototype
              URLs are filled into the textarea above.
            </p>
          </div>
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

type PlaylistPreviewCardProps = {
  effectiveIds: number[];
};

function PlaylistPreviewCard({ effectiveIds }: PlaylistPreviewCardProps) {
  const [namesById, setNamesById] = useState<Record<number, string>>({});

  useEffect(() => {
    const uniqueIds = Array.from(new Set(effectiveIds));
    let isCancelled = false;

    const resolveNames = async () => {
      if (uniqueIds.length === 0) {
        if (!isCancelled) {
          setNamesById({});
        }
        return;
      }

      try {
        const names = await getPrototypeNamesFromStore(uniqueIds);
        if (!isCancelled) {
          setNamesById(names);
        }
      } catch {
        if (!isCancelled) {
          setNamesById({});
        }
      }
    };

    void resolveNames();

    return () => {
      isCancelled = true;
    };
  }, [effectiveIds]);

  return (
    <Card className="w-full p-4 border-4">
      <CardHeader>
        <CardTitle>Prototypes in playlist</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Prototype ID</TableHead>
              <TableHead>Prototype name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {effectiveIds.map((id, index) => (
              <TableRow key={`${id}-${index}`}>
                <TableCell className="text-center text-xs text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="font-mono text-xs">{id}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {namesById[id] ?? 'unknown (cache not available)'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

type PlaylistTitleCardProps = {
  title: string;
  setTitle: (value: string) => void;
  titleError: string | null;
  setTitleError: (value: string | null) => void;
};

function PlaylistTitleCard({
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

type PlaylistOutputCardProps = {
  ids: {
    idsError: string | null;
    idsText: string;
    effectiveIds: number[];
  };
  title: {
    title: string;
    titleError: string | null;
  };
  playlistUrl: string;
  copyStatus: 'idle' | 'ok' | 'fail';
  canGeneratePlaylistUrl: boolean;
  onCopy: () => void;
  pageTitle: string;
  highlighted: boolean;
  hasInputError: boolean;
};

function PlaylistOutputCard({
  ids,
  title,
  playlistUrl,
  copyStatus,
  canGeneratePlaylistUrl,
  pageTitle,
  highlighted,
  hasInputError,
  onCopy,
}: PlaylistOutputCardProps) {
  const hasIds = ids.idsText.trim().length > 0 && !ids.idsError;
  const hasTitle = title.title.trim().length > 0 && !title.titleError;

  const cardState = getAggregateCardState({
    hasError:
      Boolean(ids.idsError) || Boolean(title.titleError) || hasInputError,
    hasAnyValid: hasIds || hasTitle || Boolean(playlistUrl),
  });

  logger.debug('playlist-output:status', {
    props: {
      playlistUrl,
      title,
      idsTextLength: ids.idsText.length,
      copyStatus,
      canGeneratePlaylistUrl,
      pageTitle,
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
        {playlistUrl ? (
          <div className="flex flex-col gap-4">
            <code className="rounded bg-muted px-3 py-2 text-xs break-all">
              {playlistUrl}
            </code>
            <div className="flex gap-3">
              <Button type="button" onClick={onCopy} disabled={!playlistUrl}>
                Copy
              </Button>
              <a
                href={playlistUrl}
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
            {pageTitle && (
              <p className="text-xs text-muted-foreground">
                Page title: {pageTitle}
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

type PlaylistUrlGeneratorProps = {
  directLaunchParams?: DirectLaunchParams;
};

export function PlaylistUrlGenerator({
  directLaunchParams,
}: PlaylistUrlGeneratorProps) {
  const [title, setTitle] = useState(() => {
    if (directLaunchParams?.title) {
      return directLaunchParams.title;
    }
    return '';
  });
  const [pageUrl, setPageUrl] = useState('');
  const [idsText, setIdsText] = useState(() => {
    if (directLaunchParams?.ids && directLaunchParams.ids.length > 0) {
      return directLaunchParams.ids.join('\n');
    }
    return '';
  });
  const [urlsText, setUrlsText] = useState('');
  const [lastDriver, setLastDriver] = useState<LastDriver>(() => {
    if (directLaunchParams?.ids && directLaunchParams.ids.length > 0) {
      return 'ids';
    }
    return null;
  });
  const [copyStatus, setCopyStatus] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [idsError, setIdsError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [urlsError, setUrlsError] = useState<string | null>(null);
  const [urlsHighlighted, setUrlsHighlighted] = useState(false);
  const [idsHighlighted, setIdsHighlighted] = useState(false);
  const [playlistHighlighted, setPlaylistHighlighted] = useState(false);

  const { trigger: triggerScrape, isMutating: isFetchingPage } = useSWRMutation(
    ['scrapePageHtml'],
    async (_key, { arg }: { arg: string }) => {
      return scrapePageHtml(arg);
    },
  );

  const urlsArray = useMemo(() => {
    return urlsText
      .split(/\n+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }, [urlsText]);

  const manualIds = useMemo(() => parsePrototypeIdLines(idsText), [idsText]);

  const autoIds = useMemo(() => normalizeIdsFromUrls(urlsArray), [urlsArray]);

  const effectiveIds = lastDriver === 'ids' ? manualIds : autoIds;

  const hasInputError = Boolean(urlsError) || Boolean(idsError);

  const canGeneratePlaylistUrl = useMemo(() => {
    if (idsError || titleError) return false;
    const hasIds = effectiveIds.length > 0;
    const hasTitle = title.trim().length > 0;

    // RED GUARDRAIL:
    // Do not allow playlist generation while any visible card
    // is in an "invalid" (red) state.
    //
    // Prototype IDs Inputs card is red if either URLs or IDs
    // have validation errors (except for the special neutral
    // case "URLs invalid & IDs empty"). Playlist card should
    // never be green when Inputs is red.
    if (hasInputError) {
      return false;
    }

    return hasIds || hasTitle;
  }, [effectiveIds.length, hasInputError, idsError, title, titleError]);

  useEffect(() => {
    if (lastDriver === 'urls' && !urlsError) {
      const ids = normalizeIdsFromUrls(urlsArray);
      setIdsText(ids.join('\n'));
      if (ids.length > 0) {
        setIdsHighlighted(true);
      }
    }
  }, [urlsArray, lastDriver, urlsError]);

  useEffect(() => {
    if (!urlsHighlighted && !idsHighlighted && !playlistHighlighted) return;
    const timer = setTimeout(() => {
      setUrlsHighlighted(false);
      setIdsHighlighted(false);
      setPlaylistHighlighted(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [urlsHighlighted, idsHighlighted, playlistHighlighted]);

  const playlistUrl = useMemo(() => {
    if (!canGeneratePlaylistUrl) {
      return '';
    }
    return buildPlaylistUrl(effectiveIds, title);
  }, [canGeneratePlaylistUrl, effectiveIds, title]);

  useEffect(() => {
    if (!playlistUrl) return;
    setPlaylistHighlighted(true);
  }, [playlistUrl]);

  const playlistPageTitle = useMemo(() => {
    if (!canGeneratePlaylistUrl) {
      return '';
    }
    const playMode: PlayModeState = {
      type: 'playlist',
      ids: effectiveIds,
      title,
    };
    return computeDocumentTitle(playMode);
  }, [canGeneratePlaylistUrl, effectiveIds, title]);

  const handleFetchFromPage = useCallback(async () => {
    const trimmedUrl = pageUrl.trim();
    if (trimmedUrl.length === 0) {
      setPageError('Please enter a page URL.');
      return;
    }

    try {
      setPageError(null);
      logger.debug('handleFetchFromPage:start', { pageUrl: trimmedUrl });
      const isAllowed = isAllowedUrlForClient(trimmedUrl);
      if (!isAllowed) {
        logger.debug('handleFetchFromPage:skipped:notAllowedByPolicy', {
          pageUrl: trimmedUrl,
        });
        setPageError('This URL is not allowed for fetching.');
        return;
      }

      // 1. Try client-side fetch first (subject to CORS) when URL is allowed.
      if (isAllowed) {
        try {
          logger.debug('handleFetchFromPage:clientFetch:request', {
            pageUrl: trimmedUrl,
          });
          const response = await fetch(trimmedUrl, { method: 'GET' });
          logger.debug('handleFetchFromPage:clientFetch:response', {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            type: response.type,
          });
          if (response.ok) {
            const html = await response.text();
            logger.debug('handleFetchFromPage:clientFetch:htmlReceived', {
              length: html.length,
            });
            if (!html || html.length === 0) {
              setPageError('Client fetch OK but contained no content.');
              return;
            }

            const urls = extractPrototypeUrls(html, trimmedUrl);
            logger.debug('handleFetchFromPage:clientFetch:urlsExtracted', {
              count: urls.length,
              urls,
            });
            if (urls.length === 0) {
              setPageError(
                'Client fetch OK, but no ProtoPedia prototype URLs were found on this page.',
              );
              return;
            }

            setUrlsText(urls.join('\n'));
            setLastDriver('urls');
            logger.debug('handleFetchFromPage:clientFetch:success', {
              urlCount: urls.length,
            });
            return;
          }
          // Non-OK status from client fetch: surface briefly and fall back.
          logger.warn('handleFetchFromPage:clientFetch:nonOkStatus', {
            status: response.status,
            statusText: response.statusText,
          });
          setPageError(
            `Client fetch failed: ${response.status} ${response.statusText}. Trying server-side fetch next (no CORS).`,
          );
        } catch (clientError) {
          logger.error('handleFetchFromPage:clientFetch:error', {
            pageUrl: trimmedUrl,
            error:
              clientError instanceof Error
                ? { name: clientError.name, message: clientError.message }
                : clientError,
          });
          const message =
            clientError instanceof Error && clientError.message
              ? clientError.message
              : 'Client fetch failed.';
          setPageError(
            `${message} Trying server-side fetch next (no CORS restrictions in browser).`,
          );
        }
      } else {
        logger.debug('handleFetchFromPage:clientFetch:skippedNotAllowed', {
          pageUrl: trimmedUrl,
        });
      }

      // 2. Fallback: server-side fetch via Server Action.
      logger.debug('handleFetchFromPage:serverFetch:request', {
        pageUrl: trimmedUrl,
      });
      const { html, finalUrl } = await triggerScrape(trimmedUrl);
      logger.debug('handleFetchFromPage:serverFetch:htmlReceived', {
        length: html.length,
        finalUrl,
      });
      if (html.length === 0) {
        setPageError('Page fetched but contained no content.');
        return;
      }

      const urls = extractPrototypeUrls(html, finalUrl);
      logger.debug('handleFetchFromPage:serverFetch:urlsExtracted', {
        count: urls.length,
        urls,
      });
      if (urls.length === 0) {
        setPageError('No ProtoPedia prototype URLs were found on this page.');
        return;
      }

      setUrlsText(urls.join('\n'));
      setLastDriver('urls');
      setUrlsHighlighted(true);
      logger.debug('handleFetchFromPage:serverFetch:success', {
        urlCount: urls.length,
      });
      // If playlist title is empty, try to use the page <title> as a helpful default.
      if (!title) {
        const pageTitle = extractTitleFromPageTitle(html);
        if (pageTitle) {
          setTitle(pageTitle);
          logger.debug('handleFetchFromPage:serverFetch:titleExtracted', {
            pageTitle,
          });
        }
      }
    } catch (error) {
      logger.error('handleFetchFromPage:unhandledError', {
        pageUrl: trimmedUrl,
        error:
          error instanceof Error
            ? { name: error.name, message: error.message }
            : error,
      });
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Failed to fetch the page. Please check the URL.';
      setPageError(message);
    }
  }, [pageUrl, title, triggerScrape]);

  const handleCopy = useCallback(async () => {
    if (!playlistUrl) return;
    try {
      await navigator.clipboard.writeText(playlistUrl);
      setCopyStatus('ok');
    } catch {
      // Swallow clipboard error; status already reflects failure
      setCopyStatus('fail');
    } finally {
      setTimeout(() => setCopyStatus('idle'), 2500);
    }
  }, [playlistUrl]);

  return (
    <div className="flex flex-col gap-8">
      <PrototypeInputsCard
        ids={{
          text: idsText,
          setText: setIdsText,
          highlighted: idsHighlighted,
          error: idsError,
          setError: setIdsError,
        }}
        urls={{
          text: urlsText,
          setText: setUrlsText,
          highlighted: urlsHighlighted,
          error: urlsError,
          setError: setUrlsError,
        }}
        page={{
          url: pageUrl,
          setUrl: setPageUrl,
          error: pageError,
          setError: setPageError,
        }}
        lastDriver={lastDriver}
        setLastDriver={setLastDriver}
        isFetchingPage={isFetchingPage}
        onFetchFromPage={handleFetchFromPage}
      />
      <PlaylistTitleCard
        title={title}
        setTitle={setTitle}
        titleError={titleError}
        setTitleError={setTitleError}
      />
      <PlaylistOutputCard
        ids={{ idsError, idsText, effectiveIds }}
        title={{ title, titleError }}
        playlistUrl={playlistUrl}
        canGeneratePlaylistUrl={canGeneratePlaylistUrl}
        copyStatus={copyStatus}
        pageTitle={playlistPageTitle}
        highlighted={playlistHighlighted}
        hasInputError={hasInputError}
        onCopy={handleCopy}
      />
      <PlaylistPreviewCard effectiveIds={effectiveIds} />
    </div>
  );
}
