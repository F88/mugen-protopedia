import type { Meta, StoryObj } from '@storybook/nextjs';
import { StatusCard, type CardState } from './status-card';

const meta = {
  title: 'Components/StatusCard',
  component: StatusCard,
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'inline-radio',
      options: ['invalid', 'valid', 'neutral'] satisfies CardState[],
      description: 'Visual state of the card border and icon',
    },
    title: {
      control: 'text',
      description: 'Title shown in the card header',
    },
    description: {
      control: 'text',
      description: 'Optional description under the title',
    },
    helpText: {
      control: 'text',
      description:
        'Optional tooltip text shown when the card is in neutral state',
    },
    children: {
      control: false,
    },
  },
} satisfies Meta<typeof StatusCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Invalid: Story = {
  args: {
    state: 'invalid',
    title: 'Invalid state',
    description: (
      <p className="mt-1 text-xs text-muted-foreground">
        Something is wrong in this section. Please review the fields below.
      </p>
    ),
    children: (
      <div className="text-sm text-muted-foreground">
        <p>This area represents the inner content of the StatusCard.</p>
        <p>You can place form fields or any other components here.</p>
      </div>
    ),
  },
};

export const Valid: Story = {
  args: {
    state: 'valid',
    title: 'Valid state',
    description: (
      <p className="mt-1 text-xs text-muted-foreground">
        Everything in this section looks good.
      </p>
    ),
    children: (
      <div className="text-sm text-muted-foreground">
        <p>
          Use the valid state to indicate that the underlying inputs are
          complete and accepted.
        </p>
      </div>
    ),
  },
};

export const NeutralWithoutHelp: Story = {
  args: {
    state: 'neutral',
    title: 'Neutral state (no help)',
    description: (
      <p className="mt-1 text-xs text-muted-foreground">
        This section is optional and has no special status.
      </p>
    ),
    helpText: undefined,
    children: (
      <div className="text-sm text-muted-foreground">
        <p>
          With no helpText the neutral state renders without an icon on the
          right.
        </p>
      </div>
    ),
  },
};

export const NeutralWithHelp: Story = {
  args: {
    state: 'neutral',
    title: 'Neutral state (with help)',
    description: (
      <p className="mt-1 text-xs text-muted-foreground">
        Optional section that can assist the user.
      </p>
    ),
    helpText: `Use this card to group related inputs.
You can show help text in this tooltip
without affecting the validation state of the section.`,
    children: (
      <div className="text-sm text-muted-foreground">
        <p>
          Hover the information icon in the top right to see how multi-line help
          text is rendered.
        </p>
      </div>
    ),
  },
};
