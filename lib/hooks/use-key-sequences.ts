import { useCallback, useEffect, useRef } from 'react';

import { logger } from '@/lib/logger.client';

export type KeySequence = {
  name: string;
  keys: string[];
  onMatch: () => void;
};

export type UseKeySequencesOptions = {
  sequences: KeySequence[];
  onBufferChange?: (buffer: string[]) => void;
  disabled?: boolean;
};

const isTextInputLike = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  ) {
    return true;
  }

  return false;
};

export const useKeySequences = ({
  sequences,
  onBufferChange,
  disabled = false,
}: UseKeySequencesOptions) => {
  const bufferRef = useRef<string[]>([]);
  const maxBufferLength = 10;

  const resetBuffer = useCallback(() => {
    bufferRef.current = [];
    if (onBufferChange) {
      onBufferChange([]);
    }
  }, [onBufferChange]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    if (sequences.length === 0) {
      return;
    }

    const maxLength = sequences.reduce(
      (max, seq) => (seq.keys.length > max ? seq.keys.length : max),
      0,
    );

    const handleKeyDown = (event: KeyboardEvent) => {
      // logger.debug('[useKeySequences] keydown', {
      //   key: event.key,
      //   buffer: bufferRef.current.join(','),
      // });

      if (isTextInputLike(event.target)) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const rawKey = event.key;
      const key = rawKey.length === 1 ? rawKey.toLowerCase() : rawKey;

      const buffer = bufferRef.current;
      buffer.push(key);
      const limit = Math.min(maxLength, maxBufferLength);
      if (buffer.length > limit) {
        buffer.shift();
      }

      if (onBufferChange) {
        // Defer state updates to avoid interrupting other event listeners
        // that might be registered on the same element (window).
        // If we trigger a re-render synchronously, other listeners might be removed
        // before they have a chance to run.
        setTimeout(() => {
          // Use the current ref value to ensure we don't overwrite a reset
          // that might have happened synchronously in another listener.
          onBufferChange([...bufferRef.current]);
        }, 0);
      }

      // Check sequences from longest to shortest for a deterministic match
      for (const sequence of sequences) {
        const { keys, onMatch } = sequence;
        if (keys.length === 0) continue;

        if (buffer.length < keys.length) continue;

        let matched = true;
        for (let i = 0; i < keys.length; i += 1) {
          const bufferIndex = buffer.length - keys.length + i;
          if (buffer[bufferIndex] !== keys[i]) {
            matched = false;
            break;
          }
        }

        if (matched) {
          logger.debug('[useKeySequences] sequence matched', {
            name: sequence.name,
            keys: sequence.keys,
          });
          onMatch();
          logger.debug('[useKeySequences] reset buffer after match', {
            name: sequence.name,
            previous: bufferRef.current.join(','),
          });
          bufferRef.current = [];
          if (onBufferChange) {
            onBufferChange([]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sequences, onBufferChange, disabled]);

  return { resetBuffer };
};
