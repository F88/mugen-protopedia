'use client';

import { useEffect, useRef } from 'react';

type KeyboardShortcutsProps = {
  onGetRandomPrototype: () => void;
  onClear: () => void;
  onScrollNext: () => void;
  onScrollPrev: () => void;
  onOpenPrototype: () => void;
};

export const useKeyboardShortcuts = ({
  onGetRandomPrototype,
  onClear,
  onScrollNext,
  onScrollPrev,
  onOpenPrototype,
}: KeyboardShortcutsProps) => {
  // const ACTION_COOLDOWN_MS = 0;
  // const ACTION_COOLDOWN_MS = 50;
  const ACTION_COOLDOWN_MS = 80;
  // const ACTION_COOLDOWN_MS = 100;

  const lastTriggeredRef = useRef<Record<string, number>>({});

  const canTrigger = (action: string) => {
    const now = performance.now();
    const last = lastTriggeredRef.current[action] ?? 0;
    if (now - last < ACTION_COOLDOWN_MS) {
      return false;
    }
    lastTriggeredRef.current[action] = now;
    return true;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ignore modified keys
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;

      if (key === 'Enter') {
        e.preventDefault();
        if (canTrigger('random')) {
          onGetRandomPrototype();
        }
      } else if (
        key === 'j' ||
        key === 'J' ||
        key === 'ArrowDown' ||
        key === 'ArrowRight'
      ) {
        e.preventDefault();
        if (canTrigger('scroll-next')) {
          onScrollNext();
        }
      } else if (
        key === 'k' ||
        key === 'K' ||
        key === 'ArrowUp' ||
        key === 'ArrowLeft'
      ) {
        e.preventDefault();
        if (canTrigger('scroll-prev')) {
          onScrollPrev();
        }
      } else if (key === 'r' || key === 'R') {
        e.preventDefault();
        if (canTrigger('clear')) {
          onClear();
        }
      } else if (key === 'o' || key === 'O') {
        e.preventDefault();
        if (canTrigger('open')) {
          onOpenPrototype();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onGetRandomPrototype,
    onClear,
    onScrollNext,
    onScrollPrev,
    onOpenPrototype,
  ]);
};
