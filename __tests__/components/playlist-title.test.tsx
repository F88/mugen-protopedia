import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  PlaylistTitle,
  PLAYLIST_TITLE_MAX_LENGTH,
} from '@/components/playlist-title';

describe('PlaylistTitle', () => {
  it('should render the title when within the limit', () => {
    const title = 'My Awesome Playlist';
    render(
      <PlaylistTitle
        ids={[]}
        title={title}
        processedCount={0}
        totalCount={0}
      />,
    );
    const headingElement = screen.getByRole('heading', { name: title });
    expect(headingElement).toBeInTheDocument();
  });

  it('should truncate a title that exceeds the limit', () => {
    const longTitle = 'A'.repeat(PLAYLIST_TITLE_MAX_LENGTH + 50);
    const expectedTitle = `${longTitle.substring(0, PLAYLIST_TITLE_MAX_LENGTH)}...`;
    render(
      <PlaylistTitle
        ids={[]}
        title={longTitle}
        processedCount={0}
        totalCount={0}
      />,
    );
    const headingElement = screen.getByRole('heading', { name: expectedTitle });
    expect(headingElement).toBeInTheDocument();
  });

  it('should not truncate a title that exactly meets the limit', () => {
    const exactLengthTitle = 'B'.repeat(PLAYLIST_TITLE_MAX_LENGTH);
    render(
      <PlaylistTitle
        ids={[]}
        title={exactLengthTitle}
        processedCount={0}
        totalCount={0}
      />,
    );
    const headingElement = screen.getByRole('heading', {
      name: exactLengthTitle,
    });
    expect(headingElement).toBeInTheDocument();
  });

  it('should append progress to a truncated title', () => {
    const longTitle = 'C'.repeat(PLAYLIST_TITLE_MAX_LENGTH + 10);
    const expectedTitle = `${longTitle.substring(0, PLAYLIST_TITLE_MAX_LENGTH)}... (2 / 5)`;
    render(
      <PlaylistTitle
        ids={[10, 20, 30]}
        title={longTitle}
        processedCount={2}
        totalCount={5}
      />,
    );
    const headingElement = screen.getByRole('heading', { name: expectedTitle });
    expect(headingElement).toBeInTheDocument();
  });

  it('should show progress when ids are provided', () => {
    const title = 'Progress Playlist';
    render(
      <PlaylistTitle
        ids={[1, 2, 3]}
        title={title}
        processedCount={1}
        totalCount={3}
      />,
    );
    const headingElement = screen.getByRole('heading', {
      name: `${title} (1 / 3)`,
    });
    expect(headingElement).toBeInTheDocument();
  });

  it('should fall back to default label when title is missing', () => {
    render(<PlaylistTitle ids={[]} processedCount={0} totalCount={0} />);
    const headingElement = screen.getByRole('heading', { name: 'Playlist' });
    expect(headingElement).toBeInTheDocument();
  });

  it('should show progress with the default label when title is missing', () => {
    render(<PlaylistTitle ids={[7]} processedCount={0} totalCount={1} />);
    const headingElement = screen.getByRole('heading', {
      name: 'Playlist (0 / 1)',
    });
    expect(headingElement).toBeInTheDocument();
  });

  it('should render with special characters in the title', () => {
    const specialTitle = 'Playlist with special characters: !@#$%^&*()_+';
    render(
      <PlaylistTitle
        ids={[]}
        title={specialTitle}
        processedCount={0}
        totalCount={0}
      />,
    );
    const headingElement = screen.getByRole('heading', { name: specialTitle });
    expect(headingElement).toBeInTheDocument();
  });
});
