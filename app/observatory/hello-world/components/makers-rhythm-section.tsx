import React from 'react';

import { ActivityHeatmap } from '@/components/analysis/activity-heatmap';
import { Bar } from '../../components/bar';

import { clampPercent } from '@/lib/utils/math';
import { IconClock } from '../../shared/icons';
import { helloWorldTheme } from '../theme';
import { ObservatorySection } from './observatory-section';

type BirthPulseSectionProps = {
  releaseTimeDistribution: {
    dayOfWeek: number[];
    hour: number[];
    heatmap?: number[][];
  };
  releaseDateDistribution: {
    month: number[];
  };
  maxReleaseDayCount: number;
  maxReleaseHourCount: number;
  maxReleaseMonthCount: number;
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

function getPeakTimeIcon(hour: number) {
  if (hour < 0) return '❓';
  if (hour < 5) return '🦉';
  if (hour < 9) return '🌅';
  if (hour < 17) return '☀️';
  if (hour < 20) return '🌇';
  return '🌙';
}

function calculateStats(
  dayOfWeek: number[],
  hour: number[],
  heatmap?: number[][],
) {
  const total = dayOfWeek.reduce((a, b) => a + b, 0);
  if (total === 0)
    return { weekendRate: 0, afterHoursRate: 0, weeklyPeaks: [] };

  // Weekend Warrior Rate
  // 0=Sun, 6=Sat
  const weekendCount = (dayOfWeek[0] ?? 0) + (dayOfWeek[6] ?? 0);
  const weekendRate = Math.round((weekendCount / total) * 100);

  // After Hours Rate
  let afterHoursCount = 0;
  let weekdayTotal = 0;

  if (heatmap) {
    // heatmap: [day][hour]
    // Days: 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
    for (let d = 1; d <= 5; d++) {
      // Mon to Fri
      if (!heatmap[d]) continue;
      for (let h = 0; h < 24; h++) {
        const count = heatmap[d][h] ?? 0;
        weekdayTotal += count;
        // After hours: < 9 or >= 18
        if (h < 9 || h >= 18) {
          afterHoursCount += count;
        }
      }
    }
  } else {
    // Fallback: use hour distribution (includes weekends if heatmap missing)
    weekdayTotal = total;
    hour.forEach((count, h) => {
      if (h < 9 || h >= 18) {
        afterHoursCount += count;
      }
    });
  }

  const afterHoursRate =
    weekdayTotal > 0 ? Math.round((afterHoursCount / weekdayTotal) * 100) : 0;

  // Weekly Peaks
  const weeklyPeaks: { dayIndex: number; peakHour: number; count: number }[] =
    [];
  if (heatmap) {
    for (let d = 0; d < 7; d++) {
      let max = -1;
      let peakHour = -1;
      if (heatmap[d]) {
        for (let h = 0; h < 24; h++) {
          const count = heatmap[d][h] ?? 0;
          if (count > max) {
            max = count;
            peakHour = h;
          }
        }
      }
      weeklyPeaks.push({ dayIndex: d, peakHour, count: max });
    }
  }

  return { weekendRate, afterHoursRate, weeklyPeaks };
}

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

export function BirthPulseSection({
  releaseTimeDistribution,
  releaseDateDistribution,
  maxReleaseDayCount,
  maxReleaseHourCount,
  maxReleaseMonthCount,
  days,
  months,
}: BirthPulseSectionProps) {
  const { weekendRate, afterHoursRate, weeklyPeaks } = calculateStats(
    releaseTimeDistribution.dayOfWeek,
    releaseTimeDistribution.hour,
    releaseTimeDistribution.heatmap,
  );

  return (
    <ObservatorySection
      theme={helloWorldTheme.sections.birthPulse.theme}
      icon={<IconClock />}
      title="Birth Pulse"
      description="Follow the cadence of fresh releases and witness when new ideas burst into life."
      sourceNote={
        <>
          <strong>Release Date</strong> of all prototypes (Historical Data).
        </>
      }
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-orange-400/20 rounded-full animate-ping opacity-20 duration-3000"></div>
          <div className="absolute inset-2 bg-yellow-400/20 rounded-full animate-pulse opacity-30"></div>
          <div className="text-6xl filter drop-shadow-lg">⏰</div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">🕰️</span> The Creator&apos;s Heartbeat
          </>
        ),
        content: (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                The Weekend Warriors
              </p>
              <p>
                New releases spike across the weekend, where passion overrides
                obligation and Makers usher in fresh ideas as the world exhales
                from the work week.
              </p>
            </div>
            <div>
              <p className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                The Midnight Oil
              </p>
              <p>
                Late-night surges highlight inspiration striking in the quiet of
                night. While most of the world sleeps, the boldest experiments
                ignite and prototypes take their very first breath.
              </p>
            </div>
          </div>
        ),
      }}
      delay={helloWorldTheme.sections.birthPulse.delay}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-4 border border-orange-100 dark:border-orange-800/30 flex items-center gap-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-800/30 rounded-full text-2xl">
            🏖️
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Weekend Warrior Rate
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {weekendRate}%
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              of releases happen on Sat/Sun
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800/30 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-800/30 rounded-full text-2xl">
            🌙
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              After Hours Rate
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {afterHoursRate}%
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              created outside 9:00-18:00 (Mon-Fri)
            </div>
          </div>
        </div>
      </div>

      {weeklyPeaks.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
            <span>Golden Hour by Day</span>
            <span className="text-xs font-normal normal-case text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-full">
              Most active hour
            </span>
          </h4>
          <div className="grid grid-cols-7 gap-2">
            {weeklyPeaks.map((peak, index) => (
              <div
                key={index}
                className="bg-white/40 dark:bg-white/5 rounded-lg p-2 border border-orange-100 dark:border-orange-800/30 flex flex-col items-center text-center"
              >
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mb-1">
                  {days[index].slice(0, 3)}
                </span>
                <span
                  className="text-xl mb-1"
                  role="img"
                  aria-label="time icon"
                >
                  {getPeakTimeIcon(peak.peakHour)}
                </span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {peak.peakHour >= 0 ? `${peak.peakHour}:00` : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {renderDailyCycle({
          counts: releaseTimeDistribution?.hour ?? [],
          maxCount: maxReleaseHourCount,
          containerClassName:
            'bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-800/30',
          barClassName:
            'w-full bg-indigo-400 dark:bg-indigo-500 rounded-t-sm transition-all duration-500 group-hover:bg-indigo-500 dark:group-hover:bg-indigo-400',
          title: 'Daily Cycle (JST)',
          footerLabels: ['00:00', '06:00', '12:00', '18:00', '23:00'],
        })}
        {renderWeeklyCycle({
          counts: releaseTimeDistribution?.dayOfWeek ?? [],
          maxCount: maxReleaseDayCount,
          containerClassName:
            'bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-800/30',
          barClassName:
            'w-full bg-orange-400 dark:bg-orange-500 rounded-t-md transition-all duration-500 group-hover:bg-orange-500 dark:group-hover:bg-orange-400',
          days,
          title: 'Weekly Pulse',
          unitLabel: 'releases',
        })}
        {renderMonthlyCycle({
          counts: releaseDateDistribution?.month ?? [],
          maxCount: maxReleaseMonthCount,
          containerClassName:
            'bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-800/30',
          barClassName:
            'w-full bg-pink-400 dark:bg-pink-500 rounded-t-md transition-all duration-500 group-hover:bg-pink-500 dark:group-hover:bg-pink-400',
          months,
          title: 'Monthly Pulse (Birth Season)',
          unitLabel: 'releases',
        })}
      </div>

      {releaseTimeDistribution.heatmap && (
        <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-800/30">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Weekly Release Activity (JST)
          </h3>
          <ActivityHeatmap heatmap={releaseTimeDistribution.heatmap} />
        </div>
      )}
    </ObservatorySection>
  );
}

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

export function AfterglowRhythmSection({
  updateTimeDistribution,
  updateDateDistribution,
  maxUpdateDayCount,
  maxUpdateHourCount,
  maxUpdateMonthCount,
  days,
  months,
}: AfterglowRhythmSectionProps) {
  const { weekendRate, afterHoursRate, weeklyPeaks } = calculateStats(
    updateTimeDistribution.dayOfWeek,
    updateTimeDistribution.hour,
    updateTimeDistribution.heatmap,
  );

  return (
    <ObservatorySection
      theme={helloWorldTheme.sections.afterglowRhythm.theme}
      icon={<IconClock />}
      title="Afterglow Rhythm"
      description="Analysis of update timing and maintenance cycles."
      sourceNote={
        <>
          <strong>Last Update Date</strong> of all prototypes.
        </>
      }
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping opacity-20 duration-3000"></div>
          <div className="absolute inset-2 bg-pink-400/20 rounded-full animate-pulse opacity-30"></div>
          <div className="text-6xl filter drop-shadow-lg">✨</div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">✨</span> The Pulse of Maintenance
          </>
        ),
        content: (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                The Weekend Polish
              </p>
              <p>
                Updates often follow a different rhythm than releases. Weekend
                updates suggest hobbyist dedication, refining projects in free
                time.
              </p>
            </div>
            <div>
              <p className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                The Evening Glow
              </p>
              <p>
                Post-work updates reflect the &quot;Afterglow&quot; - the
                persistent effort to improve and maintain creations after the
                initial release.
              </p>
            </div>
          </div>
        ),
      }}
      delay={helloWorldTheme.sections.afterglowRhythm.delay}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30 flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-800/30 rounded-full text-2xl">
            🏖️
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Weekend Update Rate
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {weekendRate}%
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              of updates happen on Sat/Sun
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800/30 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-800/30 rounded-full text-2xl">
            🌙
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              After Hours Rate
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {afterHoursRate}%
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              updates between 18:00 - 09:00
            </div>
          </div>
        </div>
      </div>

      {weeklyPeaks.length > 0 && (
        <div className="mb-8 bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
            <span className="text-lg">☀️</span>
            Golden Hour by Day (Updates)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {days.map((day, index) => {
              const dayData = weeklyPeaks.find((p) => p.dayIndex === index);
              if (!dayData) return null;

              const Icon = getPeakTimeIcon(dayData.peakHour);

              return (
                <div
                  key={day}
                  className="flex flex-col items-center p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-purple-50 dark:border-purple-900/20"
                >
                  <span className="text-xs font-medium text-gray-400 mb-2">
                    {day}
                  </span>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{Icon}</span>
                    <span className="text-lg font-bold text-gray-700 dark:text-gray-200">
                      {dayData.peakHour}:00
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {dayData.count} updates
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {renderDailyCycle({
          counts: updateTimeDistribution?.hour ?? [],
          maxCount: maxUpdateHourCount,
          containerClassName:
            'bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30',
          barClassName:
            'w-full bg-indigo-400 dark:bg-indigo-500 rounded-t-sm transition-all duration-500 group-hover:bg-indigo-500 dark:group-hover:bg-indigo-400',
          title: 'Daily Cycle (JST)',
          footerLabels: ['00:00', '06:00', '12:00', '18:00', '23:00'],
        })}
        {renderWeeklyCycle({
          counts: updateTimeDistribution?.dayOfWeek ?? [],
          maxCount: maxUpdateDayCount,
          containerClassName:
            'bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30',
          barClassName:
            'w-full bg-purple-400 dark:bg-purple-500 rounded-t-md transition-all duration-500 group-hover:bg-purple-500 dark:group-hover:bg-purple-400',
          days,
          title: 'Weekly Rhythm',
          unitLabel: 'updates',
        })}
        {renderMonthlyCycle({
          counts: updateDateDistribution?.month ?? [],
          maxCount: maxUpdateMonthCount,
          containerClassName:
            'bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30',
          barClassName:
            'w-full bg-pink-400 dark:bg-pink-500 rounded-t-md transition-all duration-500 group-hover:bg-pink-500 dark:group-hover:bg-pink-400',
          months,
          title: 'Monthly Rhythm',
          unitLabel: 'updates',
        })}
      </div>

      {updateTimeDistribution.heatmap && (
        <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Weekly Update Activity (JST)
          </h3>
          <ActivityHeatmap heatmap={updateTimeDistribution.heatmap} />
        </div>
      )}
    </ObservatorySection>
  );
}
