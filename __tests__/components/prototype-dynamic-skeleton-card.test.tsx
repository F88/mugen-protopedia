// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PrototypeDynamicSkeletonCard } from '@/components/prototype/prototype-dynamic-skeleton-card';

describe('PrototypeDynamicSkeletonCard', () => {
  it('renders with default shuffle variant', () => {
    const { container } = render(<PrototypeDynamicSkeletonCard />);
    const skeletonBlocks = container.querySelectorAll('.skeleton-shuffle');
    expect(skeletonBlocks.length).toBeGreaterThan(0);
  });

  it('renders with explode variant', () => {
    const { container } = render(
      <PrototypeDynamicSkeletonCard variant="explode" />,
    );
    const skeletonBlocks = container.querySelectorAll('.skeleton-explode');
    expect(skeletonBlocks.length).toBeGreaterThan(0);
  });

  it('renders with cascade variant', () => {
    const { container } = render(
      <PrototypeDynamicSkeletonCard variant="cascade" />,
    );
    const skeletonBlocks = container.querySelectorAll('.skeleton-cascade');
    expect(skeletonBlocks.length).toBeGreaterThan(0);
  });

  it('renders without animations when disableAnimation is true', () => {
    const { container } = render(
      <PrototypeDynamicSkeletonCard disableAnimation />,
    );
    const shuffleBlocks = container.querySelectorAll('.skeleton-shuffle');
    const explodeBlocks = container.querySelectorAll('.skeleton-explode');
    const cascadeBlocks = container.querySelectorAll('.skeleton-cascade');
    expect(shuffleBlocks.length).toBe(0);
    expect(explodeBlocks.length).toBe(0);
    expect(cascadeBlocks.length).toBe(0);
  });

  it('renders error message when provided', () => {
    const errorMsg = 'Failed to load';
    const { getByText } = render(
      <PrototypeDynamicSkeletonCard errorMessage={errorMsg} />,
    );
    expect(getByText(errorMsg)).toBeDefined();
  });

  it('applies focus styling when isFocused is true', () => {
    const { container } = render(<PrototypeDynamicSkeletonCard isFocused />);
    const card = container.querySelector('[data-selected="true"]');
    expect(card).not.toBeNull();
    expect(card?.getAttribute('aria-selected')).toBe('true');
  });

  it('does not apply focus styling when isFocused is false', () => {
    const { container } = render(
      <PrototypeDynamicSkeletonCard isFocused={false} />,
    );
    const card = container.querySelector('[data-selected="false"]');
    expect(card).not.toBeNull();
    expect(card?.getAttribute('aria-selected')).toBe('false');
  });

  it('combines variant and disableAnimation props correctly', () => {
    const { container } = render(
      <PrototypeDynamicSkeletonCard variant="cascade" disableAnimation />,
    );
    // When animation is disabled, variant classes should not be present
    const cascadeBlocks = container.querySelectorAll('.skeleton-cascade');
    expect(cascadeBlocks.length).toBe(0);
  });

  it('renders all skeleton blocks for complete card structure', () => {
    const { container } = render(<PrototypeDynamicSkeletonCard />);
    // Check that multiple skeleton blocks are rendered
    const allDivs = container.querySelectorAll('div');
    expect(allDivs.length).toBeGreaterThan(10);
  });

  it('renders with random variant when randomVariant is true', () => {
    const { container } = render(
      <PrototypeDynamicSkeletonCard randomVariant />,
    );
    // Should render one of the dynamic animation variants
    const shuffleBlocks = container.querySelectorAll('.skeleton-shuffle');
    const explodeBlocks = container.querySelectorAll('.skeleton-explode');
    const cascadeBlocks = container.querySelectorAll('.skeleton-cascade');
    const orbitBlocks = container.querySelectorAll('.skeleton-orbit');
    const spinBlocks = container.querySelectorAll('.skeleton-spin');
    const rainbowBlocks = container.querySelectorAll('.skeleton-rainbow');
    const totalAnimatedBlocks =
      shuffleBlocks.length +
      explodeBlocks.length +
      cascadeBlocks.length +
      orbitBlocks.length +
      spinBlocks.length +
      rainbowBlocks.length;
    expect(totalAnimatedBlocks).toBeGreaterThan(0);
  });

  it('randomVariant overrides variant prop', () => {
    const { container } = render(
      <PrototypeDynamicSkeletonCard variant="shuffle" randomVariant />,
    );
    // Should use random variant, not the specified shuffle
    // We can't predict which one, but it should have animation blocks
    const shuffleBlocks = container.querySelectorAll('.skeleton-shuffle');
    const explodeBlocks = container.querySelectorAll('.skeleton-explode');
    const cascadeBlocks = container.querySelectorAll('.skeleton-cascade');
    const orbitBlocks = container.querySelectorAll('.skeleton-orbit');
    const spinBlocks = container.querySelectorAll('.skeleton-spin');
    const rainbowBlocks = container.querySelectorAll('.skeleton-rainbow');
    const totalAnimatedBlocks =
      shuffleBlocks.length +
      explodeBlocks.length +
      cascadeBlocks.length +
      orbitBlocks.length +
      spinBlocks.length +
      rainbowBlocks.length;
    expect(totalAnimatedBlocks).toBeGreaterThan(0);
  });
});
