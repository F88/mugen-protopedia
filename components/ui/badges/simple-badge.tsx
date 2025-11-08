import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type SimpleBadgeSize = 'small' | 'normal' | 'responsive';

export type SimpleBadgeProps = {
  label: string;
  size?: SimpleBadgeSize;
  nowrap?: boolean;
  className?: string;
  tooltip?: ReactNode;
};

const sizeStyles: Record<SimpleBadgeSize, string> = {
  small: 'gap-1 px-3 py-1 text-xs',
  normal: 'gap-2 px-4 py-1.5 text-sm',
  responsive: 'gap-1 px-3 py-1 text-xs xl:gap-2 xl:px-4 xl:py-1.5 xl:text-sm',
};

export function SimpleBadge({
  label,
  size = 'normal',
  nowrap = false,
  className,
  tooltip,
}: SimpleBadgeProps) {
  const shouldWrap = !nowrap;
  const badgeWrapClasses = shouldWrap
    ? 'justify-start items-start whitespace-normal text-left shrink min-w-0'
    : 'whitespace-nowrap';

  const badge = (
    <Badge
      className={cn(
        'font-semibold bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] shadow-sm',
        sizeStyles[size],
        badgeWrapClasses,
        className,
      )}
    >
      {label}
    </Badge>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }
  return badge;
}
