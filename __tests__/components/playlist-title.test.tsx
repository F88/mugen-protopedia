import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  PlaylistTitle,
  PLAYLIST_TITLE_MAX_LENGTH,
} from '../../components/playlist-title';

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
      name: /My Awesome Playlist/,
    });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveAccessibleName(`❓ ${title}`);
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
      name: new RegExp(escapeRegExp(truncatedTitle)),
    });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveAccessibleName(`❓ ${truncatedTitle}`);
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
    expect(headingElement).toHaveAccessibleName(`❓ ${exactLengthTitle}`);
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
      name: new RegExp(`${escapeRegExp(truncatedTitle)} \\(2 / 5\\)`),
    });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveAccessibleName(`▶️ ${truncatedTitle} (2 / 5)`);
    expect(screen.getByText('▶️')).toBeInTheDocument();
    expect(screen.getByText('(2 / 5)')).toBeInTheDocument();
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
      name: new RegExp(`${escapeRegExp(title)} \\(1 / 3\\)`),
    });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveAccessibleName(`⏸️ ${title} (1 / 3)`);
    expect(screen.getByText('⏸️')).toBeInTheDocument();
    expect(screen.getByText('(1 / 3)')).toBeInTheDocument();
  });

  it('falls back to default label when title is missing', () => {
    render(<PlaylistTitle ids={[]} processedCount={0} totalCount={0} />);

    const headingElement = screen.getByRole('heading', {
      name: /Playlist/,
    });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveAccessibleName('❓ Playlist');
    expect(screen.getByText('❓')).toBeInTheDocument();
  });

  it('shows progress with the default label when title is missing', () => {
    render(<PlaylistTitle ids={[7]} processedCount={0} totalCount={1} />);

    const headingElement = screen.getByRole('heading', {
      name: /Playlist \(0 \/ 1\)/,
    });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveAccessibleName('⏸️ Playlist (0 / 1)');
    expect(screen.getByText('⏸️')).toBeInTheDocument();
    expect(screen.getByText('(0 / 1)')).toBeInTheDocument();
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
      name: new RegExp(escapeRegExp(specialTitle)),
    });
    expect(headingElement).toBeInTheDocument();
    expect(headingElement).toHaveAccessibleName(`❓ ${specialTitle}`);
  });

  it('shows completed status when all items processed', () => {
    render(<PlaylistTitle ids={[1, 2]} processedCount={2} totalCount={2} />);

    expect(screen.getByText('📋')).toBeInTheDocument();
    const headingElement = screen.getByRole('heading', {
      name: /Playlist \(2 \/ 2\)/,
    });
    expect(headingElement).toHaveAccessibleName('📋 Playlist (2 / 2)');
  });
});
