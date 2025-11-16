// Client-safe logger that mirrors the minimal API of the server logger.
// Use this in any module that can run in the browser to avoid importing server-only deps.

export type Logger = {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  child: (bindings: Record<string, unknown>) => Logger;
};

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

export function getClientLogLevel(): LogLevel {
  const envLevel = process.env.NEXT_PUBLIC_CLIENT_LOG_LEVEL?.toLowerCase();
  const validLevels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'silent'];

  if (envLevel && validLevels.includes(envLevel as LogLevel)) {
    return envLevel as LogLevel;
  }

  // Default: info in development, warn in production
  return process.env.NODE_ENV === 'development' ? 'info' : 'warn';
}

function formatPrefix(bindings?: Record<string, unknown>): string {
  if (!bindings || Object.keys(bindings).length === 0) return '';
  try {
    const flat = Object.entries(bindings)
      .map(([k, v]) => `${k}=${String(v)}`)
      .join(' ');
    return `[${flat}]`;
  } catch {
    return '';
  }
}

function makeConsoleLogger(bindings?: Record<string, unknown>): Logger {
  const currentLevel = getClientLogLevel();
  const currentLevelValue = LOG_LEVELS[currentLevel];

  const prefix = formatPrefix(bindings);

  const withPrefixAndLevel =
    (level: string, fn: (...args: unknown[]) => void) =>
    (...args: unknown[]) => {
      const levelTag = `[${level.toUpperCase()}]`;
      if (prefix) {
        fn(prefix, levelTag, ...args);
      } else {
        fn(levelTag, ...args);
      }
    };

  const noop = () => {};

  const shouldLog = (level: LogLevel) => LOG_LEVELS[level] >= currentLevelValue;

  return {
    debug: shouldLog('debug')
      ? withPrefixAndLevel('debug', console.debug.bind(console))
      : noop,
    info: shouldLog('info')
      ? withPrefixAndLevel('info', console.info.bind(console))
      : noop,
    warn: shouldLog('warn')
      ? withPrefixAndLevel('warn', console.warn.bind(console))
      : noop,
    error: shouldLog('error')
      ? withPrefixAndLevel('error', console.error.bind(console))
      : noop,
    child: (childBindings: Record<string, unknown>) =>
      makeConsoleLogger({ ...(bindings ?? {}), ...(childBindings ?? {}) }),
  };
}

export const logger: Logger = makeConsoleLogger();
