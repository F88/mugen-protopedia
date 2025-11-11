import 'server-only';
import pino from 'pino';

import {
  logger as clientLogger,
  type Logger as ClientLogger,
} from './logger.client';

type ServerLogger = pino.Logger;

function createServerLogger(): ServerLogger {
  const level =
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'development' ? 'debug' : 'info');

  const prettyEnv = process.env.LOG_PRETTY;
  const prettyEnabled =
    typeof prettyEnv === 'string'
      ? prettyEnv === '1' || prettyEnv.toLowerCase() === 'true'
      : process.env.NODE_ENV === 'development';

  // Use pino's transport system to reference pino-pretty by name without a static import.
  // This avoids bundling server-only deps into client builds and keeps side-effects minimal.
  const transport = prettyEnabled
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined;

  return pino({
    level,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
    transport,
  }) as ServerLogger;
}

const isBrowser = typeof window !== 'undefined';

export const logger: ServerLogger | ClientLogger = isBrowser
  ? clientLogger
  : createServerLogger();
export type Logger = ServerLogger | ClientLogger;
