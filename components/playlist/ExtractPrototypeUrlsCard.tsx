import React, { useState } from 'react';

import { StatusCard } from '@/components/playlist/StatusCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { logger } from '@/lib/logger.client';
import { extractPrototypeUrls } from '@/lib/utils/playlist-builder';
import { isAllowedProtopediaScrapeUrl } from '@/lib/utils/url-allowlist';

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
  onApplyUrls: (urls: string[]) => void;
  onApplyTitle: (title: string | null) => void;
};

export function ExtractPrototypeUrlsCard({
  source,
  isFetching,
  onFetch,
  onApplyUrls,
  onApplyTitle,
}: ExtractPrototypeUrlsCardProps) {
  const [rawContent, setRawContent] = useState('');

  const [lastExtractCount, setLastExtractCount] = useState<number | null>(null);

  const handleExtractFromContent = () => {
    const content = rawContent.trim();
    if (!content) {
      source.setError('Paste HTML or TSV content to extract from.');
      return;
    }

    const urls = extractPrototypeUrls(content, source.url || undefined);
    logger.debug('extract-card:content:urlsExtracted', {
      count: urls.length,
      urls,
    });
    setLastExtractCount(urls.length);

    if (urls.length === 0) {
      source.setError(
        'No ProtoPedia prototype URLs were found in the content.',
      );
      return;
    }

    source.setError(null);
    onApplyUrls(urls);
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
      onApplyUrls(urls);

      if (!rawContent) {
        setRawContent(html);
      }

      if (!urls || urls.length === 0) {
        onApplyTitle(null);
        return;
      }

      const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const pageTitle = match?.[1]?.trim() ?? '';
      if (pageTitle) {
        onApplyTitle(pageTitle);
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

  const hasError = Boolean(source.error);
  const hasAnyValid = (lastExtractCount ?? 0) > 0;
  const cardState = hasError ? 'invalid' : hasAnyValid ? 'valid' : 'neutral';

  return (
    <StatusCard
      title="Extract prototype URLs"
      state={cardState}
      description={
        <p className="mt-1 text-xs text-muted-foreground">
          Paste HTML/TSV or fetch a page to extract ProtoPedia URLs into the
          playlist editor.
        </p>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="extract-page-url" className="text-xs font-medium">
            Page URL
          </label>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            <Input
              id="extract-page-url"
              type="url"
              value={source.url}
              onChange={(e) => {
                source.setUrl(e.target.value);
                if (source.error) {
                  source.setError(null);
                }
              }}
              className="w-full text-xs"
              placeholder="Paste a page URL to fetch ProtoPedia URLs"
              aria-describedby="extract-page-url-help"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleFetchFromPage}
              disabled={isFetching}
              aria-label="Fetch prototype URLs from page"
            >
              {isFetching ? 'Fetching…' : 'Fetch from page'}
            </Button>
          </div>
          {source.error && (
            <div className="flex flex-col gap-0.5 text-xs leading-relaxed text-red-600 dark:text-red-400">
              {source.error.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}
          <p
            id="extract-page-url-help"
            className="text-xs text-muted-foreground"
          >
            Fetches the page server-side and extracts ProtoPedia prototype URLs.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="extract-raw" className="text-xs font-medium">
            Raw content (HTML or TSV)
          </label>
          <Textarea
            id="extract-raw"
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            className="text-xs font-mono bg-white dark:bg-zinc-900"
            placeholder={
              'Paste raw HTML or TSV that includes ProtoPedia prototype URLs.'
            }
            rows={6}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleExtractFromContent}
              disabled={!rawContent.trim()}
              aria-label="Extract URLs from raw content"
            >
              Extract from content
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setRawContent('');
                setLastExtractCount(null);
                source.setError(null);
              }}
              disabled={
                !rawContent && !source.error && lastExtractCount === null
              }
              aria-label="Clear raw content and errors"
            >
              Clear
            </Button>
          </div>
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
