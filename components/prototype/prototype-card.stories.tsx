import type { Meta, StoryObj } from '@storybook/nextjs';
import { PrototypeCard } from './prototype-card';
import {
  anniversaryMinimalPrototype,
  fullfilledPrototype,
  minimalPrototype,
} from '../../.storybook/prototypes.fixture';

const meta = {
  title: 'Components/Prototype/PrototypeCard',
  component: PrototypeCard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PrototypeCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Minimal: Story = {
  args: {
    prototype: minimalPrototype,
  },
};

export const AnniversaryMinimal: Story = {
  args: {
    prototype: anniversaryMinimalPrototype,
  },
};

export const Fullfilled_Not_Anniversary: Story = {
  args: {
    prototype: fullfilledPrototype,
  },
};

export const Fullfilled_And_Anniversary: Story = {
  args: {
    prototype: {
      ...fullfilledPrototype,
      releaseDate: anniversaryMinimalPrototype.releaseDate,
    },
  },
};

export const Fullfilled_Image_640x360: Story = {
  args: {
    prototype: {
      ...fullfilledPrototype,
      // mainUrl: '/public/img/P-640x360.png',
      mainUrl: '/img/P-640x360.png',
    },
  },
};

export const Fullfilled_Image_640x480: Story = {
  args: {
    prototype: {
      ...fullfilledPrototype,
      // mainUrl: '/public/img/P-640x480.png',
      mainUrl: '/img/P-640x480.png',
    },
  },
};

export const Fullfilled_Image_640x640: Story = {
  args: {
    prototype: {
      ...fullfilledPrototype,
      // mainUrl: '/public/img/P-640x640.png',
      mainUrl: '/img/P-640x640.png',
    },
  },
};

export const Fullfilled_Image_1080x2400: Story = {
  args: {
    prototype: {
      ...fullfilledPrototype,
      // mainUrl: '/public/img/P-640x480.png',
      mainUrl: '/img/P-1080x2400.png',
    },
  },
};
