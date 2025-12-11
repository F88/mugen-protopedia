import { describe, expect, it } from 'vitest';

import type { ResultOfListPrototypesApiResponse } from 'protopedia-api-v2-client';

import { normalizePrototype } from '@/lib/api/prototypes';

describe('normalizePrototype', () => {
  const basePrototype: ResultOfListPrototypesApiResponse = {
    id: 1,
    prototypeNm: 'Test Prototype',
    createDate: '2023-01-01 00:00:00.0',
    updateDate: '2024-02-02 00:00:00.0',
    releaseDate: '2025-03-03 00:00:00.0',
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

    it('returns undefined when releaseDate is undefined', () => {
      const prototype = {
        ...basePrototype,
        createDate: '2023-02-01 10:00:00.0',
        releaseDate: undefined,
      };
      const result = normalizePrototype(prototype);
      // releaseDate: undefined → undefined
      expect(result.releaseDate).toBeUndefined();
    });

    it('returns undefined when releaseDate is null', () => {
      const prototype = {
        ...basePrototype,
        releaseDate: null as never,
      };
      const result = normalizePrototype(prototype);
      // releaseDate: null → normalizeProtoPediaTimestamp returns null → undefined
      expect(result.releaseDate).toBeUndefined();
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

    it('falls back to original createDate when unparseable', () => {
      const prototype = {
        ...basePrototype,
        createDate: 'invalid-date',
      };
      const result = normalizePrototype(prototype);
      expect(result.createDate).toBe('invalid-date');
    });

    it('falls back to original updateDate when unparseable', () => {
      const prototype = {
        ...basePrototype,
        updateDate: 'invalid-date',
      };
      const result = normalizePrototype(prototype);
      expect(result.updateDate).toBe('invalid-date');
    });
  });

  describe('URL fields', () => {
    it('preserves all URL fields when provided', () => {
      const prototype = {
        ...basePrototype,
        officialLink: 'https://example.com',
        videoUrl: 'https://youtube.com/watch?v=123',
        relatedLink: 'https://link1.com',
        relatedLink2: 'https://link2.com',
        relatedLink3: 'https://link3.com',
        relatedLink4: 'https://link4.com',
        relatedLink5: 'https://link5.com',
      };
      const result = normalizePrototype(prototype);
      expect(result.officialLink).toBe('https://example.com');
      expect(result.videoUrl).toBe('https://youtube.com/watch?v=123');
      expect(result.relatedLink).toBe('https://link1.com');
      expect(result.relatedLink2).toBe('https://link2.com');
      expect(result.relatedLink3).toBe('https://link3.com');
      expect(result.relatedLink4).toBe('https://link4.com');
      expect(result.relatedLink5).toBe('https://link5.com');
    });

    it('handles undefined URL fields', () => {
      const prototype = {
        ...basePrototype,
        officialLink: undefined,
        videoUrl: undefined,
        relatedLink: undefined,
      };
      const result = normalizePrototype(prototype);
      expect(result.officialLink).toBeUndefined();
      expect(result.videoUrl).toBeUndefined();
      expect(result.relatedLink).toBeUndefined();
    });
  });

  describe('count fields', () => {
    it('preserves all count values', () => {
      const prototype = {
        ...basePrototype,
        viewCount: 12345,
        goodCount: 678,
        commentCount: 90,
      };
      const result = normalizePrototype(prototype);
      expect(result.viewCount).toBe(12345);
      expect(result.goodCount).toBe(678);
      expect(result.commentCount).toBe(90);
    });

    it('handles zero counts', () => {
      const prototype = {
        ...basePrototype,
        viewCount: 0,
        goodCount: 0,
        commentCount: 0,
      };
      const result = normalizePrototype(prototype);
      expect(result.viewCount).toBe(0);
      expect(result.goodCount).toBe(0);
      expect(result.commentCount).toBe(0);
    });
  });

  describe('other fields', () => {
    it('preserves uuid and nid when provided', () => {
      const prototype = {
        ...basePrototype,
        uuid: 'test-uuid-123',
        nid: 'node-456',
      };
      const result = normalizePrototype(prototype);
      expect(result.uuid).toBe('test-uuid-123');
      expect(result.nid).toBe('node-456');
    });

    it('handles undefined uuid and nid', () => {
      const prototype = {
        ...basePrototype,
        uuid: undefined,
        nid: undefined,
      };
      const result = normalizePrototype(prototype);
      expect(result.uuid).toBeUndefined();
      expect(result.nid).toBeUndefined();
    });

    it('preserves slideMode when provided', () => {
      const prototype = {
        ...basePrototype,
        slideMode: 1,
      };
      const result = normalizePrototype(prototype);
      expect(result.slideMode).toBe(1);
    });

    it('handles undefined slideMode', () => {
      const prototype = {
        ...basePrototype,
        slideMode: undefined,
      };
      const result = normalizePrototype(prototype);
      expect(result.slideMode).toBeUndefined();
    });

    it('preserves createId and updateId when provided', () => {
      const prototype = {
        ...basePrototype,
        createId: 100,
        updateId: 200,
      };
      const result = normalizePrototype(prototype);
      expect(result.createId).toBe(100);
      expect(result.updateId).toBe(200);
    });

    it('handles undefined createId and updateId', () => {
      const prototype = {
        ...basePrototype,
        createId: undefined,
        updateId: undefined,
      };
      const result = normalizePrototype(prototype);
      expect(result.createId).toBeUndefined();
      expect(result.updateId).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('handles empty pipe-separated strings', () => {
      const prototype = {
        ...basePrototype,
        tags: '',
        users: '',
        materials: '',
      };
      const result = normalizePrototype(prototype);
      expect(result.tags).toEqual([]);
      expect(result.users).toEqual([]);
      expect(result.materials).toEqual([]);
    });

    it('handles single pipe character', () => {
      const prototype = {
        ...basePrototype,
        tags: '|',
      };
      const result = normalizePrototype(prototype);
      expect(result.tags).toEqual(['', '']);
    });

    it('handles multiple consecutive pipes', () => {
      const prototype = {
        ...basePrototype,
        events: 'event1||event2',
      };
      const result = normalizePrototype(prototype);
      expect(result.events).toEqual(['event1', '', 'event2']);
    });

    it('handles leading and trailing pipes', () => {
      const prototype = {
        ...basePrototype,
        tags: '|tag1|',
      };
      const result = normalizePrototype(prototype);
      expect(result.tags).toEqual(['', 'tag1', '']);
    });

    it('handles mixed whitespace and empty segments', () => {
      const prototype = {
        ...basePrototype,
        events: '  ev1 |  | ev2  ',
      };
      const result = normalizePrototype(prototype);
      expect(result.events).toEqual(['ev1', '', 'ev2']);
    });

    it('trims whitespace in pipe-separated values', () => {
      const prototype = {
        ...basePrototype,
        awards: ' award1 | award2 | award3 ',
      };
      const result = normalizePrototype(prototype);
      expect(result.awards).toEqual(['award1', 'award2', 'award3']);
    });
  });

  describe('text fields with defaults', () => {
    it('uses empty string default for summary when undefined', () => {
      const prototype = {
        ...basePrototype,
        summary: undefined,
      };
      const result = normalizePrototype(prototype);
      expect(result.summary).toBe('');
    });

    it('preserves summary when provided', () => {
      const prototype = {
        ...basePrototype,
        summary: 'Test summary text',
      };
      const result = normalizePrototype(prototype);
      expect(result.summary).toBe('Test summary text');
    });

    it('uses empty string default for systemDescription when undefined', () => {
      const prototype = {
        ...basePrototype,
        systemDescription: undefined,
      };
      const result = normalizePrototype(prototype);
      expect(result.systemDescription).toBe('');
    });

    it('preserves systemDescription when provided', () => {
      const prototype = {
        ...basePrototype,
        systemDescription: 'System description text',
      };
      const result = normalizePrototype(prototype);
      expect(result.systemDescription).toBe('System description text');
    });
  });

  describe('status field', () => {
    it('preserves status value 1', () => {
      const prototype = {
        ...basePrototype,
        status: 1,
      };
      const result = normalizePrototype(prototype);
      expect(result.status).toBe(1);
    });

    it('preserves status value 2', () => {
      const prototype = {
        ...basePrototype,
        status: 2,
      };
      const result = normalizePrototype(prototype);
      expect(result.status).toBe(2);
    });

    it('preserves status value 3', () => {
      const prototype = {
        ...basePrototype,
        status: 3,
      };
      const result = normalizePrototype(prototype);
      expect(result.status).toBe(3);
    });
  });

  describe('comprehensive scenarios', () => {
    it('handles prototype with all fields provided', () => {
      const prototype: ResultOfListPrototypesApiResponse = {
        id: 999,
        prototypeNm: 'Full Prototype',
        createDate: '2023-05-15 10:30:00.0',
        updateDate: '2024-06-20 14:45:00.0',
        releaseDate: '2025-07-25 18:00:00.0',
        status: 2,
        releaseFlg: 2,
        revision: 5,
        mainUrl: 'https://example.com/main.png',
        viewCount: 5000,
        goodCount: 500,
        commentCount: 50,
        licenseType: 1,
        thanksFlg: 1,
        uuid: 'uuid-full',
        nid: 'nid-full',
        teamNm: 'Full Team',
        summary: 'Full summary',
        freeComment: 'Full comment',
        systemDescription: 'Full description',
        tags: 'tag1|tag2|tag3',
        users: 'user1@id1|user2@id2',
        materials: 'mat1|mat2',
        events: 'event1@id1',
        awards: 'award1',
        officialLink: 'https://official.com',
        videoUrl: 'https://youtube.com/watch?v=xyz',
        relatedLink: 'https://link1.com',
        relatedLink2: 'https://link2.com',
        relatedLink3: 'https://link3.com',
        relatedLink4: 'https://link4.com',
        relatedLink5: 'https://link5.com',
        slideMode: 1,
        createId: 100,
        updateId: 200,
      };
      const result = normalizePrototype(prototype);

      expect(result.id).toBe(999);
      expect(result.prototypeNm).toBe('Full Prototype');
      expect(result.createDate).toBe('2023-05-15T01:30:00.000Z');
      expect(result.updateDate).toBe('2024-06-20T05:45:00.000Z');
      expect(result.releaseDate).toBe('2025-07-25T09:00:00.000Z');
      expect(result.teamNm).toBe('Full Team');
      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3']);
      expect(result.users).toEqual(['user1@id1', 'user2@id2']);
      expect(result.viewCount).toBe(5000);
    });

    it('handles prototype with minimal required fields only', () => {
      const prototype: ResultOfListPrototypesApiResponse = {
        id: 1,
        prototypeNm: 'Minimal',
        createDate: '2023-01-01 00:00:00.0',
        updateDate: '2023-01-01 00:00:00.0',
        status: 1,
        mainUrl: 'https://example.com/img.png',
        viewCount: 0,
        goodCount: 0,
        commentCount: 0,
      };
      const result = normalizePrototype(prototype);

      expect(result.id).toBe(1);
      expect(result.prototypeNm).toBe('Minimal');
      expect(result.createDate).toBe('2022-12-31T15:00:00.000Z');
      expect(result.updateDate).toBe('2022-12-31T15:00:00.000Z');
      expect(result.status).toBe(1);
      expect(result.releaseFlg).toBe(2); // default
      expect(result.revision).toBe(0); // default
      expect(result.licenseType).toBe(1); // default
      expect(result.thanksFlg).toBe(0); // default
      expect(result.teamNm).toBe(''); // default
      expect(result.summary).toBe(''); // default
      expect(result.tags).toEqual([]); // undefined -> []
      expect(result.users).toEqual([]); // undefined -> []
    });

    it('handles prototype with mixed valid and undefined optional fields', () => {
      const prototype: ResultOfListPrototypesApiResponse = {
        id: 50,
        prototypeNm: 'Mixed',
        createDate: '2023-10-10 12:00:00.0',
        updateDate: '2023-10-11 14:00:00.0',
        status: 3,
        mainUrl: 'https://example.com/mixed.png',
        viewCount: 100,
        goodCount: 10,
        commentCount: 1,
        tags: 'onlyTag',
        teamNm: 'Team A',
        // Other optional fields are undefined
      };
      const result = normalizePrototype(prototype);

      expect(result.id).toBe(50);
      expect(result.tags).toEqual(['onlyTag']);
      expect(result.teamNm).toBe('Team A');
      expect(result.users).toEqual([]);
      expect(result.materials).toEqual([]);
      expect(result.summary).toBe('');
      expect(result.releaseDate).toBeUndefined();
    });
  });

  describe('date boundary cases', () => {
    it('handles JST midnight crossing to previous day in UTC', () => {
      const prototype = {
        ...basePrototype,
        createDate: '2023-01-01 00:00:00.0', // JST midnight
      };
      const result = normalizePrototype(prototype);
      // 2023-01-01 00:00 JST -> 2022-12-31 15:00 UTC
      expect(result.createDate).toBe('2022-12-31T15:00:00.000Z');
    });

    it('handles JST 09:00 staying same day in UTC', () => {
      const prototype = {
        ...basePrototype,
        updateDate: '2024-06-15 09:00:00.0', // JST 09:00
      };
      const result = normalizePrototype(prototype);
      // 2024-06-15 09:00 JST -> 2024-06-15 00:00 UTC
      expect(result.updateDate).toBe('2024-06-15T00:00:00.000Z');
    });

    it('handles year-end boundary crossing', () => {
      const prototype = {
        ...basePrototype,
        releaseDate: '2025-01-01 08:59:59.999', // JST before 09:00
      };
      const result = normalizePrototype(prototype);
      // 2025-01-01 08:59:59.999 JST -> 2024-12-31 23:59:59.999 UTC
      expect(result.releaseDate).toBe('2024-12-31T23:59:59.999Z');
    });

    it('handles leap year date', () => {
      const prototype = {
        ...basePrototype,
        createDate: '2024-02-29 12:00:00.0', // Leap year
      };
      const result = normalizePrototype(prototype);
      expect(result.createDate).toBe('2024-02-29T03:00:00.000Z');
    });
  });

  describe('real-world data patterns', () => {
    it('handles prototype with event and award annotations', () => {
      const prototype = {
        ...basePrototype,
        events: 'Hackathon 2024@hack2024|Maker Faire@mf2024',
        awards: 'Best Innovation Award|Audience Award',
      };
      const result = normalizePrototype(prototype);
      expect(result.events).toEqual(['Hackathon 2024@hack2024', 'Maker Faire@mf2024']);
      expect(result.awards).toEqual(['Best Innovation Award', 'Audience Award']);
    });

    it('handles prototype with Japanese characters in text fields', () => {
      const prototype = {
        ...basePrototype,
        prototypeNm: 'テストプロトタイプ',
        summary: '革新的なアイデア',
        teamNm: 'チームA',
      };
      const result = normalizePrototype(prototype);
      expect(result.prototypeNm).toBe('テストプロトタイプ');
      expect(result.summary).toBe('革新的なアイデア');
      expect(result.teamNm).toBe('チームA');
    });

    it('handles prototype with empty optional text fields', () => {
      const prototype = {
        ...basePrototype,
        summary: '',
        freeComment: '',
        systemDescription: '',
        teamNm: '',
      };
      const result = normalizePrototype(prototype);
      expect(result.summary).toBe('');
      expect(result.freeComment).toBe('');
      expect(result.systemDescription).toBe('');
      expect(result.teamNm).toBe('');
    });
  });

  describe('explicit values vs defaults', () => {
    it('preserves releaseFlg 0 (Draft)', () => {
      const prototype = { ...basePrototype, releaseFlg: 0 };
      const result = normalizePrototype(prototype);
      expect(result.releaseFlg).toBe(0);
    });

    it('preserves revision 0', () => {
      const prototype = { ...basePrototype, revision: 0 };
      const result = normalizePrototype(prototype);
      expect(result.revision).toBe(0);
    });

    it('preserves thanksFlg 0', () => {
      const prototype = { ...basePrototype, thanksFlg: 0 };
      const result = normalizePrototype(prototype);
      expect(result.thanksFlg).toBe(0);
    });

    it('preserves licenseType 0', () => {
      const prototype = { ...basePrototype, licenseType: 0 };
      const result = normalizePrototype(prototype);
      expect(result.licenseType).toBe(0);
    });
  });

  describe('data integrity', () => {
    it('handles URLs with query parameters and fragments', () => {
      const prototype = {
        ...basePrototype,
        mainUrl: 'https://example.com/img.png?v=1#fragment',
        videoUrl: 'https://youtube.com/watch?v=xyz&t=10s',
      };
      const result = normalizePrototype(prototype);
      expect(result.mainUrl).toBe('https://example.com/img.png?v=1#fragment');
      expect(result.videoUrl).toBe('https://youtube.com/watch?v=xyz&t=10s');
    });

    it('handles very long text content', () => {
      const longText = 'a'.repeat(10000);
      const prototype = {
        ...basePrototype,
        summary: longText,
        freeComment: longText,
      };
      const result = normalizePrototype(prototype);
      expect(result.summary).toBe(longText);
      expect(result.freeComment).toBe(longText);
    });

    it('handles negative counts (robustness)', () => {
      const prototype = {
        ...basePrototype,
        viewCount: -1,
        goodCount: -5,
      };
      const result = normalizePrototype(prototype);
      expect(result.viewCount).toBe(-1);
      expect(result.goodCount).toBe(-5);
    });
  });
});
