import type { Meta, StoryObj } from '@storybook/nextjs';

import { AnalysisDashboard } from './analysis-dashboard';
import { Header } from './header';
import {
  buildClientAnniversariesOverride,
  withMockState,
} from './storybook/analysis-dashboard-mock-state';

// The REAL dashboard in its presentational form, fed with mock state — no
// visual mirror to keep in sync (the old AnalysisDashboardStoryWrapper drifted
// from the real component's styling).
const mockAnalysisDashboard = (
  <AnalysisDashboard
    defaultExpanded={false}
    analysisState={withMockState({})}
    preferClientTimezoneAnniversaries
    clientAnniversariesOverride={buildClientAnniversariesOverride({})}
  />
);

const meta = {
  title: 'Components/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Fixed header bar with title, dashboard counters, analysis panel trigger, and theme toggle.',
      },
    },
    viewport: {
      defaultViewport: 'responsive',
    },
  },
  args: {
    dashboard: {
      prototypeCount: 92,
      inFlightRequests: 0,
      maxConcurrentFetches: 2,
    },
    playMode: 'normal',
    analysisDashboard: mockAnalysisDashboard,
    showPlayMode: false,
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Minimal: Story = {
  name: 'Minimal dashboard',
  args: {
    dashboard: {
      prototypeCount: 0,
      inFlightRequests: 0,
      maxConcurrentFetches: 1,
    },
    analysisDashboard: null,
    playMode: 'normal',
    showPlayMode: false,
  },
};

export const Busy: Story = {
  name: 'Busy (large numbers)',
  args: {
    dashboard: {
      prototypeCount: 12345,
      inFlightRequests: 8,
      maxConcurrentFetches: 8,
    },
    playMode: 'normal',
    showPlayMode: false,
  },
};

export const PlayModeIndicator: Story = {
  name: 'Play mode (normal)',
  args: {
    showPlayMode: true,
  },
};

export const PlaylistMode: Story = {
  name: 'Play mode (playlist)',
  args: {
    playMode: 'playlist',
    showPlayMode: true,
  },
};
