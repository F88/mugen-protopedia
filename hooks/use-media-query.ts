'use client';

import { useEffect, useState } from 'react';

/**
 * Subscribe to a CSS media query.
 *
 * SSR-safe: `window.matchMedia` is never called during render (it does not
 * exist on the server), so this returns `false` on the server and on the first
 * client render — avoiding a hydration mismatch — then updates after mount once
 * the query result (and any later changes) can be read.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);

  return matches;
}
