import { describe, it, expect } from 'vitest';
import { clamp, clampPercent } from '@/lib/utils/math';

describe('math utilities', () => {
  describe('clamp', () => {
    it('returns value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it('clamps to min when value is below range', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(-100, 0, 10)).toBe(0);
    });

    it('clamps to max when value is above range', () => {
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(100, 0, 10)).toBe(10);
    });

    it('works with negative ranges', () => {
      expect(clamp(-5, -10, 0)).toBe(-5);
      expect(clamp(-15, -10, 0)).toBe(-10);
      expect(clamp(5, -10, 0)).toBe(0);
    });

    it('works with decimal values', () => {
      expect(clamp(5.5, 0, 10)).toBe(5.5);
      expect(clamp(-0.5, 0, 10)).toBe(0);
      expect(clamp(10.5, 0, 10)).toBe(10);
    });
  });

  describe('clampPercent', () => {
    it('returns rounded value when within 0-100 range', () => {
      expect(clampPercent(50)).toBe(50);
      expect(clampPercent(0)).toBe(0);
      expect(clampPercent(100)).toBe(100);
    });

    it('clamps to 0 when value is negative', () => {
      expect(clampPercent(-1)).toBe(0);
      expect(clampPercent(-50)).toBe(0);
      expect(clampPercent(-100)).toBe(0);
    });

    it('clamps to 100 when value is above 100', () => {
      expect(clampPercent(101)).toBe(100);
      expect(clampPercent(150)).toBe(100);
      expect(clampPercent(200)).toBe(100);
    });

    it('rounds decimal values to nearest integer', () => {
      expect(clampPercent(50.4)).toBe(50);
      expect(clampPercent(50.5)).toBe(51);
      expect(clampPercent(50.6)).toBe(51);
      expect(clampPercent(99.4)).toBe(99);
      expect(clampPercent(99.5)).toBe(100);
    });

    it('rounds and clamps values outside range', () => {
      expect(clampPercent(-5.5)).toBe(0);
      expect(clampPercent(105.5)).toBe(100);
    });
  });
});
