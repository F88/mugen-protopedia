import type { Meta, StoryObj } from '@storybook/nextjs';

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
