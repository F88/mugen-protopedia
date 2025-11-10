// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React, { useEffect, useRef } from 'react';
import { useScrollingBehavior } from '@/lib/hooks/use-scrolling-behavior';
import type { PrototypeSlot } from '@/lib/hooks/use-prototype-slots';

function TestHarness({
  slots,
  desiredFocusIndex,
}: {
  slots: PrototypeSlot[];
  desiredFocusIndex?: number;
}) {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { currentFocusIndex, setCurrentFocusIndex } = useScrollingBehavior(
    {
      headerRef,
      scrollContainerRef: scrollRef,
      prototypeSlots: slots,
    },
    {
      extraOffset: 16,
    },
  );

  useEffect(() => {
    if (typeof desiredFocusIndex === 'number') {
      setCurrentFocusIndex(desiredFocusIndex);
    }
  }, [desiredFocusIndex, setCurrentFocusIndex]);

  // Expose values via DOM for simple inspection
  return (
    <div>
      <div ref={headerRef} data-testid="header" />
      <div ref={scrollRef} data-testid="scroll" />
      <output data-testid="focus">{currentFocusIndex}</output>
    </div>
  );
}

describe('useScrollingBehavior', () => {
  it('focuses last and scrolls on addition (happy path)', () => {
    const initial: PrototypeSlot[] = [];
    const { rerender, getByTestId } = render(<TestHarness slots={initial} />);
    // add one loading slot
    const slots1: PrototypeSlot[] = [{ id: 1, isLoading: true }];
    rerender(<TestHarness slots={slots1} />);
    // focus should be last index (0)
    const focus = getByTestId('focus').textContent;
    expect(focus).toBe('0');
  });

  it('does not change focus when user moved away from last before load completion (edge)', () => {
    const slots1: PrototypeSlot[] = [
      { id: 1, isLoading: true },
      { id: 2, isLoading: true },
    ];
    const { rerender, getByTestId } = render(<TestHarness slots={slots1} />);
    // user explicitly focuses index 0
    rerender(<TestHarness slots={slots1} desiredFocusIndex={0} />);
    const slots2: PrototypeSlot[] = [
      { id: 1, isLoading: false },
      { id: 2, isLoading: true },
    ];
    rerender(<TestHarness slots={slots2} desiredFocusIndex={0} />);
    const focus = getByTestId('focus').textContent;
    expect(focus).toBe('0');
  });
});
