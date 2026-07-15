import { useCallback, useState } from 'react';

import { useClientAnniversaries } from '@/lib/hooks/use-client-anniversaries';

// This component is intentionally presentational: it receives the already
// resolved analysis state via the `analysisState` prop instead of calling the
// real `useAnalysisOverview` hook itself. The real hook imports server actions,
// so keeping it out of this module avoids pulling those into the Storybook
// bundle, and not passing a hook around as a value lets the React Compiler
// memoize this component (and its parents). The hook is owned by
// `AnalysisDashboardContainer`. Do NOT import the real hook here.
import type { PrototypeAnalysis, AnalysisOverview } from '@/lib/analysis/types';

import { RefreshCw } from 'lucide-react';

import { AnalysisSummary } from '@/components/analysis-summary';
import { AnalysisDetailsDialogContent } from '@/components/analysis-details-dialog-content';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

export type AnalysisState = {
  data: AnalysisOverview | null;
  isLoading: boolean;
  error: string | null;
  refresh: (options?: { forceRecompute?: boolean }) => void;
};

type AnalysisDashboardProps = {
  defaultExpanded?: boolean;
  /**
   * Already resolved analysis state. The parent container owns the real hook
   * (`useAnalysisOverview`) and passes its result here so this component stays
   * presentational. See the module-level note above for why the hook is not
   * called here.
   */
  analysisState: AnalysisState;
  /**
   * When true, recomputes anniversaries (birthdays/newborns) on the client using
   * the user's local timezone and uses that result for the two sections and
   * summary counts. Falls back to server-provided analysis until the local
   * computation completes or on error.
   */
  preferClientTimezoneAnniversaries?: boolean;
  /**
   * Optional override for Storybook/tests to avoid real network calls when
   * `preferClientTimezoneAnniversaries` is true. If provided, this value will
   * be used instead of the real client recomputation result.
   */
  clientAnniversariesOverride?: {
    anniversaries: PrototypeAnalysis['anniversaries'] | null;
    isLoading: boolean;
    error: string | null;
  } | null;
  /**
   * Flag indicating if the current environment is development.
   * Used to conditionally display debug metrics.
   */
  isDevelopment?: boolean;
};

/**
 * Main analysis dashboard component with dialog-based details view
 */
export function AnalysisDashboard({
  defaultExpanded = true,
  analysisState,
  preferClientTimezoneAnniversaries = true,
  clientAnniversariesOverride = null,
  isDevelopment = false,
}: AnalysisDashboardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(() => defaultExpanded);
  const { data: analysis, isLoading, error, refresh } = analysisState;
  // Always call the hook; gate heavy work via enabled flag to satisfy rules-of-hooks
  const clientTZ = useClientAnniversaries(analysis, {
    enabled: preferClientTimezoneAnniversaries,
  });

  // Refresh both server-side analysis and client TZ anniversaries (when applicable)
  const refreshBoth = useCallback(() => {
    refresh({ forceRecompute: true });
    if (preferClientTimezoneAnniversaries && !clientAnniversariesOverride) {
      clientTZ.refresh();
    }
  }, [
    refresh,
    clientTZ,
    preferClientTimezoneAnniversaries,
    clientAnniversariesOverride,
  ]);

  if (isLoading) {
    return (
      <AnalysisSummary density="compact">
        <span className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
        </span>
      </AnalysisSummary>
    );
  }

  if (error) {
    return (
      <AnalysisSummary
        tone="error"
        density="compact"
        actions={
          <Button
            type="button"
            onClick={refreshBoth}
            variant="destructive"
            size="sm"
          >
            Retry
          </Button>
        }
      >
        <span className="max-w-full truncate">{error}</span>
      </AnalysisSummary>
    );
  }

  if (!analysis) {
    return (
      <AnalysisSummary
        density="compact"
        actions={
          <Button
            type="button"
            onClick={() => refresh()}
            variant="outline"
            size="sm"
          >
            Load
          </Button>
        }
      >
        <span>No data</span>
      </AnalysisSummary>
    );
  }

  const analyzedDate = new Date(analysis.analyzedAt);
  const formattedDate = analyzedDate.toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const anniversariesLoading =
    preferClientTimezoneAnniversaries &&
    (clientAnniversariesOverride
      ? clientAnniversariesOverride.isLoading
      : clientTZ.isLoading);

  const effectiveAnniversaries = (() => {
    if (preferClientTimezoneAnniversaries) {
      if (clientAnniversariesOverride?.anniversaries) {
        return clientAnniversariesOverride.anniversaries;
      }
      if (clientTZ.anniversaries) {
        return clientTZ.anniversaries;
      }
      // If server analysis is present but client anniversaries are not yet
      // available (and not in an error state), it implies client-side
      // computation is pending. Fall back to empty data to avoid errors.
      if (analysis && !clientTZ.anniversaries && !clientTZ.error) {
        return {
          birthdayCount: 0,
          birthdayPrototypes: [],
          newbornCount: 0,
          newbornPrototypes: [],
        };
      }
      if (clientTZ.isLoading || clientTZ.error) {
        return {
          birthdayCount: 0,
          birthdayPrototypes: [],
          newbornCount: 0,
          newbornPrototypes: [],
        };
      }
    }
    // preferClientTimezoneAnniversaries=false is not a real-world config anymore.
    // Emit a signal so we can spot regressions in case this fallback ever renders.
    console.error(
      '[AnalysisDashboard] Unexpected state: Missing client-side anniversaries without loading/error; falling back to empty slice',
      {
        preferClientTimezoneAnniversaries,
        hasClientOverride: Boolean(clientAnniversariesOverride?.anniversaries),
        hasClientHookData: Boolean(clientTZ.anniversaries),
        isClientLoading: clientTZ.isLoading,
        clientError: clientTZ.error,
      },
    );
    return {
      birthdayCount: 0,
      birthdayPrototypes: [],
      newbornCount: 0,
      newbornPrototypes: [],
    };
  })();

  const birthdayCount = effectiveAnniversaries.birthdayCount;
  const newbornCount = effectiveAnniversaries.newbornCount;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AnalysisSummary
        density="compact"
        actions={
          <>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 px-2"
              >
                🔍
              </Button>
            </DialogTrigger>
            <Button
              type="button"
              onClick={refreshBoth}
              size="sm"
              className="hidden gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 sm:inline-flex"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </>
        }
      >
        <span className="hidden sm:inline text-sm">
          🧪 {analysis.totalCount.toLocaleString()}
        </span>
        <span className="hidden sm:inline text-sm">
          🎖️ {analysis.prototypesWithAwards.toLocaleString()}
        </span>
        <span className="text-sm sm:text-base">
          🐣 {newbornCount.toLocaleString()}
        </span>
        <span className="text-sm sm:text-base">
          🎉 {birthdayCount.toLocaleString()}
        </span>
      </AnalysisSummary>

      <AnalysisDetailsDialogContent
        analysis={analysis}
        anniversaries={effectiveAnniversaries}
        anniversariesLoading={anniversariesLoading}
        formattedDate={formattedDate}
        isDevelopment={isDevelopment}
        onRefresh={refreshBoth}
      />
    </Dialog>
  );
}
