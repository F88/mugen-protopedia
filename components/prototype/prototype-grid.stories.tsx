import type { Meta, StoryObj } from '@storybook/nextjs';
import { PrototypeGrid } from './prototype-grid';
import {
  anniversaryMinimalPrototype,
  fullfilledPrototype,
  minimalPrototype,
} from '../../.storybook/prototypes.fixture';
import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';

// Mock data for different prototype slots
const createMockSlot = (
  id: number,
  prototype?: Prototype,
  options?: {
    isLoading?: boolean;
    errorMessage?: string | null;
    expectedPrototypeId?: number;
  },
) => ({
  id,
  prototype,
  isLoading: options?.isLoading ?? false,
  errorMessage: options?.errorMessage ?? null,
  expectedPrototypeId: options?.expectedPrototypeId,
});

// Sample prototypes for grid display
const samplePrototypes: Prototype[] = [
  fullfilledPrototype,
  minimalPrototype,
  anniversaryMinimalPrototype,
  {
    ...minimalPrototype,
    id: 1001,
    prototypeNm: 'Smart Garden Monitor',
    teamNm: 'GreenTech Solutions',
    summary: 'IoT-based plant monitoring system with automated watering capabilities.',
    mainUrl: 'https://placehold.co/600x360',
    tags: ['IoT', 'Agriculture', 'Sustainability'],
  },
  {
    ...minimalPrototype,
    id: 1002,
    prototypeNm: 'AR Learning Platform',
    teamNm: 'EduVision',
    summary: 'Augmented reality platform for interactive educational experiences.',
    mainUrl: 'https://placehold.co/1080x2400',
    tags: ['AR', 'Education', 'Interactive'],
  },
  {
    ...minimalPrototype,
    id: 1003,
    prototypeNm: 'Drone Delivery Service',
    teamNm: 'AirLogistics',
    summary: 'Autonomous drone network for last-mile package delivery.',
    mainUrl: 'https://placehold.co/640x480',
    tags: ['Drones', 'Logistics', 'Automation'],
  },
];

const meta = {
  title: 'Components/Prototype/PrototypeGrid',
  component: PrototypeGrid,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
} satisfies Meta<typeof PrototypeGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

// Empty grid
export const EmptyGrid: Story = {
  args: {
    prototypeSlots: [],
    currentFocusIndex: 0,
    onCardClick: () => {},
  },
};

// Single prototype
export const SinglePrototype: Story = {
  args: {
    prototypeSlots: [createMockSlot(1, fullfilledPrototype)],
    currentFocusIndex: 0,
    onCardClick: (index) => console.log('Card clicked:', index),
  },
};

// Two prototypes (mobile layout)
export const TwoPrototypes: Story = {
  args: {
    prototypeSlots: [createMockSlot(1, fullfilledPrototype), createMockSlot(2, minimalPrototype)],
    currentFocusIndex: 0,
    onCardClick: (index) => console.log('Card clicked:', index),
  },
};

// Three prototypes (tablet layout)
export const ThreePrototypes: Story = {
  args: {
    prototypeSlots: [
      createMockSlot(1, samplePrototypes[0]),
      createMockSlot(2, samplePrototypes[1]),
      createMockSlot(3, samplePrototypes[2]),
    ],
    currentFocusIndex: 1,
    onCardClick: (index) => console.log('Card clicked:', index),
  },
};

// Full grid (6 prototypes - desktop layout)
export const FullGrid: Story = {
  args: {
    prototypeSlots: samplePrototypes.map((prototype, index) =>
      createMockSlot(index + 1, prototype),
    ),
    currentFocusIndex: 2,
    onCardClick: (index) => console.log('Card clicked:', index),
  },
};

// Large grid (12 prototypes)
export const LargeGrid: Story = {
  args: {
    prototypeSlots: [
      ...samplePrototypes.map((prototype, index) => createMockSlot(index + 1, prototype)),
      ...samplePrototypes.map((prototype, index) =>
        createMockSlot(index + 6, {
          ...prototype,
          id: prototype.id + 1000,
          prototypeNm: `${prototype.prototypeNm} v2`,
        }),
      ),
    ],
    currentFocusIndex: 4,
    onCardClick: (index) => console.log('Card clicked:', index),
  },
};

// Mixed states (loading, errors, success)
export const MixedStates: Story = {
  args: {
    prototypeSlots: [
      createMockSlot(1, fullfilledPrototype),
      createMockSlot(2, undefined, { isLoading: true }),
      createMockSlot(3, undefined, {
        errorMessage: 'Failed to load prototype',
        expectedPrototypeId: 1003,
      }),
      createMockSlot(4, minimalPrototype),
      createMockSlot(5, undefined, { isLoading: true }),
      createMockSlot(6, samplePrototypes[2]),
    ],
    currentFocusIndex: 3,
    onCardClick: (index) => console.log('Card clicked:', index),
  },
};

// Loading states only
export const LoadingStates: Story = {
  args: {
    prototypeSlots: [
      createMockSlot(1, undefined, { isLoading: true }),
      createMockSlot(2, undefined, { isLoading: true, expectedPrototypeId: 1002 }),
      createMockSlot(3, undefined, {
        isLoading: true,
        errorMessage: 'Failed to fetch prototype',
      }),
      createMockSlot(4, undefined, {
        isLoading: true,
        expectedPrototypeId: 1003,
        errorMessage: 'Failed to fetch prototype',
      }),
    ],
    currentFocusIndex: 0,
    onCardClick: (index) => console.log('Card clicked:', index),
  },
};

// Error states
export const ErrorStates: Story = {
  args: {
    prototypeSlots: [
      createMockSlot(1, undefined, {
        errorMessage: 'Network error',
        // expectedPrototypeId: 1001,
      }),
      createMockSlot(2, undefined, {
        errorMessage: 'Prototype not found',
        expectedPrototypeId: 1002,
      }),
    ],
    currentFocusIndex: 1,
    onCardClick: (index) => console.log('Card clicked:', index),
  },
};

// Focus demonstration
export const FocusDemo: Story = {
  args: {
    prototypeSlots: [
      createMockSlot(1, samplePrototypes[0]),
      createMockSlot(2, samplePrototypes[1]),
      createMockSlot(3, samplePrototypes[2]),
      createMockSlot(4, samplePrototypes[3]),
    ],
    currentFocusIndex: 2, // Third item focused
    onCardClick: (index) => console.log('Card clicked:', index),
  },
};
