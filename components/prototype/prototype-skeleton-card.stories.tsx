import type { Meta, StoryObj } from '@storybook/nextjs';
import { PrototypeSkeletonCard } from './prototype-skeleton-card';

const meta = {
  title: 'Components/Prototype/PrototypeSkeletonCard',
  component: PrototypeSkeletonCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['shimmer', 'pulse', 'twinkle'],
      description: 'Animation variant for the skeleton blocks',
    },
    disableAnimation: {
      control: 'boolean',
      description: 'Disable all animations',
    },
    randomVariant: {
      control: 'boolean',
      description: 'Randomly select an animation variant',
    },
    isFocused: {
      control: 'boolean',
      description: 'Apply focus styling',
    },
  },
} satisfies Meta<typeof PrototypeSkeletonCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PrototypeSkeletonCard />,
};

export const ShimmerVariant: Story = {
  render: () => <PrototypeSkeletonCard variant="shimmer" />,
};

export const PulseVariant: Story = {
  render: () => <PrototypeSkeletonCard variant="pulse" />,
};

export const TwinkleVariant: Story = {
  render: () => <PrototypeSkeletonCard variant="twinkle" />,
};

export const DisabledAnimation: Story = {
  render: () => <PrototypeSkeletonCard disableAnimation />,
};

export const RandomVariant: Story = {
  render: () => <PrototypeSkeletonCard randomVariant />,
};

export const RandomVariantComparison: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Random #1</h3>
        <PrototypeSkeletonCard randomVariant />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Random #2</h3>
        <PrototypeSkeletonCard randomVariant />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Random #3</h3>
        <PrototypeSkeletonCard randomVariant />
      </div>
    </div>
  ),
};

export const WithExpectedIdAndNoError: Story = {
  render: () => <PrototypeSkeletonCard expectedPrototypeId={1234} />,
};

export const WithoutExpectedIdAndError: Story = {
  render: () => (
    <PrototypeSkeletonCard errorMessage="Failed to load prototype." />
  ),
};

export const WithExpectedIdAndError: Story = {
  render: () => (
    <PrototypeSkeletonCard
      expectedPrototypeId={1234}
      errorMessage="Failed to load prototype for ID 1234."
    />
  ),
};

export const AllVariantsComparison: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Shimmer (Default)</h3>
        <PrototypeSkeletonCard variant="shimmer" />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Pulse</h3>
        <PrototypeSkeletonCard variant="pulse" />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Twinkle</h3>
        <PrototypeSkeletonCard variant="twinkle" />
      </div>
    </div>
  ),
};
