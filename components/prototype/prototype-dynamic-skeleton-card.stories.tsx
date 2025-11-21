import type { Meta, StoryObj } from '@storybook/nextjs';
import { PrototypeDynamicSkeletonCard } from './prototype-dynamic-skeleton-card';

const meta = {
  title: 'Components/Prototype/PrototypeDynamicSkeletonCard',
  component: PrototypeDynamicSkeletonCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['shuffle', 'explode', 'cascade', 'orbit', 'spin', 'rainbow'],
      description: 'Dynamic animation variant for the skeleton blocks',
    },
    disableAnimation: {
      control: 'boolean',
      description: 'Disable all animations',
    },
    randomVariant: {
      control: 'boolean',
      description: 'Randomly select a dynamic animation variant',
    },
    isFocused: {
      control: 'boolean',
      description: 'Apply focus styling',
    },
  },
} satisfies Meta<typeof PrototypeDynamicSkeletonCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PrototypeDynamicSkeletonCard />,
};

export const ShuffleVariant: Story = {
  render: () => <PrototypeDynamicSkeletonCard variant="shuffle" />,
};

export const ExplodeVariant: Story = {
  render: () => <PrototypeDynamicSkeletonCard variant="explode" />,
};

export const CascadeVariant: Story = {
  render: () => <PrototypeDynamicSkeletonCard variant="cascade" />,
};

export const OrbitVariant: Story = {
  render: () => <PrototypeDynamicSkeletonCard variant="orbit" />,
};

export const SpinVariant: Story = {
  render: () => <PrototypeDynamicSkeletonCard variant="spin" />,
};

export const RainbowVariant: Story = {
  render: () => <PrototypeDynamicSkeletonCard variant="rainbow" />,
};

export const DisabledAnimation: Story = {
  render: () => <PrototypeDynamicSkeletonCard disableAnimation />,
};

export const RandomVariant: Story = {
  render: () => <PrototypeDynamicSkeletonCard randomVariant />,
};

export const RandomVariantComparison: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Random #1</h3>
        <PrototypeDynamicSkeletonCard randomVariant />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Random #2</h3>
        <PrototypeDynamicSkeletonCard randomVariant />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Random #3</h3>
        <PrototypeDynamicSkeletonCard randomVariant />
      </div>
    </div>
  ),
};

export const WithExpectedIdAndNoError: Story = {
  render: () => <PrototypeDynamicSkeletonCard expectedPrototypeId={1234} />,
};

export const WithoutExpectedIdAndError: Story = {
  render: () => (
    <PrototypeDynamicSkeletonCard errorMessage="Failed to load prototype." />
  ),
};

export const WithExpectedIdAndError: Story = {
  render: () => (
    <PrototypeDynamicSkeletonCard
      expectedPrototypeId={1234}
      errorMessage="Failed to load prototype for ID 1234."
    />
  ),
};

export const AllDynamicVariantsComparison: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Shuffle (Default)</h3>
        <PrototypeDynamicSkeletonCard variant="shuffle" />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Explode</h3>
        <PrototypeDynamicSkeletonCard variant="explode" />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Cascade</h3>
        <PrototypeDynamicSkeletonCard variant="cascade" />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Orbit</h3>
        <PrototypeDynamicSkeletonCard variant="orbit" />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Spin</h3>
        <PrototypeDynamicSkeletonCard variant="spin" />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Rainbow</h3>
        <PrototypeDynamicSkeletonCard variant="rainbow" />
      </div>
    </div>
  ),
};

export const AllDynamicVariantsComparison_With_Id: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Shuffle (Default)</h3>
        <PrototypeDynamicSkeletonCard
          expectedPrototypeId={1234}
          variant="shuffle"
        />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Explode</h3>
        <PrototypeDynamicSkeletonCard
          expectedPrototypeId={1234}
          variant="explode"
        />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Cascade</h3>
        <PrototypeDynamicSkeletonCard
          expectedPrototypeId={1234}
          variant="cascade"
        />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Orbit</h3>
        <PrototypeDynamicSkeletonCard
          expectedPrototypeId={1234}
          variant="orbit"
        />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Spin</h3>
        <PrototypeDynamicSkeletonCard
          expectedPrototypeId={1234}
          variant="spin"
        />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Rainbow</h3>
        <PrototypeDynamicSkeletonCard
          expectedPrototypeId={1234}
          variant="rainbow"
        />
      </div>
    </div>
  ),
};
