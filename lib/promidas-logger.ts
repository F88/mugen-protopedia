/**
 * Adapter that routes promidas's logger calls through the app's pino server
 * logger, so promidas's diagnostics (fetcher / store / repository) are
 * consistent with the rest of the server code instead of going to promidas's
 * standalone ConsoleLogger.
 *
 * promidas's `Logger` is `(message, meta?) => void`; pino is
 * `(bindings, message) => void`. This adapter bridges the two. Verbosity is
 * governed by the pino logger's own level.
 */
import type { Logger } from 'promidas/logger';

import { logger as baseLogger } from '@/lib/logger.server';

const emitLog = (
  level: 'error' | 'warn' | 'info' | 'debug',
  message: string,
  meta?: unknown,
): void => {
  if (meta == null) {
    baseLogger[level](message);
  } else if (typeof meta === 'object') {
    baseLogger[level](meta as Record<string, unknown>, message);
  } else {
    baseLogger[level]({ meta }, message);
  }
};

/** A promidas `Logger` that forwards to the app's pino server logger. */
export const promidasLogger: Logger = {
  error: (message, meta) => emitLog('error', message, meta),
  warn: (message, meta) => emitLog('warn', message, meta),
  info: (message, meta) => emitLog('info', message, meta),
  debug: (message, meta) => emitLog('debug', message, meta),
};
