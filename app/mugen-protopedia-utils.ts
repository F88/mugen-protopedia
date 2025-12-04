/**
 * @file Utility functions for managing simulated delays and play modes in Mugen ProtoPedia.
 *
 * This module provides helpers to determine delay ranges based on abstract "levels" (SLOW, NORMAL, FAST, etc.),
 * calculate speed transitions (speedUp/speedDown), and resolve default settings for different play modes.
 */

import {
  PlayModeState,
  SimulatedDelayLevel,
  SimulatedDelayRange,
  SimulatedDelayRangeByLevel,
} from '@/types/mugen-protopedia.types';

/**
 * Simulated delay ranges for different delay levels.
 * Defines the minimum and maximum delay in milliseconds for each speed setting.
 */
export const DELAY_LEVELS: SimulatedDelayRangeByLevel = {
  SLOWEST: { min: 3_000, max: 10_000 },
  SLOWER: { min: 1_000, max: 7_000 },
  SLOW: { min: 1_000, max: 5_000 },
  NORMAL: { min: 500, max: 3_000 },
  FAST: { min: 500, max: 2_000 },
  FASTER: { min: 500, max: 1_000 },
  FASTEST: { min: 300, max: 300 },
  UNLEASHED: { min: 0, max: 0 },
};

/**
 * Get the simulated delay range configuration for a specific delay level.
 *
 * @param level - The delay level to retrieve the range for.
 * @returns The delay range object containing min and max delay values.
 */
export function getSimulatedDelayRangeForLevel(
  level: SimulatedDelayLevel,
): SimulatedDelayRange {
  return DELAY_LEVELS[level] ?? DELAY_LEVELS.NORMAL;
}

/**
 * Get the default simulated delay level for a given play mode.
 *
 * @param playModeType - The type of the current play mode.
 * @returns The default delay level associated with the play mode.
 */
export function getDefaultSimulatedDelayLevelForPlayMode(
  playModeType: PlayModeState['type'],
): SimulatedDelayLevel {
  switch (playModeType) {
    case 'normal':
      return 'NORMAL';
    case 'playlist':
      return 'NORMAL';
    case 'unleashed':
      return 'UNLEASHED';
    default:
      return 'NORMAL';
  }
}

/**
 * Calculate the next faster delay level.
 * Cycles back to SLOW if called when already at FASTEST (overheat mechanic).
 *
 * @param current - The current delay level.
 * @returns The next faster delay level.
 */
export function speedUp(current: SimulatedDelayLevel): SimulatedDelayLevel {
  switch (current) {
    case 'SLOWEST':
      return 'SLOWER';
    case 'SLOWER':
      return 'SLOW';
    case 'SLOW':
      return 'NORMAL';
    case 'NORMAL':
      return 'FAST';
    case 'FAST':
      return 'FASTER';
    case 'FASTER':
      return 'FASTEST';
    case 'FASTEST':
      return 'SLOW'; // Overheat to SLOW
    case 'UNLEASHED':
      return 'UNLEASHED'; // No change for UNLEASHED
    default:
      return current;
  }
}

/**
 * Calculate the next slower delay level.
 * Clamps at SLOW if called when already at SLOW.
 * For lower levels (SLOWER, SLOWEST), it clamps at SLOWEST.
 *
 * @param current - The current delay level.
 * @returns The next slower delay level.
 */
export function speedDown(current: SimulatedDelayLevel): SimulatedDelayLevel {
  switch (current) {
    case 'SLOWEST':
      return 'SLOWEST';
    case 'SLOWER':
      return 'SLOWEST';
    case 'SLOW':
      return 'SLOW';
    case 'NORMAL':
      return 'SLOW';
    case 'FAST':
      return 'NORMAL';
    case 'FASTER':
      return 'FAST';
    case 'FASTEST':
      return 'FASTER';
    default:
      return current;
  }
}

/**
 * Compare two PlayModeState objects for equality.
 *
 * Performs a deep comparison for 'playlist' mode (checking IDs and title),
 * and a simple type check for 'normal' and 'unleashed' modes.
 *
 * @param left - The first PlayModeState to compare.
 * @param right - The second PlayModeState to compare.
 * @returns True if the states are equivalent, false otherwise.
 */
export const arePlayModeStatesEqual = (
  left: PlayModeState,
  right: PlayModeState,
): boolean => {
  if (left.type !== right.type) {
    return false;
  }

  if (left.type === 'normal' && right.type === 'normal') {
    return true;
  }

  if (left.type === 'unleashed' && right.type === 'unleashed') {
    return true;
  }

  if (left.type === 'playlist' && right.type === 'playlist') {
    if (left.ids.length !== right.ids.length) {
      return false;
    }

    for (let index = 0; index < left.ids.length; index += 1) {
      if (left.ids[index] !== right.ids[index]) {
        return false;
      }
    }

    return left.title === right.title;
  }

  return false;
};
