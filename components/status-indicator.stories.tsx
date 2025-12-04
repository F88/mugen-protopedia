import type { Meta, StoryObj } from '@storybook/nextjs';

import { StatusIndicator } from './status-indicator';

const meta = {
  title: 'Components/StatusIndicator',
  component: StatusIndicator,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: '🚀',
  },
} satisfies Meta<typeof StatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'gray',
  },
};

export const Blue: Story = {
  args: {
    variant: 'blue',
  },
};

export const Pulse: Story = {
  args: {
    variant: 'blue',
    pulse: true,
    children: '⚡',
  },
};

export const PlayModeIcon: Story = {
  args: {
    variant: 'gray',
    children: '▶️',
  },
};

export const SpeedIcon: Story = {
  args: {
    variant: 'blue',
    pulse: true,
    children: '🐇',
  },
};
