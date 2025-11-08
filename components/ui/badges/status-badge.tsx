import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import {
  SimpleBadge,
  SimpleBadgeProps,
} from '@/components/ui/badges/simple-badge';
import { getPrototypeStatusLabel } from '@/lib/utils/value-to-label';

export type StatusBadgeProps = {
  status: number;
  size?: SimpleBadgeProps['size'];
  className?: string;
  tooltip?: ReactNode;
};

/**
 * Status colors
 * 1: #dda424
 * 2: #96e563
 * 3: #02adbc
 * 4: #ca72d3
 */

const statusColorClasses: Record<number, string> = {
  1: 'bg-[color:var(--status-1-bg,#dda424)] text-[color:var(--status-1-fg,#0f172a)]',
  2: 'bg-[color:var(--status-2-bg,#96e563)] text-[color:var(--status-2-fg,#0f172a)]',
  3: 'bg-[color:var(--status-3-bg,#02adbc)] text-[color:var(--status-3-fg,#ffffff)]',
  4: 'bg-[color:var(--status-4-bg,#ca72d3)] text-[color:var(--status-4-fg,#ffffff)]',
};

const fallbackStatusClasses =
  'bg-[color:var(--status-fallback-bg,#0f172a)] text-[color:var(--status-fallback-fg,#ffffff)]';

export const StatusBadge = ({
  status,
  size = 'responsive',
  className,
  tooltip,
}: StatusBadgeProps) => {
  const statusLabel = getPrototypeStatusLabel(status);

  const resolvedClasses =
    status !== undefined && statusColorClasses[status]
      ? statusColorClasses[status]
      : fallbackStatusClasses;

  return (
    <SimpleBadge
      label={statusLabel}
      size={size}
      nowrap
      className={cn(
        // 'hover:opacity-90',
        resolvedClasses,
        className,
      )}
      tooltip={tooltip}
    />
  );
};
