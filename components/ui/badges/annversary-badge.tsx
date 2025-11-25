import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type AnniversaryBadgeSize = 'small' | 'normal' | 'responsive';

export type AnniversaryBadgeProps = {
  icon?: ReactNode;
  years: number;
  months?: number;
  days?: number;
  yearLabel?: string;
  monthLabel?: string;
  dayLabel?: string;
  prefixText?: string;
  suffixText?: string;
  className?: string;
  // href?: string;
  size?: AnniversaryBadgeSize;
  nowrap?: boolean;
  tooltip?: ReactNode;
};

const sizeStyles: Record<
  AnniversaryBadgeSize,
  { badge: string; content: string; icon: string; value: string; label: string }
> = {
  small: {
    badge: 'gap-1 px-3 py-1 text-xs',
    content: 'gap-1',
    icon: 'h-3.5 w-3.5',
    value: 'text-sm',
    label: 'text-xs',
  },
  normal: {
    badge: 'gap-2 px-4 py-1.5 text-sm',
    content: 'gap-2',
    icon: 'h-4 w-4',
    value: 'text-base',
    label: 'text-sm',
  },
  responsive: {
    badge: 'gap-1 px-3 py-1 text-xs xl:gap-2 xl:px-4 xl:py-1.5 xl:text-sm',
    content: 'gap-1 xl:gap-2',
    icon: 'h-3.5 w-3.5 xl:h-4 xl:w-4',
    value: 'text-sm xl:text-base',
    label: 'text-xs xl:text-sm',
  },
};

export function AnniversaryBadge({
  className,
  icon,
  years,
  months,
  days,
  yearLabel = '年',
  monthLabel = 'ヶ月',
  dayLabel = '日',
  prefixText,
  suffixText,
  size = 'normal',
  nowrap = false,
  tooltip,
}: AnniversaryBadgeProps) {
  // const displayValue =
  // typeof value === 'number' ? value.toLocaleString() : value;
  const sizeConfig = sizeStyles[size];
  const shouldWrap = !nowrap;

  // const isLink = typeof href === 'string' && href.length > 0;

  const badgeWrapClasses = shouldWrap
    ? 'justify-start items-start whitespace-normal text-left shrink min-w-0'
    : 'whitespace-nowrap';

  const contentClassName = cn(
    shouldWrap
      ? 'flex flex-wrap items-center text-left min-w-0'
      : 'inline-flex items-center',
    sizeConfig.content,
    shouldWrap ? 'gap-x-2 gap-y-1' : null,
  );

  const textClassName = cn(
    'transition-colors',
    shouldWrap ? 'break-words break-all text-left min-w-0' : null,
  );

  const iconClassName = cn(
    'flex items-center',
    sizeConfig.icon,
    shouldWrap ? 'flex-none' : null,
  );

  const badge = (
    <Badge
      asChild={false}
      className={cn(
        'font-semibold bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] shadow-sm',
        sizeConfig.badge,
        // linkEnhancements,
        badgeWrapClasses,
        className,
      )}
    >
      <span className={contentClassName}>
        {icon ? (
          <span className={iconClassName} aria-hidden>
            {icon}
          </span>
        ) : null}
        <span className={textClassName}>
          {prefixText && (
            <span className={sizeConfig.value}>{`${prefixText}`}</span>
          )}

          {/* Years */}
          <>
            {/* <span className="text-lg">{years}</span> */}
            <span className={sizeConfig.value}>{years}</span>
            <span className={sizeConfig.label}>{yearLabel}</span>
          </>

          {/* Months */}
          {months != null && (
            <>
              <span className={sizeConfig.value}> {months}</span>
              <span className={sizeConfig.label}>{monthLabel}</span>
            </>
          )}
          {/* Days */}
          {days != null && (
            <>
              <span className={sizeConfig.value}> {days}</span>
              <span className={sizeConfig.label}>{dayLabel}</span>
            </>
          )}
          {suffixText && (
            <span className={sizeConfig.value}>{`${suffixText}`}</span>
          )}
        </span>
      </span>
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

  return <>{badge}</>;
}
