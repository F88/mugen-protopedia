import type { Meta, StoryObj } from '@storybook/nextjs';
import { ControlPanel } from './control-panel';

const meta = {
  title: 'Components/ControlPanel',
  component: ControlPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ControlPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    prototypeIdInput: '7595',
    onPrototypeIdInputChange: (event) => {
      console.log('Prototype ID input change', event.target.value);
    },
    onGetPrototypeById: () => {
      console.log('Get prototype by ID clicked');
    },
    onPrototypeIdInputSet: (value) => {
      console.log('Prototype ID set', value);
    },
    onGetRandomPrototype: () => {
      console.log('Get random prototype clicked');
    },
    onClear: () => {
      console.log('Clear clicked');
    },
    canFetchMorePrototypes: true,
    prototypeIdError: null,
    isClearDisabled: false,
    onScrollNext: () => {
      console.log('Scroll next clicked');
    },
    onScrollPrev: () => {
      console.log('Scroll prev clicked');
    },
    onOpenPrototype: () => {
      console.log('Open prototype clicked');
    },
    maxPrototypeId: 7_000,
  },
};

export const WithError: Story = {
  args: {
    prototypeIdInput: 'invalid',
    onPrototypeIdInputChange: (event) => {
      console.log('Prototype ID input change', event.target.value);
    },
    onGetPrototypeById: () => {
      console.log('Get prototype by ID clicked');
    },
    onPrototypeIdInputSet: (value) => {
      console.log('Prototype ID set', value);
    },
    onGetRandomPrototype: () => {
      console.log('Get random prototype clicked');
    },
    onClear: () => {
      console.log('Clear clicked');
    },
    canFetchMorePrototypes: false,
    prototypeIdError: 'Not found.',
    isClearDisabled: true,
    onScrollNext: () => {
      console.log('Scroll next clicked');
    },
    onScrollPrev: () => {
      console.log('Scroll prev clicked');
    },
    onOpenPrototype: () => {
      console.log('Open prototype clicked');
    },
    maxPrototypeId: 7_000,
  },
};
