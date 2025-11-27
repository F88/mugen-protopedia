import type { AnniversaryCandidatePrototype } from '@/lib/analysis/types';

/**
 * Extracts month-day string in MM-DD format from a date string or Date object.
 *
 * @param date - Date string (ISO or any parseable format) or Date object
 * @returns MM-DD string (e.g., "01-15", "12-31") or null if invalid
 */
export function extractMonthDay(date: string | Date): string | null {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (Number.isNaN(dateObj.getTime())) {
    return null;
  }

  const month = dateObj.getUTCMonth() + 1;
  const day = dateObj.getUTCDate();
  const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));

  return `${pad2(month)}-${pad2(day)}`;
}

export type AnniversaryCandidateTotals = {
  candidates: number;
  birthday: number;
  byMonthDay: Record<string, number>;
};

/**
 * Builds aggregated month-day totals for anniversary candidates so both server
 * and client logs can emit identical diagnostics.
 */
export function buildAnniversaryCandidateTotals(
  candidates: Array<Pick<AnniversaryCandidatePrototype, 'releaseDate'>>,
  options?: { referenceDate?: Date },
): AnniversaryCandidateTotals {
  const monthDayCounts = candidates.reduce<Record<string, number>>(
    (acc, prototype) => {
      if (!prototype.releaseDate) {
        return acc;
      }
      const mmdd = extractMonthDay(prototype.releaseDate);
      if (mmdd) {
        acc[mmdd] = (acc[mmdd] ?? 0) + 1;
      }
      return acc;
    },
    {},
  );

  const referenceDate = options?.referenceDate ?? new Date();
  const todayKey = extractMonthDay(referenceDate);
  const birthdayCount = todayKey ? (monthDayCounts[todayKey] ?? 0) : 0;

  return {
    candidates: candidates.length,
    birthday: birthdayCount,
    byMonthDay: monthDayCounts,
  };
}
