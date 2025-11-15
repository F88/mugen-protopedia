// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PrototypeContainer } from '@/components/prototype/prototype-container';

describe('PrototypeContainer', () => {
  it('renders skeleton when isLoading is true', () => {
    const { container } = render(<PrototypeContainer isLoading />);
    // Check for skeleton animation classes
    const animatedBlocks = container.querySelectorAll(
      '[class*="skeleton-"], .skeleton-shimmer, .skeleton-pulse, .skeleton-twinkle, .skeleton-wave, .skeleton-bounce, .skeleton-slide, .skeleton-shuffle, .skeleton-explode, .skeleton-cascade, .skeleton-orbit, .skeleton-spin, .skeleton-rainbow',
    );
    expect(animatedBlocks.length).toBeGreaterThan(0);
  });

  it('renders skeleton when prototype is null', () => {
    const { container } = render(<PrototypeContainer prototype={undefined} />);
    // Check for skeleton animation classes
    const animatedBlocks = container.querySelectorAll(
      '[class*="skeleton-"], .skeleton-shimmer, .skeleton-pulse, .skeleton-twinkle, .skeleton-wave, .skeleton-bounce, .skeleton-slide, .skeleton-shuffle, .skeleton-explode, .skeleton-cascade, .skeleton-orbit, .skeleton-spin, .skeleton-rainbow',
    );
    expect(animatedBlocks.length).toBeGreaterThan(0);
  });

  it('renders error message on skeleton when errorMessage is provided', () => {
    const errorMsg = 'Not found.';
    const { getByText } = render(
      <PrototypeContainer errorMessage={errorMsg} />,
    );
    expect(getByText(errorMsg)).toBeDefined();
  });

  it('disables animations when errorMessage is provided', () => {
    const errorMsg = 'Not found.';
    const { container } = render(
      <PrototypeContainer errorMessage={errorMsg} />,
    );
    
    // When there's an error, animations should be disabled
    // Check that NO animation classes are present
    const shimmerBlocks = container.querySelectorAll('.skeleton-shimmer');
    const pulseBlocks = container.querySelectorAll('.skeleton-pulse');
    const twinkleBlocks = container.querySelectorAll('.skeleton-twinkle');
    const waveBlocks = container.querySelectorAll('.skeleton-wave');
    const bounceBlocks = container.querySelectorAll('.skeleton-bounce');
    const slideBlocks = container.querySelectorAll('.skeleton-slide');
    const shuffleBlocks = container.querySelectorAll('.skeleton-shuffle');
    const explodeBlocks = container.querySelectorAll('.skeleton-explode');
    const cascadeBlocks = container.querySelectorAll('.skeleton-cascade');
    const orbitBlocks = container.querySelectorAll('.skeleton-orbit');
    const spinBlocks = container.querySelectorAll('.skeleton-spin');
    const rainbowBlocks = container.querySelectorAll('.skeleton-rainbow');
    
    expect(shimmerBlocks.length).toBe(0);
    expect(pulseBlocks.length).toBe(0);
    expect(twinkleBlocks.length).toBe(0);
    expect(waveBlocks.length).toBe(0);
    expect(bounceBlocks.length).toBe(0);
    expect(slideBlocks.length).toBe(0);
    expect(shuffleBlocks.length).toBe(0);
    expect(explodeBlocks.length).toBe(0);
    expect(cascadeBlocks.length).toBe(0);
    expect(orbitBlocks.length).toBe(0);
    expect(spinBlocks.length).toBe(0);
    expect(rainbowBlocks.length).toBe(0);
  });

  it('shows animations when loading without error', () => {
    const { container } = render(<PrototypeContainer isLoading />);
    
    // When loading without error, animations should be enabled
    const animatedBlocks = container.querySelectorAll(
      '.skeleton-shimmer, .skeleton-pulse, .skeleton-twinkle, .skeleton-wave, .skeleton-bounce, .skeleton-slide, .skeleton-shuffle, .skeleton-explode, .skeleton-cascade, .skeleton-orbit, .skeleton-spin, .skeleton-rainbow',
    );
    expect(animatedBlocks.length).toBeGreaterThan(0);
  });
});
