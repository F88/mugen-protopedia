'use client';

/**
 * @file Home page component providing an infinite prototype browsing surface.
 *
 * @see docs/specs/slot-and-scroll-behavior.md for formal slot & scroll specification.
 */

import type { ChangeEvent } from 'react';
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { getMaxPrototypeId } from '@/app/actions/prototypes';
import type { PlayModeState } from '@/types/mugen-protopedia.types';

// lib
import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';
import { useLatestAnalysis } from '@/lib/hooks/use-analysis';
import { usePrototype } from '@/lib/hooks/use-prototype';
import { usePrototypeSlots } from '@/lib/hooks/use-prototype-slots';
import { useRandomPrototype } from '@/lib/hooks/use-random-prototype';
import { useScrollingBehavior } from '@/lib/hooks/use-scrolling-behavior';
import { logger } from '@/lib/logger.client';
import { resolvePlayMode } from '@/lib/utils/resolve-play-mode';

// hooks
import { useDirectLaunch } from '@/hooks/use-direct-launch';

// components
import { AnalysisDashboard } from '@/components/analysis-dashboard';
import { ControlPanel } from '@/components/control-panel';
import { DirectLaunchResult } from '@/components/direct-launch-result';
import { Header } from '@/components/header';
import { PlaylistTitle } from '@/components/playlist-title';
import { PrototypeGrid } from '@/components/prototype/prototype-grid';

// const SIMULATED_DELAY_RANGE = { min: 500, max: 3_000 } as const;
const SIMULATED_DELAY_RANGE = { min: 0, max: 0 } as const;
// const SIMULATED_DELAY_RANGE = { min: 2_000, max: 3_000 } as const;

// const PLAYLIST_FETCH_INTERVAL_MS = 500;
const PLAYLIST_FETCH_INTERVAL_MS = 200;
// const PLAYLIST_FETCH_INTERVAL_MS = 1_000;

/**
 * Build the external ProtoPedia detail page URL for a given prototype.
 *
 * @param prototype - Normalized prototype object
 * @returns absolute URL string to the ProtoPedia detail page
 */
const urlOfPageForPrototype = (prototype: Prototype): string =>
  `https://protopedia.net/prototype/${prototype.id}`;

const arePlayModeStatesEqual = (
  left: PlayModeState,
  right: PlayModeState,
): boolean => {
  if (left.playmode !== right.playmode) {
    return false;
  }

  if (left.playmode === 'normal' && right.playmode === 'normal') {
    return true;
  }

  if (left.playmode === 'playlist' && right.playmode === 'playlist') {
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

function HomeContent() {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const playlistTitleRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [prototypeIdError, setPrototypeIdError] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

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
      logger.debug('Play mode:', newPlayMode.playmode);
      return newPlayMode;
    });
  }, [directLaunchResult]);

  // PlayMode - playlist
  // const { ids, title: playlistTitle } =
  //   directLaunchResult.type === 'success'
  //     ? directLaunchResult.value
  //     : { ids: [], title: undefined };
  const [isPlaylistPlaying, setIsPlaylistPlaying] = useState(false);
  const playlistQueueRef = useRef<number[]>([]);
  const lastProcessedPlaylistSignatureRef = useRef<string | null>(null);
  const playlistProcessingTimeoutRef = useRef<number | null>(null);

  // Slot & concurrency management
  const {
    prototypeSlots,
    appendPlaceholder,
    replacePrototypeInSlot,
    setSlotError,
    removeSlotById,
    clearSlots,
    inFlightRequests,
    canFetchMorePrototypes,
    tryIncrementInFlightRequests,
    decrementInFlightRequests,
    maxConcurrentFetches,
  } = usePrototypeSlots({
    maxConcurrentFetches: 6,
    simulateDelayRangeMs: SIMULATED_DELAY_RANGE,
  });

  // data
  const {
    fetchPrototype,
    // isLoading: isLoadingPrototype,
    // error: prototypeError,
  } = usePrototype(
    {},
    {
      // SWR configuration
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateIfStale: false,
      errorRetryCount: 2,
      errorRetryInterval: 5 * 1000, // 5 seconds
    },
  );

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

  // Adjust layout based on headerHeight and playlistTitle
  const playlistTitle =
    playModeState.playmode === 'playlist' ? playModeState.title : undefined;

  useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      const playlistTitleHeight = playlistTitleRef.current?.offsetHeight ?? 0;
      const totalOffset = headerHeight + playlistTitleHeight;

      // Update CSS variable for header offset
      document.documentElement.style.setProperty(
        '--header-offset',
        `${totalOffset}px`,
      );
      // Set top position for PlaylistTitle
      if (playlistTitleRef.current) {
        playlistTitleRef.current.style.top = `${headerHeight}px`;
      }
    }
  }, [headerHeight, playModeState.playmode, playlistTitle, processedCount]); // Recalculate when headerHeight or playlistTitle changes

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
  }, [clearSlots, isPlaylistPlaying]);

  /**
   * Append a placeholder slot and populate it with a randomly fetched prototype.
   * Respects concurrency cap; removes placeholder on null result or error.
   */
  const handleGetRandomPrototype = useCallback(async () => {
    if (isPlaylistPlaying) {
      console.warn('Cannot fetch random prototype while playlist is playing.');
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
        removeSlotById(slotId);
        return;
      }

      await replacePrototypeInSlot(slotId, prototype);
    } catch (err) {
      console.error('Failed to fetch prototypes.', err);
      removeSlotById(slotId);
    } finally {
      decrementInFlightRequests();
    }
  }, [
    tryIncrementInFlightRequests,
    appendPlaceholder,
    getRandomPrototypeFromResults,
    removeSlotById,
    replacePrototypeInSlot,
    decrementInFlightRequests,
    isPlaylistPlaying,
  ]);

  /**
   * Fetch a prototype by explicit ID and insert it into a newly appended slot.
   * Validates input, respects concurrency cap, and sets error states on failure.
   */
  const handleGetPrototypeById = useCallback(
    async (id: number) => {
      logger.debug('Fetching prototype by ID', { id });
      // Validation
      if (id < 0) {
        console.error('Invalid prototype ID:', id);
        return;
      }

      // Fetching
      if (!tryIncrementInFlightRequests()) {
        console.warn('Maximum concurrent fetches reached.');
        return;
      }

      const slotId = appendPlaceholder({ expectedPrototypeId: id });
      setPrototypeIdError(null);

      try {
        const prototype = await fetchPrototype(id);
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
      fetchPrototype,
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
    await handleGetPrototypeById(parsedId);
  };

  /**
   * Open the currently focused prototype in a new browser tab on ProtoPedia.
   * Uses noopener/noreferrer for security.
   */
  const openCurrentPrototypeInProtoPedia = useCallback(() => {
    if (currentFocusIndex >= 0 && currentFocusIndex < prototypeSlots.length) {
      const currentSlot = prototypeSlots[currentFocusIndex];

      if (currentSlot.prototype) {
        const url = urlOfPageForPrototype(currentSlot.prototype);
        if (url.length > 0) {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
    }
  }, [currentFocusIndex, prototypeSlots]);

  // Prepare playlist queue when entering playlist mode with new parameters
  useEffect(() => {
    // If not in playlist mode, reset playlist state
    if (playModeState.playmode !== 'playlist') {
      lastProcessedPlaylistSignatureRef.current = null;
      playlistQueueRef.current = [];
      setIsPlaylistPlaying(false);
      setProcessedCount(0);
    }

    switch (playModeState.playmode) {
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

    if (playModeState.playmode !== 'playlist') {
      return undefined;
    }

    if (!isPlaylistPlaying) {
      return undefined;
    }

    const processNext = () => {
      playlistProcessingTimeoutRef.current = null;

      if (playlistQueueRef.current.length === 0) {
        if (inFlightRequests === 0) {
          logger.debug('Playlist playback completed');
          setIsPlaylistPlaying(false);
        }
        return;
      }

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

      const id = playlistQueueRef.current.shift();
      if (id !== undefined) {
        logger.debug('Proessing playlist ID:', id);
        void handleGetPrototypeById(id);
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
    handleGetPrototypeById,
  ]);

  // Removed inlined scroll/focus/concurrency logic now handled by hooks

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
        playMode={playModeState.playmode}
        analysisDashboard={
          <AnalysisDashboard
            defaultExpanded={false}
            useLatestAnalysisHook={useLatestAnalysis}
            preferClientTimezoneAnniversaries={true}
          />
        }
      />

      {/* Render direct launch status and PrototypeGrid only when headerHeight is determined */}
      {headerHeight > 0 && (
        <>
          <div
            ref={playlistTitleRef}
            className="sticky z-60"
            // topスタイルはuseLayoutEffectで動的に設定される
          >
            <DirectLaunchResult
              className="bg-transparent p-0 text-left"
              directLaunchResult={directLaunchResult}
              successMessage="Direct launch parameters validated successfully."
              failureMessage="The URL contains invalid parameters for direct launch. Please check the URL and try again."
            />
            {
              // directLaunchSucceeded ? (
              playModeState.playmode === 'playlist' ? (
                <PlaylistTitle
                  className="mt-2 bg-transparent p-0"
                  ids={playModeState.ids}
                  title={playModeState.title}
                  processedCount={processedCount}
                  totalCount={playModeState.ids.length}
                />
              ) : null
            }
          </div>

          {/* Prototypes display area - Takes available space */}
          <div
            ref={scrollContainerRef}
            className="w-full h-screen overflow-auto p-4 pb-40 header-offset-padding overscroll-contain"
          >
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

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
