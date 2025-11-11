import 'server-only';
import pino from 'pino';
import pinoPretty from 'pino-pretty';

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

  // Use a direct pretty stream in dev to avoid worker-based transport resolution
  // that can break under Next.js dev bundling (missing vendor-chunks/lib/worker.js).
  if (prettyEnabled) {
    const prettyStream = pinoPretty({
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    });
    return pino(
      {
        level,
        base: undefined,
        timestamp: pino.stdTimeFunctions.isoTime,
      },
      prettyStream as unknown as pino.DestinationStream,
    ) as ServerLogger;
  }

  return pino({
    level,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
  }) as ServerLogger;
}

const isBrowser = typeof window !== 'undefined';

export const logger: ServerLogger | ClientLogger = isBrowser
  ? clientLogger
  : createServerLogger();
export type Logger = ServerLogger | ClientLogger;
