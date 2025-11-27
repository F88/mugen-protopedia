import React from 'react';

import Link from 'next/link';

import { cn } from '@/lib/utils';
import { buildPrototypeLink } from '@/lib/utils/prototype-utils';

import { Bar } from '@/components/observatory/bar';

import { IconHeart } from '../../shared/icons';
import { helloWorldTheme } from '../theme';
import { ObservatorySection } from './observatory-section';
import { clampPercent } from '@/lib/utils/math';

type LaborOfLoveSectionProps = {
  laborOfLove: {
    longestGestation: Array<{
      id: number;
      title: string;
      durationDays: number;
      createDate: string;
      releaseDate: string;
    }>;
    distribution: Record<string, number>;
  };
};

export function LaborOfLoveSection({ laborOfLove }: LaborOfLoveSectionProps) {
  const { longestGestation, distribution } = laborOfLove;
  const maxCount = Math.max(...Object.values(distribution));

  const titleClassName = cn(
    'font-medium',
    'text-gray-900',
    'dark:text-white',
    'break-words',
    'group-hover:text-pink-600',
    'dark:group-hover:text-pink-400',
    'transition-colors',
  );

  return (
    <ObservatorySection
      theme={helloWorldTheme.sections.laborOfLove.theme}
      icon={<IconHeart />}
      title="Labor of Love"
      description="Great things take time. These prototypes are the result of long incubation periods, proving that persistence pays off."
      sourceNote={
        <>
          Duration between <strong>Registration</strong> and{' '}
          <strong>Release</strong>.
        </>
      }
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-pink-400/20 rounded-full animate-pulse opacity-20 duration-4000"></div>
          <div className="text-6xl filter drop-shadow-lg">❤️</div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">🍷</span> Aged to Perfection
          </>
        ),
        content: (
          <p>
            Not all prototypes are built in a weekend hackathon. Some ideas need
            time to mature, evolve, and find their perfect form. We honor the
            creators who stuck with their vision through the long haul.
          </p>
        ),
      }}
      delay="delay-600"
    >
      <div className="grid gap-8 lg:grid-cols-2 mb-8">
        {/* Longest Gestation Ranking */}
        <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-pink-100 dark:border-pink-800/30">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span>🐣</span> The Longest Journeys
          </h3>
          <div className="space-y-3">
            {longestGestation.slice(0, 5).map((item, index) => (
              <Link
                key={item.id}
                href={buildPrototypeLink(item.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between group hover:bg-white/50 dark:hover:bg-white/5 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 rounded-full text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <div className={titleClassName}>{item.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.createDate).toLocaleDateString()} →{' '}
                      {new Date(item.releaseDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right ml-4">
                  <span className="block text-lg font-bold text-pink-600 dark:text-pink-400">
                    {item.durationDays.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase">
                    Days
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Distribution Chart (Simple Bar) */}
        <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-pink-100 dark:border-pink-800/30">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span>🥚</span> Incubation Period
          </h3>
          <div className="space-y-3">
            {Object.entries(distribution).map(([label, count]) => {
              const percent = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-300">
                      {label}
                    </span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {count.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-pink-100 dark:bg-pink-900/30 rounded-full h-2 overflow-hidden">
                    <Bar
                      className="bg-pink-400 dark:bg-pink-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${clampPercent(percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ObservatorySection>
  );
}
