import React from 'react';

import { Bar } from '@/components/observatory/bar';
import { ActivityHeatmap } from '@/components/analysis/activity-heatmap';

import { IconClock } from '../../shared/icons';
import { helloWorldTheme } from '../theme';
import { ObservatorySection } from './observatory-section';
import { clampPercent } from '@/lib/utils/math';

type AfterglowRhythmSectionProps = {
  updateTimeDistribution: {
    dayOfWeek: number[];
    hour: number[];
    heatmap?: number[][];
  };
  updateDateDistribution: {
    month: number[];
  };
  maxUpdateDayCount: number;
  maxUpdateHourCount: number;
  maxUpdateMonthCount: number;
  days: string[];
  months: string[];
};

type DailyCycleConfig = {
  counts: number[];
  maxCount: number;
  containerClassName: string;
  barClassName: string;
  title: string;
  footerLabels: string[];
};

type WeeklyCycleConfig = {
  counts: number[];
  maxCount: number;
  containerClassName: string;
  barClassName: string;
  days: string[];
  title: string;
  unitLabel: string;
};

type MonthlyCycleConfig = {
  counts: number[];
  maxCount: number;
  containerClassName: string;
  barClassName: string;
  months: string[];
  title: string;
  unitLabel: string;
};

function renderDailyCycle({
  counts,
  maxCount,
  containerClassName,
  barClassName,
  title,
  footerLabels,
}: DailyCycleConfig) {
  return (
    <div className={containerClassName}>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {title}
      </h3>
      <div className="flex items-end justify-between h-40 gap-1">
        {Array.from({ length: 24 }).map((_, hour) => {
          const count = counts[hour] ?? 0;
          const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
          return (
            <div
              key={hour}
              className="flex flex-col items-center justify-end flex-1 gap-2 group h-full"
            >
              <div className="relative w-full flex-1 flex items-end">
                <Bar
                  className={barClassName}
                  style={{ height: `${clampPercent(heightPercent)}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                    {hour}:00 - {count}
                  </div>
                </Bar>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-2 px-1">
        {footerLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function renderWeeklyCycle({
  counts,
  maxCount,
  containerClassName,
  barClassName,
  days,
  title,
  unitLabel,
}: WeeklyCycleConfig) {
  return (
    <div className={containerClassName}>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {title}
      </h3>
      <div className="flex items-end justify-between h-40 gap-2">
        {days.map((day, index) => {
          const count = counts[index] ?? 0;
          const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
          return (
            <div
              key={day}
              className="flex flex-col items-center justify-end flex-1 gap-2 group h-full"
            >
              <div className="relative w-full flex-1 flex items-end">
                <Bar
                  className={barClassName}
                  style={{ height: `${clampPercent(heightPercent)}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                    {count} {unitLabel}
                  </div>
                </Bar>
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderMonthlyCycle({
  counts,
  maxCount,
  containerClassName,
  barClassName,
  months,
  title,
  unitLabel,
}: MonthlyCycleConfig) {
  return (
    <div className={containerClassName}>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {title}
      </h3>
      <div className="flex items-end justify-between h-40 gap-1">
        {months.map((monthName, index) => {
          const count = counts[index] ?? 0;
          const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
          return (
            <div
              key={monthName}
              className="flex flex-col items-center justify-end flex-1 gap-2 group h-full"
            >
              <div className="relative w-full flex-1 flex items-end">
                <Bar
                  className={barClassName}
                  style={{ height: `${clampPercent(heightPercent)}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                    {monthName} - {count} {unitLabel}
                  </div>
                </Bar>
              </div>
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                {monthName.slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AfterglowRhythmSection({
  updateTimeDistribution,
  updateDateDistribution,
  maxUpdateDayCount,
  maxUpdateHourCount,
  maxUpdateMonthCount,
  days,
  months,
}: AfterglowRhythmSectionProps) {
  return (
    <ObservatorySection
      theme={helloWorldTheme.sections.afterglowRhythm.theme}
      icon={<IconClock />}
      title="Afterglow Rhythm"
      description="Trace the enduring pulse of prototypes kept alive through steady updates."
      sourceNote={
        <>
          <strong>Update Date</strong> of all prototypes (Historical Data).
        </>
      }
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping opacity-20 duration-3000"></div>
          <div className="absolute inset-2 bg-indigo-400/20 rounded-full animate-pulse opacity-30"></div>
          <div className="text-6xl filter drop-shadow-lg">💡</div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">💡</span> The Sustainer&apos;s Whisper
          </>
        ),
        content: (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                The Rekindlers
              </p>
              <p>
                Updates bring dormant ideas back to life. Whenever makers
                rekindle a project, the graph brightens, proving that the flame
                never truly went out.
              </p>
            </div>
            <div>
              <p className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                The Pulse Keepers
              </p>
              <p>
                Maintenance, polish, and iteration keep prototypes breathing.
                Watch how the pulses stay steady long after the initial launch
                excitement fades.
              </p>
            </div>
          </div>
        ),
      }}
      delay={helloWorldTheme.sections.afterglowRhythm.delay}
    >
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {renderDailyCycle({
          counts: updateTimeDistribution?.hour ?? [],
          maxCount: maxUpdateHourCount,
          containerClassName:
            'bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30',
          barClassName:
            'w-full bg-indigo-400 dark:bg-indigo-500 rounded-t-sm transition-all duration-500 group-hover:bg-indigo-500 dark:group-hover:bg-indigo-400',
          title: 'Daily Cycle (JST)',
          footerLabels: ['00:00', '06:00', '12:00', '18:00', '23:00'],
        })}
        {renderWeeklyCycle({
          counts: updateTimeDistribution?.dayOfWeek ?? [],
          maxCount: maxUpdateDayCount,
          containerClassName:
            'bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30',
          barClassName:
            'w-full bg-blue-400 dark:bg-blue-500 rounded-t-md transition-all duration-500 group-hover:bg-blue-500 dark:group-hover:bg-blue-400',
          days,
          title: 'Weekly Pulse',
          unitLabel: 'updates',
        })}
        {renderMonthlyCycle({
          counts: updateDateDistribution?.month ?? [],
          maxCount: maxUpdateMonthCount,
          containerClassName:
            'bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30',
          barClassName:
            'w-full bg-cyan-400 dark:bg-cyan-500 rounded-t-md transition-all duration-500 group-hover:bg-cyan-500 dark:group-hover:bg-cyan-400',
          months,
          title: 'Monthly Pulse (Care Season)',
          unitLabel: 'updates',
        })}
      </div>

      {updateTimeDistribution.heatmap && (
        <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Weekly Update Activity (JST)
          </h3>
          <ActivityHeatmap
            heatmap={updateTimeDistribution.heatmap}
            className="[&_.bg-green-200]:bg-blue-200 [&_.bg-green-300]:bg-blue-300 [&_.bg-green-400]:bg-blue-400 [&_.bg-green-500]:bg-blue-500 [&_.dark\:bg-green-900\/40]:dark:bg-blue-900/40 [&_.dark\:bg-green-800\/60]:dark:bg-blue-800/60 [&_.dark\:bg-green-700\/80]:dark:bg-blue-700/80 [&_.dark\:bg-green-600]:dark:bg-blue-600"
          />
        </div>
      )}
    </ObservatorySection>
  );
}
