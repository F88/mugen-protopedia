import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  useKeySequences,
  type KeySequence,
} from '@/lib/hooks/use-key-sequences';

const triggerKeyDown = (key: string, target: HTMLElement | Window = window) => {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
  });

  (target as HTMLElement | Window).dispatchEvent(event as Event);
};

describe('useKeySequences', () => {
  const createKonamiSequence = (onMatch: () => void): KeySequence => ({
    name: 'konami',
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
    onMatch,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('triggers onMatch when Konami code is entered', () => {
    const onMatch = vi.fn();

    renderHook(() =>
      useKeySequences({
        sequences: [createKonamiSequence(onMatch)],
      }),
    );

    act(() => {
      const konamiKeys = [
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
      ];

      konamiKeys.forEach((key) => triggerKeyDown(key));
    });

    expect(onMatch).toHaveBeenCalledTimes(1);
  });

  it('triggers onMatch when Konami code is entered with uppercase letters', () => {
    const onMatch = vi.fn();

    renderHook(() =>
      useKeySequences({
        sequences: [createKonamiSequence(onMatch)],
      }),
    );

    act(() => {
      const konamiKeysUpper = [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'B',
        'A',
      ];

      konamiKeysUpper.forEach((key) => triggerKeyDown(key));
    });

    expect(onMatch).toHaveBeenCalledTimes(1);
  });

  it('does not trigger when sequence is incomplete or wrong', () => {
    const onMatch = vi.fn();

    renderHook(() =>
      useKeySequences({
        sequences: [createKonamiSequence(onMatch)],
      }),
    );

    act(() => {
      const almostKonami = [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'b',
      ];
      almostKonami.forEach((key) => triggerKeyDown(key));

      triggerKeyDown('x');
    });

    expect(onMatch).not.toHaveBeenCalled();
  });

  it('ignores key events when typing in an input element', () => {
    const onMatch = vi.fn();

    renderHook(() =>
      useKeySequences({
        sequences: [createKonamiSequence(onMatch)],
      }),
    );

    const input = document.createElement('input');
    document.body.appendChild(input);

    act(() => {
      const konamiKeys = [
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
      ];

      konamiKeys.forEach((key) => triggerKeyDown(key, input));
    });

    expect(onMatch).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });
});
