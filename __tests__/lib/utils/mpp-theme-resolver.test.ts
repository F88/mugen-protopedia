import { describe, expect, test } from 'vitest';

import { resolveMppThemeType } from '@/lib/utils/mpp-theme-resolver';

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

  describe('christmas mode', () => {
    test('returns christmas theme for xmas mode', () => {
      const mode: PlayModeState = { type: 'xmas' };
      const result = resolveMppThemeType(mode);
      expect(result).toBe('christmas');
    });

    test('returns christmas theme for xmas mode with delay level', () => {
      const mode: PlayModeState = { type: 'xmas' };
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
          mode: { type: 'xmas' },
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
