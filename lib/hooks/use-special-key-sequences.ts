'use client';

import { useMemo } from 'react';
import { useKeySequences } from '@/lib/hooks/use-key-sequences';
import { logger } from '../logger.client';

export type SpecialSequenceMatch = {
  name: string;
  keys: string[];
  message: string;
};

type SpecialSequenceDefinition = {
  name: string;
  keys: string[];
  message: string;
};

/**
 * 573
 */
const konamiCommand = {
  name: '573',
  // keys: ['5', '7', '3'],
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
  message: 'SPEED UP',
} satisfies SpecialSequenceDefinition;

/**
 * KSK
 */
const kskCommand = {
  name: 'ksk',
  keys: ['k', 's', 'k'],
  message: 'あ あとは 勇気だけだ！',
} satisfies SpecialSequenceDefinition;

/**
 * ping
 */
const pingCommand = {
  name: 'ping',
  keys: ['p', 'i', 'n', 'g'],
  message: 'pong',
} satisfies SpecialSequenceDefinition;

/**
 * SL
 */
const slCommand = {
  name: 'sl',
  keys: ['s', 'l'],
  message: '🚞🚃🚃🚃🚃🚃🚃',
} satisfies SpecialSequenceDefinition;

/**
 * Hi
 */
const hiCommand = {
  name: 'hi',
  keys: ['h', 'i'],
  message: '┬┴┬┴┤･ω･)ﾉ├┬┴┬┴',
} satisfies SpecialSequenceDefinition;

const SPECIAL_SEQUENCES: SpecialSequenceDefinition[] = [
  pingCommand,
  slCommand,
  hiCommand,
  konamiCommand,
  kskCommand,
];

type UseSpecialKeySequencesOptions = {
  onBufferChange?: (buffer: string[]) => void;
  disabled?: boolean;
  onMatch?: (match: SpecialSequenceMatch) => void;
};

export function useSpecialKeySequences({
  onBufferChange,
  disabled = false,
  onMatch,
}: UseSpecialKeySequencesOptions = {}) {
  const sequences = useMemo(
    () =>
      SPECIAL_SEQUENCES.map((seq) => ({
        name: seq.name,
        keys: seq.keys,
        onMatch: () => {
          logger.info(
            `[useSpecialKeySequences] ${seq.name} command detected: ${seq.message}`,
          );
          onMatch?.({
            name: seq.name,
            keys: seq.keys,
            message: seq.message,
          });
        },
      })),
    [onMatch],
  );

  return useKeySequences({
    sequences,
    onBufferChange,
    disabled,
  });
}
