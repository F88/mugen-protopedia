// Client-safe logger that mirrors the minimal API of the server logger.
// Use this in any module that can run in the browser to avoid importing server-only deps.

export type Logger = {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  child: (bindings: Record<string, unknown>) => Logger;
};

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
  const prefix = formatPrefix(bindings);
  const withPrefix =
    (fn: (...args: unknown[]) => void) =>
    (...args: unknown[]) =>
      prefix ? fn(prefix, ...args) : fn(...args);

  return {
    debug: withPrefix(console.debug.bind(console)),
    info: withPrefix(console.info.bind(console)),
    warn: withPrefix(console.warn.bind(console)),
    error: withPrefix(console.error.bind(console)),
    child: (childBindings: Record<string, unknown>) =>
      makeConsoleLogger({ ...(bindings ?? {}), ...(childBindings ?? {}) }),
  };
}

export const logger: Logger = makeConsoleLogger();
