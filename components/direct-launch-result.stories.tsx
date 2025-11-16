import type { Meta, StoryObj } from '@storybook/nextjs';

import { DirectLaunchResult } from './direct-launch-result';
import type {
  DirectLaunchParams,
  ValidationError,
} from '@/lib/utils/validation';
import type { Result } from '@/lib/utils/result';

const successResult: Result<DirectLaunchParams, ValidationError> = {
  type: 'success',
  value: {
    ids: [1, 2, 3],
    title: 'Sample Playlist',
  },
};

const failureResultSingle: Result<DirectLaunchParams, ValidationError> = {
  type: 'failure',
  error: {
    status: 'error',
    errors: ['IDs must contain only digits and commas.'],
  },
};

const failureResultMultiple: Result<DirectLaunchParams, ValidationError> = {
  type: 'failure',
  error: {
    status: 'error',
    errors: [
      'IDs must contain only digits and commas.',
      'Title must be 100 characters or less.',
    ],
  },
};

const meta = {
  title: 'Components/DirectLaunchResult',
  component: DirectLaunchResult,
  args: {
    successMessage: 'Direct launch parameters validated successfully.',
    failureMessage:
      'The URL contains invalid parameters for direct launch. Please check and try again.',
  },
} satisfies Meta<typeof DirectLaunchResult>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    directLaunchResult: successResult,
  },
};

export const FailureWithSingleError: Story = {
  args: {
    directLaunchResult: failureResultSingle,
  },
};

export const FailureWithMultipleErrors: Story = {
  args: {
    directLaunchResult: failureResultMultiple,
  },
};
