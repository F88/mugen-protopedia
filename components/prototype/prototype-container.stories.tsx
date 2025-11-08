import type { Meta, StoryObj } from '@storybook/nextjs';
import { PrototypeContainer } from './prototype-container';
import { fullfilledPrototype } from '../../.storybook/prototypes.fixture';

const meta = {
  title: 'Components/Prototype/PrototypeContainer',
  component: PrototypeContainer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PrototypeContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {},
};

export const Fullfilled: Story = {
  args: {
    prototype: fullfilledPrototype,
  },
};
