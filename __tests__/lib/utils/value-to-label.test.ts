import { describe, expect, it } from 'vitest';
import {
  getPrototypeLicenseTypeLabel,
  getPrototypeReleaseFlagLabel,
  getPrototypeStatusLabel,
  getPrototypeThanksFlagLabel,
} from '@/lib/utils/value-to-label';

describe('value-to-label utilities', () => {
  describe('getPrototypeStatusLabel', () => {
    const statusCases = [
      { value: 1, label: 'アイデア' },
      { value: 2, label: '開発中' },
      { value: 3, label: '完成' },
      { value: 4, label: '供養' },
    ];

    it.each(statusCases)('returns label $label for status $value', ({ value, label }) => {
      expect(getPrototypeStatusLabel(value)).toBe(label);
    });

    it('returns fallback for unknown status', () => {
      expect(getPrototypeStatusLabel(999)).toBe('999');
    });
  });

  describe('getPrototypeReleaseFlagLabel', () => {
    it('returns label for known release flag', () => {
      expect(getPrototypeReleaseFlagLabel(2)).toBe('一般公開');
    });

    it('returns fallback for unknown release flag', () => {
      expect(getPrototypeReleaseFlagLabel(5)).toBe('5');
    });
  });

  describe('getPrototypeThanksFlagLabel', () => {
    it('returns fallback when label is unknown', () => {
      expect(getPrototypeThanksFlagLabel(0)).toBe('0');
    });
  });

  describe('getPrototypeLicenseTypeLabel', () => {
    const licenseCases = [
      { value: 1, label: '表示する' },
      { value: 2, label: '表示しない' },
    ];

    it.each(licenseCases)('returns label $label for license type $value', ({ value, label }) => {
      expect(getPrototypeLicenseTypeLabel(value)).toBe(label);
    });

    it('returns fallback for unknown license type', () => {
      expect(getPrototypeLicenseTypeLabel(99)).toBe('99');
    });
  });
});
