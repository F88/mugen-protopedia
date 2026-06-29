import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

import {
  type SpecialSequenceMatch,
  useSpecialKeySequences,
} from '@/lib/hooks/use-special-key-sequences';
import { logger } from '@/lib/logger.client';
import type {
  PlayModeState,
  SimulatedDelayLevel,
} from '@/types/mugen-protopedia.types';

import { speedUp } from '@/app/mugen-protopedia-utils';

type UseCommandWindowParams = {
  /** Owned by the parent; matched cheat codes switch the play mode through it. */
  setPlayModeState: Dispatch<SetStateAction<PlayModeState>>;
  /** Owned by the parent; the `573` cheat code speeds up the simulated delay. */
  changeDelayLevel: (
    action:
      | SimulatedDelayLevel
      | ((prev: SimulatedDelayLevel) => SimulatedDelayLevel),
  ) => void;
};

type UseCommandWindowResult = {
  /** Whether the command window is visible. */
  showCLI: boolean;
  /** Current key-sequence buffer, shown in the command window. */
  sequenceBuffer: string[];
  /** The most recently matched special sequence, or null. */
  matchedCommand: SpecialSequenceMatch | null;
  /** Toggle the command window open/closed (also resets the buffer). */
  toggleCLI: () => void;
};

/**
 * Owns the command window / CLI concern of the home page: the special
 * (cheat-code) key sequences, the command-window visibility, the on-screen key
 * buffer, and the matched-command display.
 *
 * The side effects of a matched cheat code that belong to other concerns are
 * applied through the injected `setPlayModeState` / `changeDelayLevel` so this
 * hook stays focused on the command window while the parent keeps owning play
 * mode and the delay level.
 */
export function useCommandWindow({
  setPlayModeState,
  changeDelayLevel,
}: UseCommandWindowParams): UseCommandWindowResult {
  const [showCLI, setShowCLI] = useState(false);
  const [sequenceBuffer, setSequenceBuffer] = useState<string[]>([]);
  const [matchedCommand, setMatchedCommand] =
    useState<SpecialSequenceMatch | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSpecialSequenceMatch = useCallback(
    (match: SpecialSequenceMatch) => {
      logger.info(
        `[MugenProtoPedia] Special key sequence matched: ${match.name}`,
      );
      setMatchedCommand(match);
      setShowCLI(true);

      if (match.name === 'ksk') {
        setPlayModeState({ type: 'unleashed' });
      } else if (match.name === '573') {
        changeDelayLevel((currentLevel) => speedUp(currentLevel));
      } else if (match.name === 'rendezvous') {
        setPlayModeState({ type: 'dev' });
      }

      // Reset matched state after animation. Clear any pending reset first so a
      // rapid second match does not get its display closed early by the first
      // match's timer.
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
      resetTimeoutRef.current = setTimeout(() => {
        setMatchedCommand(null);
        setShowCLI(false);
        resetTimeoutRef.current = null;
      }, 2000);
    },
    [changeDelayLevel, setPlayModeState],
  );

  // Cancel a pending reset timer on unmount so it cannot fire afterwards.
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  // DEBUG: Monitor regeneration of handleSpecialSequenceMatch.
  //
  // We want to ensure this function is stable and not regenerated on every state change (like delayLevel).
  // Frequent regeneration causes useSpecialKeySequences to re-register its global 'keydown' listener.
  //
  // If re-registration happens frequently, it may change the order of event listeners relative to
  // useKeyboardShortcuts (used in ControlPanel). Since useKeyboardShortcuts calls preventDefault()
  // for navigation keys (like 'k'), this can cause useSpecialKeySequences to miss key events
  // needed for cheat codes (e.g., 'ksk') if it ends up running after useKeyboardShortcuts.
  useEffect(() => {
    logger.debug('[MugenProtoPedia] handleSpecialSequenceMatch regenerated');
  }, [handleSpecialSequenceMatch]);

  const { resetBuffer: resetKeySequencesBuffer } = useSpecialKeySequences({
    onBufferChange: setSequenceBuffer,
    // Always enabled to allow CLI toggle via key sequence
    disabled: false,
    onMatch: handleSpecialSequenceMatch,
  });

  const toggleCLI = useCallback(() => {
    setShowCLI((previous) => {
      const next = !previous;
      // Reset key sequence buffer (internal + visual) whenever
      // the command window is toggled (open or close).
      resetKeySequencesBuffer();
      return next;
    });
  }, [resetKeySequencesBuffer]);

  // Close command window on Escape while CLI is visible
  useEffect(() => {
    if (!showCLI) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setShowCLI(false);
        resetKeySequencesBuffer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showCLI, resetKeySequencesBuffer]);

  return { showCLI, sequenceBuffer, matchedCommand, toggleCLI };
}
