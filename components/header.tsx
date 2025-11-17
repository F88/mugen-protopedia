import { forwardRef, type ReactNode } from 'react';

import type { PlayMode } from '@/types/mugen-protopedia.types';

import { Dashboard, type DashboardProps } from './dashboard';
import { ThemeToggle } from './theme-toggle';

interface HeaderProps {
  dashboard: DashboardProps;
  analysisDashboard?: ReactNode; // allow injection for Storybook/tests
  playMode: PlayMode;
  showPlayMode?: boolean;
}

export const Header = forwardRef<HTMLDivElement, HeaderProps>(function Header(
  { dashboard, analysisDashboard, playMode, showPlayMode = false },
  ref,
) {
  // const longTitle = 'ProtoPedia Viewer 25';
  // const longTitle = '無限 ProtoPedia';
  const mugenLong = '無限';
  // const mugenLong = '∞️️'; // Unicode Character “∞” (U+221E)
  // const mugenShort = '♾️';
  const mugenShort = '∞️️'; // Unicode Character “∞” (U+221E)
  // const mugenShort = '無限';
  const longTitle = mugenLong + 'ProtoPedia';
  const shortTitle = mugenShort + 'PP';

  // const playModeLabel = playMode === 'playlist' ? 'Playlist' : 'Normal';
  const playModeLabel = playMode === 'playlist' ? ' ▶️' : 'Normal';

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-gray-900/50 transition-colors duration-200"
    >
      <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-4">
        <div className="flex items-center justify-between gap-1.5 sm:gap-4">
          <h1 className="px-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
            <span className="sm:hidden">{shortTitle}</span>
            <span className="hidden sm:inline">{longTitle}</span>
          </h1>

          {/* Play mode */}
          {showPlayMode && (
            <>
              {/* <Badge variant={'default'} className="uppercase tracking-wide"> */}
              {playModeLabel}
              {/* </Badge> */}
            </>
          )}

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Dashboard */}
            <Dashboard
              prototypeCount={dashboard.prototypeCount}
              inFlightRequests={dashboard.inFlightRequests}
              maxConcurrentFetches={dashboard.maxConcurrentFetches}
              size="compact"
            />

            {/* Analysis Dashboard */}
            {analysisDashboard}

            {/* Theme  */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
});
