'use client';

import React from 'react';

import { useCallback, useEffect, useMemo, useState } from 'react';

import useSWRMutation from 'swr/mutation';

import type { PlayModeState } from '@/types/mugen-protopedia.types';

import type { DirectLaunchParams } from '@/schemas/direct-launch';

import { computeDocumentTitle } from '@/lib/utils/document-title';
import {
  buildPlaylistUrl,
  normalizeIdsFromUrls,
  parsePrototypeIdLines,
} from '@/lib/utils/playlist-builder';

import { scrapePageHtml } from '@/app/actions/scrape';

import { ExtractPrototypeUrlsCard } from '@/components/playlist/editor/extract-prototype-urls-card';
import { PlaylistOutputCard } from '@/components/playlist/editor/playlist-output-card';
import { PlaylistPreviewCard } from '@/components/playlist/editor/playlist-preview-card';
import { PlaylistTitleCard } from '@/components/playlist/editor/playlist-title-card';
import type { LastDriver } from '@/components/playlist/editor/prototype-inputs-card';
import { PrototypeInputsCard } from '@/components/playlist/editor/prototype-inputs-card';

type PlaylistEditorProps = {
  directLaunchParams?: DirectLaunchParams;
};

export function PlaylistEditor({ directLaunchParams }: PlaylistEditorProps) {
  const [title, setTitle] = useState(() => {
    if (directLaunchParams?.title) {
      return directLaunchParams.title;
    }
    return '';
  });
  const [idsText, setIdsText] = useState(() => {
    if (directLaunchParams?.ids && directLaunchParams.ids.length > 0) {
      return directLaunchParams.ids.join('\n');
    }
    return '';
  });
  const [urlsText, setUrlsText] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [pageError, setPageError] = useState<string | null>(null);
  const [lastDriver, setLastDriver] = useState<LastDriver>(() => {
    if (directLaunchParams?.ids && directLaunchParams.ids.length > 0) {
      return 'ids';
    }
    return null;
  });
  const [copyStatus, setCopyStatus] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [idsError, setIdsError] = useState<string | null>(null);
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
      <ExtractPrototypeUrlsCard
        source={{
          url: pageUrl,
          setUrl: setPageUrl,
          error: pageError,
          setError: setPageError,
        }}
        isFetching={isFetchingPage}
        onFetch={async (url) => {
          const { html } = await triggerScrape(url);
          return html;
        }}
        onUrlsExtracted={(urls) => {
          const text = urls.join('\n');
          setUrlsText(text);
          setUrlsError(null);
          setLastDriver('urls');
          setUrlsHighlighted(true);
        }}
        onTitleExtracted={(nextTitle) => {
          if (!nextTitle) return;
          if (title.trim().length > 0) return;
          setTitle(nextTitle);
        }}
      />
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
        lastDriver={lastDriver}
        setLastDriver={setLastDriver}
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
        playlist={{ playlistUrl, pageTitle: playlistPageTitle }}
        canGeneratePlaylistUrl={canGeneratePlaylistUrl}
        copyStatus={copyStatus}
        highlighted={playlistHighlighted}
        hasInputError={hasInputError}
        onCopy={handleCopy}
      />
      <PlaylistPreviewCard effectiveIds={effectiveIds} />
    </div>
  );
}
