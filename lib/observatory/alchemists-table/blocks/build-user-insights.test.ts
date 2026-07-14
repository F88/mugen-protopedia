import { describe, expect, it } from 'vitest';

import type { PrototypeForMpp } from '@/lib/api/prototypes';
import { buildUserInsights } from './build-user-insights';

const createPrototype = (
  overrides: Partial<PrototypeForMpp> = {},
): PrototypeForMpp => ({
  id: Math.random(),
  prototypeNm: 'Proto',
  tags: [],
  teamNm: '',
  users: ['User'],
  summary: '',
  status: 1,
  releaseFlg: 1,
  createId: 1,
  createDate: '2020-06-01T00:00:00Z',
  updateId: 1,
  updateDate: '2020-06-01T00:00:00Z',
  releaseDate: '2020-06-01T00:00:00Z',
  revision: 1,
  awards: [],
  freeComment: '',
  systemDescription: '',
  viewCount: 0,
  goodCount: 0,
  commentCount: 0,
  videoUrl: undefined,
  mainUrl: 'https://example.com',
  relatedLink: undefined,
  relatedLink2: undefined,
  relatedLink3: undefined,
  relatedLink4: undefined,
  relatedLink5: undefined,
  licenseType: 0,
  thanksFlg: 0,
  events: [],
  officialLink: undefined,
  materials: [],
  ...overrides,
});

describe('buildUserInsights', () => {
  // Alice (solo, 2020) uses M5Stack + Arduino; Alice & Bob (team, 2022) use
  // M5Stack (Bob's award work); Bob (solo, 2023) uses Arduino + ChatGPT.
  const prototypes = [
    createPrototype({
      users: ['Alice'],
      materials: ['M5Stack', 'Arduino'],
      tags: ['IoT'],
      createDate: '2020-06-01T00:00:00Z',
    }),
    createPrototype({
      users: ['Alice', 'Bob'],
      materials: ['M5Stack'],
      tags: ['IoT', 'AI'],
      awards: ['Best Hack'],
      teamNm: 'Team X',
      createDate: '2022-06-01T00:00:00Z',
    }),
    createPrototype({
      users: ['Bob'],
      materials: ['Arduino', 'ChatGPT'],
      tags: [],
      awards: ['Grand Prize', 'Audience'],
      createDate: '2023-06-01T00:00:00Z',
    }),
  ];

  const findUser = (user: string) => {
    const entry = buildUserInsights(prototypes).users.find(
      (u) => u.user === user,
    );
    if (entry == null) throw new Error(`missing user: ${user}`);
    return entry;
  };

  it('lists every distinct maker, sorted by workCount then name', () => {
    const { users, totalUsers } = buildUserInsights(prototypes);
    expect(totalUsers).toBe(2);
    // Both have 2 works, so the tie breaks alphabetically.
    expect(users.map((u) => u.user)).toEqual(['Alice', 'Bob']);
  });

  it('aggregates work / material / tag counts per maker', () => {
    const alice = findUser('Alice');
    expect(alice.workCount).toBe(2);
    expect(alice.materialCounts).toEqual({ M5Stack: 2, Arduino: 1 });
    expect(alice.distinctMaterials).toBe(2);
    expect(alice.tagCounts).toEqual({ IoT: 2, AI: 1 });
    expect(alice.distinctTags).toBe(2);

    const bob = findUser('Bob');
    expect(bob.materialCounts).toEqual({ M5Stack: 1, Arduino: 1, ChatGPT: 1 });
    expect(bob.distinctMaterials).toBe(3);
  });

  it('counts awards (works and total tokens)', () => {
    const alice = findUser('Alice');
    expect(alice.awardWorkCount).toBe(1);
    expect(alice.awardCount).toBe(1);

    const bob = findUser('Bob');
    expect(bob.awardWorkCount).toBe(2);
    expect(bob.awardCount).toBe(3);
  });

  it('tracks tenure (first / latest date, per-year works, active years)', () => {
    const alice = findUser('Alice');
    expect(alice.firstDate).toBe('2020-06-01T00:00:00Z');
    expect(alice.latestDate).toBe('2022-06-01T00:00:00Z');
    expect(alice.worksByYear).toEqual({ 2020: 1, 2022: 1 });
    expect(alice.activeYears).toBe(2);

    const bob = findUser('Bob');
    expect(bob.worksByYear).toEqual({ 2022: 1, 2023: 1 });
  });

  it('splits solo vs team works', () => {
    const alice = findUser('Alice');
    expect(alice.soloWorkCount).toBe(1);
    expect(alice.teamWorkCount).toBe(1);

    const bob = findUser('Bob');
    expect(bob.soloWorkCount).toBe(1); // 2023 solo
    expect(bob.teamWorkCount).toBe(1); // 2022 team
  });

  it('skips prototypes with no users', () => {
    const result = buildUserInsights([
      createPrototype({ users: [], materials: ['M5Stack'] }),
    ]);
    expect(result.totalUsers).toBe(0);
  });
});
