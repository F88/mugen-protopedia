import {
  anniversaryMinimalPrototype,
  fullfilledPrototype,
  minimalPrototype,
} from '@/.storybook/prototypes.fixture';
import type { NormalizedPrototype } from '@/lib/api/prototypes';
import {
  buildTagAnalytics,
  buildCoreSummaries,
  buildUserTeamAnalytics,
  buildMaterialAnalytics,
  buildTimeDistributions,
  buildDateBasedPrototypeInsights,
  buildAdvancedAnalysis,
} from '@/lib/analysis/batch';
import { calculateCreationStreak } from '@/lib/analysis/core';
import {
  buildAnniversaries,
  buildAnniversarySlice,
} from '@/lib/analysis/shared/anniversaries';
import type { PrototypeAnalysis } from '@/lib/analysis/types';
import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/nextjs';

import { AnalysisDashboard } from './analysis-dashboard';

// Helper function for Storybook
function analyzePrototypes(
  prototypes: NormalizedPrototype[],
): PrototypeAnalysis {
  const referenceDate = new Date();
  const totalCount = prototypes.length;
  const {
    statusDistribution,
    prototypesWithAwards,
    averageAgeInDays: rawAverageAgeInDays,
  } = buildCoreSummaries(prototypes, { referenceDate });
  const { topTags } = buildTagAnalytics(prototypes);
  const { teams } = buildUserTeamAnalytics(prototypes);
  const { topMaterials, yearlyTopMaterials } =
    buildMaterialAnalytics(prototypes);
  const {
    releaseTimeDistribution,
    releaseDateDistribution,
    updateTimeDistribution,
    updateDateDistribution,
  } = buildTimeDistributions(prototypes);
  const { uniqueReleaseDates } = buildDateBasedPrototypeInsights(prototypes);
  const creationStreak = calculateCreationStreak(
    uniqueReleaseDates,
    referenceDate,
  );
  const advancedAnalysis = buildAdvancedAnalysis(prototypes, topTags);

  const averageAgeInDays =
    totalCount > 0 ? Math.round(rawAverageAgeInDays * 100) / 100 : 0;

  const anniversariesSliceSource = buildAnniversaries(prototypes);
  const anniversaries = buildAnniversarySlice(
    anniversariesSliceSource.birthdayPrototypes,
    anniversariesSliceSource.newbornPrototypes,
  );

  const oneDayMs = 24 * 60 * 60 * 1000;
  const anniversaryCandidates = {
    metadata: {
      computedAt: referenceDate.toISOString(),
      windowUTC: {
        fromISO: new Date(referenceDate.getTime() - oneDayMs).toISOString(),
        toISO: new Date(referenceDate.getTime() + oneDayMs).toISOString(),
      },
    },
    mmdd: prototypes
      .filter((prototype) => Boolean(prototype.releaseDate))
      .map((prototype) => ({
        id: prototype.id,
        title: prototype.prototypeNm ?? '',
        releaseDate: prototype.releaseDate,
      })),
  } as const;

  if (totalCount === 0) {
    return {
      totalCount,
      statusDistribution,
      prototypesWithAwards,
      topTags,
      topMaterials,
      yearlyTopMaterials,
      averageAgeInDays,
      topTeams: teams.topTeams,
      analyzedAt: referenceDate.toISOString(),
      anniversaryCandidates,
      anniversaries,
      createTimeDistribution: { dayOfWeek: [], hour: [], heatmap: [] },
      createDateDistribution: { month: [], year: {}, daily: {} },
      releaseTimeDistribution,
      releaseDateDistribution,
      updateTimeDistribution,
      updateDateDistribution,
      creationStreak,
      ...advancedAnalysis,
    };
  }

  return {
    totalCount,
    statusDistribution,
    prototypesWithAwards,
    topTags,
    topMaterials,
    yearlyTopMaterials,
    averageAgeInDays,
    topTeams: teams.topTeams,
    analyzedAt: referenceDate.toISOString(),
    anniversaryCandidates,
    anniversaries,
    createTimeDistribution: {
      dayOfWeek: new Array(7).fill(0),
      hour: new Array(24).fill(0),
      heatmap: Array.from({ length: 7 }, () => new Array(24).fill(0)),
    },
    createDateDistribution: {
      month: new Array(12).fill(0),
      year: {},
      daily: {},
    },
    releaseTimeDistribution,
    releaseDateDistribution,
    updateTimeDistribution,
    updateDateDistribution,
    creationStreak,
    ...advancedAnalysis,
  };
}

type MockAnalysisState = {
  data?: PrototypeAnalysis | null;
  isLoading?: boolean;
  error?: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const refresh = (_opts?: { forceRecompute?: boolean }) => {};

const sampleAnalysis = analyzePrototypes([
  fullfilledPrototype,
  minimalPrototype,
  anniversaryMinimalPrototype,
]);

const cloneAnalysis = (analysis: PrototypeAnalysis): PrototypeAnalysis =>
  JSON.parse(JSON.stringify(analysis)) as PrototypeAnalysis;

const makeAnalysis = (mutator: (analysis: PrototypeAnalysis) => void) => {
  const draft = cloneAnalysis(sampleAnalysis);
  mutator(draft);
  draft.analyzedAt = new Date().toISOString();
  return draft;
};

const randomTimeTodayISOString = (): string => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return faker.date
    .between({ from: startOfToday, to: endOfToday })
    .toISOString();
};

// Create a releaseDate that represents "birthday is today" for given years ago
// with a randomized time of day to add variance in stories
const releaseDateForYearsAgo = (years: number): string => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  // Randomize time within the day (local time)
  const hours = faker.number.int({ min: 0, max: 23 });
  const minutes = faker.number.int({ min: 0, max: 59 });
  const seconds = faker.number.int({ min: 0, max: 59 });
  const ms = faker.number.int({ min: 0, max: 999 });
  d.setHours(hours, minutes, seconds, ms);
  return d.toISOString();
};

// Pre-generate newborn datasets once per module load
const newborns7Today: PrototypeAnalysis['anniversaries']['newbornPrototypes'] =
  Array.from({ length: 7 }).map((_, index) => ({
    id: 2000 + index,
    title: `Fresh Prototype ${index + 1} with an exceptionally detailed and long title`,
    releaseDate: randomTimeTodayISOString(),
  }));

const newborns4Today: PrototypeAnalysis['anniversaries']['newbornPrototypes'] =
  Array.from({ length: 4 }).map((_, index) => ({
    id: 2000 + index,
    title: `Brand New Prototype ${index + 1}`,
    releaseDate: randomTimeTodayISOString(),
  }));

const withMockState =
  (state: MockAnalysisState = {}) =>
  () => ({
    data: state.data !== undefined ? state.data : sampleAnalysis,
    isLoading: state.isLoading ?? false,
    error: state.error ?? null,
    refresh,
  });

// Provide a mock anniversaries override to avoid network calls in Storybook
const buildClientAnniversariesOverride = (state: MockAnalysisState = {}) => {
  const data = state.data !== undefined ? state.data : sampleAnalysis;
  const isLoading = Boolean(state.isLoading);
  const error = state.error ?? null;
  return {
    anniversaries: data ? data.anniversaries : null,
    isLoading,
    error,
  } as const;
};

const meta = {
  title: 'Components/AnalysisDashboard',
  component: AnalysisDashboard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    defaultExpanded: true,
    useLatestAnalysisHook: withMockState({}),
  },
} satisfies Meta<typeof AnalysisDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderStory: Story['render'] = (_args, context) => {
  const { mockState } = (context.parameters ?? {}) as {
    mockState?: MockAnalysisState;
  };
  const useLatestAnalysisHook = withMockState(mockState ?? {});
  const clientAnniversariesOverride = buildClientAnniversariesOverride(
    mockState ?? {},
  );
  return (
    <AnalysisDashboard
      {..._args}
      useLatestAnalysisHook={useLatestAnalysisHook}
      preferClientTimezoneAnniversaries
      clientAnniversariesOverride={clientAnniversariesOverride}
    />
  );
};

export const Default: Story = {
  render: renderStory,
  parameters: {
    mockState: {
      data: sampleAnalysis,
    },
    docs: {
      description: {
        story:
          'Default analysis dashboard showing prototype statistics and insights.',
      },
    },
  },
};

export const Minimal: Story = {
  render: renderStory,
  parameters: {
    mockState: {
      // Always provide a minimal-but-non-null dataset
      data: analyzePrototypes([minimalPrototype]),
    },
    docs: {
      description: {
        story: 'Minimal dataset with a single prototype to avoid No data.',
      },
    },
  },
};

export const Loading: Story = {
  render: renderStory,
  parameters: {
    mockState: {
      isLoading: true,
      data: null,
    },
    docs: {
      description: {
        story: 'Loading state while fetching analysis data.',
      },
    },
  },
};

export const Error: Story = {
  render: renderStory,
  parameters: {
    mockState: {
      error: 'Failed to fetch analysis data',
      data: null,
    },
    docs: {
      description: {
        story: 'Error state when analysis data cannot be loaded.',
      },
    },
  },
};

export const NoData: Story = {
  render: renderStory,
  parameters: {
    mockState: {
      data: null,
    },
    docs: {
      description: {
        story: 'State when no analysis data is available in cache.',
      },
    },
  },
};

export const ManyBirthdays: Story = {
  render: renderStory,
  parameters: {
    mockState: {
      data: makeAnalysis((draft) => {
        draft.anniversaries.birthdayPrototypes = Array.from({ length: 6 }).map(
          (_, index) => {
            const years = 5 + index;
            return {
              id: 1000 + index,
              title: `Celebration Prototype ${index + 1} with a very long descriptive title to wrap`,
              years,
              releaseDate: releaseDateForYearsAgo(years),
            };
          },
        );
        draft.anniversaries.birthdayCount =
          draft.anniversaries.birthdayPrototypes.length;
      }),
    },
    docs: {
      description: {
        story:
          'Displays multiple birthday entries to verify wrapping and overflow handling.',
      },
    },
  },
};

export const ManyNewborns: Story = {
  render: renderStory,
  parameters: {
    mockState: {
      data: makeAnalysis((draft) => {
        draft.anniversaries.newbornPrototypes = newborns7Today;
        draft.anniversaries.newbornCount =
          draft.anniversaries.newbornPrototypes.length;
      }),
    },
    docs: {
      description: {
        story:
          'Displays multiple newborn prototypes to verify layout and overflow handling.',
      },
    },
  },
};

export const BirthdaysAndNewborns: Story = {
  render: renderStory,
  parameters: {
    mockState: {
      data: makeAnalysis((draft) => {
        draft.anniversaries.birthdayPrototypes = Array.from({ length: 3 }).map(
          (_, index) => {
            const years = 2 + index;
            return {
              id: 1000 + index,
              title: `Anniversary Prototype ${index + 1}`,
              years,
              releaseDate: releaseDateForYearsAgo(years),
            };
          },
        );
        draft.anniversaries.birthdayCount =
          draft.anniversaries.birthdayPrototypes.length;
        draft.anniversaries.newbornPrototypes = newborns4Today;
        draft.anniversaries.newbornCount =
          draft.anniversaries.newbornPrototypes.length;
      }),
    },
    docs: {
      description: {
        story:
          'Displays both birthday and newborn prototypes to verify layout with both sections.',
      },
    },
  },
};

export const NoBirthdays: Story = {
  render: renderStory,
  parameters: {
    mockState: {
      data: makeAnalysis((draft) => {
        // Remove birthdays
        draft.anniversaries.birthdayPrototypes = [];
        draft.anniversaries.birthdayCount = 0;
        // Keep newborns so only newborns section appears
        draft.anniversaries.newbornPrototypes = Array.from({ length: 4 }).map(
          (_, index) => ({
            id: 3000 + index,
            title: `Only Newborn Prototype ${index + 1}`,
            releaseDate: randomTimeTodayISOString(),
          }),
        );
        draft.anniversaries.newbornCount =
          draft.anniversaries.newbornPrototypes.length;
      }),
    },
    docs: {
      description: {
        story: 'State with no birthdays but some newborns.',
      },
    },
  },
};

export const NoNewborns: Story = {
  render: renderStory,
  parameters: {
    mockState: {
      data: makeAnalysis((draft) => {
        // Remove newborns
        draft.anniversaries.newbornPrototypes = [];
        draft.anniversaries.newbornCount = 0;
        // Keep birthdays so only birthdays section appears
        draft.anniversaries.birthdayPrototypes = Array.from({ length: 3 }).map(
          (_, index) => {
            const years = 1 + index;
            return {
              id: 4000 + index,
              title: `Only Birthday Prototype ${index + 1}`,
              years,
              releaseDate: releaseDateForYearsAgo(years),
            };
          },
        );
        draft.anniversaries.birthdayCount =
          draft.anniversaries.birthdayPrototypes.length;
      }),
    },
    docs: {
      description: {
        story: 'State with birthdays but no newborns.',
      },
    },
  },
};

export const NoBirthdaysAndNoNewborns: Story = {
  render: renderStory,
  parameters: {
    mockState: {
      data: makeAnalysis((draft) => {
        // Both sections empty
        draft.anniversaries.birthdayPrototypes = [];
        draft.anniversaries.birthdayCount = 0;
        draft.anniversaries.newbornPrototypes = [];
        draft.anniversaries.newbornCount = 0;
      }),
    },
    docs: {
      description: {
        story: 'State with both birthdays and newborns empty.',
      },
    },
  },
};

export const LongTeamNames: Story = {
  render: renderStory,
  parameters: {
    mockState: {
      data: makeAnalysis((draft) => {
        draft.topTeams = [
          { team: 'クラッピーチャレンジ', count: 40 },
          { team: '1000円あったら電子工作 ThousanDIY', count: 21 },
          {
            team: 'Some Extremely Verbose Open Source Collective With An Incredibly Long Team Name',
            count: 12,
          },
          { team: 'kirinsan.org', count: 8 },
        ];
      }),
    },
    docs: {
      description: {
        story:
          'Use long team labels to ensure the Active Teams list wraps correctly.',
      },
    },
  },
};

const generateBulkAnalysis = (count: number): PrototypeAnalysis => {
  const teams = faker.helpers.multiple(() => faker.company.name(), {
    count: 50,
  });

  const birthdays = faker.helpers.multiple(
    (_value, index) => {
      const years = faker.number.int({ min: 1, max: 15 });
      return {
        id: 5000 + index,
        title: faker.commerce.productName(),
        years,
        releaseDate: releaseDateForYearsAgo(years),
      };
    },
    { count: 12 },
  );

  // Generate newborns with random times within today
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const newborns = faker.helpers.multiple(
    (_value, index) => {
      const releaseDate = faker.date
        .between({ from: startOfToday, to: endOfToday })
        .toISOString();
      return {
        id: 6000 + index,
        title: faker.commerce.productName(),
        releaseDate,
      };
    },
    { count: 8 },
  );

  const topMaterials = faker.helpers.multiple(
    () => ({
      material: faker.commerce.productMaterial(),
      count: faker.number.int({ min: 5, max: 50 }),
    }),
    { count: 10 },
  );

  const releaseTimeDistribution = {
    dayOfWeek: Array.from({ length: 7 }).map(() =>
      faker.number.int({ min: 0, max: 100 }),
    ),
    hour: Array.from({ length: 24 }).map(() =>
      faker.number.int({ min: 0, max: 50 }),
    ),
    heatmap: Array.from({ length: 7 }).map(() =>
      Array.from({ length: 24 }).map(() =>
        faker.number.int({ min: 0, max: 10 }),
      ),
    ),
  };

  const releaseDateDistribution = {
    month: Array.from({ length: 12 }).map(() =>
      faker.number.int({ min: 50, max: 150 }),
    ),
    year: Object.fromEntries(
      Array.from({ length: 10 }).map((_, index) => {
        const year = 2015 + index;
        return [year, faker.number.int({ min: 5, max: 150 })];
      }),
    ),
    daily: {},
  };

  const updateTimeDistribution = {
    dayOfWeek: Array.from({ length: 7 }).map(() =>
      faker.number.int({ min: 0, max: 100 }),
    ),
    hour: Array.from({ length: 24 }).map(() =>
      faker.number.int({ min: 0, max: 50 }),
    ),
    heatmap: Array.from({ length: 7 }).map(() =>
      Array.from({ length: 24 }).map(() =>
        faker.number.int({ min: 0, max: 10 }),
      ),
    ),
  };

  const updateDateDistribution = {
    month: Array.from({ length: 12 }).map(() =>
      faker.number.int({ min: 30, max: 120 }),
    ),
    year: Object.fromEntries(
      Array.from({ length: 10 }).map((_, index) => {
        const year = 2015 + index;
        return [year, faker.number.int({ min: 3, max: 100 })];
      }),
    ),
    daily: {},
  };

  const creationStreak = {
    currentStreak: faker.number.int({ min: 0, max: 10 }),
    longestStreak: faker.number.int({ min: 10, max: 50 }),
    longestStreakEndDate: faker.date.past().toISOString(),
    totalActiveDays: faker.number.int({ min: 100, max: 500 }),
  };

  const advancedAnalysis = {
    firstPenguins: [],
    starAlignments: [],
    anniversaryEffect: [],
    earlyAdopters: [],
    laborOfLove: {
      longestGestation: [],
      distribution: {},
    },
    maternityHospital: {
      topEvents: [],
      independentRatio: 0.5,
    },
    powerOfDeadlines: {
      spikes: [],
    },
    weekendWarrior: {
      weekendHourlyCounts: [],
      totalWeekendCount: 0,
    },
    holyDay: {
      topDays: [],
    },
    longTermEvolution: {
      longestMaintenance: [],
      averageMaintenanceDays: 0,
      maintenanceRatio: 0,
    },
    evolutionSpan: {
      distribution: {
        noUpdates: 0,
        sameDayUpdate: 0,
        within3Days: 0,
        within7Days: 0,
        within14Days: 0,
        within30Days: 0,
        within90Days: 0,
        within180Days: 0,
        within1Year: 0,
        within3Years: 0,
        over3Years: 0,
      },
    },
  };

  return {
    totalCount: count,
    statusDistribution: {
      '1': Math.round(count * 0.2),
      '2': Math.round(count * 0.35),
      '3': Math.round(count * 0.25),
      '4':
        count -
        Math.round(count * 0.2) -
        Math.round(count * 0.35) -
        Math.round(count * 0.25),
    },
    prototypesWithAwards: Math.round(count * 0.42),
    topTags: faker.helpers.multiple(
      () => ({
        tag: faker.commerce.department(),
        count: faker.number.int({ min: 20, max: 120 }),
      }),
      { count: 10 },
    ),
    topMaterials,
    yearlyTopMaterials: {},
    averageAgeInDays: faker.number.int({ min: 30, max: 4000 }),
    topTeams: teams
      .slice(0, 6)
      .map((team) => ({ team, count: faker.number.int({ min: 5, max: 80 }) })),
    anniversaries: {
      birthdayCount: birthdays.length,
      birthdayPrototypes: birthdays,
      newbornCount: newborns.length,
      newbornPrototypes: newborns,
    },
    analyzedAt: faker.date.recent().toISOString(),
    anniversaryCandidates: {
      metadata: {
        computedAt: new Date().toISOString(),
        windowUTC: {
          fromISO: new Date(Date.now() - 86400000).toISOString(),
          toISO: new Date(Date.now() + 86400000).toISOString(),
        },
      },
      mmdd: [],
    },
    createTimeDistribution: {
      dayOfWeek: new Array(7).fill(0),
      hour: new Array(24).fill(0),
      heatmap: Array.from({ length: 7 }, () => new Array(24).fill(0)),
    },
    createDateDistribution: {
      month: new Array(12).fill(0),
      year: {},
      daily: {},
    },
    releaseTimeDistribution,
    releaseDateDistribution,
    updateTimeDistribution,
    updateDateDistribution,
    creationStreak,
    ...advancedAnalysis,
  } satisfies PrototypeAnalysis;
};

export const LargeDataset_10000: Story = {
  render: renderStory,
  parameters: {
    mockState: {
      data: generateBulkAnalysis(10_000),
    },
    docs: {
      description: {
        story:
          'Synthetic analysis generated from 10,000 prototypes to test scaling and layout.',
      },
    },
  },
};
