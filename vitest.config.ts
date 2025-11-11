import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

export default defineConfig({
  test: {
    // Default to jsdom so React Testing Library usage does not require per-file directives.
    // Pure Node tests remain unaffected unless they rely on absence of DOM APIs.
    environment: 'jsdom',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    globals: true,
    reporters: 'default',
    setupFiles: ['./vitest.setup.mjs'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
      // Next.js-specific stub to allow importing 'server-only' in tests
      'server-only': fileURLToPath(
        new URL('./__tests__/mocks/server-only.ts', import.meta.url),
      ),
    },
  },
});
