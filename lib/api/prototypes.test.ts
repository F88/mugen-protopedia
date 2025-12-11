import { describe, expect, it } from 'vitest';

import type { ResultOfListPrototypesApiResponse } from 'protopedia-api-v2-client';

import { normalizePrototype } from '@/lib/api/prototypes';

describe('normalizePrototype', () => {
  const basePrototype: ResultOfListPrototypesApiResponse = {
    id: 1,
    prototypeNm: 'Test Prototype',
    createDate: '2023-01-01 00:00:00.0',
    updateDate: '2023-02-02 00:00:00.0',
    releaseDate: '2023-03-03 00:00:00.0',
    status: 2,
    releaseFlg: 2,
    revision: 0,
    mainUrl: 'https://example.com/image.png',
    viewCount: 100,
    goodCount: 10,
    commentCount: 5,
    licenseType: 1,
    thanksFlg: 1,
    uuid: 'test-uuid',
  };

  it('normalizes all required fields correctly', () => {
    const result = normalizePrototype(basePrototype);

    expect(result.id).toBe(1);
    expect(result.prototypeNm).toBe('Test Prototype');
    expect(result.status).toBe(2);
    expect(result.mainUrl).toBe('https://example.com/image.png');
    expect(result.viewCount).toBe(100);
    expect(result.goodCount).toBe(10);
    expect(result.commentCount).toBe(5);
  });

  describe('v3.0.0 optional fields with defaults', () => {
    it('uses default when teamNm is undefined', () => {
      const prototype = { ...basePrototype, teamNm: undefined };
      const result = normalizePrototype(prototype);
      expect(result.teamNm).toBe('');
    });

    it('preserves teamNm when provided', () => {
      const prototype = { ...basePrototype, teamNm: 'Team Name' };
      const result = normalizePrototype(prototype);
      expect(result.teamNm).toBe('Team Name');
    });

    it('uses default when releaseFlg is undefined', () => {
      const prototype = { ...basePrototype, releaseFlg: undefined };
      const result = normalizePrototype(prototype);
      expect(result.releaseFlg).toBe(2);
    });

    it('uses default when revision is undefined', () => {
      const prototype = { ...basePrototype, revision: undefined };
      const result = normalizePrototype(prototype);
      expect(result.revision).toBe(0);
    });

    it('uses default when freeComment is undefined', () => {
      const prototype = { ...basePrototype, freeComment: undefined };
      const result = normalizePrototype(prototype);
      expect(result.freeComment).toBe('');
    });

    it('preserves freeComment when provided', () => {
      const prototype = { ...basePrototype, freeComment: 'Story text' };
      const result = normalizePrototype(prototype);
      expect(result.freeComment).toBe('Story text');
    });

    it('uses default when licenseType is undefined', () => {
      const prototype = { ...basePrototype, licenseType: undefined };
      const result = normalizePrototype(prototype);
      expect(result.licenseType).toBe(1);
    });

    it('uses default when thanksFlg is undefined', () => {
      const prototype = { ...basePrototype, thanksFlg: undefined };
      const result = normalizePrototype(prototype);
      expect(result.thanksFlg).toBe(0);
    });
  });

  describe('releaseDate handling', () => {
    it('normalizes valid releaseDate', () => {
      const prototype = {
        ...basePrototype,
        releaseDate: '2023-01-15 12:30:45.0',
      };
      const result = normalizePrototype(prototype);
      // JST to UTC conversion: 12:30:45 JST -> 03:30:45 UTC
      expect(result.releaseDate).toBe('2023-01-15T03:30:45.000Z');
    });

    it('falls back to createDate when releaseDate is undefined', () => {
      const prototype = {
        ...basePrototype,
        createDate: '2023-02-01 10:00:00.0',
        releaseDate: undefined,
      };
      const result = normalizePrototype(prototype);
      // Should fallback to createDate
      expect(result.releaseDate).toBe('2023-02-01T01:00:00.000Z');
    });

    it('uses original releaseDate when normalization returns null', () => {
      const prototype = {
        ...basePrototype,
        releaseDate: 'invalid-date-format',
      };
      const result = normalizePrototype(prototype);
      // normalizeProtoPediaTimestamp returns null, fallback chain applies
      expect(result.releaseDate).toBeDefined();
    });
  });

  describe('pipe-separated fields', () => {
    it('splits tags correctly', () => {
      const prototype = {
        ...basePrototype,
        tags: 'tag1|tag2|tag3',
      };
      const result = normalizePrototype(prototype);
      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('handles undefined tags', () => {
      const prototype = { ...basePrototype, tags: undefined };
      const result = normalizePrototype(prototype);
      expect(result.tags).toEqual([]);
    });

    it('splits users correctly', () => {
      const prototype = {
        ...basePrototype,
        users: 'user1@id1|user2@id2',
      };
      const result = normalizePrototype(prototype);
      expect(result.users).toEqual(['user1@id1', 'user2@id2']);
    });

    it('handles undefined users', () => {
      const prototype = { ...basePrototype, users: undefined };
      const result = normalizePrototype(prototype);
      expect(result.users).toEqual([]);
    });

    it('splits materials correctly', () => {
      const prototype = {
        ...basePrototype,
        materials: 'API1|Library2|Tool3',
      };
      const result = normalizePrototype(prototype);
      expect(result.materials).toEqual(['API1', 'Library2', 'Tool3']);
    });

    it('splits events correctly', () => {
      const prototype = {
        ...basePrototype,
        events: 'Event1@id1|Event2@id2',
      };
      const result = normalizePrototype(prototype);
      expect(result.events).toEqual(['Event1@id1', 'Event2@id2']);
    });

    it('splits awards correctly', () => {
      const prototype = {
        ...basePrototype,
        awards: 'Award1|Award2',
      };
      const result = normalizePrototype(prototype);
      expect(result.awards).toEqual(['Award1', 'Award2']);
    });
  });

  describe('timestamp normalization', () => {
    it('normalizes createDate from JST to UTC', () => {
      const prototype = {
        ...basePrototype,
        createDate: '2023-03-01 15:30:00.0',
      };
      const result = normalizePrototype(prototype);
      // 15:30 JST -> 06:30 UTC
      expect(result.createDate).toBe('2023-03-01T06:30:00.000Z');
    });

    it('normalizes updateDate from JST to UTC', () => {
      const prototype = {
        ...basePrototype,
        updateDate: '2023-04-01 20:45:30.0',
      };
      const result = normalizePrototype(prototype);
      // 20:45:30 JST -> 11:45:30 UTC
      expect(result.updateDate).toBe('2023-04-01T11:45:30.000Z');
    });

    it('preserves original date when normalization fails', () => {
      const prototype = {
        ...basePrototype,
        createDate: '2023-01-01T00:00:00Z', // Already in ISO format
      };
      const result = normalizePrototype(prototype);
      expect(result.createDate).toBeDefined();
    });
  });
});
