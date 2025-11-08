import type { Meta, StoryObj } from '@storybook/nextjs';
import { Dashboard } from './dashboard';

const meta = {
  title: 'Components/Dashboard',
  component: Dashboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Dashboard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    prototypeCount: 3,
    inFlightRequests: 1,
    maxConcurrentFetches: 2,
  },
};

export const AtCapacity: Story = {
  args: {
    prototypeCount: 1234,
    inFlightRequests: 1234,
    maxConcurrentFetches: 9999,
  },
};
