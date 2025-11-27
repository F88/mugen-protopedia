import React from 'react';

import { IconHeart } from '../../shared/icons';
import { helloWorldTheme } from '../theme';
import { ObservatorySection } from './observatory-section';

type LongTermEvolutionSectionProps = {
  longTermEvolution: {
    longestMaintenance: Array<{
      id: number;
      title: string;
      maintenanceDays: number;
      releaseDate: string;
      updateDate: string;
    }>;
    averageMaintenanceDays: number;
    maintenanceRatio: number;
  };
};

export function LongTermEvolutionSection({
  longTermEvolution,
}: LongTermEvolutionSectionProps) {
  const { longestMaintenance, averageMaintenanceDays, maintenanceRatio } =
    longTermEvolution;

  const formatDuration = (days: number) => {
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    return months > 0 ? `${years}y ${months}m` : `${years} years`;
  };

  return (
    <ObservatorySection
      theme={helloWorldTheme.sections.longTermEvolution.theme}
      icon={<IconHeart />}
      title="Long-Term Evolution"
      description="Some prototypes are not just released—they are nurtured, evolved, and maintained over time."
      sourceNote={
        <>
          <strong>Release Date</strong> and <strong>Update Date</strong> of all
          prototypes (Historical Data).
        </>
      }
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-pulse opacity-20 duration-2000"></div>
          <div className="absolute inset-2 bg-green-400/20 rounded-full animate-pulse opacity-30"></div>
          <div className="text-6xl filter drop-shadow-lg">🌱</div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">🌳</span> The Garden of Continuous Growth
          </>
        ),
        content: (
          <div className="space-y-4">
            <p>
              In the fast-paced world of prototyping, some creations stand out
              not for their initial spark, but for their sustained evolution.
              These prototypes represent a commitment to continuous
              improvement—a testament to their creators&apos; dedication.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatDuration(Math.round(averageMaintenanceDays))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average Maintenance Period
                </div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {(maintenanceRatio * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Prototypes Still Evolving
                </div>
              </div>
            </div>
          </div>
        ),
      }}
      delay={helloWorldTheme.sections.longTermEvolution.delay}
    >
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Top Evolving Prototypes
        </h3>
        <div className="grid gap-3">
          {longestMaintenance.slice(0, 10).map((proto, index) => {
            const releaseYear = new Date(proto.releaseDate).getFullYear();
            const updateYear = new Date(proto.updateDate).getFullYear();
            const yearSpan = updateYear - releaseYear;

            return (
              <div
                key={proto.id}
                className="bg-white/60 dark:bg-black/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        {index + 1}
                      </span>
                      <a
                        href={`https://protopedia.net/prototype/${proto.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-gray-900 dark:text-gray-100 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline truncate"
                      >
                        {proto.title}
                      </a>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                      <div>
                        Released:{' '}
                        {new Date(proto.releaseDate).toLocaleDateString(
                          'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' },
                        )}
                      </div>
                      <div>
                        Last Updated:{' '}
                        {new Date(proto.updateDate).toLocaleDateString(
                          'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' },
                        )}
                      </div>
                      {yearSpan > 0 && (
                        <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Evolved across {yearSpan}{' '}
                          {yearSpan === 1 ? 'year' : 'years'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatDuration(proto.maintenanceDays)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      maintained
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ObservatorySection>
  );
}
