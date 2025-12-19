import { describe, expect, it } from 'vitest';
import {
  splitPipeSeparatedString,
  getPlayModeLabel,
  getPlayModeIcon,
  getSpeedIcon,
} from '@/lib/utils/converter';

describe('splitPipeSeparatedString', () => {
  it('returns empty array when input is empty', () => {
    expect(splitPipeSeparatedString('')).toStrictEqual([]);
  });

  it('returns single value when no delimiter present', () => {
    expect(splitPipeSeparatedString('Solo Award')).toStrictEqual([
      'Solo Award',
    ]);
  });

  it('preserves empty segments', () => {
    expect(splitPipeSeparatedString('First||Third')).toStrictEqual([
      'First',
      '',
      'Third',
    ]);
  });

  it('splits pipe separated values', () => {
    const input = 'Award One | Award Two | Award Three';
    expect(splitPipeSeparatedString(input)).toStrictEqual([
      'Award One',
      'Award Two',
      'Award Three',
    ]);
  });
});

describe('getPlayModeLabel', () => {
  it('returns "Normal" for normal mode', () => {
    expect(getPlayModeLabel('normal')).toBe('Normal');
  });

  it('returns "Playlist️" for playlist mode', () => {
    expect(getPlayModeLabel('playlist')).toBe('Playlist️');
  });

  it('returns "Unleashed" for unleashed mode', () => {
    expect(getPlayModeLabel('unleashed')).toBe('Unleashed');
  });

  it('returns "Dev" for dev mode', () => {
    expect(getPlayModeLabel('dev')).toBe('Dev');
  });

  it('returns "Christmas" for xmas mode', () => {
    expect(getPlayModeLabel('xmas')).toBe('Christmas');
  });
});

describe('getPlayModeIcon', () => {
  it('returns empty string for normal mode', () => {
    expect(getPlayModeIcon('normal')).toBe('');
  });

  it('returns "📜" for playlist mode', () => {
    expect(getPlayModeIcon('playlist')).toBe('📜');
  });

  it('returns "🦸" for unleashed mode', () => {
    expect(getPlayModeIcon('unleashed')).toBe('🦸');
  });

  it('returns "⚔️" for dev mode', () => {
    expect(getPlayModeIcon('dev')).toBe('⚔️');
  });

  it('returns "�" for xmas mode', () => {
    expect(getPlayModeIcon('xmas')).toBe('🎄');
  });
});

describe('getSpeedIcon', () => {
  it('returns "⏱️" for UNLEASHED', () => {
    expect(getSpeedIcon('UNLEASHED')).toBe('⏱️');
  });

  it('returns "🚀" for FASTEST', () => {
    expect(getSpeedIcon('FASTEST')).toBe('🚀');
  });

  it('returns "🚄" for FASTER', () => {
    expect(getSpeedIcon('FASTER')).toBe('🚄');
  });

  it('returns "🏃🏼‍➡️" for FAST', () => {
    expect(getSpeedIcon('FAST')).toBe('🏃🏼‍➡️');
  });

  it('returns undefined for NORMAL', () => {
    expect(getSpeedIcon('NORMAL')).toBeUndefined();
  });

  it('returns "🐢" for SLOW', () => {
    expect(getSpeedIcon('SLOW')).toBe('🐢');
  });

  it('returns "🐌" for SLOWER', () => {
    expect(getSpeedIcon('SLOWER')).toBe('🐌');
  });

  it('returns "🦥" for SLOWEST', () => {
    expect(getSpeedIcon('SLOWEST')).toBe('🦥');
  });
});
