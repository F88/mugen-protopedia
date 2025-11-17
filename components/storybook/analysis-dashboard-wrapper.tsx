import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { RefreshCw } from 'lucide-react';

import { AnalysisSummary } from '@/components/analysis-summary';
import { Button } from '@/components/ui/button';

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
});

const defaultMetrics = {
  totalPrototypes: 4821,
  prototypesWithAwards: 1672,
  birthdayCount: 4,
  newbornCount: 3,
} as const;

export type AnalysisDashboardSummaryMetrics = {
  totalPrototypes?: number;
  prototypesWithAwards?: number;
  birthdayCount?: number;
  newbornCount?: number;
};

/**
 * Storybook-friendly wrapper for the header slot where the real analysis
 * dashboard appears. Mirrors the compact summary bar rendered by the real
 * component so Header stories keep the same visual rhythm without requiring
 * dialog wiring.
 */
export type AnalysisDashboardStoryWrapperProps = {
  /** Optional render function for the real dashboard when needed. */
  renderActual?: () => ReactNode;
  /** Override the default summary metrics. */
  metrics?: AnalysisDashboardSummaryMetrics;
  /** Render a loading state for scenarios like skeleton testing. */
  isLoading?: boolean;
  /** Custom placeholder node shown when neither snapshot nor actual render. */
  placeholderNode?: ReactNode;
  /** Text displayed when falling back to plain placeholder. */
  placeholderLabel?: string;
  /** Extra class names merged onto the outer wrapper. */
  className?: string;
  /** Hide the refresh button when the layout only needs the search trigger. */
  showRefreshButton?: boolean;
};

export function AnalysisDashboardStoryWrapper({
  renderActual,
  metrics,
  isLoading = false,
  placeholderNode,
  placeholderLabel = 'Analysis dashboard unavailable',
  className,
  showRefreshButton = true,
}: AnalysisDashboardStoryWrapperProps) {
  if (typeof renderActual === 'function') {
    return <>{renderActual()}</>;
  }

  if (isLoading) {
    const placeholders = [
      { className: 'hidden text-sm sm:inline', widthClass: 'w-20' },
      { className: 'hidden text-sm sm:inline', widthClass: 'w-24' },
      { className: 'text-sm sm:text-base', widthClass: 'w-16' },
      { className: 'text-sm sm:text-base', widthClass: 'w-16' },
    ];

    return (
      <AnalysisSummary
        density="compact"
        className={cn(
          'border border-border text-muted-foreground shadow-sm',
          className,
        )}
        actions={
          <div className="flex items-center gap-1.5">
            <span className="h-8 w-10 animate-pulse rounded bg-muted" />
            {showRefreshButton ? (
              <span className="hidden h-8 w-10 animate-pulse rounded bg-muted sm:inline-block" />
            ) : null}
          </div>
        }
      >
        {placeholders.map(({ className: container, widthClass }, index) => (
          <span key={index} className={container} aria-hidden="true">
            <span
              className={cn(
                'block h-4 animate-pulse rounded bg-muted',
                widthClass,
              )}
            />
          </span>
        ))}
      </AnalysisSummary>
    );
  }

  if (placeholderNode) {
    return (
      <>
        {placeholderNode}
        {placeholderLabel ? (
          <span className="sr-only">{placeholderLabel}</span>
        ) : null}
      </>
    );
  }

  const snapshot = {
    ...defaultMetrics,
    ...(metrics ?? {}),
  } satisfies AnalysisDashboardSummaryMetrics;

  return (
    <AnalysisSummary
      density="compact"
      className={className}
      actions={
        <>
          <Button type="button" variant="outline" size="sm" className="gap-2">
            🔍
          </Button>
          {showRefreshButton ? (
            <Button
              type="button"
              size="sm"
              className="hidden gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 sm:inline-flex"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          ) : null}
        </>
      }
    >
      <span className="hidden text-sm sm:inline">
        🧪 {numberFormatter.format(snapshot.totalPrototypes ?? 0)}
      </span>
      <span className="hidden text-sm sm:inline">
        🎖️ {numberFormatter.format(snapshot.prototypesWithAwards ?? 0)}
      </span>
      <span className="text-sm sm:text-base">
        🎉 {numberFormatter.format(snapshot.birthdayCount ?? 0)}
      </span>
      <span className="text-sm sm:text-base">
        🐣 {numberFormatter.format(snapshot.newbornCount ?? 0)}
      </span>
    </AnalysisSummary>
  );
}
