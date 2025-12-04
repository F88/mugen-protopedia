import { forwardRef, type ReactNode } from 'react';

import type {
  PlayMode,
  SimulatedDelayLevel,
} from '@/types/mugen-protopedia.types';

import {
  getPlayModeIcon,
  getPlayModeLabel,
  getSpeedIcon,
} from '@/lib/utils/converter';

import { Dashboard, type DashboardProps } from '@/components/dashboard';
import { ObservatoryHeaderButton } from '@/components/observatory-header-button';
import { PlaylistHeaderButton } from '@/components/playlist-header-button';
import { StatusIndicator } from '@/components/status-indicator';
import { ThemeToggle } from '@/components/theme-toggle';

interface HeaderProps {
  dashboard: DashboardProps;
  analysisDashboard?: ReactNode; // allow injection for Storybook/tests
  playMode: PlayMode;
  showPlayMode?: boolean;
  delayLevel?: SimulatedDelayLevel;
}

export const Header = forwardRef<HTMLDivElement, HeaderProps>(function Header(
  {
    dashboard,
    analysisDashboard,
    playMode,
    showPlayMode = false,
    delayLevel = 'NORMAL',
  },
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

  const playModeIcon = showPlayMode ? getPlayModeIcon(playMode) : null;
  const speedIcon = getSpeedIcon(delayLevel);

  /**
   * Tailwind screen breakpoints (min-width):
   * - sm: 640px
   * - md: 768px
   * - lg: 1024px
   * - xl: 1280px
   * - 2xl: 1536px
   */

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-gray-900/50 transition-colors duration-200"
    >
      <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-4">
        <div className="flex items-center justify-between gap-1.5 sm:gap-4">
          <h1 className="px-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
            <span className="sm:hidden">{shortTitle}</span>
            <span className="hidden sm:inline">{longTitle}</span>
          </h1>

          {/* Play mode and speed indicator */}
          <div className="flex items-center gap-1">
            {/* Play mode */}
            {process.env.NODE_ENV === 'development' && (
              <span>{getPlayModeLabel(playMode)}</span>
            )}
            {playModeIcon && <StatusIndicator>{playModeIcon}</StatusIndicator>}
            {/* Speed */}
            {speedIcon != null && (
              <StatusIndicator variant="blue" pulse>
                {speedIcon}
              </StatusIndicator>
            )}
          </div>

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
            {/* Playlist editor shortcut (hidden on small screens) */}
            <div className="hidden lg:block">
              <PlaylistHeaderButton />
            </div>
            {/* Observatory shortcut */}
            {/* {process.env.NODE_ENV === 'development' && ( */}
            <ObservatoryHeaderButton />
            {/* )} */}
            {/* Theme  */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
});
