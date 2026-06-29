import { describe, expect, it } from 'vitest';
import type { ResultOfListPrototypesApiResponse } from 'protopedia-api-v2-client';

import { normalizePrototypeForMpp } from '@/lib/api/prototypes';

/**
 * Characterization tests for `normalizePrototypeForMpp`.
 *
 * These lock in the current normalization contract (pipe-separated splitting,
 * JST -> UTC timestamp conversion, and fallback values for the fields that
 * `protopedia-api-v2-client` v3 marks optional) so that any change to the
 * normalization implementation - including delegating it to the `promidas`
 * package - has a precise, observable diff.
 */

const makeUpstream = (
  overrides: Partial<ResultOfListPrototypesApiResponse> = {},
): ResultOfListPrototypesApiResponse =>
  ({
    id: 1,
    prototypeNm: 'name',
    status: 2,
    createDate: '2024-01-01 12:00:00.0',
    updateDate: '2024-02-02 09:30:00.0',
    mainUrl: 'https://example.com/main.png',
    viewCount: 0,
    goodCount: 0,
    commentCount: 0,
    ...overrides,
  }) as ResultOfListPrototypesApiResponse;

describe('normalizePrototypeForMpp', () => {
  it('maps a fully populated upstream prototype', () => {
    const result = normalizePrototypeForMpp(
      makeUpstream({
        id: 123,
        prototypeNm: 'My Project',
        tags: 'IoT | AI | Robotics',
        teamNm: 'Team Rocket',
        users: 'user1|user2',
        summary: 'A summary',
        status: 2,
        releaseFlg: 1,
        createId: 10,
        createDate: '2024-01-01 12:00:00.0',
        updateId: 11,
        updateDate: '2024-02-02 09:30:00.0',
        releaseDate: '2025-11-14 12:03:07.0',
        revision: 3,
        awards: 'Award1|Award2',
        freeComment: 'free',
        systemDescription: 'sys',
        viewCount: 100,
        goodCount: 5,
        commentCount: 2,
        videoUrl: 'https://youtu.be/x',
        mainUrl: 'https://example.com/x.png',
        relatedLink: 'l1',
        relatedLink2: 'l2',
        relatedLink3: 'l3',
        relatedLink4: 'l4',
        relatedLink5: 'l5',
        licenseType: 1,
        thanksFlg: 1,
        events: 'Event1|Event2',
        officialLink: 'https://official.example.com',
        materials: 'Mat1|Mat2',
      }),
    );

    expect(result).toEqual({
      id: 123,
      prototypeNm: 'My Project',
      tags: ['IoT', 'AI', 'Robotics'],
      teamNm: 'Team Rocket',
      users: ['user1', 'user2'],
      summary: 'A summary',
      status: 2,
      releaseFlg: 1,
      createId: 10,
      createDate: '2024-01-01T03:00:00.000Z',
      updateId: 11,
      updateDate: '2024-02-02T00:30:00.000Z',
      releaseDate: '2025-11-14T03:03:07.000Z',
      revision: 3,
      awards: ['Award1', 'Award2'],
      freeComment: 'free',
      systemDescription: 'sys',
      viewCount: 100,
      goodCount: 5,
      commentCount: 2,
      videoUrl: 'https://youtu.be/x',
      mainUrl: 'https://example.com/x.png',
      relatedLink: 'l1',
      relatedLink2: 'l2',
      relatedLink3: 'l3',
      relatedLink4: 'l4',
      relatedLink5: 'l5',
      licenseType: 1,
      thanksFlg: 1,
      events: ['Event1', 'Event2'],
      officialLink: 'https://official.example.com',
      materials: ['Mat1', 'Mat2'],
    });
  });

  describe('fallbacks for optional / missing fields', () => {
    const result = normalizePrototypeForMpp(makeUpstream());

    it('defaults text fields to an empty string', () => {
      expect(result.teamNm).toBe('');
      expect(result.freeComment).toBe('');
      expect(result.summary).toBe('');
      expect(result.systemDescription).toBe('');
    });

    it('leaves releaseDate / updateDate undefined when the API omits them', () => {
      expect(result.releaseDate).toBeUndefined();
      expect(
        normalizePrototypeForMpp(makeUpstream({ updateDate: undefined }))
          .updateDate,
      ).toBeUndefined();
    });

    it('leaves URL fields undefined when absent', () => {
      expect(result.videoUrl).toBeUndefined();
      expect(result.officialLink).toBeUndefined();
      expect(result.relatedLink).toBeUndefined();
    });

    it('applies promidas default codes for numeric flag fields', () => {
      expect(result.releaseFlg).toBe(2); // Released
      expect(result.revision).toBe(0);
      expect(result.licenseType).toBe(1); // 表示(CC:BY)
      expect(result.thanksFlg).toBe(0);
    });

    it('defaults pipe-separated array fields to empty arrays', () => {
      expect(result.tags).toEqual([]);
      expect(result.users).toEqual([]);
      expect(result.awards).toEqual([]);
      expect(result.events).toEqual([]);
      expect(result.materials).toEqual([]);
    });
  });

  describe('pipe-separated splitting', () => {
    it('trims each segment', () => {
      expect(normalizePrototypeForMpp(makeUpstream({ tags: 'a | b |c' })).tags).toEqual(
        ['a', 'b', 'c'],
      );
    });

    it('filters out empty segments', () => {
      expect(normalizePrototypeForMpp(makeUpstream({ tags: 'a||b' })).tags).toEqual([
        'a',
        'b',
      ]);
      expect(normalizePrototypeForMpp(makeUpstream({ users: 'u1|' })).users).toEqual([
        'u1',
      ]);
    });

    it('returns an empty array for an empty string', () => {
      expect(normalizePrototypeForMpp(makeUpstream({ tags: '' })).tags).toEqual([]);
    });
  });

  describe('timestamp normalization', () => {
    it('converts JST timestamps to UTC ISO strings', () => {
      const result = normalizePrototypeForMpp(
        makeUpstream({
          createDate: '2024-01-01 12:00:00.0',
          updateDate: '2024-01-01 00:00:00.0',
        }),
      );
      expect(result.createDate).toBe('2024-01-01T03:00:00.000Z');
      expect(result.updateDate).toBe('2023-12-31T15:00:00.000Z');
    });

    it('falls back to the original string when the timestamp is unparseable', () => {
      const result = normalizePrototypeForMpp(
        makeUpstream({ createDate: '2025/11/14 12:03:07' }),
      );
      expect(result.createDate).toBe('2025/11/14 12:03:07');
    });
  });
});
