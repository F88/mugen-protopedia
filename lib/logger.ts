// This legacy logger module is deprecated. Importing it will throw an error
// to enforce the use of the new context-specific loggers.
throw new Error(
  "The '@/lib/logger' module is deprecated. Please import from '@/lib/logger.server' or '@/lib/logger.client' instead.",
);
