'use client';

import { useTheme } from '@/hooks/use-theme';

import { ThemeIcon } from '@/components/theme-icon';
import { Button } from '@/components/ui/button';

export const ThemeToggle: React.FC = () => {
  const { resolvedTheme, mounted, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={mounted ? toggleTheme : undefined}
      aria-label="Toggle theme"
      title={
        mounted
          ? resolvedTheme === 'light'
            ? 'Dark'
            : 'Light'
          : 'Toggle theme'
      }
      className={`transition-opacity duration-200 ${
        mounted ? 'opacity-100' : 'opacity-50'
      }`}
      disabled={!mounted}
    >
      <ThemeIcon theme={resolvedTheme} mounted={mounted} />
    </Button>
  );
};
