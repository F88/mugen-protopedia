import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import storybook from 'eslint-plugin-storybook';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypescript,
  ...storybook.configs['flat/recommended'],
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
      'lib/**/*.ts',
      'lib/**/*.tsx',
      '!lib/**/*.client.ts',
      '!lib/**/*.client.tsx',
      'lib/**/*server*.{ts,tsx}',
      'lib/api/**/*.{ts,tsx}',
      'lib/protopedia-client.ts',
    ],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  // eslint-plugin-react (bundled by eslint-config-next) auto-detects the React
  // version via context.getFilename(), which ESLint 10 removed. Pinning the
  // version explicitly skips that detection path and avoids the crash.
  {
    settings: { react: { version: '19.2.7' } },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'storybook-static/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
