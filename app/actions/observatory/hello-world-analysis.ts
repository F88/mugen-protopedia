'use server';

/**
 * @fileoverview Observatory-only analysis data source for the "Hello World" page.
 *
 * This is intentionally SEPARATE from the base analysis
 * (`buildAnalysisOverview` / `getAnalysisOverview`) that the 無限PP top page
 * depends on: the home page must not pay to compute Hello-World-only metrics.
 * The composition + caching live in the {@link analysisRepository}; this action
 * is a thin server entry point the page calls.
 */

import {
  analysisRepository,
  type AnalysisResult,
} from '@/lib/repositories/analysis-repository';
import type { HelloWorldInsights } from '@/lib/observatory/hello-world/build-hello-world-insights';

export type GetHelloWorldAnalysisResult = AnalysisResult<HelloWorldInsights>;

/**
 * Build the Hello World page's analysis on demand via the Analysis Repository.
 */
export async function getHelloWorldAnalysis(): Promise<GetHelloWorldAnalysisResult> {
  return analysisRepository.getHelloWorldAnalysis();
}
