import type { Meta, StoryObj } from '@storybook/nextjs';
import type { RefObject } from 'react';

import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';
import type { PrototypeSlot } from '@/lib/hooks/use-prototype-slots';
import type { ControlPanelProps } from '@/components/control-panel';

import {
  anniversaryMinimalPrototype,
  fullfilledPrototype,
  minimalPrototype,
} from '../.storybook/prototypes.fixture';
import { AnalysisDashboardStoryWrapper } from '@/components/storybook/analysis-dashboard-wrapper';

import { HomeLayout } from './home-layout';
import { MugenProtoPediaView } from './mugen-protopedia-view';

/**
 * Stories for the presentational home view. Because `MugenProtoPediaView` is a
 * "dumb" component (no hooks, no data fetching), every state is reproduced by
 * passing plain props. The analysis dashboard slot is injected via the
 * Storybook wrapper to keep server actions out of the bundle.
 */

// A null ref is enough here: the refs are attached to DOM nodes but only read
// by the container's hooks, which are not present in Storybook.
const nullRef = { current: null } as RefObject<HTMLDivElement | null>;

const createSlot = (id: number, prototype?: Prototype): PrototypeSlot => ({
  id,
  prototype,
  isLoading: false,
  errorMessage: null,
  expectedPrototypeId: prototype?.id,
});

const sampleSlots: PrototypeSlot[] = [
  createSlot(1, fullfilledPrototype),
  createSlot(2, minimalPrototype),
  createSlot(3, anniversaryMinimalPrototype),
];

const baseControlPanel: ControlPanelProps = {
  controlPanelMode: 'normal',
  prototypeIdInput: '',
  onPrototypeIdInputChange: () => {},
  onPrototypeIdInputSet: () => {},
  onGetPrototypeById: () => {},
  onGetRandomPrototype: () => {},
  onClear: () => {},
  canFetchMorePrototypes: true,
  prototypeIdError: null,
  maxPrototypeId: 9999,
  shortcutsDisabled: false,
  onScrollNext: () => {},
  onScrollPrev: () => {},
  onOpenPrototype: () => {},
  onToggleCLI: () => {},
};

const playlistTitleCardProps = {
  className: 'mx-auto',
  ids: [3, 12, 2345],
  title: 'Sample Playlist',
  processedCount: 1,
  totalCount: 3,
  isCompleted: false,
  isPlaying: true,
  variant: 'default' as const,
  fontFamily: 'sans' as const,
};

const meta = {
  title: 'App/MugenProtoPediaView',
  component: MugenProtoPediaView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Presentational home view. State is driven entirely by props; the container (`MugenProtoPedia`) wires the hooks.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    // The view no longer renders its own `<main>`; the page owns the layout
    // shell. Wrap stories in `HomeLayout` so the background shell is present.
    (Story) => (
      <HomeLayout>
        <Story />
      </HomeLayout>
    ),
  ],
  args: {
    headerRef: nullRef,
    stickyBannerRef: nullRef,
    scrollContainerRef: nullRef,
    playModeState: { type: 'normal' },
    delayLevel: 'NORMAL',
    dashboard: {
      prototypeCount: sampleSlots.length,
      inFlightRequests: 0,
      maxConcurrentFetches: 6,
    },
    analysisDashboard: <AnalysisDashboardStoryWrapper />,
    headerHeight: 64,
    shouldShowStickyBanner: false,
    shouldShowDirectLaunchBanner: false,
    isPlaylistMode: false,
    directLaunchResult: {
      type: 'success',
      value: { ids: [], title: undefined },
    },
    playlistTitleCardProps: null,
    isPlaybackCompleted: false,
    prototypeSlots: sampleSlots,
    currentFocusIndex: 0,
    onCardClick: () => {},
    controlPanel: baseControlPanel,
    showCLI: false,
    commandBuffer: [],
    matchedCommand: null,
  },
} satisfies Meta<typeof MugenProtoPediaView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Normal mode with a few loaded prototypes. */
export const Default: Story = {};

/** No prototypes yet (empty grid). */
export const Empty: Story = {
  args: {
    prototypeSlots: [],
    dashboard: {
      prototypeCount: 0,
      inFlightRequests: 0,
      maxConcurrentFetches: 6,
    },
  },
};

/** Playlist playing: sticky banner with the title card visible. */
export const PlaylistPlaying: Story = {
  args: {
    playModeState: { type: 'playlist', ids: [3, 12, 2345], title: 'Sample Playlist' },
    isPlaylistMode: true,
    shouldShowStickyBanner: true,
    playlistTitleCardProps,
    isPlaybackCompleted: false,
    controlPanel: { ...baseControlPanel, controlPanelMode: 'loadingPlaylist' },
  },
};

/** Playlist completed: title card moves into the scroll area. */
export const PlaylistCompleted: Story = {
  args: {
    playModeState: { type: 'playlist', ids: [3, 12, 2345], title: 'Sample Playlist' },
    isPlaylistMode: true,
    shouldShowStickyBanner: false,
    playlistTitleCardProps: {
      ...playlistTitleCardProps,
      processedCount: 3,
      isPlaying: false,
      isCompleted: true,
    },
    isPlaybackCompleted: true,
  },
};

/** Direct launch failure banner shown in the sticky area. */
export const DirectLaunchFailure: Story = {
  args: {
    shouldShowStickyBanner: true,
    shouldShowDirectLaunchBanner: true,
    directLaunchResult: {
      type: 'failure',
      error: {
        status: 'error',
        errors: ['IDs must contain only digits and commas.'],
      },
    },
  },
};

/** Command window (CLI) open. */
export const CommandWindowOpen: Story = {
  args: {
    showCLI: true,
    commandBuffer: ['x', 'm', 'a', 's'],
    controlPanel: { ...baseControlPanel, shortcutsDisabled: true },
  },
};
