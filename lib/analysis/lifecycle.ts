/**
 * @fileoverview
 * Shared lifecycle utilities for prototype analysis modules.
 *
 * - Normalizes timestamps to JST for consistent analytics
 * - Provides reusable context objects for create/update/release/sunset events
 * - Centralizes future lifecycle-driven helpers across batch/core layers
 */
import type { NormalizedPrototype } from '@/lib/api/prototypes';

/**
 * Represents a single lifecycle moment (create, update, release, sunset) in JST.
 *
 * @property iso - Raw ISO 8601 timestamp from upstream data.
 * @property timestampMs - Parsed millisecond epoch (UTC reference).
 * @property year - JST calendar year.
 * @property mmdd - Month-day (MM-DD) string in JST.
 * @property yyyymmdd - Full date (YYYY-MM-DD) in JST.
 * @property weekday - JST weekday index (0=Sunday, 6=Saturday).
 * @property hour - JST hour of day (0-23).
 */
export type LifecycleMomentContext = {
  iso: string;
  timestampMs: number;
  year: number;
  mmdd: string;
  yyyymmdd: string;
  weekday: number;
  hour: number;
};

/**
 * Precomputed lifecycle timeline for a prototype.
 *
 * @property prototype - Source normalized prototype object.
 * @property create - JST-normalized creation moment (if available).
 * @property update - JST-normalized last update moment (if available).
 * @property release - JST-normalized release moment (required).
 * @property sunset - JST-normalized retirement moment (when status=4).
 */
export type PrototypeLifecycleContext = {
  prototype: NormalizedPrototype;
  create?: LifecycleMomentContext;
  update?: LifecycleMomentContext;
  release: LifecycleMomentContext;
  sunset?: LifecycleMomentContext;
};

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * Converts an ISO timestamp into a JST lifecycle moment descriptor.
 *
 * @param dateISO - ISO timestamp string from upstream data.
 * @returns Normalized lifecycle moment or null for missing/invalid input.
 */
export function createLifecycleMomentContext(
  dateISO: string | undefined,
): LifecycleMomentContext | null {
  if (!dateISO) {
    return null;
  }

  const timestampMs = Date.parse(dateISO);
  if (Number.isNaN(timestampMs)) {
    return null;
  }

  const jstDate = new Date(timestampMs + JST_OFFSET_MS);
  const year = jstDate.getUTCFullYear();
  const month = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(jstDate.getUTCDate()).padStart(2, '0');

  return {
    iso: dateISO,
    timestampMs,
    year,
    mmdd: `${month}-${day}`,
    yyyymmdd: `${year}-${month}-${day}`,
    weekday: jstDate.getUTCDay(),
    hour: jstDate.getUTCHours(),
  };
}

/**
 * Builds a lifecycle context for a prototype, including inferred sunset dates.
 *
 * @param prototype - Normalized prototype with raw timestamps and status.
 * @returns Lifecycle context when release data is valid; otherwise null.
 */
export function createPrototypeLifecycleContext(
  prototype: NormalizedPrototype,
): PrototypeLifecycleContext | null {
  const release = createLifecycleMomentContext(prototype.releaseDate);
  if (!release) {
    return null;
  }

  const create = createLifecycleMomentContext(prototype.createDate);
  const update = createLifecycleMomentContext(prototype.updateDate);
  const sunset = prototype.status === 4 ? update : null; // status:4 marks retired entries

  return {
    prototype,
    release,
    ...(create ? { create } : {}),
    ...(update ? { update } : {}),
    ...(sunset ? { sunset } : {}),
  };
}
