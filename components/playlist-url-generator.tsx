'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import useSWRMutation from 'swr/mutation';
import {
  extractPrototypeUrls,
  normalizeIdsFromUrls,
  parsePrototypeIdLines,
  sortIdsWithDuplicates,
  deduplicateIdsPreserveOrder,
  buildPlaylistUrl,
} from '@/lib/utils/playlist-builder';
import { logger } from '@/lib/logger.client';
import { PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS } from '@/lib/config/app-constants';
import type { DirectLaunchParams } from '@/lib/utils/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { scrapePageHtml } from '@/app/actions/scrape';
import { getPrototypeNamesFromStore } from '@/app/actions/prototypes';

type LastDriver = 'urls' | 'ids' | null;

const playlistTitleSchema = z
  .string()
  .optional()
  .transform((value) => value ?? '')
  .refine((value) => value.length === 0 || value.length <= 300, {
    message: 'Playlist title must be 300 characters or fewer.',
  });

const idsTextSchema = z
  .string()
  .transform((value) => value ?? '')
  .refine(
    (value) => {
      if (value.length === 0) return true;
      const lines = value.split(/\r?\n|\r/);
      return lines.every((line) => line.length === 0 || /^\d+$/.test(line));
    },
    {
      message: 'Each non-empty line must contain digits only.',
    },
  );

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
  try {
    const url = new URL(rawUrl);
    const origin =
      `${url.protocol}//${url.host}` as (typeof PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS)[number];
    return (
      url.protocol === 'https:' &&
      PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS.includes(origin)
    );
  } catch {
    return false;
  }
}

type PrototypeInputsCardProps = {
  urlsText: string;
  setUrlsText: (value: string) => void;
  idsText: string;
  setIdsText: (value: string) => void;
  pageUrl: string;
  setPageUrl: (value: string) => void;
  lastDriver: LastDriver;
  setLastDriver: (value: LastDriver) => void;
  pageError: string | null;
  setPageError: (value: string | null) => void;
  idsError: string | null;
  setIdsError: (value: string | null) => void;
  isFetchingPage: boolean;
  onFetchFromPage: () => void;
};

function PrototypeInputsCard({
  urlsText,
  setUrlsText,
  idsText,
  setIdsText,
  pageUrl,
  setPageUrl,
  lastDriver,
  setLastDriver,
  pageError,
  setPageError,
  idsError,
  setIdsError,
  isFetchingPage,
  onFetchFromPage,
}: PrototypeInputsCardProps) {
  const urlsArray = useMemo(() => {
    return urlsText
      .split(/\n+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }, [urlsText]);

  const manualIds = useMemo(() => parsePrototypeIdLines(idsText), [idsText]);

  const autoIds = useMemo(() => normalizeIdsFromUrls(urlsArray), [urlsArray]);

  const effectiveIds = lastDriver === 'ids' ? manualIds : autoIds;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prototype IDs Inputs</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Enter the IDs of the prototypes you want in this playlist.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          You can paste ProtoPedia prototype page URLs or numeric prototype IDs
          to build the list of IDs.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="playlist-urls" className="text-sm font-medium">
              Prototype URLs (editable)
            </label>
            <textarea
              id="playlist-urls"
              value={urlsText}
              onChange={(e) => {
                setUrlsText(e.target.value);
                setLastDriver('urls');
              }}
              className="min-h-[180px] w-full rounded border border-border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={'Paste prototype URLs here (one per line).'}
              aria-describedby="playlist-urls-help"
            />
            <p className="text-xs text-muted-foreground">
              URLs detected: {urlsArray.length}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setUrlsText('');
                  setLastDriver('urls');
                }}
                disabled={!urlsText}
                aria-label="Clear URLs"
              >
                Clear URLs
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setUrlsText('');
                  setLastDriver('urls');
                }}
                disabled={!urlsText}
                aria-label="Reset URLs"
              >
                Reset URLs
              </Button>
            </div>
            <p
              id="playlist-urls-help"
              className="text-xs text-muted-foreground"
            >
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
                <input
                  id="source-page-url"
                  type="url"
                  value={pageUrl}
                  onChange={(e) => {
                    setPageUrl(e.target.value);
                    if (pageError) {
                      setPageError(null);
                    }
                  }}
                  className="w-full rounded border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Paste a page URL to fetch ProtoPedia URLs into this box"
                  aria-describedby="source-page-url-help"
                />
                <div className="flex gap-2">
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
                      setPageUrl('');
                      setPageError(null);
                    }}
                    disabled={pageUrl.length === 0 && !pageError}
                    aria-label="Clear page URL"
                  >
                    Clear
                  </Button>
                </div>
              </div>
              {pageError && (
                <div className="flex flex-col gap-0.5 text-xs leading-relaxed text-red-600 dark:text-red-400">
                  {pageError.split('\n').map((line, index) => (
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
            <label htmlFor="playlist-ids" className="text-sm font-medium">
              Prototype IDs (editable)
            </label>
            <textarea
              id="playlist-ids"
              value={idsText}
              onChange={(e) => {
                const nextValue = e.target.value;
                setIdsText(nextValue);
                const result = idsTextSchema.safeParse(nextValue);
                if (!result.success) {
                  const firstIssue = result.error.issues[0];
                  setIdsError(firstIssue?.message ?? null);
                } else {
                  const parsedIds = parsePrototypeIdLines(nextValue);
                  if (parsedIds.length > 100) {
                    setIdsError(
                      'You can use up to 100 prototype IDs per playlist.',
                    );
                  } else {
                    setIdsError(null);
                  }
                }
                setLastDriver('ids');
              }}
              className="min-h-[140px] w-full rounded border border-border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={'Enter one numeric ID per line'}
              aria-describedby="playlist-ids-help"
            />
            <p className="text-xs text-muted-foreground">
              Effective IDs: {effectiveIds.length}{' '}
              {effectiveIds.length === 1 ? 'item' : 'items'}
            </p>
            {idsError && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {idsError}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIdsText('');
                  setLastDriver('ids');
                }}
                disabled={!idsText}
                aria-label="Clear manual IDs"
              >
                Clear IDs
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const parsed = parsePrototypeIdLines(idsText);
                  if (parsed.length === 0) return;
                  const sorted = sortIdsWithDuplicates(parsed);
                  setIdsText(sorted.join('\n'));
                  setLastDriver('ids');
                }}
                disabled={!idsText.trim()}
                aria-label="Sort IDs ascending"
              >
                Sort IDs
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const parsed = parsePrototypeIdLines(idsText);
                  if (parsed.length === 0) return;
                  const deduped = deduplicateIdsPreserveOrder(parsed);
                  setIdsText(deduped.join('\n'));
                  setLastDriver('ids');
                }}
                disabled={!idsText.trim()}
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
      </CardContent>
    </Card>
  );
}

type PrototypesSummaryCardProps = {
  effectiveIds: number[];
};

function PrototypesSummaryCard({ effectiveIds }: PrototypesSummaryCardProps) {
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
    <Card>
      <CardHeader>
        <CardTitle>Prototypes in playlist</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-6 text-sm text-muted-foreground">
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title of playlist</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="playlist-title" className="text-sm font-medium">
            Playlist Title
          </label>
          <input
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
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter playlist title"
            aria-describedby="playlist-title-help"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setTitle('')}
              disabled={!title}
              aria-label="Clear title"
            >
              Clear
            </Button>
          </div>
          {titleError && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {titleError}
            </p>
          )}
          <p id="playlist-title-help" className="text-xs text-muted-foreground">
            Optional. Included in generated playlist URL (up to 300 characters,
            emoji supported).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

type PlaylistOutputCardProps = {
  playlistUrl: string;
  title: string;
  effectiveIds: number[];
  copyStatus: 'idle' | 'ok' | 'fail';
  onCopy: () => void;
};

function PlaylistOutputCard({
  playlistUrl,
  title,
  effectiveIds,
  copyStatus,
  onCopy,
}: PlaylistOutputCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Playlist</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-6">
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
              Title: {title || '(none)'}
            </p>
            <p className="text-xs text-muted-foreground">
              IDs used: {effectiveIds.length} ({effectiveIds.join(', ')})
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No IDs found yet. Paste URLs, or enter IDs manually.
          </p>
        )}
      </CardContent>
    </Card>
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
  const [lastDriver, setLastDriver] = useState<LastDriver>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [idsError, setIdsError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

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

  useEffect(() => {
    if (lastDriver === 'urls') {
      const ids = normalizeIdsFromUrls(urlsArray);
      setIdsText(ids.join('\n'));
    }
  }, [urlsArray, lastDriver]);

  const playlistUrl = useMemo(
    () => buildPlaylistUrl(effectiveIds, title),
    [effectiveIds, title],
  );

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
        setPageError(
          [
            'This URL is not allowed for fetching.',
            '',
            'Allowed origins:',
            ...PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS.map((origin) => `- ${origin}`),
          ].join('\n'),
        );
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
        urlsText={urlsText}
        setUrlsText={setUrlsText}
        idsText={idsText}
        setIdsText={setIdsText}
        pageUrl={pageUrl}
        setPageUrl={setPageUrl}
        lastDriver={lastDriver}
        setLastDriver={setLastDriver}
        pageError={pageError}
        setPageError={setPageError}
        idsError={idsError}
        setIdsError={setIdsError}
        isFetchingPage={isFetchingPage}
        onFetchFromPage={handleFetchFromPage}
      />
      <PrototypesSummaryCard effectiveIds={effectiveIds} />
      <PlaylistTitleCard
        title={title}
        setTitle={setTitle}
        titleError={titleError}
        setTitleError={setTitleError}
      />
      <PlaylistOutputCard
        playlistUrl={playlistUrl}
        effectiveIds={effectiveIds}
        title={title}
        copyStatus={copyStatus}
        onCopy={handleCopy}
      />
    </div>
  );
}
