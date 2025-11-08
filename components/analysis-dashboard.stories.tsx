import type { Meta, StoryObj } from '@storybook/nextjs';
import { analyzePrototypes, type PrototypeAnalysis } from '@/lib/utils/prototype-analysis';
import {
  anniversaryMinimalPrototype,
  fullfilledPrototype,
  minimalPrototype,
} from '@/.storybook/prototypes.fixture';
import { faker } from '@faker-js/faker';

import { AnalysisDashboard } from './analysis-dashboard';

type MockAnalysisState = {
  data?: PrototypeAnalysis | null;
  isLoading?: boolean;
  error?: string | null;
};

const refresh = () => {};

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

const withMockState =
  (state: MockAnalysisState = {}) =>
  () => ({
    data: state.data ?? sampleAnalysis,
    isLoading: state.isLoading ?? false,
    error: state.error ?? null,
    refresh,
  });

const meta = {
  title: 'Components/AnalysisDashboard',
  component: AnalysisDashboard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    defaultExpanded: true,
  },
} satisfies Meta<typeof AnalysisDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderStory: Story['render'] = (_args, context) => {
  const { mockState } = (context.parameters ?? {}) as { mockState?: MockAnalysisState };
  return <AnalysisDashboard useLatestAnalysisHook={withMockState(mockState ?? {})} />;
};

export const Default: Story = {
  render: renderStory,
  parameters: {
    mockState: {
      data: sampleAnalysis,
    },
    docs: {
      description: {
        story: 'Default analysis dashboard showing prototype statistics and insights.',
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
        draft.anniversaries.birthdayPrototypes = Array.from({ length: 6 }).map((_, index) => ({
          id: 1000 + index,
          title: `Celebration Prototype ${index + 1} with a very long descriptive title to wrap`,
          years: 5 + index,
          releaseDate: new Date(2015 + index, 0, 1).toISOString(),
        }));
        draft.anniversaries.birthdayCount = draft.anniversaries.birthdayPrototypes.length;
      }),
    },
    docs: {
      description: {
        story: 'Displays multiple birthday entries to verify wrapping and overflow handling.',
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
        story: 'Use long team labels to ensure the Active Teams list wraps correctly.',
      },
    },
  },
};

const generateBulkAnalysis = (count: number): PrototypeAnalysis => {
  const teams = faker.helpers.multiple(() => faker.company.name(), { count: 50 });

  const birthdays = faker.helpers.multiple(
    (_value, index) => ({
      id: 5000 + index,
      title: faker.commerce.productName(),
      years: faker.number.int({ min: 1, max: 15 }),
      releaseDate: faker.date.past({ years: 15 }).toISOString(),
    }),
    { count: 12 },
  );

  return {
    totalCount: count,
    statusDistribution: {
      '1': Math.round(count * 0.2),
      '2': Math.round(count * 0.35),
      '3': Math.round(count * 0.25),
      '4': count - Math.round(count * 0.2) - Math.round(count * 0.35) - Math.round(count * 0.25),
    },
    prototypesWithAwards: Math.round(count * 0.42),
    topTags: faker.helpers.multiple(
      () => ({ tag: faker.commerce.department(), count: faker.number.int({ min: 20, max: 120 }) }),
      { count: 10 },
    ),
    averageAgeInDays: faker.number.int({ min: 30, max: 4000 }),
    yearDistribution: Object.fromEntries(
      Array.from({ length: 10 }).map((_, index) => {
        const year = 2015 + index;
        return [year, faker.number.int({ min: 5, max: 150 })];
      }),
    ),
    topTeams: teams
      .slice(0, 6)
      .map((team) => ({ team, count: faker.number.int({ min: 5, max: 80 }) })),
    anniversaries: {
      birthdayCount: birthdays.length,
      birthdayPrototypes: birthdays,
    },
    analyzedAt: faker.date.recent().toISOString(),
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
        story: 'Synthetic analysis generated from 10,000 prototypes to test scaling and layout.',
      },
    },
  },
};
