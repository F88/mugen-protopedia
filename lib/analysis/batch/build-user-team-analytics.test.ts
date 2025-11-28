import { describe, expect, it } from 'vitest';

import type { NormalizedPrototype } from '@/lib/api/prototypes';
import { buildUserTeamAnalytics } from './build-user-team-analytics';

const createPrototype = (teamNm: string | undefined): NormalizedPrototype => ({
  id: Math.random(),
  prototypeNm: 'Proto',
  tags: [],
  teamNm: teamNm ?? '',
  users: ['User'],
  summary: '',
  status: 1,
  releaseFlg: 1,
  createId: 1,
  createDate: new Date().toISOString(),
  updateId: 1,
  updateDate: new Date().toISOString(),
  releaseDate: new Date().toISOString(),
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
});

describe('buildUserTeamAnalytics', () => {
  it('aggregates team counts and sorts top teams', () => {
    const prototypes = [
      createPrototype('Team A'),
      createPrototype('Team B'),
      createPrototype('Team A'),
      createPrototype(undefined),
    ];

    const analytics = buildUserTeamAnalytics(prototypes);

    expect(analytics.teams.teamCounts).toEqual({ 'Team A': 2, 'Team B': 1 });
    expect(analytics.teams.topTeams[0]).toEqual({ team: 'Team A', count: 2 });
    expect(analytics.users.topUsers).toEqual([]);
  });
});
