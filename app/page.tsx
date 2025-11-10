'use client';

import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getMaxPrototypeId } from '@/app/actions/prototypes';

import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';
import { usePrototype } from '@/lib/hooks/use-prototype';
import { useRandomPrototype } from '@/lib/hooks/use-random-prototype';
import { scrollToPrototypeByIndex as baseScrollToPrototypeByIndex } from '@/lib/utils/scroll-to-prototype';

import { ControlPanel } from '@/components/control-panel';
import { Header } from '@/components/header';
import { PrototypeGrid } from '@/components/prototype/prototype-grid';

const MAX_CONCURRENT_FETCHES = 6;

const urlOfPageForPrototype = (prototype: Prototype) =>
  `https://protopedia.net/prototype/${prototype.id}`;

export default function Home() {
  type PrototypeSlot = {
    id: number;
    prototype?: Prototype;
    expectedPrototypeId?: number;
    errorMessage?: string | null;
    isLoading: boolean;
  };

  /**
   * Slots for displaying prototypes fetched asynchronously.
   * It can contain prototypes having same id.
   */
  const [prototypeSlots, setPrototypeSlots] = useState<PrototypeSlot[]>([]);

  const slotIdRef = useRef(0);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [prototypeIdError, setPrototypeIdError] = useState<string | null>(null);
  const [inFlightRequests, setInFlightRequests] = useState(0);
  const [canFetchMorePrototypes, setCanFetchMorePrototypes] = useState(true);
  const inFlightRequestsRef = useRef(inFlightRequests);

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

  const updateInFlightState = useCallback((next: number) => {
    inFlightRequestsRef.current = next;
    setInFlightRequests(next);
    setCanFetchMorePrototypes(next < MAX_CONCURRENT_FETCHES);
  }, []);

  const tryIncrementInFlightRequests = useCallback(() => {
    const current = inFlightRequestsRef.current;
    if (current >= MAX_CONCURRENT_FETCHES) {
      setCanFetchMorePrototypes(false);
      return false;
    }

    const next = current + 1;
    updateInFlightState(next);
    return true;
  }, [updateInFlightState]);

  const decrementInFlightRequests = useCallback(() => {
    const current = inFlightRequestsRef.current;
    const next = Math.max(0, current - 1);
    updateInFlightState(next);
  }, [updateInFlightState]);

  const appendPlaceholder = useCallback(
    ({ expectedPrototypeId }: { expectedPrototypeId?: number } = {}) => {
      const slotId = slotIdRef.current;
      slotIdRef.current += 1;
      setPrototypeSlots((prev) => [
        ...prev,
        {
          id: slotId,
          prototype: undefined,
          expectedPrototypeId,
          errorMessage: null,
          isLoading: true,
        },
      ]);
      return slotId;
    },
    [],
  );

  const replacePrototypeInSlot = useCallback(
    async (slotId: number, prototype: Prototype) => {
      const minDelayMs = 500;
      const maxDelayMs = 3_000;
      const randomDelayMs =
        Math.random() * (maxDelayMs - minDelayMs) + minDelayMs;
      // const msg = `Simulating network delay of ${Math.round(randomDelayMs).toLocaleString()}ms before replacing prototype in slot ${slotId}`;
      // console.debug(msg);
      await new Promise((resolve) => {
        window.setTimeout(resolve, randomDelayMs);
      });

      setPrototypeSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId
            ? { ...slot, prototype, errorMessage: null, isLoading: false }
            : slot,
        ),
      );
      // logNotableHighlights(prototype);
    },
    [],
  );

  const setSlotError = (slotId: number, message: string) => {
    setPrototypeSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              prototype: undefined,
              errorMessage: message,
              isLoading: false,
            }
          : slot,
      ),
    );
  };

  const removeSlotById = useCallback((slotId: number) => {
    setPrototypeSlots((prev) => prev.filter((slot) => slot.id !== slotId));
  }, []);

  const getRandomPrototypeFromResults =
    useCallback(async (): Promise<Prototype | null> => {
      const prototype = await getRandomPrototype();

      if (!prototype) {
        return null;
      }

      const clonedPrototype = clonePrototype(prototype);
      console.debug('Selected random prototype', { clonedPrototype });
      return clonedPrototype;
    }, [getRandomPrototype]);

  const handlePrototypeIdInputChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setPrototypeIdInput(event.target.value);
  };

  const handlePrototypeIdInputSet = (value: number) => {
    setPrototypeIdInput(String(value));
  };

  const handleClearPrototypes = useCallback(() => {
    setPrototypeSlots([]);
  }, []);

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

  useEffect(() => {
    const element = headerRef.current;
    if (!element) {
      return undefined;
    }

    const updateOffset = () => {
      const height = element.getBoundingClientRect().height;
      document.documentElement.style.setProperty(
        '--header-offset',
        `${Math.ceil(height + 16)}px`,
      );
    };

    updateOffset();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        updateOffset();
      });
      observer.observe(element);
      return () => {
        observer.disconnect();
      };
    }

    window.addEventListener('resize', updateOffset);
    return () => {
      window.removeEventListener('resize', updateOffset);
    };
  }, []);

  // Wrapper around extracted utility to bind current container ref
  const scrollToPrototypeByIndex = useCallback(
    (
      index: number,
      behavior: ScrollBehavior = 'smooth',
      options?: { waitForLayout?: boolean; extraOffset?: number },
    ) => {
      baseScrollToPrototypeByIndex(scrollContainerRef.current, index, {
        behavior,
        waitForLayout: options?.waitForLayout,
        extraOffset: options?.extraOffset,
      });
    },
    [],
  );

  // Auto-scroll to the newly added prototype
  // 共通スクロール関数を前方で定義するため、このエフェクトより上に移動された scrollToPrototypeByIndex を利用
  useEffect(() => {
    if (!scrollContainerRef.current || prototypeSlots.length === 0) {
      return;
    }
    // 新しく追加された最後の要素へフォーカスしスクロール
    const lastIndex = prototypeSlots.length - 1;
    setCurrentFocusIndex(lastIndex);
    // レイアウト安定後にスクロール（従来の二重 rAF + timeout を抽象化）
    scrollToPrototypeByIndex(lastIndex, 'smooth', {
      waitForLayout: true,
      extraOffset: 16,
    });
  }, [prototypeSlots.length, scrollToPrototypeByIndex]);

  // Current focused prototype index for keyboard navigation
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);

  // Handle card tap/click to set focus
  const handleCardClick = useCallback(
    (index: number) => {
      setCurrentFocusIndex(index);
      scrollToPrototypeByIndex(index, 'smooth');
    },
    [scrollToPrototypeByIndex],
  );

  // Keyboard navigation for prototype containers
  const scrollToPrototype = useCallback(
    (direction: 'next' | 'prev') => {
      if (!scrollContainerRef.current || prototypeSlots.length === 0) return;

      const container = scrollContainerRef.current;
      const prototypeElements = container.querySelectorAll(
        '[data-prototype-id]',
      );

      if (prototypeElements.length === 0) return;

      let nextIndex;

      if (direction === 'next') {
        nextIndex = Math.min(
          currentFocusIndex + 1,
          prototypeElements.length - 1,
        );
      } else {
        nextIndex = Math.max(currentFocusIndex - 1, 0);
      }

      // Update current focus index
      setCurrentFocusIndex(nextIndex);

      // Scroll to target element using common function
      scrollToPrototypeByIndex(nextIndex, 'smooth');
    },
    [currentFocusIndex, prototypeSlots.length, scrollToPrototypeByIndex],
  );

  // Open current prototype in Protopedia
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

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <Header
        ref={headerRef}
        dashboard={{
          prototypeCount: prototypeSlots.length,
          inFlightRequests,
          maxConcurrentFetches: MAX_CONCURRENT_FETCHES,
        }}
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
        className="w-full overflow-auto p-4 pb-40 min-h-screen header-offset-padding"
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
