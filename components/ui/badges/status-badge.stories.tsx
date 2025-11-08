import type { Meta, StoryObj } from '@storybook/nextjs';

import { StatusBadge } from './status-badge';

const meta = {
  title: 'Components/UI/Badges/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: { type: 'radio' },
      options: [1, 2, 3, 4],
      description: 'Prototype status value mapped to a label and color',
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'normal'],
      description: 'Badge sizing preset',
    },
    tooltip: {
      control: { type: 'text' },
      description: 'Optional tooltip content shown on hover',
    },
    className: {
      control: false,
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Status_1_Idea: Story = {
  args: {
    status: 1,
  },
};

export const Status_2_InProgress: Story = {
  args: {
    status: 2,
  },
};

export const Status_3_Complete: Story = {
  args: {
    status: 3,
  },
};

export const Status_4_Archive: Story = {
  args: {
    status: 4,
  },
};

export const WithTooltip: Story = {
  args: {
    status: 2,
    tooltip: 'Status explanations can be surfaced with an optional tooltip.',
  },
};

export const FallbackStatus: Story = {
  args: {
    status: 99,
  },
};

export const Size_Small: Story = {
  args: {
    status: 3,
    size: 'small',
  },
};
