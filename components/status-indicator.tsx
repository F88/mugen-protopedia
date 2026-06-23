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
        variant === 'gray' && ' text-gray-800 dark:text-gray-100',
        variant === 'blue' && ' text-blue-800 dark:text-blue-100',
        pulse && 'animate-pulse',
        className,
      )}
    >
      {children}
    </span>
  );
}
