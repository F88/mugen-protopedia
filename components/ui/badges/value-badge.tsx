import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export type ValueBadgeProps = {
  value: string | number;
  className?: string;
  href?: string;
  icon?: ReactNode;
  size?: 'small' | 'normal';
  nowrap?: boolean;
  tooltip?: ReactNode;
};

const sizeStyles = {
  small: {
    badge: 'gap-1 px-3 py-1 text-xs',
    content: 'gap-1',
    icon: 'h-3.5 w-3.5',
  },
  normal: {
    badge: 'gap-2 px-4 py-1.5 text-sm',
    content: 'gap-2',
    icon: 'h-4 w-4',
  },
} satisfies Record<'small' | 'normal', { badge: string; content: string; icon: string }>;

export function ValueBadge({
  value,
  className,
  href,
  icon,
  size = 'normal',
  nowrap = false,
  tooltip,
}: ValueBadgeProps) {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;
  const sizeConfig = sizeStyles[size];
  const shouldWrap = !nowrap;

  const isLink = typeof href === 'string' && href.length > 0;

  const badgeWrapClasses = shouldWrap
    ? 'justify-start items-start whitespace-normal text-left shrink min-w-0'
    : 'whitespace-nowrap';

  const contentClassName = cn(
    shouldWrap ? 'flex flex-wrap items-center text-left min-w-0' : 'inline-flex items-center',
    sizeConfig.content,
    shouldWrap ? 'gap-x-2 gap-y-1' : null,
  );

  const textClassName = cn(
    'transition-colors',
    isLink ? 'group-hover:underline underline-offset-4' : null,
    shouldWrap ? 'break-words break-all text-left min-w-0' : null,
  );

  const iconClassName = cn('flex items-center', sizeConfig.icon, shouldWrap ? 'flex-none' : null);

  const linkEnhancements = isLink
    ? 'group cursor-pointer transition-[color,box-shadow] hover:bg-[hsl(var(--secondary))] [a&]:hover:bg-[hsl(var(--secondary))] hover:ring-1 hover:ring-[hsl(var(--ring))] hover:ring-offset-1 hover:ring-offset-[hsl(var(--background))] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--ring))]'
    : null;

  const badge = (
    <Badge
      asChild={isLink}
      className={cn(
        'font-semibold bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] shadow-sm',
        sizeConfig.badge,
        linkEnhancements,
        badgeWrapClasses,
        className,
      )}
    >
      {isLink ? (
        <a href={href} target="_blank" rel="noreferrer" className={contentClassName}>
          {icon ? (
            <span className={iconClassName} aria-hidden>
              {icon}
            </span>
          ) : null}
          <span className={textClassName}>{displayValue}</span>
        </a>
      ) : (
        <span className={contentClassName}>
          {icon ? (
            <span className={iconClassName} aria-hidden>
              {icon}
            </span>
          ) : null}
          <span className={textClassName}>{displayValue}</span>
        </span>
      )}
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
