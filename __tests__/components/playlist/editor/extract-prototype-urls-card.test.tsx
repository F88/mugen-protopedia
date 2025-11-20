import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ExtractPrototypeUrlsCard } from '@/components/playlist/editor/extract-prototype-urls-card';

function setup() {
  const onFetch = vi
    .fn<(url: string) => Promise<string>>()
    .mockResolvedValue(
      '<html><head><title>Page</title></head><body>https://protopedia.net/prototype/1</body></html>',
    );
  const onUrlsExtracted = vi.fn<(urls: string[]) => void>();
  const onTitleExtracted = vi.fn<(title: string | null) => void>();

  let url = '';
  let error: string | null = null;

  const setUrl = (value: string) => {
    url = value;
  };
  const setError = (value: string | null) => {
    error = value;
  };

  const result = render(
    <ExtractPrototypeUrlsCard
      source={{ url, setUrl, error, setError }}
      isFetching={false}
      onFetch={onFetch}
      onUrlsExtracted={onUrlsExtracted}
      onTitleExtracted={onTitleExtracted}
    />,
  );

  return {
    ...result,
    onFetch,
    onUrlsExtracted,
    onTitleExtracted,
  };
}

describe('ExtractPrototypeUrlsCard', () => {
  it('disables Fetch button when URL is empty', () => {
    setup();

    const accordionTrigger = screen.getByRole('button', {
      name: /Advanced: extract prototype URLs from an existing page or raw content/i,
    });
    fireEvent.click(accordionTrigger);

    const fetchButton = screen.getByRole('button', {
      name: 'Fetch prototype URLs from page',
    });

    expect(fetchButton).toBeDisabled();
  });

  it('validates page URL and disables Fetch button when invalid', () => {
    setup();

    const accordionTrigger = screen.getByRole('button', {
      name: /Advanced: extract prototype URLs from an existing page or raw content/i,
    });
    fireEvent.click(accordionTrigger);

    const pageUrlInput = screen.getByLabelText('Page URL');
    const fetchButton = screen.getByRole('button', {
      name: 'Fetch prototype URLs from page',
    });

    fireEvent.change(pageUrlInput, { target: { value: 'not-a-url' } });

    expect(fetchButton).toBeDisabled();
  });

  it('extracts URLs from raw content and shows count', () => {
    setup();

    const accordionTrigger = screen.getByRole('button', {
      name: /Advanced: extract prototype URLs from an existing page or raw content/i,
    });
    fireEvent.click(accordionTrigger);

    const textarea = screen.getByLabelText(
      'Raw content (for example HTML, CSV, TSV)',
    );
    const extractButton = screen.getByRole('button', {
      name: 'Extract URLs from raw content',
    });

    fireEvent.change(textarea, {
      target: {
        value:
          'https://protopedia.net/prototype/1\nhttps://protopedia.net/prototype/2',
      },
    });

    fireEvent.click(extractButton);

    expect(
      screen.getByText(/Last extraction: 2 URLs found\./i),
    ).toBeInTheDocument();
  });

  it('shows error when no URLs are found in raw content', () => {
    setup();

    const accordionTrigger = screen.getByRole('button', {
      name: /Advanced: extract prototype URLs from an existing page or raw content/i,
    });
    fireEvent.click(accordionTrigger);

    const textarea = screen.getByLabelText(
      'Raw content (for example HTML, CSV, TSV)',
    );
    const extractButton = screen.getByRole('button', {
      name: 'Extract URLs from raw content',
    });

    fireEvent.change(textarea, {
      target: { value: 'no urls here' },
    });

    fireEvent.click(extractButton);

    expect(
      screen.getByText(
        /No ProtoPedia prototype URLs were found in the content/i,
      ),
    ).toBeInTheDocument();
  });

  it('fetches page and extracts URLs and title when URL is valid', async () => {
    const { onFetch, onUrlsExtracted, onTitleExtracted } = setup();

    const accordionTrigger = screen.getByRole('button', {
      name: /Advanced: extract prototype URLs from an existing page or raw content/i,
    });
    fireEvent.click(accordionTrigger);

    const pageUrlInput = screen.getByLabelText('Page URL');
    const fetchButton = screen.getByRole('button', {
      name: 'Fetch prototype URLs from page',
    });

    fireEvent.change(pageUrlInput, {
      target: { value: 'https://protopedia.net/some/page' },
    });

    expect(fetchButton).not.toBeDisabled();

    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(onFetch).toHaveBeenCalledWith('https://protopedia.net/some/page');
    });

    await waitFor(() => {
      expect(onUrlsExtracted).toHaveBeenCalled();
      expect(onTitleExtracted).toHaveBeenCalledWith('Page');
    });
  });
});
