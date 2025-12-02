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
      over90Days: number;
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
      color: 'bg-slate-300 dark:bg-slate-600',
    },
    {
      label: 'Same Day',
      count: distribution.sameDayUpdate,
      color: 'bg-slate-400 dark:bg-slate-500',
    },
    {
      label: '3 Days',
      count: distribution.within3Days,
      color: 'bg-teal-200 dark:bg-teal-900',
    },
    {
      label: '7 Days',
      count: distribution.within7Days,
      color: 'bg-teal-300 dark:bg-teal-800',
    },
    {
      label: '14 Days',
      count: distribution.within14Days,
      color: 'bg-teal-400 dark:bg-teal-700',
    },
    {
      label: '30 Days',
      count: distribution.within30Days,
      color: 'bg-teal-500 dark:bg-teal-600',
    },
    {
      label: '90 Days',
      count: distribution.within90Days,
      color: 'bg-teal-600 dark:bg-teal-500',
    },
    {
      label: '90+ Days',
      count: distribution.over90Days,
      color: 'bg-teal-700 dark:bg-teal-400',
    },
  ];

  // Calculate percentages
  const dataWithPercentage = data.map((item) => ({
    ...item,
    percentage: totalCount > 0 ? (item.count / totalCount) * 100 : 0,
  }));

  // Find max percentage for bar scaling
  const maxPercentage = Math.max(
    ...dataWithPercentage.map((d) => d.percentage),
  );

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
                className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out relative`}
                style={{
                  width: `${(item.percentage / maxPercentage) * 100}%`,
                  minWidth: item.percentage > 0 ? '4px' : '0',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </ObservatorySection>
  );
}
