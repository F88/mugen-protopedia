/**
 * @fileoverview
 * Exports all single-purpose, inefficient analysis functions that are candidates for future batching.
 *
 * Directory policy:
 * - Place legacy or non-batch analysis logic here for future refactoring.
 * - Each file should export a single, well-documented function.
 * - Use this index to aggregate exports for easier import elsewhere.
 */

export * from './top-tags';
export * from './top-materials';
export * from './average-age';
export * from './top-teams';
export * from './status-distribution';
export * from './awards-count';
export * from './year-distribution';
