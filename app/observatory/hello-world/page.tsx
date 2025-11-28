/**
 * Hello World Page - The Latest Prototypes' Debut
 *
 * This page displays an analysis of the latest prototypes, focusing on new arrivals ("Newborns")
 * and general statistics about the ProtoPedia universe.
 */

import type { Metadata } from 'next';

import type { AnniversaryCandidatePrototype } from '@/lib/analysis/types';
import { APP_TITLE } from '@/lib/config/app-constants';

import { getLatestAnalysis } from '@/app/actions/analysis';

import { ObservatoryHeader } from '@/components/observatory/observatory-header';

import { IconGlobe } from '@/app/observatory/shared/icons';

import { HelloWorldBackground } from './background';

import { AnniversaryEffectSection } from './components/anniversary-effect-section';
import { EarlyAdoptersSection } from './components/early-adopters-section';
import { EternalFlameSection } from './components/eternal-flame-section';
import { FirstPenguinSection } from './components/first-penguin-section';
import { GatewayDrugSection } from './components/gateway-drug-section';
import { HolyDaySection } from './components/holy-day-section';
import { LaborOfLoveSection } from './components/labor-of-love-section';
import { LongTermEvolutionSection } from './components/long-term-evolution-section';
import {
  AfterglowRhythmSection,
  BirthPulseSection,
} from './components/makers-rhythm-section';
import { MaternityHospitalSection } from './components/maternity-hospital-section';
import { NewbornsSection } from './components/newborns-section';
import { PowerOfDeadlinesSection } from './components/power-of-deadlines-section';
import { StarAlignmentSection } from './components/star-alignment-section';
import { WeekendWarriorSection } from './components/weekend-warrior-section';

export const metadata: Metadata = {
  title: `Hello World - ProtoPedia Observatory | ${APP_TITLE}`,
  description:
    'Greetings, Universe! Here we celebrate the ignition of new ideas. Witness the latest prototypes that have just materialized into our world.',
};

export const dynamic = 'force-dynamic';

export default async function HelloWorldPage() {
  // Force recompute to ensure we have the latest analysis logic including Maker's Rhythm
  // const result = await getLatestAnalysis({ forceRecompute: true });
  const result = await getLatestAnalysis({ forceRecompute: false });

  if (!result.ok) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl inline-block">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            Connection Lost
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Unable to retrieve the latest transmission from the ProtoPedia
            universe.
          </p>
          <p className="text-sm text-gray-500 mt-4">{result.error}</p>
        </div>
      </div>
    );
  }

  const analysis = result.data;
  const {
    anniversaryCandidates,
    releaseTimeDistribution,
    releaseDateDistribution,
    updateTimeDistribution,
    updateDateDistribution,
    creationStreak,
    earlyAdopters,
    firstPenguins,
    starAlignments,
    anniversaryEffect,
    topMaterials,
    laborOfLove,
    maternityHospital,
    powerOfDeadlines,
    weekendWarrior,
    holyDay,
    longTermEvolution,
  } = analysis;

  // Determine "Now" and "24 Hours Ago" for filtering newborns
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Filter newborns: Prototypes released within the last 24 hours
  const newbornPrototypes = anniversaryCandidates.mmdd.filter(
    (p: AnniversaryCandidatePrototype) => {
      const pDate = new Date(p.releaseDate);

      // Handle invalid dates
      if (Number.isNaN(pDate.getTime())) return false;

      return pDate >= twentyFourHoursAgo && pDate <= now;
    },
  );

  const newbornCount = newbornPrototypes.length;

  // Sort newborns by release date (newest first)
  const sortedNewborns = [...newbornPrototypes].sort(
    (a: AnniversaryCandidatePrototype, b: AnniversaryCandidatePrototype) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
  );

  // Prepare Maker's Rhythm Data
  const releaseDayCounts = releaseTimeDistribution?.dayOfWeek || [];
  const maxReleaseDayCount =
    releaseDayCounts.length > 0 ? Math.max(...releaseDayCounts) : 0;

  const releaseHourCounts = releaseTimeDistribution?.hour || [];
  const maxReleaseHourCount =
    releaseHourCounts.length > 0 ? Math.max(...releaseHourCounts) : 0;

  const releaseMonthCounts = releaseDateDistribution?.month || [];
  const maxReleaseMonthCount =
    releaseMonthCounts.length > 0 ? Math.max(...releaseMonthCounts) : 0;

  const updateDayCounts = updateTimeDistribution?.dayOfWeek || [];
  const maxUpdateDayCount =
    updateDayCounts.length > 0 ? Math.max(...updateDayCounts) : 0;

  const updateHourCounts = updateTimeDistribution?.hour || [];
  const maxUpdateHourCount =
    updateHourCounts.length > 0 ? Math.max(...updateHourCounts) : 0;

  const updateMonthCounts = updateDateDistribution?.month || [];
  const maxUpdateMonthCount =
    updateMonthCounts.length > 0 ? Math.max(...updateMonthCounts) : 0;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Calculate Longest Streak Period
  let longestStreakPeriod = null;
  if (creationStreak.longestStreakEndDate && creationStreak.longestStreak > 0) {
    const endDate = new Date(creationStreak.longestStreakEndDate);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (creationStreak.longestStreak - 1));

    const startStr = startDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const endStr = endDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    longestStreakPeriod = `${startStr} - ${endStr}`;
  }

  return (
    <>
      <ObservatoryHeader colorScheme="pink" />
      <main>
        <HelloWorldBackground />
        <div className="px-4 py-8 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <span className="text-4xl">
                <IconGlobe />
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 dark:text-white sm:text-5xl">
              Hello World
            </h1>
            <p className="text-xl text-blue-500 dark:text-blue-300 font-medium">
              The Latest Prototypes&apos; Debut
            </p>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 leading-relaxed">
              Greetings, Universe! Here we celebrate the ignition of new ideas.
              Witness the latest prototypes that have just materialized into our
              world.
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 space-y-1">
              <p>
                * Analysis covers the <strong>entire history</strong> of
                ProtoPedia.
              </p>
              <p>
                * Data is based on the <strong>Release Date</strong> of each
                prototype.
              </p>
              <p>* All times are displayed in Japan Standard Time (JST).</p>
            </div>
          </div>

          <NewbornsSection count={newbornCount} prototypes={sortedNewborns} />

          <BirthPulseSection
            releaseTimeDistribution={releaseTimeDistribution}
            releaseDateDistribution={releaseDateDistribution}
            maxReleaseDayCount={maxReleaseDayCount}
            maxReleaseHourCount={maxReleaseHourCount}
            maxReleaseMonthCount={maxReleaseMonthCount}
            days={days}
            months={months}
          />

          <AfterglowRhythmSection
            updateTimeDistribution={updateTimeDistribution}
            updateDateDistribution={updateDateDistribution}
            maxUpdateDayCount={maxUpdateDayCount}
            maxUpdateHourCount={maxUpdateHourCount}
            maxUpdateMonthCount={maxUpdateMonthCount}
            days={days}
            months={months}
          />

          <EternalFlameSection
            streak={creationStreak}
            longestStreakPeriod={longestStreakPeriod}
          />

          {/* With events */}
          <MaternityHospitalSection maternityHospital={maternityHospital} />
          <PowerOfDeadlinesSection
            powerOfDeadlines={powerOfDeadlines}
            dailyReleaseCounts={releaseDateDistribution.daily}
          />
          <WeekendWarriorSection weekendWarrior={weekendWarrior} />

          {/* Date based */}
          <StarAlignmentSection alignments={starAlignments} />
          <HolyDaySection holyDay={holyDay} />
          <AnniversaryEffectSection holidays={anniversaryEffect} />
          <FirstPenguinSection penguins={firstPenguins} />

          {/* Term based */}
          <LaborOfLoveSection laborOfLove={laborOfLove} />
          <LongTermEvolutionSection longTermEvolution={longTermEvolution} />

          {/* Tag based   */}
          <EarlyAdoptersSection adopters={earlyAdopters} />

          {/* Material based   */}
          <GatewayDrugSection topMaterials={topMaterials} />
        </div>
      </main>
    </>
  );
}
