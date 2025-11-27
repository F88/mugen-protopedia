---
lang: en
title: Logging Policy
title-en: Logging Policy
title-ja: ロギングポリシー
related:
    - DEVELOPMENT.md "Development Guide"
instructions-for-ais:
    - This document should be written in English for AI readability.
    - Content within code fences may be written in languages other than English.
    - Prohibit updating this front-matter.
    - Prohibit updating title line (1st line) in this document.
---

# Logging Policy

This project separates logging by runtime to avoid bundling server-only
dependencies into the browser and to make side-effects explicit.

- **Server-only**: `@/lib/logger.server` – Uses pino with optional pretty output via a direct pretty stream (`pino-pretty`), not via transport. Marked with `server-only` to prevent client imports.
- **Browser-only**: `@/lib/logger.client` – Thin console wrapper matching a small subset of the server logger API.

## How to use

### Server contexts (server actions, API handlers, server utilities)

```ts
// app/actions/your-action.ts
import { logger } from '@/lib/logger.server';

export async function doStuff() {
    const log = logger.child({ action: 'doStuff' });
    log.info('start');
    // ...
    log.info('done');
}
```

### Client contexts (client components, browser hooks, Storybook stories)

```ts
// components/thing.tsx (use client)
import { logger } from '@/lib/logger.client';

export function Thing() {
    logger.debug('render Thing');
    return null;
}
```

**Note:** The client logger's `child()` method returns a simplified `Logger` type that provides basic logging functionality (`debug`, `info`, `warn`, `error`, `child`). Unlike pino's full child logger API, it does not support advanced features such as nested serializers, custom formatters, or pino-specific options. If you need these features, use the server logger in server-side contexts.

## ESLint guardrails

ESLint enforces that `@/lib/logger.server` is only imported from server-only
contexts. Allowed paths include:

- `app/actions/**/*.{ts,tsx}`
- `lib/**/!(*.client).{ts,tsx}` (non-client TS/TSX under `lib/`)
- `lib/**/*server*.{ts,tsx}`
- `lib/api/**/*.{ts,tsx}`
- `lib/protopedia-client.ts`

Anywhere else, importing `@/lib/logger.server` triggers `no-restricted-imports`. Client-side code must use `@/lib/logger.client`.

## Environment variables

- `LOG_LEVEL`: `debug` | `info` | `warn` | `error` (server)
- `LOG_PRETTY`: `1`/`true` to enable pretty logs even outside dev (server)
- `PROTOPEDIA_API_V2_LOG_LEVEL`:
  `silent` | `error` | `warn` | `info` | `debug` (upstream client)

Defaults:

- Dev: pretty logging enabled by default
- Prod: JSON logs by default (set `LOG_PRETTY=1` to pretty-print)

## Do / Don't

- ✅ Do import `@/lib/logger.server` in server code only.
- ✅ Do import `@/lib/logger.client` in browser code and Storybook.
- ❌ Don't import `@/lib/logger.server` in client components or stories.
- 📝 Note: `pino-pretty` is statically imported to avoid Next.js bundling issues with worker-based transports.
