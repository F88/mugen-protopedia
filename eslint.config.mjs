import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypescript,
  ...compat.extends('plugin:storybook/recommended'),
  // Turn off rules that might conflict with Prettier formatting
  prettierConfig,
  // Restrict importing server-only logger from non-server files
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/lib/logger.server',
              message:
                'Use "@/lib/logger.client" in browser/client code. Server logger is allowed only in server contexts (app/actions, server utilities).',
            },
          ],
        },
      ],
    },
  },
  // Allow server logger in explicit server contexts
  {
    files: [
      'app/actions/**/*.{ts,tsx}',
      'lib/**/!(*.client).{ts,tsx}',
      'lib/**/*server*.{ts,tsx}',
      'lib/api/**/*.{ts,tsx}',
      'lib/protopedia-client.ts',
    ],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
