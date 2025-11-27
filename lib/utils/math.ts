/**
 * Math utility functions
 */

/**
 * Clamps a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Clamps a percentage value between 0 and 100, rounding to the nearest integer
 */
export const clampPercent = (value: number): number =>
  Math.max(0, Math.min(100, Math.round(value)));
