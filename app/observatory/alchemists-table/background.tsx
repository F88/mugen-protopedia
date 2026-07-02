'use client';

import { UniverseBackgroundMainDark } from '../shared/universe-background-main-dark';

/**
 * AlchemistsTableBackground
 *
 * - Dark Mode: shared deep-space universe background.
 * - Light Mode: an apothecary gradient — an ember-warm base rising through violet
 *   to a green brew, echoing the cauldron card theme.
 */
export function AlchemistsTableBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Dark Mode: Deep Space */}
      <div className="dark:opacity-100 opacity-0 transition-opacity duration-700">
        <UniverseBackgroundMainDark />
      </div>

      {/* Light Mode: the cauldron - flames below, brew and smoke above */}
      <div className="absolute inset-0 bg-linear-to-t from-red-100 via-violet-100 to-emerald-50 dark:opacity-0 opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-linear-to-br from-violet-200/40 via-transparent to-emerald-200/40" />
      </div>
    </div>
  );
}
