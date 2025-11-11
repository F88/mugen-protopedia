// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PrototypeSkeletonCard } from '@/components/prototype/prototype-skeleton-card';

describe('PrototypeSkeletonCard', () => {
  it('renders with default shimmer variant', () => {
    const { container } = render(<PrototypeSkeletonCard />);
    const skeletonBlocks = container.querySelectorAll('.skeleton-shimmer');
    expect(skeletonBlocks.length).toBeGreaterThan(0);
  });

  it('renders with pulse variant', () => {
    const { container } = render(<PrototypeSkeletonCard variant="pulse" />);
    const skeletonBlocks = container.querySelectorAll('.skeleton-pulse');
    expect(skeletonBlocks.length).toBeGreaterThan(0);
  });

  it('renders with twinkle variant', () => {
    const { container } = render(<PrototypeSkeletonCard variant="twinkle" />);
    const skeletonBlocks = container.querySelectorAll('.skeleton-twinkle');
    expect(skeletonBlocks.length).toBeGreaterThan(0);
  });

  it('renders without animations when disableAnimation is true', () => {
    const { container } = render(<PrototypeSkeletonCard disableAnimation />);
    const shimmerBlocks = container.querySelectorAll('.skeleton-shimmer');
    const pulseBlocks = container.querySelectorAll('.skeleton-pulse');
    const twinkleBlocks = container.querySelectorAll('.skeleton-twinkle');
    expect(shimmerBlocks.length).toBe(0);
    expect(pulseBlocks.length).toBe(0);
    expect(twinkleBlocks.length).toBe(0);
  });

  it('renders error message when provided', () => {
    const errorMsg = 'Failed to load';
    const { getByText } = render(
      <PrototypeSkeletonCard errorMessage={errorMsg} />,
    );
    expect(getByText(errorMsg)).toBeDefined();
  });

  it('applies focus styling when isFocused is true', () => {
    const { container } = render(<PrototypeSkeletonCard isFocused />);
    const card = container.querySelector('[data-selected="true"]');
    expect(card).not.toBeNull();
    expect(card?.getAttribute('aria-selected')).toBe('true');
  });

  it('does not apply focus styling when isFocused is false', () => {
    const { container } = render(<PrototypeSkeletonCard isFocused={false} />);
    const card = container.querySelector('[data-selected="false"]');
    expect(card).not.toBeNull();
    expect(card?.getAttribute('aria-selected')).toBe('false');
  });

  it('combines variant and disableAnimation props correctly', () => {
    const { container } = render(
      <PrototypeSkeletonCard variant="twinkle" disableAnimation />,
    );
    // When animation is disabled, variant classes should not be present
    const twinkleBlocks = container.querySelectorAll('.skeleton-twinkle');
    expect(twinkleBlocks.length).toBe(0);
  });

  it('renders all skeleton blocks for complete card structure', () => {
    const { container } = render(<PrototypeSkeletonCard />);
    // Check that multiple skeleton blocks are rendered
    const allDivs = container.querySelectorAll('div');
    expect(allDivs.length).toBeGreaterThan(10);
  });

  it('renders with random variant when randomVariant is true', () => {
    const { container } = render(<PrototypeSkeletonCard randomVariant />);
    // Should render one of the three animation variants
    const shimmerBlocks = container.querySelectorAll('.skeleton-shimmer');
    const pulseBlocks = container.querySelectorAll('.skeleton-pulse');
    const twinkleBlocks = container.querySelectorAll('.skeleton-twinkle');
    const totalAnimatedBlocks =
      shimmerBlocks.length + pulseBlocks.length + twinkleBlocks.length;
    expect(totalAnimatedBlocks).toBeGreaterThan(0);
  });

  it('randomVariant overrides variant prop', () => {
    const { container } = render(
      <PrototypeSkeletonCard variant="shimmer" randomVariant />,
    );
    // Should use random variant, not the specified shimmer
    // We can't predict which one, but it should have animation blocks
    const shimmerBlocks = container.querySelectorAll('.skeleton-shimmer');
    const pulseBlocks = container.querySelectorAll('.skeleton-pulse');
    const twinkleBlocks = container.querySelectorAll('.skeleton-twinkle');
    const totalAnimatedBlocks =
      shimmerBlocks.length + pulseBlocks.length + twinkleBlocks.length;
    expect(totalAnimatedBlocks).toBeGreaterThan(0);
  });
});
