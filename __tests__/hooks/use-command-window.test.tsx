import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCommandWindow } from '@/hooks/use-command-window';

const triggerKeyDown = (key: string, target: HTMLElement | Window = window) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true });
  (target as HTMLElement | Window).dispatchEvent(event as Event);
};

// Key arrays mirror lib/hooks/use-special-key-sequences.ts
const KSK_KEYS = ['k', 's', 'k'];
const KONAMI_KEYS = [
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

const renderCommandWindow = () => {
  const setPlayModeState = vi.fn();
  const changeDelayLevel = vi.fn();
  const view = renderHook(() =>
    useCommandWindow({ setPlayModeState, changeDelayLevel }),
  );
  return { ...view, setPlayModeState, changeDelayLevel };
};

describe('useCommandWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('toggleCLI flips visibility and resets the buffer', async () => {
    const { result } = renderCommandWindow();

    expect(result.current.showCLI).toBe(false);

    // Build up a partial buffer, then toggling should clear it.
    act(() => triggerKeyDown('k'));
    await waitFor(() => expect(result.current.sequenceBuffer).toEqual(['k']));

    act(() => result.current.toggleCLI());
    expect(result.current.showCLI).toBe(true);
    await waitFor(() => expect(result.current.sequenceBuffer).toEqual([]));

    act(() => result.current.toggleCLI());
    expect(result.current.showCLI).toBe(false);
  });

  it('closes on Escape while open', () => {
    const { result } = renderCommandWindow();

    act(() => result.current.toggleCLI());
    expect(result.current.showCLI).toBe(true);

    act(() => triggerKeyDown('Escape'));
    expect(result.current.showCLI).toBe(false);
  });

  it('applies the ksk cheat code (unleashed play mode) and shows the match', () => {
    const { result, setPlayModeState } = renderCommandWindow();

    act(() => KSK_KEYS.forEach((key) => triggerKeyDown(key)));

    expect(setPlayModeState).toHaveBeenCalledWith({ type: 'unleashed' });
    expect(result.current.matchedCommand?.name).toBe('ksk');
    expect(result.current.showCLI).toBe(true);
  });

  it('applies the 573 cheat code (speed up via changeDelayLevel)', () => {
    const { result, changeDelayLevel } = renderCommandWindow();

    act(() => KONAMI_KEYS.forEach((key) => triggerKeyDown(key)));

    expect(changeDelayLevel).toHaveBeenCalledTimes(1);
    expect(result.current.matchedCommand?.name).toBe('573');
  });
});
