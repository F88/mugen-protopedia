import type { Meta, StoryObj } from '@storybook/nextjs';
import { useEffect, useRef } from 'react';

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

export const EmptyInput: Story = {
  args: {
    prototypeIdInput: '',
    canFetchMorePrototypes: true,
    prototypeIdError: null,
  },
};

export const SmallMaxPrototypeId: Story = {
  args: {
    prototypeIdInput: '12',
    canFetchMorePrototypes: true,
    prototypeIdError: null,
    maxPrototypeId: 50,
  },
};
export const WithError: Story = {
  args: {
    prototypeIdInput: 'invalid',
    canFetchMorePrototypes: false,
    prototypeIdError: 'Not found.',
  },
};

export const NoMorePrototypes: Story = {
  args: {
    prototypeIdInput: '1024',
    canFetchMorePrototypes: false,
    prototypeIdError: null,
  },
};

export const PlaylistError: Story = {
  args: {
    prototypeIdInput: '555',
    canFetchMorePrototypes: true,
    prototypeIdError: 'Failed to queue playlist. Try again shortly.',
    controlPanelMode: 'loadingPlaylist',
  },
};

export const ExpandedSubPanel: Story = {
  args: {
    prototypeIdInput: '777',
    canFetchMorePrototypes: true,
    prototypeIdError: null,
  },
  render: (args) => {
    const StoryWrapper = () => {
      const containerRef = useRef<HTMLDivElement | null>(null);

      useEffect(() => {
        const toggleButton = containerRef.current?.querySelector(
          'button[aria-controls="control-sub-panel"]',
        ) as HTMLButtonElement | null;
        toggleButton?.click();
      }, []);

      return (
        <div ref={containerRef}>
          <ControlPanel {...args} />
        </div>
      );
    };

    return <StoryWrapper />;
  },
};

export const Mode_LoadingPlaylist_PlaylistLoading: Story = {
  args: {
    prototypeIdInput: '123,456',
    canFetchMorePrototypes: true,
    prototypeIdError: null,
    controlPanelMode: 'loadingPlaylist',
  },
};

export const Mode_LoadingPlaylist_PlaylistLocked: Story = {
  args: {
    prototypeIdInput: '987',
    canFetchMorePrototypes: false,
    prototypeIdError: null,
    controlPanelMode: 'loadingPlaylist',
  },
};
