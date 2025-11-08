import type { Meta, StoryObj } from '@storybook/nextjs';

import { PrototypeIdBadge } from './prototype-id-badge';

const meta = {
  title: 'Components/UI/Badges/PrototypeIdBadge',
  component: PrototypeIdBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    id: {
      control: { type: 'number' },
      description: 'Numeric identifier rendered inside the badge',
    },
  },
} satisfies Meta<typeof PrototypeIdBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 12345,
  },
};

export const SmallId: Story = {
  args: {
    id: 7,
  },
};

export const LargeId: Story = {
  args: {
    id: 2025123456,
  },
};
