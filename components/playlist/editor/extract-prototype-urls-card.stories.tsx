import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';

import { ExtractPrototypeUrlsCard } from './extract-prototype-urls-card';

const meta = {
  title: 'Components/Playlist/ExtractPrototypeUrlsCard',
  component: ExtractPrototypeUrlsCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExtractPrototypeUrlsCard>;

export default meta;

type Story = StoryObj<typeof meta>;

type ExtractCardProps = React.ComponentProps<typeof ExtractPrototypeUrlsCard>;

function Wrapper(props: Partial<ExtractCardProps>) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [extractedUrls, setExtractedUrls] = useState<string[]>([]);
  const [title, setTitle] = useState<string | null>(null);

  const baseProps: ExtractCardProps = {
    source: {
      url,
      setUrl,
      error,
      setError,
    },
    isFetching: false,
    onFetch: async () =>
      '<html><head><title>Sample page</title></head><body>https://protopedia.net/prototype/1</body></html>',
    onUrlsExtracted: (urls) => {
      setExtractedUrls(urls);
    },
    onTitleExtracted: (nextTitle) => {
      setTitle(nextTitle);
    },
  };

  const mergedProps: ExtractCardProps = {
    ...baseProps,
    ...props,
    source: {
      ...baseProps.source,
      ...(props.source ?? {}),
    },
  };

  return (
    <div className="max-w-3xl w-full">
      <ExtractPrototypeUrlsCard {...mergedProps} />
      <div className="mt-4 space-y-1 text-xs text-muted-foreground">
        <div>
          <span className="font-semibold">Extracted URLs:</span>{' '}
          {extractedUrls.length > 0 ? extractedUrls.join(', ') : '(none)'}
        </div>
        <div>
          <span className="font-semibold">Extracted title:</span>{' '}
          {title || '(none)'}
        </div>
        <div>
          <span className="font-semibold">Current error:</span>{' '}
          {error || '(none)'}
        </div>
      </div>
    </div>
  );
}

export const Default: Story = {
  args: {
    source: {
      url: '',
      setUrl: () => {},
      error: null,
      setError: () => {},
    },
    isFetching: false,
    onFetch: async () =>
      '<html><head><title>Sample page</title></head><body>https://protopedia.net/prototype/1</body></html>',
    onUrlsExtracted: () => {},
    onTitleExtracted: () => {},
  },
};

export const WithPrefilledUrl: Story = {
  args: {
    ...Default.args!,
    source: {
      url: 'https://protopedia.net/example',
      setUrl: () => {},
      error: null,
      setError: () => {},
    },
  },
};
