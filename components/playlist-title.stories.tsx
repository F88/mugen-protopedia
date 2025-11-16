import type { Meta, StoryObj } from '@storybook/nextjs';

import { PLAYLIST_TITLE_MAX_LENGTH, PlaylistTitle } from './playlist-title';
import { faker } from '@faker-js/faker';

const meta = {
  title: 'Components/PlaylistTitle',
  component: PlaylistTitle,
  tags: ['autodocs'],
  args: {
    ids: [101, 202, 303],
    processedCount: 1,
    totalCount: 3,
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
