import { useCallback, useState, type ReactNode } from 'react';

import { useClientAnniversaries } from '@/lib/hooks/use-client-anniversaries';
import { calculateAge } from '@/lib/utils/anniversary-nerd';

// The hook is injected to avoid importing server actions in Storybook bundles.
// Do NOT import the real hook here.
import type {
  PrototypeAnalysis,
  ServerPrototypeAnalysis,
} from '@/lib/utils/prototype-analysis.types';

import { RefreshCw } from 'lucide-react';

import { AnalysisSummary } from '@/components/analysis-summary';
import { StatBadge } from '@/components/ui/badges/stat-badge';
import { StatusBadge } from '@/components/ui/badges/status-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const title = 'Prototype Analysis';

/**
 * Component to display a single analysis statistic
 */
function AnalysisStat({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description?: string;
}) {
  return (
    <div className="flex flex-col space-y-1 text-center">
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </div>
      {description && (
        <div className="text-xs text-gray-500 dark:text-gray-500">
          {description}
        </div>
      )}
    </div>
  );
}

/**
 * Component to display status distribution
 */
function StatusDistribution({
  statusDistribution,
}: {
  statusDistribution: Record<string, number>;
}) {
  const entries = Object.entries(statusDistribution).sort(
    ([, a], [, b]) => b - a,
  );

  if (entries.length === 0) {
    return (
      <div className="text-sm text-gray-500">No status data available</div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Status Distribution
      </h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {entries.map(([status, count]) => (
          <div
            key={status}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/70 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800/60"
          >
            <StatusBadge status={parseInt(status)} />
            <span className="text-sm font-medium">
              {count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Component to display top tags
 */
function TopTags({
  topTags,
}: {
  topTags: Array<{ tag: string; count: number }>;
}) {
  if (topTags.length === 0) {
    return <div className="text-sm text-gray-500">No tags available</div>;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Popular Tags
      </h4>
      <div className="flex flex-wrap justify-center gap-1 sm:justify-start">
        {topTags.slice(0, 6).map(({ tag, count }) => (
          <StatBadge
            key={tag}
            label={tag}
            value={count}
            wrapValueWithParens={true}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Component to display birthday prototypes.
 *
 * Output specification:
 * - Always renders the section; shows an empty-state message when none.
 * - Sorting: by `releaseDate` ascending (oldest first); ties by `id` ascending.
 * - Renders up to the first 5 items from the sorted list.
 * - Each row shows:
 *   - ID (numeric identifier)
 *   - Title (prototype name)
 *   - Age badge computed at render using the user's local timezone:
 *     "🎂 N 歳".
 *
 * Timezone note:
 * - Birthday detection and displayed age are intended to reflect the user's local timezone.
 * - The age badge is recalculated on render via `calculateAge(releaseDate)` to ensure
 *   it matches the user's locale/timezone even if upstream analysis was computed on the server.
 * - When there are more than 5 items, shows a trailing summary:
 *   "+X more prototypes" where X is the remaining count.
 * - Empty state message: "No birthdays today".
 */
function BirthdayPrototypes({
  anniversaries,
  isLoading = false,
}: {
  anniversaries: PrototypeAnalysis['anniversaries'];
  isLoading?: boolean;
}) {
  const { birthdayCount, birthdayPrototypes } = anniversaries;

  const sortedBirthdayPrototypes = [...birthdayPrototypes].sort((a, b) => {
    const aTime = new Date(a.releaseDate).getTime();
    const bTime = new Date(b.releaseDate).getTime();
    if (aTime !== bTime) return aTime - bTime; // oldest first
    return a.id - b.id; // tie-breaker by ID ascending
  });

  let birthdayBody: ReactNode;
  if (isLoading) {
    birthdayBody = (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span>Loading birthdays…</span>
      </div>
    );
  } else if (birthdayCount === 0) {
    birthdayBody = (
      <div className="text-sm text-gray-500">No birthdays today</div>
    );
  } else {
    birthdayBody = (
      <div className="space-y-1">
        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {birthdayCount.toLocaleString()} prototypes celebrating today!
        </div>
        {sortedBirthdayPrototypes.slice(0, 5).map((prototype) => (
          <div
            key={prototype.id}
            className="flex items-start justify-between gap-3 text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                ID: {prototype.id}
              </span>
              <span className="font-medium wrap-break-word text-gray-900 dark:text-gray-100">
                {prototype.title}
              </span>
            </div>
            <span className="text-base text-blue-600 dark:text-blue-400 font-semibold shrink-0 self-start">
              🎂 {calculateAge(prototype.releaseDate).years} 歳
            </span>
          </div>
        ))}
        {birthdayCount > 5 && (
          <div className="text-xs text-gray-500">
            +{birthdayCount - 5} more prototypes
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        🎉 Birthday Prototypes Today
      </h4>
      {birthdayBody}
    </div>
  );
}

/**
 * Component to display newborn prototypes (published today).
 *
 * Output specification:
 * - Lists all newborn items for "today" (no truncation/pagination).
 * - Sorted by `releaseDate` in descending order (most recent first).
 * - Each row shows:
 *   - ID (numeric identifier)
 *   - Title (prototype name)
 *   - Badge "NEW"
 *   - Published time in Japanese locale with seconds: HH:MM:SS (`ja-JP`).
 * - When there are no newborns, renders: "No newborns today".
 */
function NewbornPrototypes({
  anniversaries,
  isLoading = false,
}: {
  anniversaries: PrototypeAnalysis['anniversaries'];
  isLoading?: boolean;
}) {
  const { newbornCount, newbornPrototypes } = anniversaries;

  const sortedNewbornPrototypes = [...newbornPrototypes].sort(
    (a, b) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
  );

  let newbornBody: ReactNode;
  if (isLoading) {
    newbornBody = (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span>Loading newborns…</span>
      </div>
    );
  } else if (newbornCount === 0) {
    newbornBody = (
      <div className="text-sm text-gray-500">No newborns today</div>
    );
  } else {
    newbornBody = (
      <div className="space-y-1">
        <div className="text-lg font-bold text-green-600 dark:text-green-400">
          {newbornCount.toLocaleString()} new prototypes published today!
        </div>
        {sortedNewbornPrototypes.map((prototype) => (
          <div
            key={prototype.id}
            className="flex items-start justify-between gap-3 text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                ID: {prototype.id}
              </span>
              <span className="font-medium wrap-break-word text-gray-900 dark:text-gray-100">
                {prototype.title}
              </span>
            </div>
            <span className="text-base text-green-700 dark:text-green-300">
              {`🎉 ` +
                new Date(prototype.releaseDate).toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        🐣 Newborn Prototypes Today
      </h4>
      {newbornBody}
    </div>
  );
}

type AnalysisState = {
  data: ServerPrototypeAnalysis | null;
  isLoading: boolean;
  error: string | null;
  refresh: (options?: { forceRecompute?: boolean }) => void;
};

type AnalysisDashboardProps = {
  defaultExpanded?: boolean;
  useLatestAnalysisHook: () => AnalysisState;
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
};

/**
 * Main analysis dashboard component with dialog-based details view
 */
export function AnalysisDashboard({
  defaultExpanded = true,
  useLatestAnalysisHook,
  preferClientTimezoneAnniversaries = true,
  clientAnniversariesOverride = null,
}: AnalysisDashboardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(() => defaultExpanded);
  const { data: analysis, isLoading, error, refresh } = useLatestAnalysisHook();
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
                className="gap-2"
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
          🎉 {birthdayCount.toLocaleString()}
        </span>
        <span className="text-sm sm:text-base">
          🐣 {newbornCount.toLocaleString()}
        </span>
      </AnalysisSummary>

      <DialogContent className="max-h-[85vh] overflow-y-auto p-4 sm:p-6 space-y-6 sm:max-w-4xl">
        <DialogHeader className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
          <Button
            type="button"
            onClick={refreshBoth}
            size="sm"
            className="self-start gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <DialogTitle className="self-center">{title}</DialogTitle>
          <DialogDescription className="self-center text-sm">
            Last updated: {formattedDate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pb-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnalysisStat
              label="Total Prototypes"
              value={analysis.totalCount.toLocaleString()}
            />
            <AnalysisStat
              label="With Awards"
              value={analysis.prototypesWithAwards}
              description={`${((analysis.prototypesWithAwards / analysis.totalCount) * 100).toFixed(1).toLocaleString()}%`}
            />
            <AnalysisStat
              label="Average Age"
              value={`${Math.round(analysis.averageAgeInDays).toLocaleString()} days`}
              description={`~${Math.round(analysis.averageAgeInDays / 365)} years`}
            />
            <AnalysisStat
              label="Top Tags"
              value={analysis.topTags.length.toLocaleString()}
              description="categories"
            />
          </div>

          <div className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <BirthdayPrototypes
              anniversaries={effectiveAnniversaries}
              isLoading={anniversariesLoading}
            />
          </div>

          <div className="bg-linear-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <NewbornPrototypes
              anniversaries={effectiveAnniversaries}
              isLoading={anniversariesLoading}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <StatusDistribution
              statusDistribution={analysis.statusDistribution}
            />
            <TopTags topTags={analysis.topTags} />
          </div>

          {analysis.topTeams.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active Teams
              </h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {analysis.topTeams.slice(0, 6).map(({ team, count }) => (
                  <div
                    key={team}
                    className="flex items-start justify-between gap-3 rounded bg-gray-50 p-2 dark:bg-gray-800"
                  >
                    <span className="min-w-0 text-sm font-medium wrap-break-word text-gray-900 dark:text-gray-100">
                      {team}
                    </span>
                    <span className="shrink-0 text-sm text-gray-600 dark:text-gray-400">
                      {count} prototypes
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
