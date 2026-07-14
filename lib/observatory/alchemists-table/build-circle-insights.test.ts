import { describe, expect, it } from 'vitest';

import { materialChampions } from './build-circle-insights';
import type { UserInsightsEntry } from './blocks/build-user-insights';

/** A minimal maker fixture — only the fields `materialChampions` reads matter. */
const maker = (
  user: string,
  workCount: number,
  materialCounts: Record<string, number>,
): UserInsightsEntry => ({
  user,
  workCount,
  materialCounts,
  distinctMaterials: Object.keys(materialCounts).length,
  tagCounts: {},
  distinctTags: 0,
  awardCount: 0,
  awardWorkCount: 0,
  firstDate: '',
  latestDate: '',
  worksByYear: {},
  activeYears: 0,
  soloWorkCount: 0,
  teamWorkCount: 0,
});

describe('materialChampions', () => {
  it('scores devotion as count^2 / workCount and crowns the top maker per material', () => {
    // A: 50/50 M5Stack -> 50^2/50 = 50. B: 10/50 -> 10^2/50 = 2.
    const champions = materialChampions([
      maker('A', 50, { M5Stack: 50 }),
      maker('B', 50, { M5Stack: 10 }),
    ]);
    expect(champions.get('A')).toEqual([
      { material: 'M5Stack', count: 50, rate: 1, score: 50 },
    ]);
    expect(champions.has('B')).toBe(false);
  });

  it('keeps EVERY material a maker tops — multiple crowns, no arbitrary pick', () => {
    // A always pairs M5Stack + AWS (both 50/50 -> score 50), so A wins both.
    const champions = materialChampions([
      maker('A', 50, { M5Stack: 50, AWS: 50 }),
      maker('B', 50, { M5Stack: 10, AWS: 10 }),
    ]);
    expect(champions.get('A')).toEqual([
      { material: 'AWS', count: 50, rate: 1, score: 50 },
      { material: 'M5Stack', count: 50, rate: 1, score: 50 },
    ]);
    expect(champions.has('B')).toBe(false);
  });

  it('gives a material more than one champion on a score tie', () => {
    const champions = materialChampions([
      maker('A', 10, { LED: 10 }),
      maker('B', 10, { LED: 10 }),
    ]);
    expect(champions.get('A')).toEqual([
      { material: 'LED', count: 10, rate: 1, score: 10 },
    ]);
    expect(champions.get('B')).toEqual([
      { material: 'LED', count: 10, rate: 1, score: 10 },
    ]);
  });

  it('reports rate = count / workCount and score = count^2 / workCount', () => {
    // 20 of 25 works -> rate 0.8, score 20^2 / 25 = 16.
    const champions = materialChampions([maker('A', 25, { Arduino: 20 })]);
    expect(champions.get('A')).toEqual([
      { material: 'Arduino', count: 20, rate: 0.8, score: 16 },
    ]);
  });

  it('rewards depth: at an equal usage rate, more works wins the crown', () => {
    // Both 100% M5Stack; A (50 works, score 50) beats B (10 works, score 10).
    const champions = materialChampions([
      maker('A', 50, { M5Stack: 50 }),
      maker('B', 10, { M5Stack: 10 }),
    ]);
    expect(champions.has('A')).toBe(true);
    expect(champions.has('B')).toBe(false);
  });

  it('is independent of materialCounts insertion order', () => {
    const a = materialChampions([maker('A', 10, { M5Stack: 10, AWS: 10 })]);
    const b = materialChampions([maker('A', 10, { AWS: 10, M5Stack: 10 })]);
    expect(a.get('A')).toEqual(b.get('A'));
    expect(a.get('A')?.map((c) => c.material)).toEqual(['AWS', 'M5Stack']);
  });

  it('ignores makers with no materials', () => {
    expect(materialChampions([maker('A', 10, {})]).size).toBe(0);
  });
});
