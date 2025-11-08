import type { Meta, StoryObj } from '@storybook/nextjs';
import {
  anniversaryMinimalPrototype,
  fullfilledPrototype,
  minimalPrototype,
} from '../.storybook/prototypes.fixture';
import { MedalBadges } from './medals-badges';

const meta = {
  title: 'Components/MedalBadges',
  component: MedalBadges,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MedalBadges>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithHighlights: Story = {
  args: {
    prototype: fullfilledPrototype,
  },
};

export const WithoutHighlights: Story = {
  args: {
    prototype: {
      ...minimalPrototype,
      awards: [],
      viewCount: 0,
      goodCount: 0,
      commentCount: 0,
      releaseDate: minimalPrototype.releaseDate ?? undefined,
    },
  },
};

export const AnniversaryPrototype: Story = {
  args: {
    prototype: {
      ...anniversaryMinimalPrototype,
    },
  },
};
