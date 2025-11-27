/**
 * @fileoverview
 * To-be-batched: Single-purpose inefficient average age calculation.
 *
 * This function is kept for compatibility and will be refactored into a batch process.
 */
import type { NormalizedPrototype } from '../../api/prototypes';

/**
 * Computes the average age in days of all prototypes relative to the supplied reference date, skipping invalid or future-dated entries.
 *
 * @deprecated Should be batched with other analysis.
 * @param prototypes - Array of normalized prototypes to analyze.
 * @param referenceDate - Date to measure age against (typically "now").
 * @returns Average age in days; 0 if no valid prototypes.
 */
export function computeAverageAgeInDays(
  prototypes: NormalizedPrototype[],
  referenceDate: Date,
): number {
  const ages = prototypes
    .map((prototype) => {
      const releaseDate = new Date(prototype.releaseDate);
      return (
        (referenceDate.getTime() - releaseDate.getTime()) /
        (1000 * 60 * 60 * 24)
      );
    })
    .filter((age) => !Number.isNaN(age) && age >= 0);
  if (ages.length === 0) {
    return 0;
  }
  const total = ages.reduce((sum, age) => sum + age, 0);
  return total / ages.length;
}
