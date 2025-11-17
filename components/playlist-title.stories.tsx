import type { Meta, StoryObj } from '@storybook/nextjs';

import { PLAYLIST_TITLE_MAX_LENGTH, PlaylistTitle } from './playlist-title';
import { faker } from '@faker-js/faker';

const meta = {
  title: 'Components/PlaylistTitle',
  component: PlaylistTitle,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
        <div className="w-full max-w-5xl">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    ids: [101, 202, 303],
    processedCount: 1,
    totalCount: 3,
    className: 'mx-auto',
  },
} satisfies Meta<typeof PlaylistTitle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithTitle: Story = {
  args: {
    title: 'Maker Faire Highlights',
  },
};

export const WithoutTitle: Story = {
  args: {
    title: undefined,
  },
};

const longTitle =
  'Extremely Long Playlist Title That Demonstrates Truncation Behavior When Rendering Direct Launch Results In The Header Area';

export const LongTitle: Story = {
  args: {
    title: longTitle,
    processedCount: 2,
    totalCount: 5,
  },
};

let truncatedTitle = faker.lorem.paragraphs(10);
while (truncatedTitle.length <= PLAYLIST_TITLE_MAX_LENGTH) {
  truncatedTitle = `${truncatedTitle} ${faker.lorem.paragraph()}`;
}

export const TruncatedTitle: Story = {
  args: {
    title: truncatedTitle,
    processedCount: 1,
    totalCount: 10,
  },
};

export const Processing: Story = {
  args: {
    ids: [11, 22, 33, 44],
    processedCount: 2,
    totalCount: 4,
  },
};

export const Completed: Story = {
  args: {
    ids: [1, 2, 3],
    processedCount: 3,
    totalCount: 3,
  },
};

export const Empty: Story = {
  args: {
    ids: [],
    processedCount: 0,
    totalCount: 0,
  },
};

export const Playing: Story = {
  args: {
    title: 'Morning Demo Playlist',
    ids: [1001, 1002, 1003, 1004],
    processedCount: 3,
    totalCount: 4,
    isPlaying: true,
  },
};

export const LargeQueue: Story = {
  args: {
    title: 'Weekend Mega Showcase',
    ids: Array.from({ length: 12 }, (_, index) => index + 1),
    processedCount: 5,
    totalCount: 12,
  },
};

export const SingleItem: Story = {
  args: {
    title: 'Single Prototype Spotlight',
    ids: [404],
    processedCount: 1,
    totalCount: 1,
  },
};

export const TitleOnlyNoItems: Story = {
  args: {
    title: 'Empty Queue Placeholder',
    ids: [],
    processedCount: 0,
    totalCount: 0,
  },
};

export const CustomSpacing: Story = {
  args: {
    title: 'Inline Playlist Banner',
    ids: [71, 72, 73],
    processedCount: 1,
    totalCount: 3,
    className: 'mx-auto my-6 max-w-3xl',
  },
};

export const NarrowViewport: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    title: 'Compact Playlist Cue',
    ids: [11, 22],
    processedCount: 0,
    totalCount: 2,
    className: 'mx-auto',
  },
};
