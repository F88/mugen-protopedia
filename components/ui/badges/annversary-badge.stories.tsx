import type { Meta, StoryObj } from '@storybook/nextjs';
import { AnniversaryBadge } from './annversary-badge';

const meta = {
  title: 'Components/UI/Badges/AnniversaryBadge',
  component: AnniversaryBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    years: {
      control: { type: 'number' },
      description: 'Number of years for the anniversary',
    },
    months: {
      control: { type: 'number' },
      description: 'Optional number of months for the anniversary',
    },
    days: {
      control: { type: 'number' },
      description: 'Optional number of days for the anniversary',
    },
    prefixText: {
      control: { type: 'text' },
      description: 'Text displayed before years/months/days (default "(")',
    },
    suffixText: {
      control: { type: 'text' },
      description: 'Text displayed after years/months/days (default ")")',
    },
    yearLabel: {
      control: { type: 'text' },
      description: 'Label string displayed after the years value',
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'normal', 'responsive'],
      description: 'Badge sizing preset',
    },
    nowrap: {
      control: { type: 'boolean' },
      description: 'Prevents text wrapping when true',
    },
    tooltip: {
      control: { type: 'text' },
      description: 'Tooltip content displayed on hover',
    },
  },
} satisfies Meta<typeof AnniversaryBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    years: 99,
    months: 11,
    days: 23,
  },
};

export const Custom: Story = {
  args: {
    years: 99,
    yearLabel: '歳',
    months: 11,
    days: 23,
    icon: `🎉`,
    prefixText: `2000-02-29 (`,
    suffixText: `)`,
  },
};

export const VariousIcon: Story = {
  args: {
    icon: '🎂',
    years: 99,
    months: 11,
    days: 23,
  },
};

export const CustomLabels: Story = {
  args: {
    years: 99,
    months: 11,
    days: 23,
    yearLabel: 'year(s)',
    monthLabel: 'month(s)',
    dayLabel: 'day(s)',
  },
};

export const NoParentheses: Story = {
  args: {
    years: 99,
    months: 11,
    days: 23,
    prefixText: '',
    suffixText: '',
  },
};

export const CustomBrackets: Story = {
  args: {
    years: 99,
    months: 11,
    days: 23,
    prefixText: '[',
    suffixText: ']',
  },
};

export const Years: Story = {
  args: {
    years: 12,
  },
};

export const YearsMonth: Story = {
  args: {
    years: 12,
    months: 34,
  },
};

export const YearsMonthDay: Story = {
  args: {
    years: 12,
    months: 34,
    days: 56,
  },
};

export const Size_Small: Story = {
  args: {
    years: 12,
    months: 34,
    days: 56,
    size: 'small',
  },
};

export const Size_Responsive: Story = {
  args: {
    years: 12,
    months: 34,
    days: 56,
    size: 'responsive',
  },
  render: (args) => (
    <div className="w-full max-w-md">
      <AnniversaryBadge {...args} />
    </div>
  ),
};

export const WithTooltip: Story = {
  args: {
    years: 12,
    months: 34,
    days: 56,
    tooltip: 'このプロトタイプはリリースから12年34ヶ月56日経過しています',
  },
  render: (args) => <AnniversaryBadge {...args} />,
};
