import type { NetworkFailure } from '@/types/prototype-api.types';

/**
 * Resolves an unknown error value into a string message.
 * @param value The error value to resolve.
 * @returns The resolved error message.
 */
export const resolveErrorMessage = (value: unknown): string => {
  if (value instanceof Error) {
    return value.message;
  }

  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  return 'Unknown error occurred.';
};

/**
 * Resolves an unknown error value into a string message.

/**
 * Constructs a user-friendly display message for an error.
 *
 * Combines the original error message with the HTTP status text if available,
 * avoiding redundancy.
 *
 * @param failure The failure object containing status, error, and details.
 * @returns The constructed display message.
 */
export const constructDisplayMessage = (failure: NetworkFailure): string => {
  const { error, status, details } = failure;
  const statusText = details?.statusText;
  const code = details?.code;
  const message = resolveErrorMessage(error);

  const prefix = statusText || code;

  if (prefix) {
    // Avoid redundancy if the message is just the generic status message
    if (message === `Request failed with status ${status}`) {
      return prefix;
    }
    // Prepend prefix if not already present
    if (!message.startsWith(prefix)) {
      return `${prefix}: ${message}`;
    }
  }

  return message;
};
