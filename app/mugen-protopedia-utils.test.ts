import { describe, expect, it } from 'vitest';
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
    it('should return correct range for NORMAL level', () => {
      const range = getSimulatedDelayRangeForLevel('NORMAL');
      expect(range).toEqual(DELAY_LEVELS.NORMAL);
    });

    it('should return correct range for FASTEST level', () => {
      const range = getSimulatedDelayRangeForLevel('FASTEST');
      expect(range).toEqual(DELAY_LEVELS.FASTEST);
    });

    it('should return NORMAL range for unknown level (fallback)', () => {
      // @ts-expect-error Testing invalid input
      const range = getSimulatedDelayRangeForLevel('UNKNOWN_LEVEL');
      expect(range).toEqual(DELAY_LEVELS.NORMAL);
    });
  });

  describe('getDefaultSimulatedDelayLevelForPlayMode', () => {
    it('should return NORMAL for normal play mode', () => {
      expect(getDefaultSimulatedDelayLevelForPlayMode('normal')).toBe('NORMAL');
    });

    it('should return NORMAL for playlist play mode', () => {
      expect(getDefaultSimulatedDelayLevelForPlayMode('playlist')).toBe(
        'NORMAL',
      );
    });

    it('should return UNLEASHED for unleashed play mode', () => {
      expect(getDefaultSimulatedDelayLevelForPlayMode('unleashed')).toBe(
        'UNLEASHED',
      );
    });

    it('should return NORMAL for unknown play mode (fallback)', () => {
      // @ts-expect-error Testing invalid input
      expect(getDefaultSimulatedDelayLevelForPlayMode('unknown')).toBe(
        'NORMAL',
      );
    });
  });

  describe('speedUp', () => {
    it('should increase speed from SLOW to NORMAL', () => {
      expect(speedUp('SLOW')).toBe('NORMAL');
    });

    it('should increase speed from NORMAL to FAST', () => {
      expect(speedUp('NORMAL')).toBe('FAST');
    });

    it('should increase speed from FAST to FASTER', () => {
      expect(speedUp('FAST')).toBe('FASTER');
    });

    it('should increase speed from FASTER to FASTEST', () => {
      expect(speedUp('FASTER')).toBe('FASTEST');
    });

    it('should overheat (reset to SLOW) from FASTEST', () => {
      expect(speedUp('FASTEST')).toBe('SLOW');
    });

    it('should return current level for UNLEASHED (no change)', () => {
      expect(speedUp('UNLEASHED')).toBe('UNLEASHED');
    });
  });

  describe('speedDown', () => {
    it('should stay at SLOW when slowing down from SLOW', () => {
      expect(speedDown('SLOW')).toBe('SLOW');
    });

    it('should decrease speed from NORMAL to SLOW', () => {
      expect(speedDown('NORMAL')).toBe('SLOW');
    });

    it('should decrease speed from FAST to NORMAL', () => {
      expect(speedDown('FAST')).toBe('NORMAL');
    });

    it('should decrease speed from FASTER to FAST', () => {
      expect(speedDown('FASTER')).toBe('FAST');
    });

    it('should decrease speed from FASTEST to FASTER', () => {
      expect(speedDown('FASTEST')).toBe('FASTER');
    });

    it('should return current level for UNLEASHED (no change)', () => {
      expect(speedDown('UNLEASHED')).toBe('UNLEASHED');
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
