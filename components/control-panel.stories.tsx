import type { Meta, StoryObj } from '@storybook/nextjs';
import { ControlPanel } from './control-panel';

const meta = {
  title: 'Components/ControlPanel',
  component: ControlPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
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
} satisfies Meta<typeof ControlPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    prototypeIdInput: '7595',
    canFetchMorePrototypes: true,
    prototypeIdError: null,
  },
};

export const WithError: Story = {
  args: {
    prototypeIdInput: 'invalid',
    canFetchMorePrototypes: false,
    prototypeIdError: 'Not found.',
  },
};

export const PlaylistLoading: Story = {
  args: {
    prototypeIdInput: '123,456',
    canFetchMorePrototypes: true,
    prototypeIdError: null,
    controlPanelMode: 'loadingPlaylist',
  },
};
