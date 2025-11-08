import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatBadgeProps = {
  label: string;
  value: number;
  className?: string;
  wrapValueWithParens?: boolean;
  size?: 'small' | 'normal';
};

const sizeStyles = {
  small: 'gap-1 px-3 py-1 text-xs',
  normal: 'gap-2 px-4 py-1.5 text-sm',
} satisfies Record<'small' | 'normal', string>;

export function StatBadge({
  label,
  value,
  className,
  wrapValueWithParens = true,
  size = 'normal',
}: StatBadgeProps) {
  return (
    <Badge
      className={cn(
        'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
        sizeStyles[size],
        className,
      )}
    >
      {label}
      {wrapValueWithParens ? ` (${value.toLocaleString()})` : ` ${value.toLocaleString()}`}
    </Badge>
  );
}
