'use client';

import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

/**
 * Measure the header element's height and keep it in sync with the
 * `--header-offset` CSS custom property.
 *
 * - Observes the header via `ResizeObserver` and tracks its `offsetHeight`.
 * - Mirrors the measured height onto `document.documentElement` as
 *   `--header-offset` so layout offsets can be driven from CSS.
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

    const resizeObserver = new ResizeObserver(() => {
      setHeaderHeight(headerElement.offsetHeight);
    });

    resizeObserver.observe(headerElement);

    // Cleanup observer on unmount
    return () => resizeObserver.disconnect();
  }, []); // Run only once on mount

  useLayoutEffect(() => {
    document.documentElement.style.setProperty(
      '--header-offset',
      `${headerHeight}px`,
    );
  }, [headerHeight]);

  return { headerRef, headerHeight };
}
