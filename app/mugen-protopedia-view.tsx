/**
 * @file Presentational ("dumb") view for the home experience.
 *
 * This component owns only the layout/markup of the home page. All state,
 * hooks and orchestration live in {@link MugenProtoPedia} (the container),
 * which passes the derived state and callbacks in via props. Keeping this
 * layer free of hooks makes it straightforward to render in isolation
 * (e.g. Storybook) by supplying plain props.
 *
 * @see app/mugen-protopedia.tsx for the container that wires the hooks.
 * @see docs/specs/slot-and-scroll-behavior.md for the slot & scroll spec.
 */

import type { ComponentProps, ReactNode, RefObject } from 'react';

import type {
  PlayModeState,
  SimulatedDelayLevel,
} from '@/types/mugen-protopedia.types';

import type { DashboardProps } from '@/components/dashboard';
import type { PrototypeSlot } from '@/lib/hooks/use-prototype-slots';

import { CommandWindow } from '@/components/command-window';
import {
  ControlPanel,
  type ControlPanelProps,
} from '@/components/control-panel';
import { DirectLaunchResult } from '@/components/direct-launch-result';
import { Header } from '@/components/header';
import { PlayModeTheme } from '@/components/play-mode-theme';
import { PlaylistTitleCard } from '@/components/playlist/playlist-title';
import { PrototypeGrid } from '@/components/prototype/prototype-grid';

export type MugenProtoPediaViewProps = {
  // Refs (DOM rendered here, consumed by container hooks)
  headerRef: RefObject<HTMLDivElement | null>;
  stickyBannerRef: RefObject<HTMLDivElement | null>;
  scrollContainerRef: RefObject<HTMLDivElement | null>;

  // Theme / header
  playModeState: PlayModeState;
  delayLevel: SimulatedDelayLevel;
  dashboard: DashboardProps;
  /** Injected so this view stays free of the data-fetching analysis container. */
  analysisDashboard: ReactNode;

  // Layout control flags
  headerHeight: number;
  shouldShowStickyBanner: boolean;
  shouldShowDirectLaunchBanner: boolean;
  isPlaylistMode: boolean;

  // Playlist / direct launch
  directLaunchResult: ComponentProps<
    typeof DirectLaunchResult
  >['directLaunchResult'];
  playlistTitleCardProps: ComponentProps<typeof PlaylistTitleCard> | null;
  isPlaybackCompleted: boolean;

  // Grid / scroll
  prototypeSlots: PrototypeSlot[];
  currentFocusIndex: number;
  onCardClick: (index: number) => void;

  // Control panel (bundled)
  controlPanel: ControlPanelProps;

  // Command window
  showCLI: boolean;
  commandBuffer: ComponentProps<typeof CommandWindow>['buffer'];
  matchedCommand: ComponentProps<typeof CommandWindow>['matchedCommand'];
};

/**
 * Presentational layout for the home experience.
 */
export function MugenProtoPediaView({
  headerRef,
  stickyBannerRef,
  scrollContainerRef,
  playModeState,
  delayLevel,
  dashboard,
  analysisDashboard,
  headerHeight,
  shouldShowStickyBanner,
  shouldShowDirectLaunchBanner,
  isPlaylistMode,
  directLaunchResult,
  playlistTitleCardProps,
  isPlaybackCompleted,
  prototypeSlots,
  currentFocusIndex,
  onCardClick,
  controlPanel,
  showCLI,
  commandBuffer,
  matchedCommand,
}: MugenProtoPediaViewProps) {
  return (
    <>
      {/* Play Mode Theme Overlay */}
      <PlayModeTheme mode={playModeState} delayLevel={delayLevel} />

      {/* Header */}
      <Header
        ref={headerRef}
        dashboard={dashboard}
        playMode={playModeState.type}
        showPlayMode={true}
        delayLevel={delayLevel}
        analysisDashboard={analysisDashboard}
      />

      {headerHeight > 0 && (
        <>
          {/* Sticky banner container */}
          {shouldShowStickyBanner ? (
            <div
              ref={stickyBannerRef}
              className="sticky z-50 header-offset-top"
            >
              {/* Render direct launch status and PrototypeGrid only when headerHeight is determined */}
              {shouldShowDirectLaunchBanner && (
                <div className="p-4">
                  <DirectLaunchResult
                    className="bg-transparent p-0 text-left"
                    directLaunchResult={directLaunchResult}
                    successMessage="Direct launch parameters validated successfully."
                    failureMessage="The URL contains invalid parameters for direct launch. Please check the URL and try again."
                  />
                </div>
              )}
              {/* Show playlist title when sticky banner is visible */}
              {isPlaylistMode && playlistTitleCardProps && (
                <div
                  className={`transition-all duration-3000 ease-out transform-gpu ${
                    !isPlaybackCompleted
                      ? 'opacity-100 translate-y-0 max-h-96 p-4'
                      : 'opacity-0 -translate-y-8 max-h-0 overflow-hidden p-0'
                  }`}
                >
                  <PlaylistTitleCard {...playlistTitleCardProps} />
                </div>
              )}
            </div>
          ) : null}

          {/* Scrollable container for prototypes and other content */}
          <div
            ref={scrollContainerRef}
            className="w-full h-screen overflow-auto p-4 pb-40 header-offset-padding overscroll-contain relative z-10"
          >
            {isPlaylistMode && playlistTitleCardProps && (
              <div
                // delay-3000 waits until the sticky PlaylistTitleCard fades out before showing this one.
                className={`p-4 transition-opacity duration-1000 delay-3000 ease-in ${
                  isPlaybackCompleted
                    ? 'opacity-100'
                    : 'opacity-0 max-h-0 overflow-hidden p-0'
                }`}
              >
                <PlaylistTitleCard {...playlistTitleCardProps} />
              </div>
            )}

            <PrototypeGrid
              prototypeSlots={prototypeSlots}
              currentFocusIndex={currentFocusIndex}
              onCardClick={onCardClick}
            />
          </div>
        </>
      )}

      {/* Control panel - Fixed overlay at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-transparent transition-colors duration-200">
        <div className="container mx-auto p-4">
          <ControlPanel {...controlPanel} />
        </div>
      </div>

      {/* Command window - centered panel toggled by "/" */}
      {showCLI ? (
        <CommandWindow buffer={commandBuffer} matchedCommand={matchedCommand} />
      ) : null}
    </>
  );
}
