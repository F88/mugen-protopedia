import type { Meta, StoryObj } from '@storybook/nextjs';

import { RefreshCw } from 'lucide-react';

import { AnalysisSummary } from '@/components/analysis-summary';
import { Button } from '@/components/ui/button';

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const defaultMetrics = {
  totalPrototypes: 4821,
  prototypesWithAwards: 1672,
  birthdayCount: 4,
  newbornCount: 3,
} as const;

const summaryContent = (
  <>
    <span className="hidden text-sm sm:inline">
      🧪 {numberFormatter.format(defaultMetrics.totalPrototypes)}
    </span>
    <span className="hidden text-sm sm:inline">
      🎖️ {numberFormatter.format(defaultMetrics.prototypesWithAwards)}
    </span>
    <span className="text-sm sm:text-base">
      🎉 {numberFormatter.format(defaultMetrics.birthdayCount)}
    </span>
    <span className="text-sm sm:text-base">
      🐣 {numberFormatter.format(defaultMetrics.newbornCount)}
    </span>
  </>
);

const summaryActions = (
  <>
    <Button type="button" variant="outline" size="sm" className="gap-2">
      🔍
    </Button>
    <Button
      type="button"
      size="sm"
      className="hidden gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 sm:inline-flex"
    >
      <RefreshCw className="h-4 w-4" />
    </Button>
  </>
);

const skeletonContent = (
  <>
    {['w-20', 'w-24', 'w-16', 'w-16'].map((width, index) => (
      <span key={width} className={index < 2 ? 'hidden sm:inline' : 'inline'}>
        <span className={`block h-4 animate-pulse rounded bg-muted ${width}`} />
      </span>
    ))}
  </>
);

const meta = {
  title: 'Components/AnalysisSummary',
  component: AnalysisSummary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    density: 'normal',
    tone: 'default',
    actions: summaryActions,
    children: summaryContent,
  },
} satisfies Meta<typeof AnalysisSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default summary',
};

export const Compact: Story = {
  name: 'Compact summary',
  args: {
    density: 'compact',
  },
};

export const ErrorState: Story = {
  name: 'Error tone',
  args: {
    tone: 'error',
    actions: (
      <Button type="button" variant="destructive" size="sm">
        Retry
      </Button>
    ),
    children: <span className="text-sm">分析に失敗しました</span>,
  },
};

export const LoadingSkeleton: Story = {
  name: 'Loading skeleton',
  args: {
    density: 'compact',
    className: 'text-muted-foreground',
    actions: (
      <div className="flex items-center gap-1.5">
        <span className="h-8 w-10 animate-pulse rounded bg-muted" />
        <span className="hidden h-8 w-10 animate-pulse rounded bg-muted sm:inline-block" />
      </div>
    ),
    children: skeletonContent,
  },
};
