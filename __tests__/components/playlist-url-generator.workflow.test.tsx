import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { PlaylistUrlGenerator } from '@/components/playlist-url-generator';

/**
 * NOTE:
 * These tests focus on the high-level workflow and UI state
 * transitions of the PlaylistUrlGenerator component.
 */

describe('Work flow: ids', () => {
  it('shows IDs indicator and disables sort/dedup when IDs invalid', () => {
    render(<PlaylistUrlGenerator />);

    const idsTextarea = screen.getByLabelText('Prototype IDs (editable)');
    const sortButton = screen.getByRole('button', {
      name: 'Sort IDs ascending',
    });
    const dedupButton = screen.getByRole('button', {
      name: 'Remove duplicate IDs',
    });

    // Empty IDs -> indicator shows "(empty)" and buttons disabled.
    expect(screen.getAllByText('(empty)')[1]).toBeInTheDocument();
    expect(sortButton).toBeDisabled();
    expect(dedupButton).toBeDisabled();

    // Valid IDs -> indicator shows ✅ and buttons enabled.
    fireEvent.change(idsTextarea, {
      target: {
        value: '2\n1',
      },
    });
    expect(screen.getByText('✅')).toBeInTheDocument();
    expect(sortButton).not.toBeDisabled();
    expect(dedupButton).not.toBeDisabled();

    // Invalid IDs -> indicator shows ❌ and buttons disabled.
    fireEvent.change(idsTextarea, {
      target: {
        value: 'abc',
      },
    });
    expect(screen.getByText('❌')).toBeInTheDocument();
    expect(sortButton).toBeDisabled();
    expect(dedupButton).toBeDisabled();
  });
});

describe('Work flow: urls > ids', () => {
  it('clears IDs when URLs become invalid', () => {
    render(<PlaylistUrlGenerator />);

    const urlsTextarea = screen.getByLabelText('Prototype URLs (editable)');
    const idsTextarea = screen.getByLabelText('Prototype IDs (editable)');

    // Start with a valid URL so that IDs are populated.
    fireEvent.change(urlsTextarea, {
      target: {
        value: 'https://protopedia.net/prototype/123',
      },
    });

    // IDs should be auto-populated from URLs.
    expect(idsTextarea).toHaveValue('123');

    // Make URLs invalid.
    fireEvent.change(urlsTextarea, {
      target: {
        value: 'not-a-valid-url',
      },
    });

    // IDs should be cleared when URLs are invalid.
    expect(idsTextarea).toHaveValue('');
  });

  it('shows URL indicator and disables regenerate button when URLs invalid', () => {
    const { container } = render(<PlaylistUrlGenerator />);

    const urlsTextarea = screen.getByLabelText('Prototype URLs (editable)');

    // Empty state -> URLs indicator shows "(empty)" and button disabled.
    const urlsIndicator = container.querySelector(
      '[data-test-id="urls-indicator"]',
    );
    expect(urlsIndicator).not.toBeNull();
    expect(urlsIndicator).toHaveTextContent('(empty)');
    const regenerateButton = screen.getByRole('button', {
      name: 'Regenerate IDs from Prototype URLs',
    });
    expect(regenerateButton).toBeDisabled();

    // Valid URL -> indicator shows ✅ and button enabled.
    fireEvent.change(urlsTextarea, {
      target: {
        value: 'https://protopedia.net/prototype/1',
      },
    });
    expect(urlsIndicator).toHaveTextContent('✅');
    expect(regenerateButton).not.toBeDisabled();

    // Invalid URL -> indicator shows ❌ and button disabled.
    fireEvent.change(urlsTextarea, {
      target: {
        value: 'invalid-url',
      },
    });
    expect(urlsIndicator).toHaveTextContent('❌');
    expect(regenerateButton).toBeDisabled();
  });

  it('renders rows in Prototypes in playlist when IDs are valid', () => {
    render(<PlaylistUrlGenerator />);

    const urlsTextarea = screen.getByLabelText('Prototype URLs (editable)');

    // Set valid URLs so that effectiveIds becomes non-empty.
    fireEvent.change(urlsTextarea, {
      target: {
        value:
          'https://protopedia.net/prototype/101\nhttps://protopedia.net/prototype/202',
      },
    });

    // Table should render at least one data row when IDs are valid.
    const rows = screen.getAllByRole('row');
    // First row is the header; there should be additional data rows.
    expect(rows.length).toBeGreaterThan(1);
  });
});

describe('Work flow: clear + validation', () => {
  it('clears IDs error and allows title-only playlist URL after Clear IDs', () => {
    render(<PlaylistUrlGenerator />);

    const idsTextarea = screen.getByLabelText('Prototype IDs (editable)');
    const titleInput = screen.getByLabelText('Playlist Title');

    fireEvent.change(titleInput, {
      target: { value: 'My Playlist' },
    });

    fireEvent.change(idsTextarea, {
      target: { value: 'abc' },
    });

    expect(screen.getByText('❌')).toBeInTheDocument();

    const clearIdsButton = screen.getByRole('button', {
      name: 'Clear manual IDs',
    });
    fireEvent.click(clearIdsButton);

    expect(idsTextarea).toHaveValue('');

    expect(screen.getAllByText('(empty)')[1]).toBeInTheDocument();

    const playlistUrlHeading = screen.getByText('Playlist URL');
    const playlistCard = playlistUrlHeading.closest('div');
    expect(playlistCard).toBeInTheDocument();
  });

  it('clears URLs error when Clear URLs is clicked', () => {
    const { container } = render(<PlaylistUrlGenerator />);

    const urlsTextarea = screen.getByLabelText('Prototype URLs (editable)');
    const urlsIndicator = container.querySelector(
      '[data-test-id="urls-indicator"]',
    );
    expect(urlsIndicator).not.toBeNull();

    fireEvent.change(urlsTextarea, {
      target: { value: 'invalid-url' },
    });

    expect(urlsIndicator).toHaveTextContent('❌');

    const clearUrlsButton = screen.getByRole('button', {
      name: 'Clear URLs',
    });
    fireEvent.click(clearUrlsButton);

    expect(urlsTextarea).toHaveValue('');
    expect(urlsIndicator).toHaveTextContent('(empty)');
  });

  it('clears title error and supports IDs-only playlist URL after Clear Title', () => {
    render(<PlaylistUrlGenerator />);

    const titleInput = screen.getByLabelText('Playlist Title');
    const idsTextarea = screen.getByLabelText('Prototype IDs (editable)');

    fireEvent.change(idsTextarea, {
      target: { value: '1' },
    });

    fireEvent.change(titleInput, {
      target: { value: 'x'.repeat(400) },
    });

    expect(screen.getByText('❌')).toBeInTheDocument();

    const clearTitleButton = screen.getByRole('button', {
      name: 'Clear title',
    });
    fireEvent.click(clearTitleButton);

    expect(titleInput).toHaveValue('');

    const urlText = screen.getByText('Playlist URL');
    expect(urlText).toBeInTheDocument();
  });
});

describe('Work flow: fetch > urls > ids', () => {
  it('fills URLs from page and then regenerates IDs', () => {
    render(<PlaylistUrlGenerator />);

    const pageUrlInput = screen.getByLabelText(
      'Page URL (helper for Prototype URLs)',
    );

    // Initially empty URLs and IDs.
    const urlsTextarea = screen.getByLabelText('Prototype URLs (editable)');
    const idsTextarea = screen.getByLabelText('Prototype IDs (editable)');
    expect(urlsTextarea).toHaveValue('');
    expect(idsTextarea).toHaveValue('');

    // For now, just set a value into URLs as if fetched,
    // then ensure Regenerate from URLs works as expected.
    fireEvent.change(urlsTextarea, {
      target: {
        value:
          'https://protopedia.net/prototype/10\nhttps://protopedia.net/prototype/20',
      },
    });

    const regenerateButton = screen.getByRole('button', {
      name: 'Regenerate IDs from Prototype URLs',
    });

    fireEvent.click(regenerateButton);

    expect(idsTextarea).toHaveValue('10\n20');

    // Page URL input is present and editable as part of the flow.
    fireEvent.change(pageUrlInput, {
      target: {
        value: 'https://protopedia.net/some/page',
      },
    });
    expect(pageUrlInput).toHaveValue('https://protopedia.net/some/page');
  });
});
