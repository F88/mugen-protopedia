import React, { useState } from 'react';

import { StatusCard } from '@/components/status-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { getIndicatorSymbol } from '@/components/playlist/editor/playlist-editor-utils';

import { logger } from '@/lib/logger.client';
import { extractPrototypeUrls } from '@/lib/utils/playlist-builder';
import { isAllowedProtopediaScrapeUrl } from '@/lib/utils/url-allowlist';
import { pageUrlSchema } from '@/schemas/playlist';

export type ExtractSource = {
  url: string;
  setUrl: (value: string) => void;
  error: string | null;
  setError: (value: string | null) => void;
};

export type ExtractPrototypeUrlsCardProps = {
  source: ExtractSource;
  isFetching: boolean;
  onFetch: (url: string) => Promise<string>; // returns HTML
  onUrlsExtracted: (urls: string[]) => void;
  onTitleExtracted: (title: string | null) => void;
};

export function ExtractPrototypeUrlsCard({
  source,
  isFetching,
  onFetch,
  onUrlsExtracted,
  onTitleExtracted,
}: ExtractPrototypeUrlsCardProps) {
  const [rawContent, setRawContent] = useState('');

  const [lastExtractCount, setLastExtractCount] = useState<number | null>(null);
  const [rawContentError, setRawContentError] = useState<string | null>(null);

  const handlePageUrlChange = (nextUrl: string) => {
    source.setUrl(nextUrl);

    const trimmed = nextUrl.trim();
    if (trimmed.length === 0) {
      source.setError(null);
      return;
    }

    const result = pageUrlSchema.safeParse(trimmed);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      source.setError(firstIssue?.message ?? 'Please enter a valid https URL.');
    } else {
      source.setError(null);
    }
  };

  const handleExtractFromContent = () => {
    const content = rawContent.trim();
    if (!content) {
      setRawContentError('Paste HTML or TSV content to extract from.');
      return;
    }

    const urls = extractPrototypeUrls(content, source.url || undefined);
    logger.debug('extract-card:content:urlsExtracted', {
      count: urls.length,
      urls,
    });
    setLastExtractCount(urls.length);

    if (urls.length === 0) {
      setRawContentError(
        'No ProtoPedia prototype URLs were found in the content.',
      );
      return;
    }

    setRawContentError(null);
    onUrlsExtracted(urls);
  };

  const handleFetchFromPage = async () => {
    const trimmedUrl = source.url.trim();
    if (!trimmedUrl) {
      source.setError('Please enter a page URL.');
      return;
    }

    if (!isAllowedProtopediaScrapeUrl(trimmedUrl)) {
      logger.debug('extract-card:skipped:notAllowedByPolicy', {
        pageUrl: trimmedUrl,
      });
      source.setError('This URL is not allowed for fetching.');
      return;
    }

    try {
      source.setError(null);
      logger.debug('extract-card:fetch:start', { pageUrl: trimmedUrl });
      const html = await onFetch(trimmedUrl);
      logger.debug('extract-card:fetch:htmlReceived', {
        length: html.length,
      });
      if (!html || html.length === 0) {
        source.setError('Page fetched but contained no content.');
        return;
      }

      const urls = extractPrototypeUrls(html, trimmedUrl);
      logger.debug('extract-card:fetch:urlsExtracted', {
        count: urls.length,
        urls,
      });
      setLastExtractCount(urls.length);

      if (urls.length === 0) {
        source.setError(
          'No ProtoPedia prototype URLs were found on this page.',
        );
        return;
      }

      source.setError(null);
      onUrlsExtracted(urls);

      if (!urls || urls.length === 0) {
        onTitleExtracted(null);
        return;
      }

      const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const pageTitle = match?.[1]?.trim() ?? '';
      if (pageTitle) {
        onTitleExtracted(pageTitle);
      }
    } catch (error) {
      logger.error('extract-card:fetch:error', {
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
      source.setError(message);
    }
  };

  const hasError = Boolean(source.error) || Boolean(rawContentError);
  const hasAnyValid = (lastExtractCount ?? 0) > 0;
  const cardState = hasError ? 'invalid' : hasAnyValid ? 'valid' : 'neutral';

  return (
    <StatusCard
      title="Extract prototype URLs"
      state={cardState}
      description={
        <p className="mt-1 text-xs text-muted-foreground">
          Paste raw content or fetch a page to extract ProtoPedia prototype URLs
          into the playlist editor.
        </p>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="extract-page-url" className="text-sm font-medium">
              Page URL
            </label>
            <span
              className="text-xs"
              aria-live="polite"
              data-test-id="extract-page-url-indicator"
            >
              {getIndicatorSymbol({
                hasValue: source.url.trim().length > 0,
                hasError: Boolean(source.error),
              })}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[3fr_auto] md:items-start md:gap-3">
            <div className="w-full max-w-3xl">
              <Input
                id="extract-page-url"
                type="url"
                value={source.url}
                onChange={(e) => handlePageUrlChange(e.target.value)}
                className="w-full text-xs bg-white dark:bg-zinc-900"
                placeholder="Paste a page URL to fetch ProtoPedia URLs"
                aria-describedby="extract-page-url-help"
              />
            </div>
            <div className="flex gap-2 justify-start md:justify-end">
              <Button
                type="button"
                variant="default"
                onClick={handleFetchFromPage}
                disabled={isFetching}
                aria-label="Fetch prototype URLs from page"
              >
                {isFetching ? 'Fetching…' : 'Fetch'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  source.setUrl('');
                  source.setError(null);
                  setLastExtractCount(null);
                }}
                disabled={
                  !source.url && !source.error && lastExtractCount === null
                }
                aria-label="Clear page URL and errors"
              >
                Clear
              </Button>
            </div>
          </div>
          {source.error && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {source.error}
            </p>
          )}
          <p
            id="extract-page-url-help"
            className="text-xs text-muted-foreground"
          >
            Fetches the page server-side and extracts ProtoPedia prototype URLs.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="extract-raw" className="text-sm font-medium">
              Raw content (for example HTML, CSV, TSV)
            </label>
            <span
              className="text-xs"
              aria-live="polite"
              data-test-id="extract-raw-indicator"
            >
              {getIndicatorSymbol({
                hasValue: rawContent.trim().length > 0,
                hasError: Boolean(rawContentError),
              })}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[3fr_auto] md:items-start md:gap-3">
            <div className="w-full max-w-3xl">
              <Textarea
                id="extract-raw"
                value={rawContent}
                onChange={(e) => {
                  setRawContent(e.target.value);
                  if (rawContentError) {
                    setRawContentError(null);
                  }
                }}
                className="text-xs font-mono bg-white dark:bg-zinc-900"
                placeholder={
                  'Paste raw content (for example HTML, CSV, TSV) that includes ProtoPedia prototype URLs.'
                }
                rows={6}
              />
            </div>
            <div className="flex gap-2 justify-start md:justify-end">
              <Button
                type="button"
                variant="default"
                onClick={handleExtractFromContent}
                disabled={!rawContent.trim() || Boolean(rawContentError)}
                aria-label="Extract URLs from raw content"
              >
                Extract
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setRawContent('');
                  setLastExtractCount(null);
                  setRawContentError(null);
                }}
                disabled={
                  !rawContent && !rawContentError && lastExtractCount === null
                }
                aria-label="Clear raw content and errors"
              >
                Clear
              </Button>
            </div>
          </div>
          {rawContentError && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {rawContentError}
            </p>
          )}
          {lastExtractCount !== null && (
            <p className="text-xs text-muted-foreground">
              Last extraction: {lastExtractCount} URL
              {lastExtractCount === 1 ? '' : 's'} found.
            </p>
          )}
        </div>
      </div>
    </StatusCard>
  );
}
