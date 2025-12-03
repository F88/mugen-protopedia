import type { Meta, StoryObj } from '@storybook/nextjs';

import { CommandWindow } from './command-window';

const meta = {
  title: 'Components/CommandWindow',
  component: CommandWindow,
  args: {
    title: 'Mugen ProtoPedia Command Line',
    description: 'Type your secret commands here. Press Esc to close.',
  },
} satisfies Meta<typeof CommandWindow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomTitleAndDescription: Story = {
  args: {
    title: 'Developer Console',
    description: (
      <div>
        <p>Use this console to issue developer commands.</p>
        <p className="mt-1 text-xs text-slate-500">
          Press Esc to close. Commands are not persisted.
        </p>
      </div>
    ),
  },
};
