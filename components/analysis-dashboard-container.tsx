'use client';

import { useAnalysisOverview } from '@/lib/hooks/use-analysis';

import { AnalysisDashboard } from './analysis-dashboard';

type AnalysisDashboardContainerProps = {
  defaultExpanded?: boolean;
  preferClientTimezoneAnniversaries?: boolean;
  isDevelopment?: boolean;
};

/**
 * Container that owns the real `useAnalysisOverview` hook and feeds its resolved
 * state into the presentational `AnalysisDashboard`.
 *
 * This thin wrapper exists for two reasons:
 *
 * 1. The hook is kept in a separate module from `AnalysisDashboard` so the
 *    server actions it imports never enter the Storybook bundle (stories import
 *    `AnalysisDashboard` directly and inject mock state instead).
 * 2. Calling the hook here — rather than passing it down as a prop — keeps the
 *    dashboard presentational, which lets the React Compiler memoize both this
 *    component and the consumers that render it. Owning the hook in a small
 *    leaf container (instead of lifting it into the page component) also keeps
 *    analysis re-renders isolated to this subtree.
 */
export function AnalysisDashboardContainer(
  props: AnalysisDashboardContainerProps,
) {
  const analysisState = useAnalysisOverview();
  return <AnalysisDashboard {...props} analysisState={analysisState} />;
}
