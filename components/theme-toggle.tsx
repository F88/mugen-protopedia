'use client';

import { useTheme } from '@/hooks/use-theme';

import { ThemeIcon } from '@/components/theme-icon';
import { Button } from '@/components/ui/button';

export const ThemeToggle: React.FC = () => {
  const { resolvedTheme, mounted, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={mounted ? toggleTheme : undefined}
      aria-label="Toggle theme"
      title={mounted ? (resolvedTheme === 'light' ? 'Dark' : 'Light') : 'Toggle theme'}
      className={`h-9 w-9 p-0 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-opacity duration-200 ${
        mounted ? 'opacity-100' : 'opacity-50'
      }`}
      disabled={!mounted}
    >
      <ThemeIcon theme={resolvedTheme} mounted={mounted} />
    </Button>
  );
};
