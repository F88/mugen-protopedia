'use client';

import { useMemo } from 'react';
import { useKeySequences } from '@/lib/hooks/use-key-sequences';
import { logger } from '../logger.client';

type UseSpecialKeySequencesOptions = {
  onBufferChange?: (buffer: string[]) => void;
  disabled?: boolean;
  onMatch?: (sequenceName: string) => void;
};

export function useSpecialKeySequences({
  onBufferChange,
  disabled = false,
  onMatch,
}: UseSpecialKeySequencesOptions = {}) {
  const sequences = useMemo(
    () => [
      {
        name: '573',
        keys: [
          'ArrowUp',
          'ArrowUp',
          'ArrowDown',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'ArrowLeft',
          'ArrowRight',
          'b',
          'a',
        ],
        onMatch: () => {
          logger.info('[useSpecialKeySequences] 573 command detected');
          onMatch?.('573');
        },
      },
      {
        name: 'ksk',
        keys: ['k', 's', 'k'],
        onMatch: () => {
          logger.info('[useSpecialKeySequences] ksk switch pushed');
          onMatch?.('ksk');
        },
      },
    ],
    [onMatch],
  );

  return useKeySequences({
    sequences,
    onBufferChange,
    disabled,
  });
}
