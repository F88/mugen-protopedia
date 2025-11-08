import type { Meta, StoryObj } from '@storybook/nextjs';

import { StatBadge } from './stat-badge';

const meta = {
  title: 'Components/UI/Badges/StatBadge',
  component: StatBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Descriptor displayed before the numeric value',
    },
    value: {
      control: { type: 'number' },
      description: 'Numeric value rendered inside the badge',
    },
    wrapValueWithParens: {
      control: { type: 'boolean' },
      description: 'Wrap the numeric value with parentheses when true',
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'normal'],
      description: 'Badge sizing preset',
    },
    className: {
      control: false,
    },
  },
} satisfies Meta<typeof StatBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Views',
    value: 1240,
  },
};

export const Size_Small: Story = {
  args: {
    label: 'Likes',
    value: 87,
    size: 'small',
  },
};

export const WithoutParentheses: Story = {
  args: {
    label: 'Bookmarks',
    value: 312,
    wrapValueWithParens: false,
  },
};

export const LargeNumber: Story = {
  args: {
    label: 'Total impressions',
    value: 1234567,
  },
};
