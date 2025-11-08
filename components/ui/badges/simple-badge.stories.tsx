import type { Meta, StoryObj } from '@storybook/nextjs';

import { SimpleBadge } from './simple-badge';

const meta = {
  title: 'Components/UI/Badges/SimpleBadge',
  component: SimpleBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Text content displayed inside the badge',
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'normal'],
      description: 'Badge sizing preset',
    },
    nowrap: {
      control: { type: 'boolean' },
      description: 'Prevent text wrapping when true',
    },
    tooltip: {
      control: { type: 'text' },
      description: 'Optional tooltip content shown on hover',
    },
    className: {
      control: false,
    },
  },
} satisfies Meta<typeof SimpleBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Prototype badge',
  },
};

export const Size_Small: Story = {
  args: {
    label: 'Compact badge',
    size: 'small',
  },
};

export const WithTooltip: Story = {
  args: {
    label: 'Hover for details',
    tooltip: 'Tooltip explaining additional badge context',
  },
};

export const WrappingContent: Story = {
  args: {
    label:
      'This badge demonstrates how longer text will wrap across multiple lines when nowrap is disabled.',
  },
  render: (args) => (
    <div className="max-w-xs">
      <SimpleBadge {...args} />
    </div>
  ),
};

export const NoWrapContent: Story = {
  args: {
    label:
      'This is a badge with a long label that will remain on a single line when nowrap is enabled.',
    nowrap: true,
  },
  render: (args) => (
    <div className="max-w-xs">
      <SimpleBadge {...args} />
    </div>
  ),
};
