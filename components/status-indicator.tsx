import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  children: ReactNode;
  variant?: 'gray' | 'blue';
  pulse?: boolean;
  className?: string;
}

export function StatusIndicator({
  children,
  variant = 'gray',
  pulse = false,
  className,
}: StatusIndicatorProps) {
  return (
    <span
      className={cn(
        'flex items-center justify-center w-6 h-6 rounded',
        variant === 'gray' &&
          'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100',
        variant === 'blue' &&
          'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
        pulse && 'animate-pulse',
        className,
      )}
    >
      {children}
    </span>
  );
}
