import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  PlaylistTitle,
  PLAYLIST_TITLE_MAX_LENGTH,
} from '../../components/playlist-title';

describe('PlaylistTitle', () => {
  it('renders the title when within the limit', () => {
    const title = 'My Awesome Playlist';
    render(
      <PlaylistTitle
        ids={[]}
        title={title}
        processedCount={0}
        totalCount={0}
      />,
    );

    const headingElement = screen.getByRole('heading', {
      name: title,
    });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveAccessibleName(title);
    expect(
      screen.queryByTestId('playlist-status-icon'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('progressbar', { name: 'Playlist progress' }),
    ).not.toBeInTheDocument();
  });

  it('truncates a title that exceeds the limit', () => {
    const longTitle = 'A'.repeat(PLAYLIST_TITLE_MAX_LENGTH + 50);
    const truncatedTitle = `${longTitle.substring(0, PLAYLIST_TITLE_MAX_LENGTH)}...`;
    render(
      <PlaylistTitle
        ids={[]}
        title={longTitle}
        processedCount={0}
        totalCount={0}
      />,
    );

    const headingElement = screen.getByRole('heading', {
      name: truncatedTitle,
    });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveAccessibleName(truncatedTitle);
    expect(
      screen.queryByTestId('playlist-status-icon'),
    ).not.toBeInTheDocument();
    expect(screen.getByText(truncatedTitle)).toHaveAttribute(
      'title',
      longTitle,
    );
    expect(
      screen.queryByRole('progressbar', { name: 'Playlist progress' }),
    ).not.toBeInTheDocument();
  });

  it('does not truncate a title that meets the limit', () => {
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
    expect(headingElement).toHaveAccessibleName(exactLengthTitle);
    expect(
      screen.queryByTestId('playlist-status-icon'),
    ).not.toBeInTheDocument();
    expect(screen.getByText(exactLengthTitle)).not.toHaveAttribute('title');
    expect(
      screen.queryByRole('progressbar', { name: 'Playlist progress' }),
    ).not.toBeInTheDocument();
  });

  it('shows truncated title and progress while playing', () => {
    const longTitle = 'C'.repeat(PLAYLIST_TITLE_MAX_LENGTH + 10);
    const truncatedTitle = `${longTitle.substring(0, PLAYLIST_TITLE_MAX_LENGTH)}...`;
    render(
      <PlaylistTitle
        ids={[10, 20, 30]}
        title={longTitle}
        processedCount={2}
        totalCount={5}
        isPlaying
      />,
    );

    const headingElement = screen.getByRole('heading', {
      name: truncatedTitle,
    });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveAccessibleName(truncatedTitle);
    expect(
      screen.queryByTestId('playlist-status-icon'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('(2 / 5)')).not.toBeInTheDocument();
    expect(screen.getByText(truncatedTitle)).toHaveAttribute(
      'title',
      longTitle,
    );
    const playingProgress = screen.getByRole('progressbar', {
      name: 'Playlist progress',
    });
    expect(playingProgress).toBeInTheDocument();
    expect(Number(playingProgress.getAttribute('aria-valuenow'))).toBeCloseTo(
      40,
    );
  });

  it('shows progress when ids are provided', () => {
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
      name: title,
    });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveAccessibleName(title);
    expect(
      screen.queryByTestId('playlist-status-icon'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('(3)')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('progressbar', { name: 'Playlist progress' }),
    ).not.toBeInTheDocument();
  });

  it('hides progress text when total count is zero', () => {
    const title = 'No Progress Yet';
    render(
      <PlaylistTitle
        ids={[]}
        title={title}
        processedCount={0}
        totalCount={0}
      />,
    );

    expect(
      screen.getByRole('heading', {
        name: title,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText('(0)')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('playlist-status-icon'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('progressbar', { name: 'Playlist progress' }),
    ).not.toBeInTheDocument();
  });

  it('falls back to default label when title is missing', () => {
    render(<PlaylistTitle ids={[]} processedCount={0} totalCount={0} />);

    expect(
      screen.queryByRole('heading', {
        name: 'Playlist',
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Playlist')).toBeInTheDocument();
    expect(
      screen.queryByTestId('playlist-status-icon'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('progressbar', { name: 'Playlist progress' }),
    ).not.toBeInTheDocument();
  });

  it('shows progress with the default label when title is missing', () => {
    render(<PlaylistTitle ids={[7]} processedCount={0} totalCount={1} />);

    expect(
      screen.queryByRole('heading', {
        name: 'Playlist',
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Playlist')).toBeInTheDocument();
    expect(
      screen.queryByTestId('playlist-status-icon'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('(1)')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('progressbar', { name: 'Playlist progress' }),
    ).not.toBeInTheDocument();
  });

  it('renders special characters in the title', () => {
    const specialTitle = 'Playlist with special characters: !@#$%^&*()_+';
    render(
      <PlaylistTitle
        ids={[]}
        title={specialTitle}
        processedCount={0}
        totalCount={0}
      />,
    );

    const headingElement = screen.getByRole('heading', {
      name: specialTitle,
    });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveAccessibleName(specialTitle);
    expect(
      screen.queryByTestId('playlist-status-icon'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('progressbar', { name: 'Playlist progress' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(specialTitle)).not.toHaveAttribute('title');
  });

  it('shows completed status when all items processed', () => {
    render(<PlaylistTitle ids={[1, 2]} processedCount={2} totalCount={2} />);

    expect(
      screen.queryByRole('heading', {
        name: 'Playlist',
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Playlist')).toBeInTheDocument();
    expect(
      screen.queryByTestId('playlist-status-icon'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('(2)')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('progressbar', { name: 'Playlist progress' }),
    ).not.toBeInTheDocument();
  });
});
