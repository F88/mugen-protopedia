import { useState, type ReactNode } from 'react';

// The hook is injected to avoid importing server actions in Storybook bundles.
// Do NOT import the real hook here.
import type { PrototypeAnalysis } from '@/lib/utils/prototype-analysis';

import { RefreshCw } from 'lucide-react';

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

type SummaryBarProps = {
  children: ReactNode;
  actions?: ReactNode;
  tone?: 'default' | 'error';
  density?: 'normal' | 'compact';
};

function SummaryBar({
  children,
  actions,
  tone = 'default',
  density = 'normal',
}: SummaryBarProps) {
  const baseClass = 'flex flex-wrap items-center justify-between rounded-lg';
  const spacingClass =
    density === 'compact'
      ? 'gap-2 px-2 py-1.5 text-xs'
      : 'gap-3 px-3 py-2 text-sm';
  const minHeightClass =
    density === 'compact' ? 'min-h-[32px]' : 'min-h-[48px]';
  const toneClass =
    tone === 'error'
      ? 'text-red-700 dark:text-red-300'
      : 'text-gray-700 dark:text-gray-200';

  return (
    <div
      className={`${baseClass} ${spacingClass} ${minHeightClass} ${toneClass}`}
    >
      <div
        className={`flex flex-wrap items-center ${density === 'compact' ? 'gap-2' : 'gap-3'}`}
      >
        {children}
      </div>
      {actions && (
        <div
          className={`flex items-center ${density === 'compact' ? 'gap-1.5' : 'gap-2'}`}
        >
          {actions}
        </div>
      )}
    </div>
  );
}

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
 * Component to display birthday prototypes
 */
function BirthdayPrototypes({
  anniversaries,
}: {
  anniversaries: PrototypeAnalysis['anniversaries'];
}) {
  const { birthdayCount, birthdayPrototypes } = anniversaries;

  const sortedBirthdayPrototypes = [...birthdayPrototypes].sort(
    (a, b) => a.id - b.id,
  );
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        🎉 Birthday Prototypes Today
      </h4>
      {birthdayCount === 0 ? (
        <div className="text-sm text-gray-500">No birthdays today</div>
      ) : (
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
              <span className="text-blue-600 dark:text-blue-400 font-semibold shrink-0 self-start">
                {prototype.years} 歳
              </span>
            </div>
          ))}
          {birthdayCount > 3 && (
            <div className="text-xs text-gray-500">
              +{birthdayCount - 3} more prototypes
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type AnalysisState = {
  data: PrototypeAnalysis | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

type AnalysisDashboardProps = {
  defaultExpanded?: boolean;
  useLatestAnalysisHook: () => AnalysisState;
};

/**
 * Main analysis dashboard component with dialog-based details view
 */
export function AnalysisDashboard({
  defaultExpanded = true,
  useLatestAnalysisHook,
}: AnalysisDashboardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(() => defaultExpanded);
  const { data: analysis, isLoading, error, refresh } = useLatestAnalysisHook();

  if (isLoading) {
    return (
      <SummaryBar density="compact">
        <span className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
        </span>
      </SummaryBar>
    );
  }

  if (error) {
    return (
      <SummaryBar
        tone="error"
        density="compact"
        actions={
          <Button
            type="button"
            onClick={refresh}
            variant="destructive"
            size="sm"
          >
            Retry
          </Button>
        }
      >
        <span className="max-w-full truncate">{error}</span>
      </SummaryBar>
    );
  }

  if (!analysis) {
    return (
      <SummaryBar
        density="compact"
        actions={
          <Button type="button" onClick={refresh} variant="outline" size="sm">
            Load
          </Button>
        }
      >
        <span>No data</span>
      </SummaryBar>
    );
  }

  const analyzedDate = new Date(analysis.analyzedAt);
  const formattedDate = analyzedDate.toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const birthdayCount = analysis.anniversaries.birthdayCount;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <SummaryBar
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
              onClick={refresh}
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
      </SummaryBar>

      <DialogContent className="max-h-[85vh] overflow-y-auto p-4 sm:p-6 space-y-6 sm:max-w-4xl">
        <DialogHeader className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
          <Button
            type="button"
            onClick={refresh}
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

          {birthdayCount > 0 && (
            <div className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <BirthdayPrototypes anniversaries={analysis.anniversaries} />
            </div>
          )}

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
