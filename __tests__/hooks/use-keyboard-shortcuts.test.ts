import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';

const triggerKeyDown = (key: string, target: HTMLElement | Window = window) => {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
  });

  (target as HTMLElement | Window).dispatchEvent(event as Event);
};

describe('useKeyboardShortcuts', () => {
  const onGetRandomPrototype = vi.fn();
  const onClear = vi.fn();
  const onScrollNext = vi.fn();
  const onScrollPrev = vi.fn();
  const onOpenPrototype = vi.fn();

  const setup = () => {
    renderHook(() =>
      useKeyboardShortcuts({
        onGetRandomPrototype,
        onClear,
        onScrollNext,
        onScrollPrev,
        onOpenPrototype,
      }),
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  type ShortcutCase = {
    key: string;
    handlerName:
      | 'onGetRandomPrototype'
      | 'onClear'
      | 'onScrollNext'
      | 'onScrollPrev'
      | 'onOpenPrototype';
  };

  const shortcutCases: ShortcutCase[] = [
    // Random prototype
    { key: 'Enter', handlerName: 'onGetRandomPrototype' },
    { key: 'f', handlerName: 'onGetRandomPrototype' },
    { key: 'F', handlerName: 'onGetRandomPrototype' },
    // Clear
    { key: 'r', handlerName: 'onClear' },
    { key: 'R', handlerName: 'onClear' },
    // Scroll next
    { key: 'j', handlerName: 'onScrollNext' },
    { key: 'J', handlerName: 'onScrollNext' },
    { key: 'ArrowDown', handlerName: 'onScrollNext' },
    { key: 'ArrowRight', handlerName: 'onScrollNext' },
    { key: 'd', handlerName: 'onScrollNext' },
    { key: 'D', handlerName: 'onScrollNext' },
    // Scroll prev
    { key: 'k', handlerName: 'onScrollPrev' },
    { key: 'K', handlerName: 'onScrollPrev' },
    { key: 'ArrowUp', handlerName: 'onScrollPrev' },
    { key: 'ArrowLeft', handlerName: 'onScrollPrev' },
    { key: 'a', handlerName: 'onScrollPrev' },
    { key: 'A', handlerName: 'onScrollPrev' },
    // Open prototype
    { key: 'o', handlerName: 'onOpenPrototype' },
    { key: 'O', handlerName: 'onOpenPrototype' },
    { key: 'e', handlerName: 'onOpenPrototype' },
    { key: 'E', handlerName: 'onOpenPrototype' },
  ];

  it.each(shortcutCases)(
    'triggers "%s" mapped to %s',
    ({ key, handlerName }) => {
      setup();

      act(() => {
        triggerKeyDown(key);
      });

      const handlers = {
        onGetRandomPrototype,
        onClear,
        onScrollNext,
        onScrollPrev,
        onOpenPrototype,
      } as const;

      expect(handlers[handlerName]).toHaveBeenCalledTimes(1);
    },
  );

  it('does not trigger shortcuts when typing in input elements', () => {
    setup();

    const input = document.createElement('input');
    document.body.appendChild(input);

    act(() => {
      triggerKeyDown('a', input);
      triggerKeyDown('d', input);
      triggerKeyDown('f', input);
    });

    expect(onScrollPrev).not.toHaveBeenCalled();
    expect(onScrollNext).not.toHaveBeenCalled();
    expect(onGetRandomPrototype).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });
});
