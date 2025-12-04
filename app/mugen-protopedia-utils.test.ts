import { describe, expect, it } from 'vitest';
import type { SimulatedDelayLevel } from '@/types/mugen-protopedia.types';
import {
  DELAY_LEVELS,
  arePlayModeStatesEqual,
  getDefaultSimulatedDelayLevelForPlayMode,
  getSimulatedDelayRangeForLevel,
  speedDown,
  speedUp,
} from './mugen-protopedia-utils';

describe('mugen-protopedia-utils', () => {
  describe('getSimulatedDelayRangeForLevel', () => {
    it.each([
      ['SLOWEST', DELAY_LEVELS.SLOWEST],
      ['SLOWER', DELAY_LEVELS.SLOWER],
      ['SLOW', DELAY_LEVELS.SLOW],
      ['NORMAL', DELAY_LEVELS.NORMAL],
      ['FAST', DELAY_LEVELS.FAST],
      ['FASTER', DELAY_LEVELS.FASTER],
      ['FASTEST', DELAY_LEVELS.FASTEST],
      ['UNLEASHED', DELAY_LEVELS.UNLEASHED],
      ['UNKNOWN_LEVEL', DELAY_LEVELS.NORMAL],
    ])('should return correct range for %s level', (level, expected) => {
      // @ts-expect-error Testing invalid input
      const range = getSimulatedDelayRangeForLevel(level);
      expect(range).toEqual(expected);
    });
  });

  describe('getDefaultSimulatedDelayLevelForPlayMode', () => {
    it.each([
      ['normal', 'NORMAL'],
      ['playlist', 'NORMAL'],
      ['unleashed', 'UNLEASHED'],
      ['unknown', 'NORMAL'],
    ])('should return %s for %s play mode', (mode, expected) => {
      // @ts-expect-error Testing invalid input
      expect(getDefaultSimulatedDelayLevelForPlayMode(mode)).toBe(expected);
    });
  });

  describe('speedUp', () => {
    it.each([
      ['SLOWEST', 'SLOWER'],
      ['SLOWER', 'SLOW'],
      ['SLOW', 'NORMAL'],
      ['NORMAL', 'FAST'],
      ['FAST', 'FASTER'],
      ['FASTER', 'FASTEST'],
      ['FASTEST', 'SLOW'],
      ['UNLEASHED', 'UNLEASHED'],
    ])('should increase speed from %s to %s', (current, expected) => {
      expect(speedUp(current as SimulatedDelayLevel)).toBe(expected);
    });
  });

  describe('speedDown', () => {
    it.each([
      ['SLOWEST', 'SLOWEST'],
      ['SLOWER', 'SLOWEST'],
      ['SLOW', 'SLOW'],
      ['NORMAL', 'SLOW'],
      ['FAST', 'NORMAL'],
      ['FASTER', 'FAST'],
      ['FASTEST', 'FASTER'],
      ['UNLEASHED', 'UNLEASHED'],
    ])('should decrease speed from %s to %s', (current, expected) => {
      expect(speedDown(current as SimulatedDelayLevel)).toBe(expected);
    });
  });

  describe('arePlayModeStatesEqual', () => {
    it('should return true for identical normal states', () => {
      expect(
        arePlayModeStatesEqual({ type: 'normal' }, { type: 'normal' }),
      ).toBe(true);
    });

    it('should return true for identical unleashed states', () => {
      expect(
        arePlayModeStatesEqual({ type: 'unleashed' }, { type: 'unleashed' }),
      ).toBe(true);
    });

    it('should return true for identical playlist states', () => {
      expect(
        arePlayModeStatesEqual(
          { type: 'playlist', ids: [1, 2, 3], title: 'My Playlist' },
          { type: 'playlist', ids: [1, 2, 3], title: 'My Playlist' },
        ),
      ).toBe(true);
    });

    it('should return false for different types', () => {
      expect(
        arePlayModeStatesEqual({ type: 'normal' }, { type: 'unleashed' }),
      ).toBe(false);
    });

    it('should return false for playlist states with different ids', () => {
      expect(
        arePlayModeStatesEqual(
          { type: 'playlist', ids: [1, 2, 3] },
          { type: 'playlist', ids: [1, 2, 4] },
        ),
      ).toBe(false);
    });

    it('should return false if one playlist state has different title', () => {
      expect(
        arePlayModeStatesEqual(
          { type: 'playlist', ids: [1, 2, 3], title: 'A' },
          { type: 'playlist', ids: [1, 2, 3], title: 'B' },
        ),
      ).toBe(false);
    });
  });
});
