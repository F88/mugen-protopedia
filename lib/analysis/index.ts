/**
 * @fileoverview
 * Central export for all analysis logic in mugen-protopedia.
 *
 * Directory policy:
 * - This directory aggregates all analysis-related modules: batch, single, shared, types, etc.
 * - Use this index to provide a unified import surface for analysis consumers.
 * - Each subdirectory should have its own index.ts with policy comments and exports.
 *
 * Directory purposes:
 *
 * entrypoints/   : Entrypoints for analysis APIs, CLI, or external calls.
 * individual/, single/ : Small analysis functions for single prototype objects.
 * shared/        : Shared logic/utilities used by both batch and single analysis.
 * types/         : Type definitions for separation and reuse.
 * batch/         : Efficient, multi-prototype (batch) analysis logic.
 */

export * from './core';
export * from './batch';
// export * from './single'; // Uncomment when single-purpose analysis is implemented
export * from './shared';
// export * from './types';  // Uncomment when types are separated
export * from './entrypoints/server';
export * from './entrypoints/client';
