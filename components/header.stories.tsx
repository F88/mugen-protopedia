import type { Meta, StoryObj } from '@storybook/nextjs';

import { Header } from './header';

// Lightweight mock to avoid importing server actions inside Storybook
const MockAnalysisDashboard = ({
  defaultExpanded,
}: {
  defaultExpanded?: boolean;
}) => (
  <div className="px-2 py-0.5 text-[10px] border border-dashed border-gray-300 dark:border-gray-600 rounded opacity-80">
    Analysis (mock{defaultExpanded ? '✓' : ''})
  </div>
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
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    AnalysisDashboardComponent: MockAnalysisDashboard,
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
    AnalysisDashboardComponent: MockAnalysisDashboard,
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
    AnalysisDashboardComponent: MockAnalysisDashboard,
  },
};
