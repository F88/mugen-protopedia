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
    coverage: {
      provider: 'v8',
      include: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'types/**/*.ts',
        'tools/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.d.ts',
        '**/*.stories.*',
        '**/*.test.*',
        '**/__tests__/**',
        'lib/analysis/types.ts',
        '.next/**',
        'coverage/**',
        'node_modules/**',
        'vitest.config.ts',
      ],
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
    },
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
