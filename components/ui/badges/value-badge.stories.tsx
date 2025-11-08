import type { Meta, StoryObj } from '@storybook/nextjs';
import { Castle, Link2, Users } from 'lucide-react';

import { ValueBadge } from './value-badge';

const meta = {
  title: 'Components/UI/Badges/ValueBadge',
  component: ValueBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'text' },
      description: 'Display text for the badge',
    },
    href: {
      control: { type: 'text' },
      description: 'Optional external link',
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'normal'],
      description: 'Badge sizing preset',
    },
    nowrap: {
      control: { type: 'boolean' },
      description: 'Prevents text wrapping when true',
    },
    tooltip: {
      control: { type: 'text' },
      description: 'Tooltip content to show on hover',
    },
  },
} satisfies Meta<typeof ValueBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 'General availability',
  },
};

export const Size_Small: Story = {
  args: {
    value: 'Small size',
    size: 'small',
  },
};
export const Size_Normal: Story = {
  args: {
    value: 'Normal size',
    size: 'normal',
  },
};

export const WithIcon: Story = {
  args: {
    value: 'Studio team',
  },
  render: (args) => (
    <ValueBadge {...args} icon={<Users className="h-4 w-4" />} />
  ),
};

export const AsLink: Story = {
  args: {
    value: 'View prototype',
    href: 'https://example.com/prototype',
  },
  render: (args) => (
    <ValueBadge {...args} icon={<Link2 className="h-4 w-4" />} />
  ),
};

export const WithTooltip: Story = {
  args: {
    value: 'Role: Environment designer',
    tooltip: 'Shows detailed info about this responsibility',
  },
  render: (args) => (
    <ValueBadge {...args} icon={<Castle className="h-4 w-4" />} />
  ),
};

export const WrappingContent: Story = {
  args: {
    value:
      'This is a badge with a very long string value that will wrap across multiple lines to demonstrate layout handling.',
  },
  render: (args) => (
    <div className="max-w-xs">
      <ValueBadge {...args} />
    </div>
  ),
};
