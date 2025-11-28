/**
 * @fileoverview
 * Shared helpers for release-date keyed aggregations such as unique day counts.
 */

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import {
  createLifecycleMomentContext,
  createPrototypeLifecycleContext,
  type LifecycleMomentContext,
} from '../lifecycle';

type MinimalLogger = {
  debug: (payload: unknown, message?: string) => void;
};

export type DateBasedPrototypeInsights = {
  uniqueCreateDates: Set<string>;
  uniqueUpdateDates: Set<string>;
  uniqueReleaseDates: Set<string>;
};

type DateKind = 'create' | 'update' | 'release';

/**
 * Initializes the aggregation container for daily prototype insights.
 */
export function createDateBasedPrototypeInsights(): DateBasedPrototypeInsights {
  return {
    uniqueCreateDates: new Set<string>(),
    uniqueUpdateDates: new Set<string>(),
    uniqueReleaseDates: new Set<string>(),
  };
}

/**
 * Tracks a prototype event taking place at the provided JST date by recording the YYYY-MM-DD string.
 */
export function trackDateBasedPrototypeInsights(
  insights: DateBasedPrototypeInsights,
  moment: LifecycleMomentContext,
  kind: DateKind,
): void {
  const key = moment.yyyymmdd;

  switch (kind) {
    case 'create':
      insights.uniqueCreateDates.add(key);
      break;
    case 'update':
      insights.uniqueUpdateDates.add(key);
      break;
    case 'release':
      insights.uniqueReleaseDates.add(key);
      break;
    default:
      break;
  }
}

/**
 * Builds date-keyed insights (create/update/release JST dates) in a single pass.
 */
export function buildDateBasedPrototypeInsights(
  prototypes: NormalizedPrototype[],
  options?: { logger?: MinimalLogger },
): DateBasedPrototypeInsights {
  const startTime = performance.now();
  const insights = createDateBasedPrototypeInsights();

  prototypes.forEach((prototype) => {
    const lifecycle = createPrototypeLifecycleContext(prototype);

    const createMoment =
      lifecycle?.create ?? createLifecycleMomentContext(prototype.createDate);
    if (createMoment) {
      trackDateBasedPrototypeInsights(insights, createMoment, 'create');
    }

    const updateMoment =
      lifecycle?.update ?? createLifecycleMomentContext(prototype.updateDate);
    if (updateMoment) {
      trackDateBasedPrototypeInsights(insights, updateMoment, 'update');
    }

    const releaseMoment =
      lifecycle?.release ?? createLifecycleMomentContext(prototype.releaseDate);
    if (releaseMoment) {
      trackDateBasedPrototypeInsights(insights, releaseMoment, 'release');
    }
  });

  if (options?.logger) {
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
    options.logger.debug(
      {
        elapsedMs,
        uniqueCreateDates: insights.uniqueCreateDates.size,
        uniqueUpdateDates: insights.uniqueUpdateDates.size,
        uniqueReleaseDates: insights.uniqueReleaseDates.size,
      },
      '[ANALYSIS] Date-based prototype insights computed',
    );
  }

  return insights;
}
