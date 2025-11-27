import React from 'react';

import { Bar } from '@/components/observatory/Bar';

import { IconClock } from '../../components/icons';
import { ObservatorySection } from './observatory-section';
import { clampPercent } from './utils';

type MakersRhythmSectionProps = {
  distribution: { dayOfWeek: number[]; hour: number[] };
  maxDayCount: number;
  maxHourCount: number;
  days: string[];
};

export function MakersRhythmSection({
  distribution,
  maxDayCount,
  maxHourCount,
  days,
}: MakersRhythmSectionProps) {
  return (
    <ObservatorySection
      theme="orange"
      icon={<IconClock />}
      title="Maker's Rhythm"
      description="Every creation has a pulse. Observe the heartbeat of the community through time."
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
                Data shows a surge of prototypes born on weekends. This is proof
                that creation is fueled not by obligation, but by pure passion.
                When the work week ends, the real work begins for many makers.
              </p>
            </div>
            <div>
              <p className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                The Midnight Oil
              </p>
              <p>
                The spikes in the late hours tell a story of inspiration
                striking in the silence of the night. For many, the best code is
                written and the wildest ideas are born when the world sleeps.
              </p>
            </div>
          </div>
        ),
      }}
      delay="delay-100"
    >
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Weekly Cycle */}
        <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-800/30">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Weekly Pulse
          </h3>
          <div className="flex items-end justify-between h-40 gap-2">
            {days.map((day, index) => {
              const count = distribution?.dayOfWeek?.[index] || 0;
              const heightPercent =
                maxDayCount > 0 ? (count / maxDayCount) * 100 : 0;
              return (
                <div
                  key={day}
                  className="flex flex-col items-center justify-end flex-1 gap-2 group h-full"
                >
                  <div className="relative w-full flex-1 flex items-end">
                    <Bar
                      className="w-full bg-orange-400 dark:bg-orange-500 rounded-t-md transition-all duration-500 group-hover:bg-orange-500 dark:group-hover:bg-orange-400"
                      style={{ height: `${clampPercent(heightPercent)}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                        {count} releases
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

        {/* Daily Cycle */}
        <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-800/30">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Daily Cycle (JST)
          </h3>
          <div className="flex items-end justify-between h-40 gap-1">
            {Array.from({ length: 24 }).map((_, hour) => {
              const count = distribution?.hour?.[hour] || 0;
              const heightPercent =
                maxHourCount > 0 ? (count / maxHourCount) * 100 : 0;
              return (
                <div
                  key={hour}
                  className="flex flex-col items-center justify-end flex-1 gap-2 group h-full"
                >
                  <div className="relative w-full flex-1 flex items-end">
                    <Bar
                      className="w-full bg-indigo-400 dark:bg-indigo-500 rounded-t-sm transition-all duration-500 group-hover:bg-indigo-500 dark:group-hover:bg-indigo-400"
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
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>
      </div>
    </ObservatorySection>
  );
}
