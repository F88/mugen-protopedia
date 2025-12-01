'use client';

import { UniverseBackgroundMainDark } from '../shared/universe-background-main-dark';

export function ObservatoryBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Dark Mode: Deep Space */}
      <div className="dark:opacity-100 opacity-0 transition-opacity duration-700">
        <UniverseBackgroundMainDark />
      </div>

      {/* Light Mode: Stratosphere (darker) */}
      <div className="absolute inset-0 bg-linear-to-b from-blue-500 via-blue-200 to-blue-50 dark:opacity-0 opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-linear-to-tr from-blue-500/40 via-transparent to-purple-400/40" />
      </div>
    </div>
  );
}
