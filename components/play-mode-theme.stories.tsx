import type { Meta, StoryObj } from '@storybook/nextjs';

import { PlayModeTheme } from './play-mode-theme';

/**
 * Theme-confirmation stories. `PlayModeTheme` owns theme selection
 * (`resolveMppThemeType`) and rendering, so this is where each theme overlay is
 * verified. The Christmas theme is normally date-gated; the injectable `now`
 * prop makes it previewable on any date without touching the system clock.
 */
const meta = {
  title: 'Components/PlayModeTheme',
  component: PlayModeTheme,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['!autodocs'],
} satisfies Meta<typeof PlayModeTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Christmas theme previewed via an injected December date, independent of the
 * current system date or play mode.
 */
export const ChristmasByDate: Story = {
  args: {
    mode: { type: 'normal' },
    now: new Date('2025-12-24T18:00:00'),
  },
};

/** Unleashed theme (driven by the play mode). */
export const Unleashed: Story = {
  args: {
    mode: { type: 'unleashed' },
  },
};

/** Randomized "normal" theme, shown for fast delay levels. */
export const RandomNormal: Story = {
  args: {
    mode: { type: 'normal' },
    delayLevel: 'FAST',
  },
};

/** No theme: normal mode, normal speed, outside the Christmas period. */
export const NoTheme: Story = {
  args: {
    mode: { type: 'normal' },
    delayLevel: 'NORMAL',
    now: new Date('2025-06-29T12:00:00'),
  },
};
