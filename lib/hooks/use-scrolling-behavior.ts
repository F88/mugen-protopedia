/**
 * @file React hook encapsulating prototype card focus & scrolling behavior.
 *
 * Responsibilities:
 * - Maintains a focused slot index to navigate prototypes.
 * - Auto-scrolls newly appended last slot into view using a lightweight layout wait.
 * - Performs alignment correction scroll when any loading slot finishes and the last slot remains focused.
 * - Synchronizes `--header-offset` CSS variable with dynamic header height.
 * - Provides imperative helpers for click and keyboard (prev/next) navigation.
 *
 * Contracts:
 * - Never scrolls when container ref is null or index is out of bounds.
 * - Correction scroll fires only when loading count decreases (transition true→false).
 * - Addition sets focus to last slot (microtask deferred) preserving responsiveness.
 *
 * Extensions:
 * - Can accept custom `headerOffsetProvider` to override DOM measurement for environments like SSR snapshots.
 * - `extraOffset` enables spacing adjustments without touching header code.
 *
 * See also: `docs/specs/slot-and-scroll-behavior.md` for formal lifecycle & triggers.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

import { scrollToPrototypeByIndex as baseScrollToPrototypeByIndex } from '@/lib/utils/scroll-to-prototype';
import type { ScrollToPrototypeOptions } from '@/lib/utils/scroll-to-prototype';
import type { PrototypeSlot } from '@/lib/hooks/use-prototype-slots';

/**
 * Configuration options for {@link useScrollingBehavior}.
 * - `extraOffset`: Additional spacing added below the fixed header when computing target scroll position.
 * - `layoutWaitRafRounds` / `layoutWaitTimeoutMs`: Layout stabilization parameters passed to the scroll utility.
 * - `headerOffsetProvider`: Custom function to derive the header height (overrides CSS variable strategy).
 */
export type UseScrollingBehaviorOptions = {
  extraOffset?: number;
  layoutWaitRafRounds?: number;
  layoutWaitTimeoutMs?: number;
  headerOffsetProvider?: ScrollToPrototypeOptions['headerOffsetProvider'];
};

/**
 * Public API returned from {@link useScrollingBehavior}.
 */
export type UseScrollingBehaviorResult = {
  /** Currently focused slot index. */
  currentFocusIndex: number;
  /** Imperatively override focus index. */
  setCurrentFocusIndex: React.Dispatch<React.SetStateAction<number>>;
  /** Scroll to given index with provided behavior (default smooth). */
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
  /** Convenience wrapper for a typical lightweight scroll (smooth + layout wait config). */
  scrollLightToIndex: (index: number) => void;
  /** Handle card click: set focus & scroll. */
  onCardClick: (index: number) => void;
  /** Keyboard style navigation to next or previous prototype. */
  scrollTo: (direction: 'next' | 'prev') => void;
};

/**
 * Encapsulate focus state and auto-scroll effects.
 *
 * Behavior summary:
 * 1. Header offset sync: keeps CSS variable `--header-offset` aligned with actual header height (+ extraOffset).
 * 2. Slot addition: auto-focus last slot and perform a lightweight scroll into view.
 * 3. Load completion: if the last slot remains focused and any slot finished loading, re-scroll for alignment.
 * 4. User interactions: click sets focus & scroll; keyboard navigation moves focus boundedly.
 *
 * Edge cases:
 * - If container or header refs are null, scrolling / offset updates safely no-op.
 * - Re-scroll only fires when loading count decreases (ignores increases or stable states).
 * - Focus index out of range guards against stale indices after external slot removal.
 *
 * Performance notes:
 * - Lightweight scroll uses 1 rAF + short timeout defaults for responsiveness.
 * - Microtask deferral of focus update on addition avoids React effect cascade warnings.
 */
export function useScrollingBehavior(
  params: {
    headerRef: RefObject<HTMLDivElement | null>;
    scrollContainerRef: RefObject<HTMLDivElement | null>;
    prototypeSlots: PrototypeSlot[];
  },
  options: UseScrollingBehaviorOptions = {},
): UseScrollingBehaviorResult {
  const { headerRef, scrollContainerRef, prototypeSlots } = params;
  const extraOffset = options.extraOffset ?? 16;
  const layoutWaitRafRounds = options.layoutWaitRafRounds ?? 1;
  const layoutWaitTimeoutMs = options.layoutWaitTimeoutMs ?? 50;
  const headerOffsetProvider = options.headerOffsetProvider;

  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const previousLoadingCountRef = useRef(0);
  const previousSlotsLengthRef = useRef(0);

  // Keep CSS --header-offset aligned with dynamic header height
  useEffect(() => {
    const element = headerRef.current;
    if (!element) return;

    const updateOffset = () => {
      const height = element.getBoundingClientRect().height;
      document.documentElement.style.setProperty(
        '--header-offset',
        `${Math.ceil(height + extraOffset)}px`,
      );
    };

    updateOffset();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        updateOffset();
      });
      observer.observe(element);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, [headerRef, extraOffset]);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      const el = scrollContainerRef.current;
      if (!el) return;
      const merged: ScrollToPrototypeOptions = {
        behavior,
        waitForLayout: true,
        layoutWaitRafRounds,
        layoutWaitTimeoutMs,
        extraOffset,
        headerOffsetProvider,
      };
      baseScrollToPrototypeByIndex(el, index, merged);
    },
    [
      scrollContainerRef,
      extraOffset,
      layoutWaitRafRounds,
      layoutWaitTimeoutMs,
      headerOffsetProvider,
    ],
  );

  const scrollLightToIndex = useCallback(
    (index: number) => {
      scrollToIndex(index, 'smooth');
    },
    [scrollToIndex],
  );

  // On addition: auto-select last and lightly scroll into view
  useEffect(() => {
    const prevLen = previousSlotsLengthRef.current;
    const len = prototypeSlots.length;
    if (len > prevLen && len > 0) {
      // Defer state update to next microtask to avoid synchronous cascade warning
      Promise.resolve().then(() => setCurrentFocusIndex(len - 1));
      scrollLightToIndex(len - 1);
    }
    previousSlotsLengthRef.current = len;
  }, [prototypeSlots.length, scrollLightToIndex]);

  // After any slot finishes loading, re-align if last is still focused
  useEffect(() => {
    const loadingCount = prototypeSlots.reduce(
      (acc, s) => (s.isLoading ? acc + 1 : acc),
      0,
    );
    const prev = previousLoadingCountRef.current;
    previousLoadingCountRef.current = loadingCount;
    if (loadingCount < prev) {
      const lastIndex = prototypeSlots.length - 1;
      const isLastFocused = currentFocusIndex === lastIndex;
      if (
        scrollContainerRef.current &&
        isLastFocused &&
        currentFocusIndex >= 0 &&
        currentFocusIndex < prototypeSlots.length
      ) {
        scrollLightToIndex(currentFocusIndex);
      }
    }
  }, [
    prototypeSlots,
    currentFocusIndex,
    scrollLightToIndex,
    scrollContainerRef,
  ]);

  const onCardClick = useCallback(
    (index: number) => {
      setCurrentFocusIndex(index);
      scrollToIndex(index, 'smooth');
    },
    [scrollToIndex],
  );

  const scrollTo = useCallback(
    (direction: 'next' | 'prev') => {
      const container = scrollContainerRef.current;
      if (!container || prototypeSlots.length === 0) return;
      const prototypeElements = container.querySelectorAll(
        '[data-prototype-id]',
      );
      if (prototypeElements.length === 0) return;

      const nextIndex =
        direction === 'next'
          ? Math.min(currentFocusIndex + 1, prototypeElements.length - 1)
          : Math.max(currentFocusIndex - 1, 0);

      setCurrentFocusIndex(nextIndex);
      scrollToIndex(nextIndex, 'smooth');
    },
    [
      currentFocusIndex,
      prototypeSlots.length,
      scrollToIndex,
      scrollContainerRef,
    ],
  );

  return {
    currentFocusIndex,
    setCurrentFocusIndex,
    scrollToIndex,
    scrollLightToIndex,
    onCardClick,
    scrollTo,
  };
}
