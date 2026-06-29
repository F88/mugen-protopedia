'use client';

/**
 * @file Home page component providing an infinite prototype browsing surface.
 *
 * @see docs/specs/slot-and-scroll-behavior.md for formal slot & scroll specification.
 */

import type { ChangeEvent } from 'react';
import { useCallback, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import type {
  PlayModeState,
  SimulatedDelayLevel,
} from '@/types/mugen-protopedia.types';

// lib
import { useMaxPrototypeId } from '@/lib/hooks/use-max-prototype-id';
import { usePrototypeFetching } from '@/lib/hooks/use-prototype-fetching';
import { usePrototypeSlots } from '@/lib/hooks/use-prototype-slots';
import { useScrollingBehavior } from '@/lib/hooks/use-scrolling-behavior';
import { logger } from '@/lib/logger.client';
import { buildPrototypeLink } from '@/lib/utils/prototype-utils';
import { resolvePlayMode } from '@/lib/utils/resolve-play-mode';

// hooks
import { useCommandWindow } from '@/hooks/use-command-window';
import { useDirectLaunch } from '@/hooks/use-direct-launch';
import { useHeaderHeight } from '@/hooks/use-header-height';
import { usePlaylistPlayback } from '@/hooks/use-playlist-playback';
import { usePlaylistPlaybackState } from '@/hooks/use-playlist-playback-state';

// components
import { AnalysisDashboardContainer } from '@/components/analysis-dashboard-container';
import { MugenProtoPediaView } from './mugen-protopedia-view';
import {
  arePlayModeStatesEqual,
  getSimulatedDelayRangeForLevel,
} from './mugen-protopedia-utils';

export function MugenProtoPedia() {
  const router = useRouter();
  const { headerRef, headerHeight } = useHeaderHeight();
  const stickyBannerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [delayLevel, setDelayLevel] = useState<SimulatedDelayLevel>('NORMAL');

  // Playlist playback state machine (isPlaying / isCompleted / processedCount /
  // title-card style). Declared early so its stable `dispatch` can be fed into
  // `usePrototypeFetching` below while the orchestration effects run later.
  const { state: playbackState, dispatch: playbackDispatch } =
    usePlaylistPlaybackState();

  // Direct launch & play mode
  const directLaunchResult = useDirectLaunch();
  const [playModeState, setPlayModeState] = useState<PlayModeState>(() =>
    resolvePlayMode({ directLaunchResult }),
  );

  // Sync play mode when the direct launch parameters change. directLaunchResult
  // is a stable reference (useDirectLaunch memoizes on searchParams), so compare
  // it against the previous value during render instead of via an effect. The
  // initial value is the current result, so this runs only on later changes,
  // matching the old effect (which was a no-op on mount because playModeState is
  // already initialized from the same resolver).
  const [prevDirectLaunchResult, setPrevDirectLaunchResult] =
    useState(directLaunchResult);
  if (prevDirectLaunchResult !== directLaunchResult) {
    setPrevDirectLaunchResult(directLaunchResult);
    const resolvedPlayMode = resolvePlayMode({ directLaunchResult });
    setPlayModeState((previousState) => {
      const newPlayMode = arePlayModeStatesEqual(
        previousState,
        resolvedPlayMode,
      )
        ? previousState
        : resolvedPlayMode;
      logger.debug(
        '[MugenProtoPedia]',
        'Play mode:',
        `${previousState.type} -> ${newPlayMode.type}`,
      );
      return newPlayMode;
    });
  }

  const isPlaylistMode = playModeState.type === 'playlist';

  // Slot & concurrency management
  const {
    prototypeSlots,
    appendPlaceholder,
    replacePrototypeInSlot,
    setSlotError,
    clearSlots,
    inFlightRequests,
    canFetchMorePrototypes,
    tryIncrementInFlightRequests,
    decrementInFlightRequests,
    maxConcurrentFetches,
  } = usePrototypeSlots({
    maxConcurrentFetches: 6,
    simulateDelayRangeMs: getSimulatedDelayRangeForLevel(delayLevel),
  });

  const [prototypeIdInput, setPrototypeIdInput] = useState(
    '',
    // '3' /* おしゃべりパパ人形 */,
    // '12' /* DrunkenMaster byDrunker5 */,
    // '5916' /* クロとシロ */,
    // '2345' /* スタックチャン */,
    // '3877' /* Type-C 危機一発 */,
    // '7595' /* よのこまえ */,
    // '7627' /* ProtoPedia API Ver 2.0 Client for Javascript | ProtoPedia */,
    // '7759' /* 無限ProtoPedia */,
  );

  const maxPrototypeId = useMaxPrototypeId();

  const changeDelayLevel = useCallback(
    (
      action:
        | SimulatedDelayLevel
        | ((prev: SimulatedDelayLevel) => SimulatedDelayLevel),
    ) => {
      setDelayLevel((prev) => {
        const next = typeof action === 'function' ? action(prev) : action;
        logger.debug(
          '[MugenProtoPedia]',
          `Set delay level to ${next} (from ${prev})`,
        );
        return next;
      });
    },
    [],
  );

  // Command window / cheat-code key sequences. The hook owns the CLI visibility,
  // the key buffer and the matched-command display; play-mode/delay side effects
  // of a matched cheat code are applied through the injected setters.
  const { showCLI, sequenceBuffer, matchedCommand, toggleCLI } =
    useCommandWindow({ setPlayModeState, changeDelayLevel });

  // const logNotableHighlights = (prototype: Prototype) => {
  // const highlights = checkNotableHighlights(prototype);
  // Do something with highlights // TODO
  // logger.info('Prototype has any notable highlights!!', { highlights });
  // };

  const playlistTotalCount = isPlaylistMode ? playModeState.ids.length : 0;

  const shouldShowDirectLaunchBanner = directLaunchResult.type === 'failure';
  const shouldShowPlaylistSticky = isPlaylistMode && !playbackState.isCompleted;

  const shouldShowStickyBanner =
    shouldShowDirectLaunchBanner || shouldShowPlaylistSticky;

  // Common props for PlaylistTitleCard
  const playlistTitleCardProps = isPlaylistMode
    ? {
        className: 'mx-auto',
        ids: playModeState.ids,
        title: playModeState.title,
        processedCount: playbackState.processedCount,
        totalCount: playlistTotalCount,
        isCompleted: playbackState.isCompleted,
        isPlaying: playbackState.isPlaying,
        variant: playbackState.variant,
        fontFamily: playbackState.fontFamily,
      }
    : null;

  // Scrolling & focus behavior
  const {
    currentFocusIndex,
    onCardClick: handleCardClick,
    scrollTo: scrollToPrototype,
  } = useScrollingBehavior(
    {
      headerRef,
      scrollContainerRef,
      prototypeSlots,
    },
    {
      // extraOffset: 16,
    },
  );

  /**
   * Handle change for explicit ID input field.
   * Updates local state used by validation and fetch-by-ID action.
   */
  const handlePrototypeIdInputChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setPrototypeIdInput(event.target.value);
  };

  /**
   * Programmatically set the explicit ID input (e.g., from quick set buttons).
   */
  const handlePrototypeIdInputSet = (value: number) => {
    setPrototypeIdInput(String(value));
  };

  /**
   * Clear all prototype slots.
   */
  const handleClearPrototypes = useCallback(() => {
    if (playbackState.isPlaying) return;

    // Clear any existing prototypes
    clearSlots();

    // Reset delay level to default in any PlayMode
    changeDelayLevel('NORMAL');

    // Route back to home if in playlist mode
    if (playModeState.type === 'playlist') {
      router.replace('/', { scroll: false });
    }

    // Reset play mode to normal if not already
    if (playModeState.type !== 'normal') {
      setPlayModeState({ type: 'normal' });
    }
  }, [
    clearSlots,
    playbackState.isPlaying,
    playModeState.type,
    router,
    changeDelayLevel,
  ]);

  // Advance the playlist progress count after each playlist item fetch attempt.
  // Stable wrapper so the fetching hook's playlist handler stays stable
  // (`dispatch` is constant).
  const onPlaylistItemProcessed = useCallback(
    () => playbackDispatch({ type: 'ITEM_PROCESSED' }),
    [playbackDispatch],
  );

  // Prototype fetching (random / by-id SHOW / playlist). Slots stay owned here
  // and are injected; the playlist fetch is returned for the playback effect.
  const {
    prototypeIdError,
    fetchRandomPrototype,
    fetchPrototypeByIdFromInput,
    fetchPrototypeByIdForPlaylist,
  } = usePrototypeFetching({
    slots: {
      appendPlaceholder,
      replacePrototypeInSlot,
      setSlotError,
      tryIncrementInFlightRequests,
      decrementInFlightRequests,
    },
    isPlaylistPlaying: playbackState.isPlaying,
    onPlaylistItemProcessed,
  });

  /**
   * Open the currently focused prototype in a new browser tab on ProtoPedia.
   * Uses noopener/noreferrer for security.
   */
  const openCurrentPrototypeInProtoPedia = useCallback(() => {
    if (currentFocusIndex >= 0 && currentFocusIndex < prototypeSlots.length) {
      const currentSlot = prototypeSlots[currentFocusIndex];
      const prototypeId =
        currentSlot.prototype?.id ?? currentSlot.expectedPrototypeId;

      if (prototypeId !== undefined) {
        const url = buildPrototypeLink(prototypeId);
        if (url.length > 0) {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
    }
  }, [currentFocusIndex, prototypeSlots]);

  // Playlist playback orchestration: the ref-backed queue/signature/timeout
  // coordination and the two effects (queue-prep + timer loop) that drive the
  // playback state machine. Runs here so it can receive the playlist fetcher
  // from `usePrototypeFetching` above; it dispatches into `playbackDispatch`.
  usePlaylistPlayback({
    playModeState,
    state: playbackState,
    dispatch: playbackDispatch,
    changeDelayLevel,
    fetchPrototypeByIdForPlaylist,
    canFetchMorePrototypes,
    inFlightRequests,
  });

  /**
   * Main application layout
   *
   * All markup lives in the presentational `MugenProtoPediaView`; this
   * container only assembles the derived state and callbacks it needs.
   */
  return (
    <MugenProtoPediaView
      headerRef={headerRef}
      stickyBannerRef={stickyBannerRef}
      scrollContainerRef={scrollContainerRef}
      playModeState={playModeState}
      delayLevel={delayLevel}
      dashboard={{
        prototypeCount: prototypeSlots.length,
        inFlightRequests,
        maxConcurrentFetches,
      }}
      analysisDashboard={
        <AnalysisDashboardContainer
          defaultExpanded={false}
          preferClientTimezoneAnniversaries={true}
          isDevelopment={process.env.NODE_ENV === 'development'}
        />
      }
      headerHeight={headerHeight}
      shouldShowStickyBanner={shouldShowStickyBanner}
      shouldShowDirectLaunchBanner={shouldShowDirectLaunchBanner}
      isPlaylistMode={isPlaylistMode}
      directLaunchResult={directLaunchResult}
      playlistTitleCardProps={playlistTitleCardProps}
      isPlaybackCompleted={playbackState.isCompleted}
      prototypeSlots={prototypeSlots}
      currentFocusIndex={currentFocusIndex}
      onCardClick={handleCardClick}
      controlPanel={{
        controlPanelMode: playbackState.isPlaying ? 'loadingPlaylist' : 'normal',
        onGetRandomPrototype: fetchRandomPrototype,
        onClear: handleClearPrototypes,
        prototypeIdInput,
        onPrototypeIdInputChange: handlePrototypeIdInputChange,
        onGetPrototypeById: () => fetchPrototypeByIdFromInput(prototypeIdInput),
        onPrototypeIdInputSet: handlePrototypeIdInputSet,
        canFetchMorePrototypes,
        prototypeIdError,
        onScrollNext: () => scrollToPrototype('next'),
        onScrollPrev: () => scrollToPrototype('prev'),
        onOpenPrototype: openCurrentPrototypeInProtoPedia,
        onToggleCLI: toggleCLI,
        shortcutsDisabled: showCLI,
        maxPrototypeId,
      }}
      showCLI={showCLI}
      commandBuffer={sequenceBuffer}
      matchedCommand={matchedCommand}
    />
  );
}
