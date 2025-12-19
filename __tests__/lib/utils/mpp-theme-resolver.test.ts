import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';

import {
  resolveMppThemeType,
  resolveThemeByDate,
} from '@/lib/utils/mpp-theme-resolver';

import type {
  PlayModeState,
  SimulatedDelayLevel,
  MppThemeType,
} from '@/types/mugen-protopedia.types';

describe('resolveMppThemeType', () => {
  describe('unleashed mode', () => {
    test('returns unleashed theme for unleashed mode', () => {
      const mode: PlayModeState = { type: 'unleashed' };
      const result = resolveMppThemeType(mode);
      expect(result).toBe('unleashed');
    });

    test('returns unleashed theme for unleashed mode with any delay level', () => {
      const mode: PlayModeState = { type: 'unleashed' };
      const delayLevel: SimulatedDelayLevel = 'SLOW';
      const result = resolveMppThemeType(mode, delayLevel);
      expect(result).toBe('unleashed');
    });
  });

  describe('dev mode', () => {
    test('returns christmas theme for dev mode', () => {
      const mode: PlayModeState = { type: 'dev' };
      const result = resolveMppThemeType(mode);
      expect(result).toBe('christmas');
    });

    test('returns christmas theme for dev mode with delay level', () => {
      const mode: PlayModeState = { type: 'dev' };
      const delayLevel: SimulatedDelayLevel = 'FAST';
      const result = resolveMppThemeType(mode, delayLevel);
      expect(result).toBe('christmas');
    });
  });

  describe('dev mode', () => {
    test('returns christmas theme for dev mode', () => {
      const mode: PlayModeState = { type: 'dev' };
      const result = resolveMppThemeType(mode);
      expect(result).toBe('christmas');
    });

    test('returns christmas theme for dev mode with delay level', () => {
      const mode: PlayModeState = { type: 'dev' };
      const delayLevel: SimulatedDelayLevel = 'NORMAL';
      const result = resolveMppThemeType(mode, delayLevel);
      expect(result).toBe('christmas');
    });
  });

  describe('normal mode', () => {
    test('returns null for normal mode without delay level', () => {
      const mode: PlayModeState = { type: 'normal' };
      const result = resolveMppThemeType(mode);
      expect(result).toBeNull();
    });

    test('returns null for normal mode with undefined delay level', () => {
      const mode: PlayModeState = { type: 'normal' };
      const result = resolveMppThemeType(mode, undefined);
      expect(result).toBeNull();
    });

    test('returns null for normal mode with NORMAL delay level', () => {
      const mode: PlayModeState = { type: 'normal' };
      const delayLevel: SimulatedDelayLevel = 'NORMAL';
      const result = resolveMppThemeType(mode, delayLevel);
      expect(result).toBeNull();
    });

    test('returns null for normal mode with SLOW delay level', () => {
      const mode: PlayModeState = { type: 'normal' };
      const delayLevel: SimulatedDelayLevel = 'SLOW';
      const result = resolveMppThemeType(mode, delayLevel);
      expect(result).toBeNull();
    });

    test('returns null for normal mode with SLOWER delay level', () => {
      const mode: PlayModeState = { type: 'normal' };
      const delayLevel: SimulatedDelayLevel = 'SLOWER';
      const result = resolveMppThemeType(mode, delayLevel);
      expect(result).toBeNull();
    });

    test('returns null for normal mode with SLOWEST delay level', () => {
      const mode: PlayModeState = { type: 'normal' };
      const delayLevel: SimulatedDelayLevel = 'SLOWEST';
      const result = resolveMppThemeType(mode, delayLevel);
      expect(result).toBeNull();
    });

    test('returns random for normal mode with FAST delay level', () => {
      const mode: PlayModeState = { type: 'normal' };
      const delayLevel: SimulatedDelayLevel = 'FAST';
      const result = resolveMppThemeType(mode, delayLevel);
      expect(result).toBe('random');
    });

    test('returns random for normal mode with FASTER delay level', () => {
      const mode: PlayModeState = { type: 'normal' };
      const delayLevel: SimulatedDelayLevel = 'FASTER';
      const result = resolveMppThemeType(mode, delayLevel);
      expect(result).toBe('random');
    });

    test('returns random for normal mode with FASTEST delay level', () => {
      const mode: PlayModeState = { type: 'normal' };
      const delayLevel: SimulatedDelayLevel = 'FASTEST';
      const result = resolveMppThemeType(mode, delayLevel);
      expect(result).toBe('random');
    });
  });

  describe('type exhaustiveness', () => {
    test('handles all possible MppThemeType return values', () => {
      // This test ensures we cover all possible return types
      const possibleResults: Array<MppThemeType | null> = [
        'unleashed',
        'christmas',
        'random',
        null,
      ];

      // Test cases that should cover all return values
      const testCases: Array<{
        mode: PlayModeState;
        delayLevel?: SimulatedDelayLevel;
        expected: MppThemeType | null;
      }> = [
        {
          mode: { type: 'unleashed' },
          expected: 'unleashed',
        },
        {
          mode: { type: 'dev' },
          expected: 'christmas',
        },
        {
          mode: { type: 'dev' },
          expected: 'christmas',
        },
        {
          mode: { type: 'normal' },
          delayLevel: 'FAST',
          expected: 'random',
        },
        {
          mode: { type: 'normal' },
          delayLevel: 'NORMAL',
          expected: null,
        },
      ];

      testCases.forEach(({ mode, delayLevel, expected }) => {
        const result = resolveMppThemeType(mode, delayLevel);
        expect(possibleResults).toContain(result);
        expect(result).toBe(expected);
      });
    });
  });

  describe('edge cases', () => {
    test('handles mode with extra properties gracefully', () => {
      const mode = {
        type: 'normal' as const,
        someExtraProperty: 'should be ignored',
      };
      const result = resolveMppThemeType(mode, 'FAST');
      expect(result).toBe('random');
    });
  });
});

describe('resolveThemeByDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Christmas theme period', () => {
    test('returns christmas for December 19, 16:00', () => {
      vi.setSystemTime(new Date('2025-12-19T16:00:00'));
      expect(resolveThemeByDate()).toBe('christmas');
    });

    test('returns christmas for December 19, 18:00', () => {
      vi.setSystemTime(new Date('2025-12-19T18:00:00'));
      expect(resolveThemeByDate()).toBe('christmas');
    });

    test('returns christmas for December 20, 23:59', () => {
      vi.setSystemTime(new Date('2025-12-20T23:59:59'));
      expect(resolveThemeByDate()).toBe('christmas');
    });

    test('returns christmas for December 21, 00:00 (after midnight)', () => {
      vi.setSystemTime(new Date('2025-12-21T00:00:00'));
      expect(resolveThemeByDate()).toBe('christmas');
    });

    test('returns christmas for December 21, 05:59', () => {
      vi.setSystemTime(new Date('2025-12-21T05:59:59'));
      expect(resolveThemeByDate()).toBe('christmas');
    });

    test('returns christmas for December 25, 20:00', () => {
      vi.setSystemTime(new Date('2025-12-25T20:00:00'));
      expect(resolveThemeByDate()).toBe('christmas');
    });

    test('returns christmas for December 25, 10:00 (all day active)', () => {
      vi.setSystemTime(new Date('2025-12-25T10:00:00'));
      expect(resolveThemeByDate()).toBe('christmas');
    });

    test('returns christmas for December 25, 10:00 (all day active)', () => {
      vi.setSystemTime(new Date('2025-12-25T10:00:00'));
      expect(resolveThemeByDate()).toBe('christmas');
    });

    test('returns null for December 26, 02:00 (outside period)', () => {
      vi.setSystemTime(new Date('2025-12-26T02:00:00'));
      expect(resolveThemeByDate()).toBe(null);
    });
  });

  describe('Outside Christmas theme period', () => {
    test('returns null for December 19, 15:59', () => {
      vi.setSystemTime(new Date('2025-12-19T15:59:59'));
      expect(resolveThemeByDate()).toBeNull();
    });

    test('returns null for December 19, 06:00', () => {
      vi.setSystemTime(new Date('2025-12-19T06:00:00'));
      expect(resolveThemeByDate()).toBeNull();
    });

    test('returns null for December 18, 18:00', () => {
      vi.setSystemTime(new Date('2025-12-18T18:00:00'));
      expect(resolveThemeByDate()).toBeNull();
    });

    test('returns null for December 26, 06:00', () => {
      vi.setSystemTime(new Date('2025-12-26T06:00:00'));
      expect(resolveThemeByDate()).toBeNull();
    });

    test('returns null for December 26, 18:00', () => {
      vi.setSystemTime(new Date('2025-12-26T18:00:00'));
      expect(resolveThemeByDate()).toBeNull();
    });

    test('returns null for November 20, 18:00', () => {
      vi.setSystemTime(new Date('2025-11-20T18:00:00'));
      expect(resolveThemeByDate()).toBeNull();
    });

    test('returns null for January 20, 18:00', () => {
      vi.setSystemTime(new Date('2025-01-20T18:00:00'));
      expect(resolveThemeByDate()).toBeNull();
    });
  });

  describe('Boundary conditions', () => {
    test('returns null at December 19, 15:59:59 (before start)', () => {
      vi.setSystemTime(new Date('2025-12-19T15:59:59'));
      expect(resolveThemeByDate()).toBeNull();
    });

    test('returns christmas at December 19, 16:00:00 (exact start)', () => {
      vi.setSystemTime(new Date('2025-12-19T16:00:00'));
      expect(resolveThemeByDate()).toBe('christmas');
    });

    test('returns christmas at December 19, 16:00:01 (after start)', () => {
      vi.setSystemTime(new Date('2025-12-19T16:00:01'));
      expect(resolveThemeByDate()).toBe('christmas');
    });

    test('returns null at December 20, 15:59:59 (before daily start)', () => {
      vi.setSystemTime(new Date('2025-12-20T15:59:59'));
      expect(resolveThemeByDate()).toBeNull();
    });

    test('returns christmas at December 20, 16:00:00 (daily start)', () => {
      vi.setSystemTime(new Date('2025-12-20T16:00:00'));
      expect(resolveThemeByDate()).toBe('christmas');
    });

    test('returns christmas at December 21, 05:59:59 (before daily end)', () => {
      vi.setSystemTime(new Date('2025-12-21T05:59:59'));
      expect(resolveThemeByDate()).toBe('christmas');
    });

    test('returns null at December 21, 06:00:00 (daily end)', () => {
      vi.setSystemTime(new Date('2025-12-21T06:00:00'));
      expect(resolveThemeByDate()).toBeNull();
    });

    test('returns christmas at December 25, 23:59:59 (last moment of Dec 25)', () => {
      vi.setSystemTime(new Date('2025-12-25T23:59:59'));
      expect(resolveThemeByDate()).toBe('christmas');
    });

    test('returns christmas at December 25, 06:00:00 (all day active)', () => {
      vi.setSystemTime(new Date('2025-12-25T06:00:00'));
      expect(resolveThemeByDate()).toBe('christmas');
    });

    test('returns christmas at December 25, 06:00:00 (all day active)', () => {
      vi.setSystemTime(new Date('2025-12-25T06:00:00'));
      expect(resolveThemeByDate()).toBe('christmas');
    });

    test('returns null at December 26, 00:00:00 (after period end)', () => {
      vi.setSystemTime(new Date('2025-12-26T00:00:00'));
      expect(resolveThemeByDate()).toBeNull();
    });

    test('returns null at December 26, 05:59:59 (after period end)', () => {
      vi.setSystemTime(new Date('2025-12-26T05:59:59'));
      expect(resolveThemeByDate()).toBeNull();
    });

    test('returns null at December 26, 06:00:00 (period end)', () => {
      vi.setSystemTime(new Date('2025-12-26T06:00:00'));
      expect(resolveThemeByDate()).toBeNull();
    });

    test('returns null at December 18, 23:59:59 (day before period)', () => {
      vi.setSystemTime(new Date('2025-12-18T23:59:59'));
      expect(resolveThemeByDate()).toBeNull();
    });
  });
});
