import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AnalysisSummaryDensity = 'normal' | 'compact';

type AnalysisSummaryProps = {
  children: ReactNode;
  actions?: ReactNode;
  tone?: 'default' | 'error';
  density?: AnalysisSummaryDensity;
  className?: string;
};

const baseClassName =
  'flex flex-wrap items-center justify-between rounded-lg text-gray-700 dark:text-gray-200';

const densityStyles: Record<AnalysisSummaryDensity, string> = {
  normal: 'gap-3 px-3 py-2 text-sm min-h-[48px]',
  compact: 'gap-2 px-2 py-1.5 text-xs min-h-[32px]',
};

const toneStyles: Record<'default' | 'error', string> = {
  default: 'text-gray-700 dark:text-gray-200',
  error: 'text-red-700 dark:text-red-300',
};

/**
 * Shared summary bar used by the analysis dashboard and its Storybook wrapper.
 */
export function AnalysisSummary({
  children,
  actions,
  tone = 'default',
  density = 'normal',
  className,
}: AnalysisSummaryProps) {
  const contentGap = density === 'compact' ? 'gap-2' : 'gap-3';
  const actionGap = density === 'compact' ? 'gap-1.5' : 'gap-2';

  return (
    <div
      className={cn(
        baseClassName,
        densityStyles[density],
        toneStyles[tone],
        className,
      )}
    >
      <div className={cn('flex flex-wrap items-center', contentGap)}>
        {children}
      </div>
      {actions ? (
        <div className={cn('flex items-center', actionGap)}>{actions}</div>
      ) : null}
    </div>
  );
}
