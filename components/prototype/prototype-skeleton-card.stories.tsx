import type { Meta, StoryObj } from '@storybook/nextjs';
import { PrototypeSkeletonCard } from './prototype-skeleton-card';

const meta = {
  title: 'Components/Prototype/PrototypeSkeletonCard',
  component: PrototypeSkeletonCard,
  tags: ['autodocs'],
} satisfies Meta<typeof PrototypeSkeletonCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PrototypeSkeletonCard />,
};

export const WithExpectedIdAndNoError: Story = {
  render: () => <PrototypeSkeletonCard expectedPrototypeId={1234} />,
};

export const WithoutExpectedIdAndError: Story = {
  render: () => <PrototypeSkeletonCard errorMessage="Failed to load prototype." />,
};

export const WithExpectedIdAndError: Story = {
  render: () => (
    <PrototypeSkeletonCard
      expectedPrototypeId={1234}
      errorMessage="Failed to load prototype for ID 1234."
    />
  ),
};
