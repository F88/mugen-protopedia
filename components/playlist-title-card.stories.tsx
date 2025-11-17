import type { Meta, StoryObj } from '@storybook/nextjs';
import {
  PlaylistTitleCard,
  type PlaylistTitleCardVariant,
} from './playlist-title-card';

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
    variant: {
      control: 'select',
      options: [
        'default',
        'frame',
        'cyberpunk',
        'anime',
        'retro',
        'elegant',
        'space',
        'neon',
        'pastel',
        'monochrome',
        'gradient',
        'minimal',
        'glass',
        'sunset',
        'ocean',
        'forest',
      ],
      description: 'Visual style variant',
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

// All fonts showcase
export const AllFonts: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Font Showcase',
    processedCount: 2,
    totalCount: 5,
    isPlaying: true,
    variant: 'default',
  },
  parameters: {
    layout: 'padded',
  },
  render: () => {
    const fonts: Array<{
      fontFamily: 'sans' | 'serif' | 'mono';
      title: string;
    }> = [
      { fontFamily: 'sans', title: 'Sans-serif Font (System Default)' },
      { fontFamily: 'serif', title: 'Serif Font (Traditional)' },
      { fontFamily: 'mono', title: 'Monospace Font (Code Style)' },
    ];

    return (
      <div className="flex flex-col gap-8 p-8 w-full">
        {fonts.map(({ fontFamily, title }) => (
          <div key={fontFamily} className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              font-{fontFamily}
            </h3>
            <PlaylistTitleCard
              ids={[1, 2, 3, 4, 5]}
              title={title}
              processedCount={2}
              totalCount={5}
              isPlaying={true}
              variant="default"
              fontFamily={fontFamily}
            />
          </div>
        ))}
      </div>
    );
  },
};

// All variants showcase
export const AllVariants: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Variant Showcase',
    processedCount: 2,
    totalCount: 5,
    isPlaying: true,
  },
  parameters: {
    layout: 'padded',
  },
  render: () => {
    const variants: Array<{
      variant: PlaylistTitleCardVariant;
      title: string;
    }> = [
      { variant: 'default', title: 'Default Style' },
      { variant: 'frame', title: 'Classic Frame' },
      { variant: 'cyberpunk', title: 'Neon Cyberpunk' },
      { variant: 'anime', title: 'Colorful Anime' },
      { variant: 'retro', title: 'Pixel Art Retro' },
      { variant: 'elegant', title: 'Elegant Gold' },
      { variant: 'space', title: 'Space Odyssey' },
      { variant: 'neon', title: 'Neon Lights' },
      { variant: 'pastel', title: 'Soft Pastel' },
      { variant: 'monochrome', title: 'Black & White' },
      { variant: 'gradient', title: 'Vibrant Gradient' },
      { variant: 'minimal', title: 'Clean Minimal' },
      { variant: 'glass', title: 'Glassmorphism' },
      { variant: 'sunset', title: 'Sunset Glow' },
      { variant: 'ocean', title: 'Ocean Waves' },
      { variant: 'forest', title: 'Deep Forest' },
    ];

    return (
      <div className="flex flex-col gap-8 p-8 w-full">
        {variants.map(({ variant, title }) => (
          <div key={variant} className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {variant}
            </h3>
            <PlaylistTitleCard
              ids={[1, 2, 3, 4, 5]}
              title={title}
              processedCount={2}
              totalCount={5}
              isPlaying={true}
              variant={variant}
            />
          </div>
        ))}
      </div>
    );
  },
};

// Variant examples
export const FrameVariant: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Classic Frame Style',
    processedCount: 2,
    totalCount: 5,
    isPlaying: true,
    variant: 'frame',
  },
};

export const CyberpunkVariant: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Neon Cyberpunk',
    processedCount: 3,
    totalCount: 5,
    isPlaying: true,
    variant: 'cyberpunk',
  },
};

export const AnimeVariant: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Colorful Anime',
    processedCount: 2,
    totalCount: 5,
    isPlaying: true,
    variant: 'anime',
  },
};

export const RetroVariant: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Pixel Art Retro',
    processedCount: 1,
    totalCount: 5,
    isPlaying: true,
    variant: 'retro',
  },
};

export const ElegantVariant: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Elegant Gold',
    processedCount: 4,
    totalCount: 5,
    isPlaying: true,
    variant: 'elegant',
  },
};

export const SpaceVariant: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Space Odyssey',
    processedCount: 3,
    totalCount: 5,
    isPlaying: true,
    variant: 'space',
  },
};

export const NeonVariant: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Neon Lights',
    processedCount: 2,
    totalCount: 5,
    isPlaying: true,
    variant: 'neon',
  },
};

export const PastelVariant: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Soft Pastel',
    processedCount: 3,
    totalCount: 5,
    isPlaying: true,
    variant: 'pastel',
  },
};

export const MonochromeVariant: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Black & White',
    processedCount: 2,
    totalCount: 5,
    isPlaying: true,
    variant: 'monochrome',
  },
};

export const GradientVariant: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Vibrant Gradient',
    processedCount: 4,
    totalCount: 5,
    isPlaying: true,
    variant: 'gradient',
  },
};

export const MinimalVariant: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Clean Minimal',
    processedCount: 1,
    totalCount: 5,
    isPlaying: true,
    variant: 'minimal',
  },
};

export const GlassVariant: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Glassmorphism',
    processedCount: 3,
    totalCount: 5,
    isPlaying: true,
    variant: 'glass',
  },
};

export const SunsetVariant: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Sunset Glow',
    processedCount: 2,
    totalCount: 5,
    isPlaying: true,
    variant: 'sunset',
  },
};

export const OceanVariant: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Ocean Waves',
    processedCount: 4,
    totalCount: 5,
    isPlaying: true,
    variant: 'ocean',
  },
};

export const ForestVariant: Story = {
  args: {
    ids: [1, 2, 3, 4, 5],
    title: 'Deep Forest',
    processedCount: 3,
    totalCount: 5,
    isPlaying: true,
    variant: 'forest',
  },
};
