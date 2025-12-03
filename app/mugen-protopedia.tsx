'use client';

/**
 * @file Home page component providing an infinite prototype browsing surface.
 *
 * @see docs/specs/slot-and-scroll-behavior.md for formal slot & scroll specification.
 */

import type { ChangeEvent } from 'react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { getMaxPrototypeId } from '@/app/actions/prototypes';
import type {
  PlayModeState,
  SimulatedDelayRangeByMode,
} from '@/types/mugen-protopedia.types';

// lib
import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';
import { useLatestAnalysis } from '@/lib/hooks/use-analysis';
import { usePlaylistPrototype } from '@/lib/hooks/use-playlist-prototype';
import { usePrototypeSlots } from '@/lib/hooks/use-prototype-slots';
import { useRandomPrototype } from '@/lib/hooks/use-random-prototype';
import { useScrollingBehavior } from '@/lib/hooks/use-scrolling-behavior';
import { logger } from '@/lib/logger.client';
import { getLatestPrototypeById } from '@/lib/fetcher/get-latest-prototype-by-id';
import { getRandomPlaylistStyle } from '@/lib/utils/playlist-style';
import { resolvePlayMode } from '@/lib/utils/resolve-play-mode';

// hooks
import { useDirectLaunch } from '@/hooks/use-direct-launch';

// components
import { AnalysisDashboard } from '@/components/analysis-dashboard';
import { ControlPanel } from '@/components/control-panel';
import { DirectLaunchResult } from '@/components/direct-launch-result';
import { Header } from '@/components/header';
import {
  PlaylistTitleCard,
  type PlaylistTitleCardVariant,
} from '@/components/playlist/playlist-title';
import { PrototypeGrid } from '@/components/prototype/prototype-grid';
import { buildPrototypeLink } from '@/lib/utils/prototype-utils';

/**
 * Simulated delay ranges for different play modes.
 */
const SIMULATED_DELAY_RANGE_BY_MODE: SimulatedDelayRangeByMode = {
  // normal: { min: 500, max: 2_000 },
  normal: { min: 500, max: 3_000 },
  // playlist: { min: 0, max: 0 },
  // playlist: { min: 500, max: 1_000 } /* too fast */,
  playlist: { min: 500, max: 3_000 },
  // playlist: { min: 500, max: 5_000 },
  // playlist: { min: 3_000, max: 5_000 },
  unleashed: { min: 0, max: 0 },
  joe: { min: 300, max: 300 },
} as const;

/**
 * Interval between fetching prototypes in playlist mode (ms).
 */
const PLAYLIST_FETCH_INTERVAL_MS = 1_000;

// /**
//  * Build the external ProtoPedia detail page URL for a given prototype.
//  *
//  * @param prototype - Normalized prototype object
//  * @returns absolute URL string to the ProtoPedia detail page
//  */
// const urlOfPageForPrototype = (prototype: Prototype): string =>
//   buildPrototypeLink(prototype.id);

const arePlayModeStatesEqual = (
  left: PlayModeState,
  right: PlayModeState,
): boolean => {
  if (left.type !== right.type) {
    return false;
  }

  if (left.type === 'normal' && right.type === 'normal') {
    return true;
  }

  if (left.type === 'playlist' && right.type === 'playlist') {
    if (left.ids.length !== right.ids.length) {
      return false;
    }

    for (let index = 0; index < left.ids.length; index += 1) {
      if (left.ids[index] !== right.ids[index]) {
        return false;
      }
    }

    return left.title === right.title;
  }

  return false;
};

export function MugenProtoPedia() {
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement | null>(null);
  const stickyBannerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [prototypeIdError, setPrototypeIdError] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [showCLI, setShowCLI] = useState(false);

  // Direct launch & play mode
  const directLaunchResult = useDirectLaunch();
  const [playModeState, setPlayModeState] = useState<PlayModeState>(() =>
    resolvePlayMode({ directLaunchResult }),
  );

  // Sync play mode based on the latest direct launch parameters
  useEffect(() => {
    const resolvedPlayMode = resolvePlayMode({ directLaunchResult });
    setPlayModeState((previousState) => {
      const newPlayMode = arePlayModeStatesEqual(
        previousState,
        resolvedPlayMode,
      )
        ? previousState
        : resolvedPlayMode;
      logger.debug(
        'Play mode:',
        `${previousState.type} -> ${newPlayMode.type}`,
      );
      return newPlayMode;
    });
  }, [directLaunchResult]);

  // PlayMode - playlist
  const [isPlaylistPlaying, setIsPlaylistPlaying] = useState(false);
  const [isPlaylistCompleted, setIsPlaylistCompleted] = useState(false);
  const playlistQueueRef = useRef<number[]>([]);
  const lastProcessedPlaylistSignatureRef = useRef<string | null>(null);
  const playlistProcessingTimeoutRef = useRef<number | null>(null);

  // Random variant selection for PlaylistTitleCard
  const [playlistVariant, setPlaylistVariant] =
    useState<PlaylistTitleCardVariant>('default');
  const [playlistFont, setPlaylistFont] = useState<'sans' | 'serif' | 'mono'>(
    'sans',
  );

  const isPlaylistMode = playModeState.type === 'playlist';

  const simulateDelayRangeMs =
    SIMULATED_DELAY_RANGE_BY_MODE[playModeState.type];

  // Slot & concurrency management
  const {
    prototypeSlots,
    appendPlaceholder,
    replacePrototypeInSlot,
    setSlotError,
    clearSlots,
    inFlightRequests,
    canFetchMorePrototypes,
    tryIncrementInFlightRequests,
    decrementInFlightRequests,
    maxConcurrentFetches,
  } = usePrototypeSlots({
    maxConcurrentFetches: 6,
    simulateDelayRangeMs,
  });

  // data
  const {
    fetchPrototype: fetchPlaylistPrototype,
    // isLoading: isLoadingPlaylistPrototype,
    // error: playlistPrototypeError,
  } = usePlaylistPrototype();

  const [prototypeIdInput, setPrototypeIdInput] = useState(
    '',
    // '3' /* おしゃべりパパ人形 */,
    // '12' /* DrunkenMaster byDrunker5 */,
    // '5916' /* クロとシロ */,
    // '2345' /* スタックチャン */,
    // '3877' /* Type-C 危機一発 */,
    // '7595' /* よのこまえ */,
    // '7627' /* ProtoPedia API Ver 2.0 Client for Javascript | ProtoPedia */,
    // '7759' /* 無限ProtoPedia */,
  );

  const FALLBACK_MAX_PROTOTYPE_ID = 7_777;
  const [maxPrototypeId, setMaxPrototypeId] = useState<number>(
    FALLBACK_MAX_PROTOTYPE_ID,
  );

  const {
    getRandomPrototype,
    // isLoading: isLoadingPrototype,
    // error: randomPrototypeError,
  } = useRandomPrototype();
  // Special key sequences are wired only when command mode is active.

  /**
   * Create a deep-cloned copy of a prototype.
   *
   * Note: This uses JSON round-trip which is sufficient for our normalized
   * data shape (plain objects). If richer types are added later, replace with
   * a safer cloning strategy.
   */
  const clonePrototype = useCallback(
    (prototype: Prototype): Prototype => JSON.parse(JSON.stringify(prototype)),
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const resolveMaxPrototypeId = async () => {
      try {
        const maxId = await getMaxPrototypeId();
        if (
          isMounted &&
          typeof maxId === 'number' &&
          Number.isFinite(maxId) &&
          maxId > 0
        ) {
          setMaxPrototypeId(maxId);
        } else if (isMounted) {
          setMaxPrototypeId(FALLBACK_MAX_PROTOTYPE_ID);
        }
      } catch (error) {
        console.warn(
          'Failed to resolve max prototype id, using fallback',
          error,
        );
        if (isMounted) {
          setMaxPrototypeId(FALLBACK_MAX_PROTOTYPE_ID);
        }
      }
    };

    void resolveMaxPrototypeId();

    return () => {
      isMounted = false;
    };
  }, []);

  // const logNotableHighlights = (prototype: Prototype) => {
  // const highlights = checkNotableHighlights(prototype);
  // Do something with highlights // TODO
  // console.info('Prototype has any notable highlights!!', { highlights });
  // };

  // Observe Header height changes
  useLayoutEffect(() => {
    const headerElement = headerRef.current;
    if (!headerElement) return;

    const resizeObserver = new ResizeObserver(() => {
      setHeaderHeight(headerElement.offsetHeight);
    });

    resizeObserver.observe(headerElement);

    // Cleanup observer on unmount
    return () => resizeObserver.disconnect();
  }, []); // Run only once on mount

  const playlistTotalCount = isPlaylistMode ? playModeState.ids.length : 0;

  // Select random variant when playlist starts
  useEffect(() => {
    if (isPlaylistMode && playModeState.type === 'playlist') {
      const style = getRandomPlaylistStyle();
      setPlaylistVariant(style.variant);
      setPlaylistFont(style.fontFamily);
    }
  }, [isPlaylistMode, playModeState]);

  const shouldShowDirectLaunchBanner = directLaunchResult.type === 'failure';
  const shouldShowPlaylistSticky = isPlaylistMode && !isPlaylistCompleted;

  const shouldShowStickyBanner =
    shouldShowDirectLaunchBanner || shouldShowPlaylistSticky;

  // Common props for PlaylistTitleCard
  const playlistTitleCardProps = isPlaylistMode
    ? {
        className: 'mx-auto',
        ids: playModeState.ids,
        title: playModeState.title,
        processedCount,
        totalCount: playlistTotalCount,
        isCompleted: isPlaylistCompleted,
        isPlaying: isPlaylistPlaying,
        variant: playlistVariant,
        fontFamily: playlistFont,
      }
    : null;

  useLayoutEffect(() => {
    document.documentElement.style.setProperty(
      '--header-offset',
      `${headerHeight}px`,
    );
  }, [headerHeight]);

  const handleToggleCLI = useCallback(() => {
    setShowCLI((previous) => !previous);
  }, []);

  // Scrolling & focus behavior
  const {
    currentFocusIndex,
    onCardClick: handleCardClick,
    scrollTo: scrollToPrototype,
  } = useScrollingBehavior(
    {
      headerRef,
      scrollContainerRef,
      prototypeSlots,
    },
    {
      // extraOffset: 16,
    },
  );

  /**
   * Fetch a random prototype from the API and return a cloned instance.
   *
   * @returns cloned prototype or null when API yields no result
   */
  const getRandomPrototypeFromResults =
    useCallback(async (): Promise<Prototype | null> => {
      const prototype = await getRandomPrototype();

      if (!prototype) {
        return null;
      }

      const clonedPrototype = clonePrototype(prototype);
      logger.debug('Selected random prototype', { clonedPrototype });
      return clonedPrototype;
    }, [getRandomPrototype, clonePrototype]);

  /**
   * Handle change for explicit ID input field.
   * Updates local state used by validation and fetch-by-ID action.
   */
  const handlePrototypeIdInputChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setPrototypeIdInput(event.target.value);
  };

  /**
   * Programmatically set the explicit ID input (e.g., from quick set buttons).
   */
  const handlePrototypeIdInputSet = (value: number) => {
    setPrototypeIdInput(String(value));
  };

  /**
   * Clear all prototype slots.
   */
  const handleClearPrototypes = useCallback(() => {
    if (isPlaylistPlaying) return;

    clearSlots();

    if (playModeState.type === 'playlist') {
      router.replace('/', { scroll: false });
    }
  }, [clearSlots, isPlaylistPlaying, playModeState.type, router]);

  /**
   * Append a placeholder slot and populate it with a randomly fetched prototype.
   * Respects concurrency cap; removes placeholder on null result or error.
   */
  const handleGetRandomPrototype = useCallback(async () => {
    if (isPlaylistPlaying) {
      logger.warn('Cannot fetch random prototype while playlist is playing.');
      return;
    }
    if (!tryIncrementInFlightRequests()) {
      console.warn('Maximum concurrent fetches reached.');
      return;
    }

    const slotId = appendPlaceholder();
    try {
      const prototype = await getRandomPrototypeFromResults();
      if (!prototype) {
        setSlotError(slotId, 'Failed to load.');
        return;
      }

      await replacePrototypeInSlot(slotId, prototype);
    } catch (err) {
      console.error('Failed to fetch prototypes.', err);
      // This app targets power users/engineers, so we prefer technical accuracy over simplified user-friendly messages.
      // "Failed to fetch" is ambiguous but technically correct for network errors (offline, DNS, etc).
      // We list possible causes to aid troubleshooting.
      let message = 'Failed to load.';
      if (err instanceof Error) {
        if (err.message === 'Failed to fetch') {
          message =
            'Failed to fetch. ' +
            'Possible causes: Offline, DNS, CORS, or Server Down.';
        } else {
          message = err.message;
        }
      }
      setSlotError(slotId, message);
    } finally {
      decrementInFlightRequests();
    }
  }, [
    tryIncrementInFlightRequests,
    appendPlaceholder,
    getRandomPrototypeFromResults,
    replacePrototypeInSlot,
    decrementInFlightRequests,
    isPlaylistPlaying,
    setSlotError,
  ]);

  /**
   * Fetch a prototype by explicit ID from SHOW controls (input field).
   *
   * Validates input, respects concurrency cap, and performs a one-shot
   * upstream fetch via `getLatestPrototypeById`.
   */
  const handleGetLatestPrototypeById = useCallback(
    async (id: number) => {
      logger.debug('Fetching latest prototype by ID (SHOW)', { id });

      if (id < 0) {
        console.error('Invalid prototype ID:', id);
        return;
      }

      if (!tryIncrementInFlightRequests()) {
        console.warn('Maximum concurrent fetches reached.');
        return;
      }

      const slotId = appendPlaceholder({ expectedPrototypeId: id });
      setPrototypeIdError(null);

      try {
        const prototype = await getLatestPrototypeById(id);

        if (!prototype) {
          setPrototypeIdError('Not found.');
          setSlotError(slotId, 'Not found.');
          return;
        }

        const clonedPrototype = clonePrototype(prototype);
        await replacePrototypeInSlot(slotId, clonedPrototype);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch prototype.';
        setPrototypeIdError(message);
        setSlotError(slotId, message);
      } finally {
        decrementInFlightRequests();
      }
    },
    [
      tryIncrementInFlightRequests,
      appendPlaceholder,
      setPrototypeIdError,
      setSlotError,
      clonePrototype,
      replacePrototypeInSlot,
      decrementInFlightRequests,
    ],
  );

  /**
   * Fetch a prototype by ID for PLAYLIST mode.
   *
   * Shares slot/error handling with SHOW, but uses the map-store-first
   * repository-backed `usePlaylistPrototype` and updates playlist
   * processed count.
   */
  const handleGetPrototypeByIdInPlaylistMode = useCallback(
    async (id: number) => {
      logger.debug('Fetching prototype by ID (PLAYLIST)', { id });

      if (id < 0) {
        console.error('Invalid prototype ID:', id);
        return;
      }

      if (!tryIncrementInFlightRequests()) {
        console.warn('Maximum concurrent fetches reached.');
        return;
      }

      const slotId = appendPlaceholder({ expectedPrototypeId: id });
      setPrototypeIdError(null);

      try {
        const prototype = await fetchPlaylistPrototype(id);
        if (!prototype) {
          setPrototypeIdError('Not found.');
          setSlotError(slotId, 'Not found.');
          return;
        }

        const clonedPrototype = clonePrototype(prototype);
        await replacePrototypeInSlot(slotId, clonedPrototype);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch prototype.';
        setPrototypeIdError(message);
        setSlotError(slotId, message);
      } finally {
        decrementInFlightRequests();
        setProcessedCount((c) => c + 1);
      }
    },
    [
      tryIncrementInFlightRequests,
      appendPlaceholder,
      fetchPlaylistPrototype,
      setPrototypeIdError,
      setSlotError,
      clonePrototype,
      replacePrototypeInSlot,
      decrementInFlightRequests,
      setProcessedCount,
    ],
  );

  const handleGetPrototypeByIdFromInput = async () => {
    logger.debug('Fetching prototype by ID from input:', prototypeIdInput);

    // Validation
    const trimmed = prototypeIdInput.trim();
    if (trimmed === '') {
      setPrototypeIdError('Please enter a prototype ID.');
      return;
    }
    const parsedId = Number.parseInt(trimmed, 10);
    if (Number.isNaN(parsedId) || parsedId < 0) {
      setPrototypeIdError('Prototype ID must be a non-negative number.');
      return;
    }
    await handleGetLatestPrototypeById(parsedId);
  };

  /**
   * Open the currently focused prototype in a new browser tab on ProtoPedia.
   * Uses noopener/noreferrer for security.
   */
  const openCurrentPrototypeInProtoPedia = useCallback(() => {
    if (currentFocusIndex >= 0 && currentFocusIndex < prototypeSlots.length) {
      const currentSlot = prototypeSlots[currentFocusIndex];
      const prototypeId =
        currentSlot.prototype?.id ?? currentSlot.expectedPrototypeId;

      if (prototypeId !== undefined) {
        const url = buildPrototypeLink(prototypeId);
        if (url.length > 0) {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
    }
  }, [currentFocusIndex, prototypeSlots]);

  // Prepare playlist queue when entering playlist mode with new parameters
  useEffect(() => {
    logger.debug('Processing play mode state change:', playModeState);

    // If not in playlist mode, reset playlist state
    if (playModeState.type !== 'playlist') {
      lastProcessedPlaylistSignatureRef.current = null;
      playlistQueueRef.current = [];
      setIsPlaylistPlaying(false);
      setIsPlaylistCompleted(false);
      setProcessedCount(0);
    }

    switch (playModeState.type) {
      case 'normal':
        logger.debug('Switched to normal play mode');
        break;

      case 'playlist':
        logger.debug('Switched to playlist play mode');
        const { ids, title } = playModeState;
        if (ids.length === 0) {
          lastProcessedPlaylistSignatureRef.current = null;
          playlistQueueRef.current = [];
          setIsPlaylistPlaying(false);
          setProcessedCount(0);
          return;
        }

        const signature = `${ids.join(',')}|${title ?? ''}`;
        if (lastProcessedPlaylistSignatureRef.current === signature) {
          return;
        }

        logger.debug({ ids, title }, 'Starting playlist playback');
        lastProcessedPlaylistSignatureRef.current = signature;
        playlistQueueRef.current = [...ids];
        setProcessedCount(0);
        setIsPlaylistPlaying(true);
        setIsPlaylistCompleted(false);
      // clearSlots(); // not required
    }
  }, [
    playModeState,
    // , clearSlots
  ]);

  // Process the playlist queue while in playlist mode
  useEffect(() => {
    if (playlistProcessingTimeoutRef.current !== null) {
      window.clearTimeout(playlistProcessingTimeoutRef.current);
      playlistProcessingTimeoutRef.current = null;
    }

    if (playModeState.type !== 'playlist') {
      return undefined;
    }

    if (!isPlaylistPlaying) {
      return undefined;
    }

    const processNext = () => {
      playlistProcessingTimeoutRef.current = null;

      // Check if queue is empty
      if (playlistQueueRef.current.length === 0) {
        if (inFlightRequests === 0) {
          logger.debug('Playlist playback completed');
          setIsPlaylistPlaying(false);
          setIsPlaylistCompleted(true);
        }
        return;
      }

      // Concurrency check: if we cannot fetch now, retry later
      if (!canFetchMorePrototypes) {
        console.warn(
          'Cannot fetch more prototypes while playlist is playing. Retry in ' +
            PLAYLIST_FETCH_INTERVAL_MS +
            'ms' +
            ' for processing next id',
        );
        playlistProcessingTimeoutRef.current = window.setTimeout(
          processNext,
          PLAYLIST_FETCH_INTERVAL_MS,
        );
        return;
      }

      // Next ID to process
      const id = playlistQueueRef.current.shift();
      logger.debug('Processing playlist ID:', id);

      if (id !== undefined) {
        void handleGetPrototypeByIdInPlaylistMode(id);

        playlistProcessingTimeoutRef.current = window.setTimeout(
          processNext,
          PLAYLIST_FETCH_INTERVAL_MS,
        );
      }
    };

    playlistProcessingTimeoutRef.current = window.setTimeout(processNext, 0);

    return () => {
      if (playlistProcessingTimeoutRef.current !== null) {
        window.clearTimeout(playlistProcessingTimeoutRef.current);
        playlistProcessingTimeoutRef.current = null;
      }
    };
  }, [
    playModeState,
    isPlaylistPlaying,
    canFetchMorePrototypes,
    inFlightRequests,
    handleGetPrototypeByIdInPlaylistMode,
  ]);

  const showPlayMode = process.env.NODE_ENV === 'development';

  /**
   * Main application layout
   */
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <Header
        ref={headerRef}
        dashboard={{
          prototypeCount: prototypeSlots.length,
          inFlightRequests,
          maxConcurrentFetches: maxConcurrentFetches,
        }}
        playMode={playModeState.type}
        showPlayMode={showPlayMode}
        analysisDashboard={
          <AnalysisDashboard
            defaultExpanded={false}
            useLatestAnalysisHook={useLatestAnalysis}
            preferClientTimezoneAnniversaries={true}
            isDevelopment={process.env.NODE_ENV === 'development'}
          />
        }
      />

      {headerHeight > 0 && (
        <>
          {/* Sticky banner container */}
          {shouldShowStickyBanner ? (
            <div
              ref={stickyBannerRef}
              className="sticky z-50 header-offset-top"
            >
              {/* Render direct launch status and PrototypeGrid only when headerHeight is determined */}
              {shouldShowDirectLaunchBanner && (
                <div className="p-4">
                  <DirectLaunchResult
                    className="bg-transparent p-0 text-left"
                    directLaunchResult={directLaunchResult}
                    successMessage="Direct launch parameters validated successfully."
                    failureMessage="The URL contains invalid parameters for direct launch. Please check the URL and try again."
                  />
                </div>
              )}
              {/* Show playlist title when sticky banner is visible */}
              {isPlaylistMode && playlistTitleCardProps && (
                <div
                  className={`transition-all duration-3000 ease-out transform-gpu ${
                    !isPlaylistCompleted
                      ? 'opacity-100 translate-y-0 max-h-96 p-4'
                      : 'opacity-0 -translate-y-8 max-h-0 overflow-hidden p-0'
                  }`}
                >
                  <PlaylistTitleCard {...playlistTitleCardProps} />
                </div>
              )}
            </div>
          ) : null}

          {/* Scrollable container for prototypes and other content */}
          <div
            ref={scrollContainerRef}
            className="w-full h-screen overflow-auto p-4 pb-40 header-offset-padding overscroll-contain"
          >
            {isPlaylistMode && playlistTitleCardProps && (
              <div
                // delay-3000 waits until the sticky PlaylistTitleCard fades out before showing this one.
                className={`p-4 transition-opacity duration-1000 delay-3000 ease-in ${
                  isPlaylistCompleted
                    ? 'opacity-100'
                    : 'opacity-0 max-h-0 overflow-hidden p-0'
                }`}
              >
                <PlaylistTitleCard {...playlistTitleCardProps} />
              </div>
            )}

            <PrototypeGrid
              prototypeSlots={prototypeSlots}
              currentFocusIndex={currentFocusIndex}
              onCardClick={handleCardClick}
            />
          </div>
        </>
      )}

      {/* Control panel - Fixed overlay at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-transparent transition-colors duration-200">
        <div className="container mx-auto p-4">
          <ControlPanel
            controlPanelMode={isPlaylistPlaying ? 'loadingPlaylist' : 'normal'}
            onGetRandomPrototype={handleGetRandomPrototype}
            onClear={handleClearPrototypes}
            prototypeIdInput={prototypeIdInput}
            onPrototypeIdInputChange={handlePrototypeIdInputChange}
            onGetPrototypeById={handleGetPrototypeByIdFromInput}
            onPrototypeIdInputSet={handlePrototypeIdInputSet}
            canFetchMorePrototypes={canFetchMorePrototypes}
            prototypeIdError={prototypeIdError}
            onScrollNext={() => scrollToPrototype('next')}
            onScrollPrev={() => scrollToPrototype('prev')}
            onOpenPrototype={openCurrentPrototypeInProtoPedia}
            maxPrototypeId={maxPrototypeId}
          />
        </div>
      </div>

      {/* Dashboard - Floating display at bottom */}
      {/* <div className="fixed top-20 right-4 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-gray-900/50 p-3 transition-colors duration-200">
        <Dashboard
          prototypeCount={prototypeSlots.length}
          inFlightRequests={inFlightRequests}
          maxConcurrentFetches={MAX_CONCURRENT_FETCHES}
        />
      </div> */}
    </main>
  );
}
