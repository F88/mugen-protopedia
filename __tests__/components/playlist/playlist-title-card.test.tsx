import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlaylistTitleCard } from '@/components/playlist/playlist-title';

describe('PlaylistTitleCard', () => {
  const defaultProps = {
    ids: [1, 2, 3],
    title: 'Test Playlist',
    processedCount: 0,
    totalCount: 3,
  };

  it('renders playlist badge', () => {
    render(<PlaylistTitleCard {...defaultProps} />);
    expect(screen.getByText('Playlist')).toBeDefined();
  });

  it('displays item count', () => {
    render(<PlaylistTitleCard {...defaultProps} />);
    expect(screen.getByText('3 items')).toBeDefined();
  });

  it('displays singular item count when totalCount is 1', () => {
    render(<PlaylistTitleCard {...defaultProps} totalCount={1} />);
    expect(screen.getByText('1 item')).toBeDefined();
  });

  it('renders the title', () => {
    render(<PlaylistTitleCard {...defaultProps} />);
    expect(screen.getByText('Test Playlist')).toBeDefined();
  });

  it('renders progress bar when playing', () => {
    render(<PlaylistTitleCard {...defaultProps} isPlaying={true} />);
    expect(screen.getByRole('progressbar')).toBeDefined();
  });

  it('does not render progress bar when not playing', () => {
    render(<PlaylistTitleCard {...defaultProps} isPlaying={false} />);
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('shows 0% progress when not started', () => {
    render(
      <PlaylistTitleCard
        {...defaultProps}
        processedCount={0}
        isPlaying={true}
      />,
    );
    const progress = screen.getByRole('progressbar');
    expect(progress.getAttribute('aria-valuenow')).toBe('0');
  });

  it('shows correct progress percentage', () => {
    render(
      <PlaylistTitleCard
        {...defaultProps}
        processedCount={1}
        totalCount={3}
        isPlaying={true}
      />,
    );
    const progress = screen.getByRole('progressbar');
    expect(progress.getAttribute('aria-valuenow')).toBe(String((1 / 3) * 100));
  });

  it('shows 100% progress when completed', () => {
    render(
      <PlaylistTitleCard
        {...defaultProps}
        processedCount={3}
        isPlaying={true}
        isCompleted={true}
      />,
    );
    const progress = screen.getByRole('progressbar');
    expect(progress.getAttribute('aria-valuenow')).toBe('100');
  });

  it('truncates long titles', () => {
    const longTitle = 'A'.repeat(150);
    render(<PlaylistTitleCard {...defaultProps} title={longTitle} />);
    const titleElement = screen.getByRole('heading');
    expect(titleElement.textContent).not.toBe(longTitle);
    expect(titleElement.textContent?.length).toBeLessThan(longTitle.length);
  });

  it('renders without title', () => {
    render(<PlaylistTitleCard {...defaultProps} title={undefined} />);
    expect(screen.getByText('Playlist')).toBeDefined();
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PlaylistTitleCard {...defaultProps} className="custom-class" />,
    );
    const card = container.querySelector('.custom-class');
    expect(card).not.toBeNull();
  });

  it('clamps processedCount to totalCount', () => {
    render(
      <PlaylistTitleCard
        {...defaultProps}
        processedCount={5}
        totalCount={3}
        isPlaying={true}
      />,
    );
    const progress = screen.getByRole('progressbar');
    expect(progress.getAttribute('aria-valuenow')).toBe('100');
  });

  it('handles negative processedCount', () => {
    render(
      <PlaylistTitleCard
        {...defaultProps}
        processedCount={-1}
        totalCount={3}
        isPlaying={true}
      />,
    );
    const progress = screen.getByRole('progressbar');
    expect(progress.getAttribute('aria-valuenow')).toBe('0');
  });

  it('handles zero totalCount', () => {
    render(
      <PlaylistTitleCard {...defaultProps} totalCount={0} isPlaying={true} />,
    );
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  describe('variant', () => {
    it('variant prop is optional and defaults to default', () => {
      render(<PlaylistTitleCard {...defaultProps} />);
      expect(screen.getByText('Playlist')).toBeDefined();
    });

    it('renders with default variant', () => {
      render(<PlaylistTitleCard {...defaultProps} variant="default" />);
      expect(screen.getByText('Playlist')).toBeDefined();
    });

    it('renders with frame variant', () => {
      render(<PlaylistTitleCard {...defaultProps} variant="frame" />);
      expect(screen.getByText('Playlist')).toBeDefined();
    });

    it('renders with cyberpunk variant', () => {
      render(<PlaylistTitleCard {...defaultProps} variant="cyberpunk" />);
      expect(screen.getByText('Playlist')).toBeDefined();
    });

    it('renders with anime variant', () => {
      render(<PlaylistTitleCard {...defaultProps} variant="anime" />);
      expect(screen.getByText('Playlist')).toBeDefined();
    });

    it('renders with retro variant', () => {
      render(<PlaylistTitleCard {...defaultProps} variant="retro" />);
      expect(screen.getByText('Playlist')).toBeDefined();
    });

    it('renders with elegant variant', () => {
      render(<PlaylistTitleCard {...defaultProps} variant="elegant" />);
      expect(screen.getByText('Playlist')).toBeDefined();
    });

    it('renders with space variant', () => {
      render(<PlaylistTitleCard {...defaultProps} variant="space" />);
      expect(screen.getByText('Playlist')).toBeDefined();
    });
  });
});
