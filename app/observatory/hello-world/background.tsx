'use client';

import { UniverseBackgroundMainDark } from '../shared/universe-background-main-dark';

/**
 * HelloWorldBackground
 *
 * Background component for Hello World page.
 * - Dark Mode: Uses shared deep space background with stars
 * - Light Mode: Bright Impressionist-style gradient celebrating new beginnings
 */
export function HelloWorldBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Dark Mode: Deep Space */}
      <div className="dark:opacity-100 opacity-0 transition-opacity duration-700">
        <UniverseBackgroundMainDark />
      </div>

      {/* Light Mode: Birth of Light - Impressionist pastels */}
      <div className="absolute inset-0 bg-linear-to-br from-pink-50 via-rose-100 to-orange-100 dark:opacity-0 opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-linear-to-tr from-pink-200/40 via-rose-200/30 to-amber-200/40" />
        {/* Soft radial glow */}
        <div className="absolute inset-0 bg-radial-gradient from-white/30 via-transparent to-transparent" />
      </div>
    </div>
  );
}
