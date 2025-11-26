import { useCallback, useState, type ReactNode } from 'react';

import { useClientAnniversaries } from '@/lib/hooks/use-client-anniversaries';
import { calculateAge } from '@/lib/utils/anniversary-nerd';
import { getPrototypeStatusLabel } from '@/lib/utils/value-to-label';

import './analysis-dashboard.css';

// The hook is injected to avoid importing server actions in Storybook bundles.
// Do NOT import the real hook here.
import type {
  PrototypeAnalysis,
  ServerPrototypeAnalysis,
} from '@/lib/utils/prototype-analysis.types';

import { RefreshCw } from 'lucide-react';

import { ActivityHeatmap } from '@/components/analysis/activity-heatmap';
import { AnalysisSummary } from '@/components/analysis-summary';
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
  const total = Object.values(statusDistribution).reduce((a, b) => a + b, 0);
  const entries = Object.entries(statusDistribution)
    .map(([status, count]) => ({
      status: parseInt(status),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Sort by status ID for the stacked bar to show a logical progression
  const sortedForBar = [...entries].sort((a, b) => a.status - b.status);

  if (entries.length === 0) {
    return (
      <div className="text-sm text-gray-500">No status data available</div>
    );
  }

  const getStatusClass = (status: number) => {
    switch (status) {
      case 1:
        return 'prototype-status-color-1'; // Idea
      case 2:
        return 'prototype-status-color-2'; // Developing
      case 3:
        return 'prototype-status-color-3'; // Completed
      case 4:
        return 'prototype-status-color-4'; // Memorial/Kuyo
      default:
        return 'prototype-status-color-default';
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Status Distribution
      </h4>
      {/* Visual Distribution Bar */}
      <div className="space-y-2">
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner dark:bg-gray-800">
          {sortedForBar.map(({ status, count, percentage }) => (
            <div
              key={status}
              style={
                {
                  '--segment-width': `${percentage}%`,
                } as React.CSSProperties
              }
              className={`relative group h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full hover:opacity-90 prototype-status-bar-segment ${getStatusClass(status)}`}
              title={`${getPrototypeStatusLabel(status)}: ${count} (${percentage.toFixed(1)}%)`}
            />
          ))}
        </div>
        <div className="flex justify-end px-1 text-xs text-gray-500">
          <span>Total: {total.toLocaleString()}</span>
        </div>
      </div>

      {/* Detailed List */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {entries.map(({ status, count, percentage }) => (
            <div
              key={status}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/70 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800/60"
            >
              <div className="flex items-center gap-2">
                <StatusBadge status={status} />
                <span className="text-xs text-gray-500">
                  ({percentage.toFixed(1)}%)
                </span>
              </div>
              <span className="text-sm font-medium">
                {count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// TopTags and TopMaterials components removed as they are no longer used in the dashboard.

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
    const showCount = 10;
    birthdayBody = (
      <div className="space-y-1">
        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {birthdayCount.toLocaleString()} prototypes celebrating today!
        </div>
        {sortedBirthdayPrototypes.slice(0, showCount).map((prototype) => (
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
            <span className="text-base text-blue-600 dark:text-blue-400 font-semibold">
              🎂 {calculateAge(prototype.releaseDate).years} 歳
            </span>
          </div>
        ))}
        {birthdayCount > showCount && (
          <div className="text-xs text-gray-500">
            +{birthdayCount - showCount} more prototypes
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
  useLatestAnalysisHook,
  preferClientTimezoneAnniversaries = true,
  clientAnniversariesOverride = null,
  isDevelopment = false,
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

        <div className="space-y-8 pb-2">
          {/* Section 1: Overview */}
          <section className="space-y-4">
            <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              📊 Overview
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <AnalysisStat
                label="Total Prototypes"
                value={analysis.totalCount.toLocaleString()}
              />
              <AnalysisStat
                label="Current Streak"
                value={`${analysis.creationStreak.currentStreak.toLocaleString()} ${analysis.creationStreak.currentStreak === 1 ? 'day' : 'days'}`}
                description={`Longest: ${analysis.creationStreak.longestStreak.toLocaleString()} ${analysis.creationStreak.longestStreak === 1 ? 'day' : 'days'}`}
              />
              <AnalysisStat
                label="Days with Releases"
                value={analysis.creationStreak.totalActiveDays.toLocaleString()}
                description="total active days"
              />
              <AnalysisStat
                label="Average Age"
                value={`${Math.round(analysis.averageAgeInDays).toLocaleString()} ${Math.round(analysis.averageAgeInDays) === 1 ? 'day' : 'days'}`}
                description={`~${Math.round(analysis.averageAgeInDays / 365)} ${Math.round(analysis.averageAgeInDays / 365) === 1 ? 'year' : 'years'}`}
              />
              <AnalysisStat
                label="With Awards"
                value={analysis.prototypesWithAwards}
                description={`${((analysis.prototypesWithAwards / analysis.totalCount) * 100).toFixed(1).toLocaleString()}%`}
              />
            </div>
          </section>

          {/* Section 2: Today's Highlights */}
          <section className="space-y-4">
            <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              📅 Today&apos;s Highlights
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
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
            </div>
          </section>

          {/* Section 3: Prototype Status */}
          <section className="space-y-4">
            <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              🏗️ Prototype Status
            </h3>
            <StatusDistribution
              statusDistribution={analysis.statusDistribution}
            />
          </section>

          {/* Section 4: Developer's Rhythm */}
          <section className="space-y-4">
            <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              🕰️ Developer&apos;s Rhythm
            </h3>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <h4 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Weekly Release Activity (JST)
                </h4>
                {analysis.releaseTimeDistribution.heatmap ? (
                  <ActivityHeatmap
                    heatmap={analysis.releaseTimeDistribution.heatmap}
                  />
                ) : (
                  <div className="py-8 text-center text-sm text-gray-500">
                    No heatmap data available. Please clear cache to recompute.
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <h4 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Weekly Update Activity (JST)
                </h4>
                {analysis.updateTimeDistribution?.heatmap ? (
                  <ActivityHeatmap
                    heatmap={analysis.updateTimeDistribution.heatmap}
                    className="[&_.bg-green-200]:bg-blue-200 [&_.bg-green-300]:bg-blue-300 [&_.bg-green-400]:bg-blue-400 [&_.bg-green-500]:bg-blue-500 [&_.dark\:bg-green-900\/40]:dark:bg-blue-900/40 [&_.dark\:bg-green-800\/60]:dark:bg-blue-800/60 [&_.dark\:bg-green-700\/80]:dark:bg-blue-700/80 [&_.dark\:bg-green-600]:dark:bg-blue-600"
                  />
                ) : (
                  <div className="py-8 text-center text-sm text-gray-500">
                    No update heatmap data available.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 5: Community Trends */}
          <section className="space-y-4">
            <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              📈 Community Trends
            </h3>
            <div className="grid gap-6 md:grid-cols-1">
              {analysis.maternityHospital?.topEvents?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Top Events
                  </h4>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {analysis.maternityHospital.topEvents.map(
                      ({ event, count }, _, arr) => {
                        const maxCount = arr[0].count;
                        const ratio = count / maxCount;
                        let bgClass =
                          'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800';

                        if (ratio > 0.8) {
                          bgClass =
                            'bg-indigo-200 dark:bg-indigo-800 border-indigo-300 dark:border-indigo-600';
                        } else if (ratio > 0.5) {
                          bgClass =
                            'bg-indigo-100 dark:bg-indigo-900/60 border-indigo-200 dark:border-indigo-700';
                        }

                        return (
                          <div
                            key={event}
                            className={`flex items-start justify-between gap-3 rounded border p-2 transition-colors ${bgClass}`}
                          >
                            <span className="min-w-0 text-sm font-medium wrap-break-word text-gray-900 dark:text-gray-100">
                              {event}
                            </span>
                            <span className="shrink-0 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                              {count}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Debug Metrics */}
        {isDevelopment && analysis._debugMetrics && (
          <div className="rounded-lg border border-gray-200 bg-white/70 p-4 text-xs dark:border-gray-700 dark:bg-gray-800/60">
            <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
              Debug Metrics (ms)
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3 md:grid-cols-4">
              {Object.entries(analysis._debugMetrics).map(([key, value]) => (
                <li key={key} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {key}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {value.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-gray-200 pt-2 dark:border-gray-700">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                  Data Fields Usage
                </h4>
                <div className="flex gap-2 text-[10px]">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Used
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    Unused
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(analysis).map((key) => {
                  // Explicitly define keys used in the UI to highlight unused ones
                  const USED_KEYS = [
                    'totalCount',
                    'statusDistribution',
                    'prototypesWithAwards',
                    'topTags',
                    'topMaterials',
                    'averageAgeInDays',
                    'analyzedAt',
                    'anniversaryCandidates', // Used for client-side computation
                    'creationStreak', // Used in Overview
                    'maternityHospital', // Used in Community Trends
                    'releaseTimeDistribution', // Used in Maker's Rhythm
                    'updateTimeDistribution', // Used in Maker's Rhythm
                    '_debugMetrics', // Displayed right here
                  ];
                  const isUsed = USED_KEYS.includes(key);
                  return (
                    <span
                      key={key}
                      className={`rounded px-2 py-1 transition-colors ${
                        isUsed
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 font-medium ring-1 ring-amber-200 dark:ring-amber-800'
                      }`}
                      title={isUsed ? 'Used in UI' : 'Not used in UI'}
                    >
                      {key}
                      {!isUsed && ' ⚠️'}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
