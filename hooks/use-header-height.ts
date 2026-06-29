'use client';

import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

/**
 * Measure the header element's height and keep it in sync with the
 * `--header-offset` CSS custom property.
 *
 * - Observes the header via `ResizeObserver` (with a window `resize` fallback)
 *   and tracks its `offsetHeight`.
 * - Mirrors the measured height onto `document.documentElement` as
 *   `--header-offset` so layout offsets can be driven from CSS, and removes the
 *   property on unmount.
 *
 * Attach the returned `headerRef` to the header element.
 */
export function useHeaderHeight(): {
  headerRef: RefObject<HTMLDivElement | null>;
  headerHeight: number;
} {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Observe Header height changes
  useLayoutEffect(() => {
    const headerElement = headerRef.current;
    if (!headerElement) return;

    const measure = () => setHeaderHeight(headerElement.offsetHeight);

    // Prefer ResizeObserver; fall back to window 'resize' where it is
    // unavailable (older browsers, some test runners), mirroring
    // lib/hooks/use-scrolling-behavior.ts.
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(headerElement);
      return () => resizeObserver.disconnect();
    }

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []); // Run only once on mount

  useLayoutEffect(() => {
    document.documentElement.style.setProperty(
      '--header-offset',
      `${headerHeight}px`,
    );
  }, [headerHeight]);

  // Drop the global CSS variable on unmount so a stale value cannot linger on
  // `document.documentElement`; consumers then fall back to the CSS default.
  useLayoutEffect(() => {
    return () => {
      document.documentElement.style.removeProperty('--header-offset');
    };
  }, []);

  return { headerRef, headerHeight };
}
