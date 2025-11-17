import type { Meta, StoryObj } from '@storybook/nextjs';
import { PlaylistTitleCard } from './playlist-title-card';

const meta = {
  title: 'Components/PlaylistTitleCard',
  component: PlaylistTitleCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Playlist title',
    },
    processedCount: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Number of processed items',
    },
    totalCount: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Total number of items in playlist',
    },
    isPlaying: {
      control: 'boolean',
      description: 'Whether playlist is currently playing',
    },
    isCompleted: {
      control: 'boolean',
      description: 'Whether playlist playback is completed',
    },
  },
} satisfies Meta<typeof PlaylistTitleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'My Awesome Playlist',
    processedCount: 0,
    totalCount: 5,
    isPlaying: false,
    isCompleted: false,
  },
};

export const Playing: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Currently Playing Playlist',
    processedCount: 2,
    totalCount: 5,
    isPlaying: true,
    isCompleted: false,
  },
};

export const HalfComplete: Story = {
  args: {
    ids: [1, 2, 3, 4, 5, 6, 7, 8],
    title: 'Progress Playlist',
    processedCount: 4,
    totalCount: 8,
    isPlaying: true,
    isCompleted: false,
  },
};

export const AlmostComplete: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Almost Done',
    processedCount: 4,
    totalCount: 5,
    isPlaying: true,
    isCompleted: false,
  },
};

export const Completed: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Finished Playlist',
    processedCount: 5,
    totalCount: 5,
    isPlaying: false,
    isCompleted: true,
  },
};

export const NoTitle: Story = {
  args: {
    ids: [1, 2, 3],
    title: undefined,
    processedCount: 0,
    totalCount: 3,
    isPlaying: false,
    isCompleted: false,
  },
};

export const SingleItem: Story = {
  args: {
    ids: [42],
    title: 'Single Item Playlist',
    processedCount: 0,
    totalCount: 1,
    isPlaying: false,
    isCompleted: false,
  },
};

export const LongTitle: Story = {
  args: {
    ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    title:
      'This is a very long playlist title that should be truncated to fit within the maximum length constraint and show a tooltip',
    processedCount: 3,
    totalCount: 10,
    isPlaying: true,
    isCompleted: false,
  },
};

export const EmptyPlaylist: Story = {
  args: {
    ids: [],
    title: 'Empty Playlist',
    processedCount: 0,
    totalCount: 0,
    isPlaying: false,
    isCompleted: false,
  },
};

export const LargePlaylist: Story = {
  args: {
    ids: Array.from({ length: 100 }, (_, i) => i + 1),
    title: 'Massive Collection',
    processedCount: 25,
    totalCount: 100,
    isPlaying: true,
    isCompleted: false,
  },
};

export const JustStarted: Story = {
  args: {
    ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    title: 'Just Started Playing',
    processedCount: 1,
    totalCount: 10,
    isPlaying: true,
    isCompleted: false,
  },
};

export const Paused: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Paused Playlist',
    processedCount: 3,
    totalCount: 5,
    isPlaying: false,
    isCompleted: false,
  },
};
