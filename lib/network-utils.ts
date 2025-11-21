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
 * Constructs a user-friendly display message for an error.
 *
 * The message construction follows these rules:
 * 1. Resolves the raw error into a string message.
 * 2. Determines a prefix using `details.statusText` (priority) or `details.code`.
 * 3. If a prefix exists and the message does not already start with it, prepends the prefix (e.g., "Prefix: Message").
 * 4. Appends the status code in parentheses (e.g., "Message (404)").
 *
 * @param failure The failure object containing status, error, and details.
 * @returns The constructed display message.
 */
export const constructDisplayMessage = (failure: NetworkFailure): string => {
  const { error, status, details } = failure;
  const statusText = details?.statusText;
  const code = details?.code;
  let message = resolveErrorMessage(error);

  const prefix = statusText || code;

  if (prefix) {
    // Prepend prefix if not already present
    if (!message.startsWith(prefix)) {
      message = `${prefix}: ${message}`;
    }
  }

  return `${message} (${status})`;
};
