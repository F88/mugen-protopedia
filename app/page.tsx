'use client';

/**
 * @file Home page component providing an infinite prototype browsing surface.
 *
 * @see docs/specs/slot-and-scroll-behavior.md for formal slot & scroll specification.
 */

import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getMaxPrototypeId } from '@/app/actions/prototypes';

import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';
import { usePrototype } from '@/lib/hooks/use-prototype';
import { useRandomPrototype } from '@/lib/hooks/use-random-prototype';
import { usePrototypeSlots } from '@/lib/hooks/use-prototype-slots';
import { useScrollingBehavior } from '@/lib/hooks/use-scrolling-behavior';

import { ControlPanel } from '@/components/control-panel';
import { Header } from '@/components/header';
import { AnalysisDashboard } from '@/components/analysis-dashboard';
import { useLatestAnalysis } from '@/lib/hooks/use-analysis';
import { PrototypeGrid } from '@/components/prototype/prototype-grid';

const SIMULATED_DELAY_RANGE = { min: 500, max: 3_000 } as const;
// const SIMULATED_DELAY_RANGE = null;

/**
 * Build the external ProtoPedia detail page URL for a given prototype.
 *
 * @param prototype - Normalized prototype object
 * @returns absolute URL string to the ProtoPedia detail page
 */
const urlOfPageForPrototype = (prototype: Prototype): string =>
  `https://protopedia.net/prototype/${prototype.id}`;

export default function Home() {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [prototypeIdError, setPrototypeIdError] = useState<string | null>(null);

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
    // isLoading: isLoadingRandomPrototype,
    // error: randomPrototypeError,
  } = useRandomPrototype();

  /**
   * Create a deep-cloned copy of a prototype.
   *
   * Note: This uses JSON round-trip which is sufficient for our normalized
   * data shape (plain objects). If richer types are added later, replace with
   * a safer cloning strategy.
   */
  const clonePrototype = (prototype: Prototype): Prototype =>
    JSON.parse(JSON.stringify(prototype));

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
      // console.debug('Selected random prototype', { clonedPrototype });
      return clonedPrototype;
    }, [getRandomPrototype]);

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
    clearSlots();
  }, [clearSlots]);

  /**
   * Append a placeholder slot and populate it with a randomly fetched prototype.
   * Respects concurrency cap; removes placeholder on null result or error.
   */
  const handleGetRandomPrototype = useCallback(async () => {
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
  ]);

  /**
   * Fetch a prototype by explicit ID and insert it into a newly appended slot.
   * Validates input, respects concurrency cap, and sets error states on failure.
   */
  const handleGetPrototypeById = async () => {
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

    // Fetching
    if (!tryIncrementInFlightRequests()) {
      console.warn('Maximum concurrent fetches reached.');
      return;
    }

    const slotId = appendPlaceholder({ expectedPrototypeId: parsedId });
    setPrototypeIdError(null);

    try {
      const prototype = await fetchPrototype(parsedId);
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
  };

  // Removed inlined scroll/focus/concurrency logic now handled by hooks

  // Open current prototype in Protopedia
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
        analysisDashboard={
          <AnalysisDashboard
            defaultExpanded={false}
            useLatestAnalysisHook={useLatestAnalysis}
            preferClientTimezoneAnniversaries={true}
          />
        }
      />

      {/* {(prototypeError || randomPrototypeError) && (
        <p className="text-center text-red-500 dark:text-red-400 py-8">
          {prototypeError ?? randomPrototypeError}
        </p>
      )} */}

      {/* {(isLoadingPrototype || isLoadingRandomPrototype) && (
        <p className="text-center py-8 text-gray-600 dark:text-gray-300">
          Loading...
        </p>
      )} */}

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

      {/* Control panel - Fixed overlay at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-transparent transition-colors duration-200">
        <div className="container mx-auto p-4">
          <ControlPanel
            onGetRandomPrototype={handleGetRandomPrototype}
            onClear={handleClearPrototypes}
            prototypeIdInput={prototypeIdInput}
            onPrototypeIdInputChange={handlePrototypeIdInputChange}
            onGetPrototypeById={handleGetPrototypeById}
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
