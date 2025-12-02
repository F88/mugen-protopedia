import React from 'react';

import { IconHourglass } from '../../shared/icons';
import { helloWorldTheme } from '../theme';
import { ObservatorySection } from './observatory-section';

type EvolutionSpanSectionProps = {
  evolutionSpan: {
    distribution: {
      noUpdates: number;
      sameDayUpdate: number;
      within3Days: number;
      within7Days: number;
      within14Days: number;
      within30Days: number;
      within90Days: number;
      within180Days: number;
      within1Year: number;
      within3Years: number;
      over3Years: number;
    };
  };
};

export function EvolutionSpanSection({
  evolutionSpan,
}: EvolutionSpanSectionProps) {
  const { distribution } = evolutionSpan;

  const totalCount = Object.values(distribution).reduce((a, b) => a + b, 0);

  const data = [
    {
      label: 'No Updates',
      count: distribution.noUpdates,
      baseColor: 'slate',
    },
    {
      label: 'Same Day',
      count: distribution.sameDayUpdate,
      baseColor: 'slate',
    },
    {
      label: '3 Days',
      count: distribution.within3Days,
      baseColor: 'teal',
    },
    {
      label: '7 Days',
      count: distribution.within7Days,
      baseColor: 'teal',
    },
    {
      label: '14 Days',
      count: distribution.within14Days,
      baseColor: 'teal',
    },
    {
      label: '30 Days',
      count: distribution.within30Days,
      baseColor: 'teal',
    },
    {
      label: '90 Days',
      count: distribution.within90Days,
      baseColor: 'teal',
    },
    {
      label: '180 Days',
      count: distribution.within180Days,
      baseColor: 'teal',
    },
    {
      label: '1 Year',
      count: distribution.within1Year,
      baseColor: 'teal',
    },
    {
      label: '3 Years',
      count: distribution.within3Years,
      baseColor: 'teal',
    },
    {
      label: '3+ Years',
      count: distribution.over3Years,
      baseColor: 'teal',
    },
  ];

  // Calculate percentages
  const dataWithPercentage = data.map((item) => ({
    ...item,
    percentage: totalCount > 0 ? (item.count / totalCount) * 100 : 0,
  }));

  // Find max percentage for bar scaling and opacity calculation
  const maxPercentage = Math.max(
    ...dataWithPercentage.map((d) => d.percentage),
  );

  const getOpacity = (percentage: number) => {
    // Calculate opacity based on percentage relative to max (min 0.3, max 1.0)
    if (maxPercentage === 0) return 0.3;
    return 0.3 + (percentage / maxPercentage) * 0.7;
  };

  return (
    <ObservatorySection
      theme={helloWorldTheme.sections.evolutionSpan.theme}
      icon={<IconHourglass />}
      title="Evolution Span"
      description="How long do prototypes stay active? This distribution shows the lifespan of continuous updates."
      sourceNote={
        <>
          <strong>Release Date</strong> to <strong>Last Update Date</strong>{' '}
          duration.
        </>
      }
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-teal-400/20 rounded-full animate-pulse opacity-20 duration-3000"></div>
          <div className="text-6xl filter drop-shadow-lg">⏳</div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">⏱️</span> The Sands of Time
          </>
        ),
        content: (
          <div className="space-y-4">
            <p>
              Most prototypes are sparks—bright, intense, and brief. But some
              evolve into sustained fires. Understanding this span helps us
              appreciate both the sprint and the marathon.
            </p>
          </div>
        ),
      }}
      delay={helloWorldTheme.sections.evolutionSpan.delay}
    >
      <div className="space-y-5">
        {dataWithPercentage.map((item) => (
          <div key={item.label} className="relative group">
            <div className="flex items-end justify-between text-sm mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-200 w-24 shrink-0">
                  {item.label}
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                {item.count.toLocaleString()}
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                  item.baseColor === 'slate'
                    ? 'bg-slate-500 dark:bg-slate-400'
                    : 'bg-teal-500 dark:bg-teal-400'
                }`}
                style={{
                  width: `${(item.percentage / maxPercentage) * 100}%`,
                  minWidth: item.percentage > 0 ? '4px' : '0',
                  opacity: getOpacity(item.percentage),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </ObservatorySection>
  );
}
