import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  AnniversaryCandidatePrototype,
  ClientPrototypeAnalysis,
} from '@/lib/utils/prototype-analysis.types';
import type {
  BirthdayPrototype,
  NewbornPrototype,
} from '@/lib/utils/prototype-analysis-helpers';

import { analyzeCandidates } from '@/lib/utils/prototype-analysis.client';

type AnniversarySlice = ClientPrototypeAnalysis['anniversaries'];

const { mockBuildAnniversaries, mockBuildAnniversarySlice } = vi.hoisted(() => {
  const mockBuildAnniversaries = vi.fn(() => ({
    birthdayPrototypes: [] as BirthdayPrototype[],
    newbornPrototypes: [] as NewbornPrototype[],
  }));

  const mockBuildAnniversarySlice = vi.fn<
    (
      birthdayPrototypes: BirthdayPrototype[],
      newbornPrototypes: NewbornPrototype[],
    ) => AnniversarySlice
  >((birthdayPrototypes, newbornPrototypes) => ({
    birthdayCount: birthdayPrototypes.length,
    birthdayPrototypes,
    newbornCount: newbornPrototypes.length,
    newbornPrototypes,
  }));

  return { mockBuildAnniversaries, mockBuildAnniversarySlice };
});

vi.mock('@/lib/utils/prototype-analysis-helpers', () => ({
  buildAnniversaries: mockBuildAnniversaries,
  buildAnniversarySlice: mockBuildAnniversarySlice,
}));

function createMockLogger() {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn(() => logger),
  };
  return logger;
}

describe('analyzeCandidates logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildAnniversaries.mockReset();
    mockBuildAnniversarySlice.mockReset();

    mockBuildAnniversaries.mockReturnValue({
      birthdayPrototypes: [] as BirthdayPrototype[],
      newbornPrototypes: [] as NewbornPrototype[],
    });
    mockBuildAnniversarySlice.mockImplementation(
      (
        birthdayPrototypes: BirthdayPrototype[],
        newbornPrototypes: NewbornPrototype[],
      ) => ({
        birthdayCount: birthdayPrototypes.length,
        birthdayPrototypes,
        newbornCount: newbornPrototypes.length,
        newbornPrototypes,
      }),
    );
  });

  it('logs aggregated totals when no candidates are provided', () => {
    const logger = createMockLogger();
    const referenceDate = new Date('2025-11-14T00:00:00Z');

    const result = analyzeCandidates([], { logger, referenceDate });

    expect(mockBuildAnniversaries).not.toHaveBeenCalled();
    expect(mockBuildAnniversarySlice).not.toHaveBeenCalled();
    expect(logger.child).toHaveBeenCalledWith({ action: 'analyzeCandidates' });
    expect(logger.debug).toHaveBeenCalledWith(
      {
        totals: {
          candidates: 0,
          birthday: 0,
          byMonthDay: {},
        },
        anniversaries: {
          birthdayCount: 0,
          newbornCount: 0,
        },
      },
      'Client-side anniversaries computed from candidates',
    );
    expect(result).toEqual({
      anniversaries: {
        birthdayCount: 0,
        birthdayPrototypes: [],
        newbornCount: 0,
        newbornPrototypes: [],
      },
    });
  });

  it('logs totals and anniversary counts when candidates exist', () => {
    const logger = createMockLogger();
    const referenceDate = new Date('2025-05-01T00:00:00Z');

    const candidates: AnniversaryCandidatePrototype[] = [
      { id: 10, title: 'Candidate A', releaseDate: '2023-04-30T00:00:00Z' },
      { id: 11, title: 'Candidate B', releaseDate: '2021-05-01T00:00:00Z' },
    ];

    const birthdayPrototypes: BirthdayPrototype[] = [
      {
        id: 1,
        title: 'Birthday Proto',
        years: 4,
        releaseDate: '2021-05-01T00:00:00Z',
      },
    ];
    const newbornPrototypes: NewbornPrototype[] = [
      { id: 2, title: 'Newborn Proto', releaseDate: '2025-05-01T00:00:00Z' },
    ];

    mockBuildAnniversaries.mockReturnValue({
      birthdayPrototypes,
      newbornPrototypes,
    });

    const result = analyzeCandidates(candidates, { logger, referenceDate });

    expect(mockBuildAnniversaries).toHaveBeenCalledWith(candidates);
    expect(mockBuildAnniversarySlice).toHaveBeenCalledWith(
      birthdayPrototypes,
      newbornPrototypes,
    );
    expect(logger.debug).toHaveBeenCalledWith(
      {
        totals: {
          candidates: 2,
          birthday: 1,
          byMonthDay: {
            '04-30': 1,
            '05-01': 1,
          },
        },
        anniversaries: {
          birthdayCount: 1,
          newbornCount: 1,
        },
      },
      'Client-side anniversaries computed from candidates',
    );
    expect(result).toEqual({
      anniversaries: {
        birthdayCount: 1,
        birthdayPrototypes,
        newbornCount: 1,
        newbornPrototypes,
      },
    });
  });
});
