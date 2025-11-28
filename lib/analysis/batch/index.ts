/**
 * @fileoverview
 * Exports all batch analysis functions for mugen-protopedia.
 *
 * Directory policy:
 * - Place all efficient, multi-prototype (batch) analysis logic in this directory.
 * - Each file should export a single, well-documented batch function or related types.
 * - Use this index to aggregate exports for easier import elsewhere.
 */

export * from './build-advanced-analysis';
export * from './build-time-distributions';
export * from './collect-unique-release-dates';
