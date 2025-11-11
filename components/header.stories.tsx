import type { Meta, StoryObj } from '@storybook/nextjs';
import { Header } from './header';
import { AnalysisDashboard } from './analysis-dashboard';
import { sampleAnalysis } from '@/.storybook/analysis.fixture';

const useLatestAnalysisMock = () => ({
  data: sampleAnalysis,
  isLoading: false,
  error: null,
  refresh: () => {},
});

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
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    analysisDashboard: (
      <AnalysisDashboard
        defaultExpanded={false}
        useLatestAnalysisHook={useLatestAnalysisMock}
      />
    ),
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
    analysisDashboard: (
      <AnalysisDashboard
        defaultExpanded={false}
        useLatestAnalysisHook={useLatestAnalysisMock}
      />
    ),
  },
};

export const Mobile: Story = {
  name: 'Mobile viewport',
  parameters: {
    viewport: {
      defaultViewport: 'iphone14',
    },
  },
  args: {
    analysisDashboard: (
      <AnalysisDashboard
        defaultExpanded={false}
        useLatestAnalysisHook={useLatestAnalysisMock}
      />
    ),
  },
};
