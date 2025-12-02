import React from 'react';

import { IconHourglass } from '../../shared/icons';
import { helloWorldTheme } from '../theme';
import { ObservatorySection } from './observatory-section';

type EvolutionSpanSectionProps = {
  evolutionSpan: {
    distribution: {
      singleDay: number;
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

  const data = [
    {
      label: 'Single Day',
      count: distribution.singleDay,
      color: 'bg-gray-400',
    },
    { label: '3 Days', count: distribution.within3Days, color: 'bg-teal-300' },
    { label: '7 Days', count: distribution.within7Days, color: 'bg-teal-400' },
    {
      label: '14 Days',
      count: distribution.within14Days,
      color: 'bg-teal-500',
    },
    {
      label: '30 Days',
      count: distribution.within30Days,
      color: 'bg-teal-600',
    },
    {
      label: '90 Days',
      count: distribution.within90Days,
      color: 'bg-teal-700',
    },
    { label: '90+ Days', count: distribution.over90Days, color: 'bg-teal-800' },
  ];

  const maxCount = Math.max(...data.map((d) => d.count));

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
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.label} className="relative">
            <div className="flex justify-between text-xs sm:text-sm mb-1">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {item.label}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {item.count.toLocaleString()}
              </span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </ObservatorySection>
  );
}
