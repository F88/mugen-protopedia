/**
 * Hello World Page - The Latest Prototypes' Debut
 *
 * This page displays an analysis of the latest prototypes, focusing on new arrivals ("Newborns")
 * and general statistics about the ProtoPedia universe.
 *
 * Standard Card Layout Strategy (based on "Maker's Rhythm"):
 *
 * Each major section (Maker's Rhythm, Eternal Flame, Universe Population, Dominant Traits)
 * follows a consistent visual hierarchy to ensure a unified storytelling experience across devices.
 *
 * Layout Structure:
 * 1. Container:
 *    - Rounded corners (rounded-3xl)
 *    - Gradient background (bg-linear-to-r/br)
 *    - Subtle border
 *    - Relative positioning for background decorations
 *
 * 2. Top Section (Flex Container):
 *    - Mobile: Column layout (flex-col), Centered text
 *    - Desktop: Row layout (md:flex-row), Left-aligned text
 *    - Left Column (flex-1):
 *      - Header: Small Icon + Title (H2/H3)
 *      - Description: Introductory paragraph
 *    - Right Column (shrink-0):
 *      - Visual Anchor: Large animated icon (approx 32x32 - 48x48 tailwind sizing)
 *      - Animation: animate-ping, animate-pulse, animate-bounce, etc.
 *
 * 3. Content Section:
 *    - Main data visualization (Charts, Stats Grid, Tag Cloud)
 *    - Placed below the Top Section
 *
 * 4. Narrative Section (Optional):
 *    - Separated by a top border
 *    - "Storytelling" elements explaining the data's significance
 */

import Link from 'next/link';

import type { AnniversaryCandidatePrototype } from '@/lib/utils/prototype-analysis.types';

import { getLatestAnalysis } from '@/app/actions/analysis';

import { buildPrototypeLink } from '@/lib/utils/prototype-utils';

import './labor-of-love.css';
import './makers-rhythm.css';
import './maternity-hospital.css';

// Icons
const IconGlobe = () => <span>🌐</span>;
const IconSparkles = () => <span>✨</span>;
const IconFlame = () => <span>🔥</span>;
const IconClock = () => <span>⏰</span>;
const IconTelescope = () => <span>🔭</span>;
const IconPenguin = () => <span>🐧</span>;
const IconStar = () => <span>🌠</span>;
const IconGift = () => <span>🎁</span>;
const IconTool = () => <span>🛠️</span>;
const IconHeart = () => <span>❤️</span>;
const IconHospital = () => <span>🏥</span>;
const IconDeadline = () => <span>💣</span>;
const IconWarrior = () => <span>⚔️</span>;
const IconHoly = () => <span>🙌</span>;

export const dynamic = 'force-dynamic';

export default async function HelloWorldPage() {
  // Force recompute to ensure we have the latest analysis logic including Maker's Rhythm
  const result = await getLatestAnalysis({ forceRecompute: true });

  if (!result.ok) {
    return (
      <main className="min-h-screen bg-fixed bg-linear-to-br from-sky-100 via-indigo-100 to-purple-100 dark:from-blue-950 dark:via-gray-950 dark:to-purple-950 container mx-auto px-4 py-12 text-center">
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
      </main>
    );
  }

  const analysis = result.data;
  const {
    anniversaryCandidates,
    releaseTimeDistribution,
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
  const dayCounts = releaseTimeDistribution?.dayOfWeek || [];
  const maxDayCount = dayCounts.length > 0 ? Math.max(...dayCounts) : 0;

  const hourCounts = releaseTimeDistribution?.hour || [];
  const maxHourCount = hourCounts.length > 0 ? Math.max(...hourCounts) : 0;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
    <main className="min-h-screen bg-fixed bg-linear-to-br from-sky-100 via-indigo-100 to-purple-100 dark:from-blue-950 dark:via-gray-950 dark:to-purple-950">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <header className="mb-12 text-center space-y-4">
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
        </header>

        <NewbornsSection count={newbornCount} prototypes={sortedNewborns} />

        <GatewayDrugSection topMaterials={topMaterials} />

        <MakersRhythmSection
          distribution={releaseTimeDistribution}
          maxDayCount={maxDayCount}
          maxHourCount={maxHourCount}
          days={days}
        />

        <EternalFlameSection
          streak={creationStreak}
          longestStreakPeriod={longestStreakPeriod}
        />

        <MaternityHospitalSection maternityHospital={maternityHospital} />

        <PowerOfDeadlinesSection powerOfDeadlines={powerOfDeadlines} />

        <WeekendWarriorSection weekendWarrior={weekendWarrior} />

        <LaborOfLoveSection laborOfLove={laborOfLove} />

        <EarlyAdoptersSection adopters={earlyAdopters} />

        <FirstPenguinSection penguins={firstPenguins} />

        <StarAlignmentSection alignments={starAlignments} />

        <HolyDaySection holyDay={holyDay} />

        <AnniversaryEffectSection holidays={anniversaryEffect} />
      </div>
    </main>
  );
}

// --- Components ---

type NewbornsSectionProps = {
  count: number;
  prototypes: AnniversaryCandidatePrototype[];
};

/**
 * Newborns Section
 *
 * Displays prototypes released "today" (in JST).
 * Highlights new arrivals with a "NEW" badge and animation.
 */
function NewbornsSection({ count, prototypes }: NewbornsSectionProps) {
  return (
    <section className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-linear-to-r from-sky-50 to-yellow-50 dark:from-sky-900/20 dark:to-yellow-900/20 rounded-3xl p-8 border border-sky-100 dark:border-sky-800/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 -mt-10 -ml-10 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-3 bg-sky-100 dark:bg-sky-900/50 rounded-full text-sky-600 dark:text-sky-300">
                <IconSparkles />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                The Newborn Stars
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Witness the latest prototypes that have just materialized into our
              world.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              * Source: Prototypes released within the{' '}
              <strong>Last 24 Hours</strong>.
            </p>
          </div>
          <div className="shrink-0">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping opacity-20 duration-3000"></div>
              <div className="absolute inset-2 bg-sky-400/20 rounded-full animate-pulse opacity-30"></div>
              <div className="text-6xl filter drop-shadow-lg">✨</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mb-8">
          {count === 0 ? (
            <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-12 text-center border border-dashed border-sky-200 dark:border-sky-800/30">
              <div className="text-4xl mb-4 opacity-50">🔭</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                The sky is quiet today.
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                No new prototypes have been detected in the last 24 hours. The
                creators are likely deep in meditation (or coding).
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {prototypes.map((proto) => (
                <Link
                  key={proto.id}
                  href={buildPrototypeLink(proto.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-white/80 dark:bg-gray-800/80 rounded-xl border border-sky-100 dark:border-sky-800/50 shadow-sm hover:shadow-md hover:border-sky-400 dark:hover:border-sky-500 transition-all duration-200 p-5"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      ID: {proto.id}
                    </span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      NEW
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 line-clamp-2 transition-colors">
                    {proto.title}
                  </h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Materialized at{' '}
                    {new Date(proto.releaseDate).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="relative z-10 pt-8 border-t border-sky-200/50 dark:border-sky-800/30">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">👶</span> The Beginning of Everything
          </h3>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            Every legendary project started as a single commit, a rough
            prototype, and a nervous release. These newborn stars are the future
            of our universe. Give them a warm welcome!
          </p>
        </div>
      </div>
    </section>
  );
}

type MakersRhythmSectionProps = {
  distribution: { dayOfWeek: number[]; hour: number[] };
  maxDayCount: number;
  maxHourCount: number;
  days: string[];
};

/**
 * Maker's Rhythm Section
 *
 * Visualizes the distribution of prototype releases by day of the week and hour of the day.
 * Shows when creators are most active (e.g., weekends, late nights).
 */
function MakersRhythmSection({
  distribution,
  maxDayCount,
  maxHourCount,
  days,
}: MakersRhythmSectionProps) {
  return (
    <section className="mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
      <div className="bg-linear-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-3xl p-8 border border-orange-100 dark:border-orange-800/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 -mt-10 -ml-10 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full text-orange-600 dark:text-orange-300">
                <IconClock />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Maker&apos;s Rhythm
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Every creation has a pulse. Observe the heartbeat of the community
              through time.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              * Source: <strong>Release Date</strong> of all prototypes
              (Historical Data).
            </p>
          </div>
          <div className="shrink-0">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-orange-400/20 rounded-full animate-ping opacity-20 duration-3000"></div>
              <div className="absolute inset-2 bg-yellow-400/20 rounded-full animate-pulse opacity-30"></div>
              <div className="text-6xl filter drop-shadow-lg">⏰</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid gap-6 md:grid-cols-2 mb-8">
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
                      <div
                        className="w-full bg-orange-400 dark:bg-orange-500 rounded-t-md transition-all duration-500 group-hover:bg-orange-500 dark:group-hover:bg-orange-400 makers-rhythm-bar"
                        style={
                          {
                            '--bar-height': `${heightPercent}%`,
                          } as React.CSSProperties
                        }
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                          {count} releases
                        </div>
                      </div>
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
                      <div
                        className="w-full bg-indigo-400 dark:bg-indigo-500 rounded-t-sm transition-all duration-500 group-hover:bg-indigo-500 dark:group-hover:bg-indigo-400 makers-rhythm-bar"
                        style={
                          {
                            '--bar-height': `${heightPercent}%`,
                          } as React.CSSProperties
                        }
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                          {hour}:00 - {count}
                        </div>
                      </div>
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

        <div className="relative z-10 pt-8 border-t border-orange-200/50 dark:border-orange-800/30">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">🕰️</span> The Creator&apos;s Heartbeat
          </h3>
          <div className="grid md:grid-cols-2 gap-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
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
        </div>
      </div>
    </section>
  );
}

type EternalFlameSectionProps = {
  streak: {
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
  };
  longestStreakPeriod: string | null;
};

/**
 * Eternal Flame Section
 *
 * Displays the "streak" of consecutive days with at least one prototype release.
 * Celebrates the continuous creativity of the community.
 */
function EternalFlameSection({
  streak,
  longestStreakPeriod,
}: EternalFlameSectionProps) {
  return (
    <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
      <div className="bg-linear-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-amber-900/20 rounded-3xl p-8 border border-red-100 dark:border-red-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full text-red-600 dark:text-red-400 animate-pulse">
                <IconFlame />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                The Eternal Flame
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              The Eternal Flame represents the unbroken chain of creativity.
              <br />
              For the past{' '}
              <span className="font-bold text-red-600 dark:text-red-400">
                {streak.currentStreak.toLocaleString()}
              </span>{' '}
              days, at least one new prototype has been released every single
              day.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              * Source: Consecutive days with at least one{' '}
              <strong>Release</strong> (All time).
            </p>
          </div>

          <div className="shrink-0">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Flame Animation Placeholder */}
              <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-4 bg-red-500/20 rounded-full animate-pulse opacity-30"></div>
              <div className="text-8xl filter drop-shadow-lg animate-bounce duration-2000">
                🔥
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap justify-center md:justify-start gap-4 mb-8">
          <div className="bg-white/60 dark:bg-black/20 px-4 py-2 rounded-lg border border-red-100 dark:border-red-800/30">
            <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Longest Streak
            </span>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {streak.longestStreak.toLocaleString()} Days
            </span>
            {longestStreakPeriod && (
              <span className="block text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-mono">
                {longestStreakPeriod}
              </span>
            )}
          </div>
          <div className="bg-white/60 dark:bg-black/20 px-4 py-2 rounded-lg border border-red-100 dark:border-red-800/30">
            <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Active Days
            </span>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {streak.totalActiveDays.toLocaleString()} Days
            </span>
          </div>
        </div>

        <div className="relative z-10 mt-8 pt-8 border-t border-red-200/50 dark:border-red-800/30">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">📜</span> The Story of the Flame
          </h3>
          <div className="grid md:grid-cols-2 gap-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            <div>
              <p className="mb-4">
                <strong>Why track the streak?</strong>
                <br />
                In a community driven by voluntary creation, maintaining
                momentum is a challenge. The &quot;Eternal Flame&quot;
                visualizes the collective heartbeat of ProtoPedia. A long streak
                signifies a healthy ecosystem where the baton of inspiration is
                constantly passed from one creator to the next.
              </p>
            </div>
            <div>
              <p>
                <strong>The Golden Era</strong>
                <br />
                The record of{' '}
                <span className="font-bold text-red-600 dark:text-red-400">
                  {streak.longestStreak.toLocaleString()} days
                </span>{' '}
                set between {longestStreakPeriod || 'unknown dates'} represents
                a period of intense creativity. Whether driven by events or
                sheer passion, this era proves that innovation never truly
                sleeps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type GatewayDrugSectionProps = {
  topMaterials: { material: string; count: number }[];
};

/**
 * The Gateway Drug Section (Top Materials)
 *
 * Displays the most frequently used materials/tools (e.g., M5Stack, Unity).
 * Represents the "entry point" technologies for many creators.
 */
function GatewayDrugSection({ topMaterials }: GatewayDrugSectionProps) {
  return (
    <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
      <div className="bg-linear-to-r from-lime-50 to-green-50 dark:from-lime-900/20 dark:to-green-900/20 rounded-3xl p-8 border border-lime-100 dark:border-lime-800/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 -mt-10 -ml-10 w-64 h-64 bg-green-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-3 bg-lime-100 dark:bg-lime-800 rounded-full text-lime-600 dark:text-lime-300">
                <IconTool />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                The Gateway Drug
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Every addiction starts somewhere. These are the tools and
              materials that hooked us into the world of prototyping.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              * Source: <strong>Materials/Tools</strong> listed in all
              registered prototypes.
            </p>
          </div>
          <div className="shrink-0">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-lime-400/20 rounded-full animate-pulse opacity-20 duration-3000"></div>
              <div className="text-6xl filter drop-shadow-lg">🛠️</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            {topMaterials
              .slice(0, 15)
              .map(
                ({ material, count }: { material: string; count: number }) => (
                  <div
                    key={material}
                    className="flex items-center bg-white/80 dark:bg-black/20 rounded-lg px-4 py-2 border border-lime-100 dark:border-lime-800/50 hover:scale-105 transition-transform cursor-default"
                  >
                    <span className="text-base font-bold text-lime-800 dark:text-lime-200 mr-2">
                      {material}
                    </span>
                    <span className="text-xs font-bold text-lime-600 dark:text-lime-400 bg-lime-100 dark:bg-lime-900/50 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </div>
                ),
              )}
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-lime-200/50 dark:border-lime-800/30 mt-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">💊</span> Choose Your Poison
          </h3>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            Whether it&apos;s the click of a mechanical switch, the glow of an
            LED, or the infinite possibilities of a game engine, these are the
            common languages we speak.
          </p>
        </div>
      </div>
    </section>
  );
}

type EarlyAdoptersSectionProps = {
  adopters: {
    tag: string;
    prototypeId: number;
    prototypeTitle: string;
    releaseDate: string;
  }[];
};

/**
 * Early Adopters Section
 *
 * Highlights the first prototype to use specific popular tags.
 * Honors the pioneers who introduced new technologies or concepts.
 */
function EarlyAdoptersSection({ adopters }: EarlyAdoptersSectionProps) {
  return (
    <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
      <div className="bg-linear-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-3xl p-8 border border-slate-100 dark:border-slate-800/50 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -mt-10 -ml-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Section */}
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
                <IconTelescope />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                The Early Adopters
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Who planted the first flag? Discover the pioneers who introduced
              new technologies to our world.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              * Source: <strong>Earliest Release Date</strong> for each of the
              most popular tags.
            </p>
          </div>
          <div className="shrink-0">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-slate-400/20 rounded-full animate-ping opacity-20 duration-3000"></div>
              <div className="absolute inset-2 bg-blue-400/20 rounded-full animate-pulse opacity-30"></div>
              <div className="text-6xl filter drop-shadow-lg">🔭</div>
            </div>
          </div>
        </div>

        {/* Data Section */}
        <div className="relative z-10 mb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {adopters.slice(0, 6).map((adopter) => (
              <Link
                key={adopter.tag}
                href={buildPrototypeLink(adopter.prototypeId)}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white/80 dark:bg-gray-800/80 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    First #{adopter.tag}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(adopter.releaseDate).getFullYear()}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {adopter.prototypeTitle}
                </h3>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(adopter.releaseDate).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Narrative Section */}
        <div className="relative z-10 pt-8 border-t border-slate-200/50 dark:border-slate-800/30">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">🚩</span> The Legacy of First Steps
          </h3>
          <div className="grid md:grid-cols-2 gap-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            <div>
              <p className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                The First Penguin
              </p>
              <p>
                In a sea of uncertainty, someone has to be the first to dive in.
                These prototypes represent the brave souls who experimented with
                new tech before it was cool.
              </p>
            </div>
            <div>
              <p className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                Origin of Species
              </p>
              <p>
                Every standard tool we use today started as a risky experiment.
                By tracing back to the origin, we honor the curiosity that
                drives our evolution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type FirstPenguinSectionProps = {
  penguins: {
    year: number;
    prototype: {
      id: number;
      title: string;
      releaseDate: string;
      user: string;
    };
  }[];
};

/**
 * First Penguin Section
 *
 * Showcases the very first prototype released in each year.
 * "First Penguin" refers to the courageous individual who dives first.
 */
function FirstPenguinSection({ penguins }: FirstPenguinSectionProps) {
  return (
    <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
      <div className="bg-linear-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-3xl p-8 border border-cyan-100 dark:border-cyan-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-800 rounded-full text-cyan-600 dark:text-cyan-300">
                <IconPenguin />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                The First Penguin
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              The brave souls who broke the silence of the New Year. Celebrating
              the very first prototype of each year.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              * Source: <strong>First Release</strong> of each year (JST).
            </p>
          </div>
          <div className="shrink-0">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-bounce opacity-20 duration-3000"></div>
              <div className="text-6xl filter drop-shadow-lg">🐧</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid gap-6 md:grid-cols-2 mb-8">
          {penguins.map((penguin) => (
            <div
              key={penguin.year}
              className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-cyan-100 dark:border-cyan-800/30 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                  {penguin.year}
                </span>
                <span className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 text-xs rounded-full font-bold">
                  First Penguin
                </span>
              </div>
              <Link
                href={buildPrototypeLink(penguin.prototype.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {penguin.prototype.title}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  by {penguin.prototype.user}
                </div>
                <div className="text-xs font-mono text-cyan-600/70 dark:text-cyan-400/70">
                  {new Date(penguin.prototype.releaseDate).toLocaleString(
                    'ja-JP',
                    { timeZone: 'Asia/Tokyo' },
                  )}{' '}
                  (JST)
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="relative z-10 pt-8 border-t border-cyan-200/50 dark:border-cyan-800/30">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">🌊</span> First to Dive
          </h3>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            In the animal kingdom, the &quot;First Penguin&quot; is the
            courageous individual who dives into the unknown waters first,
            leading the flock. In ProtoPedia, these creators set the tone for
            the entire year.
          </p>
        </div>
      </div>
    </section>
  );
}

type StarAlignmentSectionProps = {
  alignments: {
    timestamp: string;
    prototypes: { id: number; title: string }[];
  }[];
};

/**
 * Star Alignment Section
 *
 * Lists groups of prototypes released at the exact same second.
 * Represents "cosmic synchronicity" between creators.
 */
function StarAlignmentSection({ alignments }: StarAlignmentSectionProps) {
  return (
    <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-800">
      <div className="bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 border border-purple-100 dark:border-purple-800/50 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-full text-purple-600 dark:text-purple-300">
                <IconStar />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                The Star Alignment
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              A miracle of timing. Discover prototypes that were released at the
              exact same moment, connected by cosmic synchronicity.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              * Source: Prototypes with{' '}
              <strong>Identical Release Timestamps</strong> (to the second).
            </p>
          </div>
          <div className="shrink-0">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-spin-slow opacity-20 duration-5000"></div>
              <div className="text-6xl filter drop-shadow-lg">🌠</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-4 mb-8">
          {alignments.length > 0 ? (
            alignments.slice(0, 3).map((alignment, i) => (
              <div
                key={i}
                className="bg-white/60 dark:bg-black/20 rounded-xl p-5 border border-purple-100 dark:border-purple-800/30"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">
                    {new Date(alignment.timestamp).toLocaleString('ja-JP', {
                      timeZone: 'Asia/Tokyo',
                    })}
                  </span>
                  <span className="h-px flex-1 bg-purple-200 dark:bg-purple-800/50"></span>
                  <span className="text-xs text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
                    {alignment.prototypes.length} Simultaneous Releases
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {alignment.prototypes.map((p) => (
                    <Link
                      key={p.id}
                      href={buildPrototypeLink(p.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-purple-100 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-500 transition-colors shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {p.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No cosmic alignments detected yet.
            </div>
          )}
        </div>

        <div className="relative z-10 pt-8 border-t border-purple-200/50 dark:border-purple-800/30">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">🤝</span> Cosmic Connection
          </h3>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            Two creators, likely miles apart, pressing the &quot;Release&quot;
            button at the exact same second. It&apos;s a rare phenomenon that
            reminds us we are never truly creating alone.
          </p>
        </div>
      </div>
    </section>
  );
}

type AnniversaryEffectSectionProps = {
  holidays: {
    name: string;
    date: string;
    count: number;
    examples: { id: number; title: string; year: number }[];
  }[];
};

/**
 * Anniversary Effect Section
 *
 * Analyzes release spikes on specific holidays (e.g., Christmas, Valentine's Day).
 * Shows how special dates inspire creation.
 */
function AnniversaryEffectSection({ holidays }: AnniversaryEffectSectionProps) {
  return (
    <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-900">
      <div className="bg-linear-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 rounded-3xl p-8 border border-rose-100 dark:border-rose-800/50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-400/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-3 bg-rose-100 dark:bg-rose-800 rounded-full text-rose-600 dark:text-rose-300">
                <IconGift />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                The Anniversary Effect
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Special days inspire special creations. See how holidays and
              anniversaries spark the community&apos;s imagination.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              * Source: Release dates matching{' '}
              <strong>Specific Holidays</strong> (JST).
            </p>
          </div>
          <div className="shrink-0">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-rose-400/20 rounded-full animate-pulse opacity-20"></div>
              <div className="text-6xl filter drop-shadow-lg">🎁</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mb-8">
          <div className="space-y-3">
            {holidays.map((holiday) => {
              const maxCount = Math.max(...holidays.map((h) => h.count));
              const percent = (holiday.count / maxCount) * 100;

              return (
                <div
                  key={holiday.name}
                  className="bg-white/60 dark:bg-black/20 rounded-xl p-4 border border-rose-100 dark:border-rose-800/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 dark:text-white">
                        {holiday.name}
                      </span>
                      <span className="text-xs text-rose-500 dark:text-rose-400 font-mono">
                        ({holiday.date})
                      </span>
                    </div>
                    <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                      {holiday.count}
                    </span>
                  </div>
                  <div className="w-full bg-rose-100 dark:bg-rose-900/30 rounded-full h-2 mb-3 overflow-hidden">
                    <div
                      className="bg-rose-500 dark:bg-rose-400 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {holiday.examples.slice(0, 3).map((ex) => (
                      <Link
                        key={ex.id}
                        href={buildPrototypeLink(ex.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      >
                        {ex.title} ({ex.year})
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-rose-200/50 dark:border-rose-800/30">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">📅</span> Holiday Magic
          </h3>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            Whether it&apos;s a Christmas gadget, a Valentine&apos;s gift, or an
            April Fool&apos;s joke, makers love to sync their releases with the
            calendar. These spikes reveal the playful heart of the community.
          </p>
        </div>
      </div>
    </section>
  );
}

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

/**
 * Labor of Love Section (Gestation Period)
 *
 * Visualizes the prolonged effort and dedication behind a prototype.
 * Celebrates the "struggle" and persistence of creators.
 */
function LaborOfLoveSection({ laborOfLove }: LaborOfLoveSectionProps) {
  const { longestGestation, distribution } = laborOfLove;

  return (
    <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-600">
      <div className="bg-linear-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-3xl p-8 border border-pink-100 dark:border-pink-800/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 -mt-10 -ml-10 w-64 h-64 bg-rose-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-3 bg-pink-100 dark:bg-pink-800 rounded-full text-pink-600 dark:text-pink-300">
                <IconHeart />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Labor of Love
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Great things take time. These prototypes are the result of long
              incubation periods, proving that persistence pays off.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              * Source: Duration between <strong>Registration</strong> and{' '}
              <strong>Release</strong>.
            </p>
          </div>
          <div className="shrink-0">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-pink-400/20 rounded-full animate-pulse opacity-20 duration-4000"></div>
              <div className="text-6xl filter drop-shadow-lg">❤️</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid gap-8 lg:grid-cols-2 mb-8">
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
                      <div className="font-medium text-gray-900 dark:text-white truncate group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {item.title}
                      </div>
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
                const maxCount = Math.max(...Object.values(distribution));
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
                      <div
                        className="bg-pink-400 dark:bg-pink-500 h-full rounded-full labor-of-love-bar"
                        style={
                          {
                            '--bar-width': `${percent}%`,
                          } as React.CSSProperties
                        }
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-pink-200/50 dark:border-pink-800/30">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">🍷</span> Aged to Perfection
          </h3>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            Not all prototypes are built in a weekend hackathon. Some ideas need
            time to mature, evolve, and find their perfect form. We honor the
            creators who stuck with their vision through the long haul.
          </p>
        </div>
      </div>
    </section>
  );
}

type MaternityHospitalSectionProps = {
  maternityHospital: {
    topEvents: Array<{ event: string; count: number }>;
    independentRatio: number;
  };
};

/**
 * Maternity Hospital Section (Events vs Independent)
 *
 * Analyzes where prototypes are "born" - at events (hackathons) or independently.
 * Shows the ecosystem's reliance on organized events vs organic creation.
 */
function MaternityHospitalSection({
  maternityHospital,
}: MaternityHospitalSectionProps) {
  const { topEvents, independentRatio } = maternityHospital;
  const independentPercent = (independentRatio * 100).toFixed(1);
  const eventPercent = (100 - independentRatio * 100).toFixed(1);

  return (
    <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-300">
                <IconHospital />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                The Maternity Hospital
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Where are ideas born? Some in the bustling delivery rooms of
              hackathons, others in the quiet solitude of a home lab.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              * Source: <strong>Event Tags</strong> attached to prototypes.
            </p>
          </div>
          <div className="shrink-0">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-pulse opacity-20 duration-3000"></div>
              <div className="text-6xl filter drop-shadow-lg">🏥</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid gap-8 lg:grid-cols-2 mb-8">
          {/* Birthplace Distribution */}
          <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30 flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">
              Birthplace Distribution
            </h3>
            <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex mb-4">
              <div
                className="h-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white whitespace-nowrap transition-all duration-1000"
                style={{ width: `${eventPercent}%` }}
              >
                Events ({eventPercent}%)
              </div>
              <div
                className="h-full bg-blue-400 flex items-center justify-center text-xs font-bold text-white whitespace-nowrap transition-all duration-1000"
                style={{ width: `${independentPercent}%` }}
              >
                Independent ({independentPercent}%)
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 px-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                <span>Born at Events</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                <span>Home Births</span>
              </div>
            </div>
          </div>

          {/* Top Maternity Wards (Events) */}
          <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span>🏆</span> Top Maternity Wards
            </h3>
            <div className="space-y-3">
              {topEvents.slice(0, 5).map((item, index) => (
                <div
                  key={item.event}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {item.event}
                    </span>
                  </div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 ml-4">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-blue-200/50 dark:border-blue-800/30">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">👶</span> Nature vs Nurture
          </h3>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            Events like hackathons act as powerful catalysts, forcing ideas into
            existence through deadlines and peer pressure. Yet, the high number
            of independent releases shows that the urge to create often strikes
            without any external prompt.
          </p>
        </div>
      </div>
    </section>
  );
}

type PowerOfDeadlinesSectionProps = {
  powerOfDeadlines: {
    spikes: Array<{ date: string; count: number; score: number }>;
  };
};

/**
 * Power of Deadlines Section
 *
 * Visualizes the "Summer Homework" phenomenon.
 * Shows days with abnormal spikes in releases, likely due to contest deadlines.
 */
function PowerOfDeadlinesSection({
  powerOfDeadlines,
}: PowerOfDeadlinesSectionProps) {
  const { spikes } = powerOfDeadlines;

  return (
    <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-600">
      <div className="bg-linear-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-3xl p-8 border border-red-100 dark:border-red-800/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 -mt-10 -ml-10 w-64 h-64 bg-red-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-800 rounded-full text-red-600 dark:text-red-300">
                <IconDeadline />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                The Power of Deadlines
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Deadlines are the mother of invention. Observe the massive spikes
              in creativity that occur just before the clock strikes zero.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              * Source: Days with <strong>Abnormal Release Counts</strong>.
            </p>
          </div>
          <div className="shrink-0">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-red-400/20 rounded-full animate-ping opacity-20 duration-1000"></div>
              <div className="text-6xl filter drop-shadow-lg">💣</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spikes.slice(0, 6).map((spike, index) => (
              <div
                key={spike.date}
                className="bg-white/60 dark:bg-black/20 rounded-xl p-4 border border-red-100 dark:border-red-800/30 flex flex-col items-center text-center"
              >
                <div className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-1">
                  Rank #{index + 1}
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                  {spike.count} Releases
                </div>
                <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
                  {new Date(spike.date).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-red-200/50 dark:border-red-800/30">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">🔥</span> The Last Minute Rush
          </h3>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            Just like summer homework, the biggest innovations often happen at
            the very last moment. These spikes represent the collective
            adrenaline rush of the community pushing to meet a contest deadline.
          </p>
        </div>
      </div>
    </section>
  );
}

type WeekendWarriorSectionProps = {
  weekendWarrior: {
    sundaySprintCount: number;
    midnightCount: number;
    daytimeCount: number;
    totalCount: number;
  };
};

/**
 * Weekend Warrior Section
 *
 * Visualizes the "Crunch Time" reality of hobbyist makers.
 * Highlights Sunday night sprints and midnight coding sessions.
 */
function WeekendWarriorSection({ weekendWarrior }: WeekendWarriorSectionProps) {
  const { sundaySprintCount, midnightCount, daytimeCount, totalCount } =
    weekendWarrior;

  const sundaySprintPercent =
    totalCount > 0 ? ((sundaySprintCount / totalCount) * 100).toFixed(1) : '0';
  const midnightPercent =
    totalCount > 0 ? ((midnightCount / totalCount) * 100).toFixed(1) : '0';
  const daytimePercent =
    totalCount > 0 ? ((daytimeCount / totalCount) * 100).toFixed(1) : '0';

  return (
    <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
      <div className="bg-linear-to-r from-slate-50 to-zinc-50 dark:from-slate-900/20 dark:to-zinc-900/20 rounded-3xl p-8 border border-slate-100 dark:border-slate-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-zinc-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
                <IconWarrior />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                The Weekend Warrior&apos;s Crunch
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              The battle against time. Witness the heroic efforts of makers who
              burn the midnight oil and sprint through Sunday nights.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              * Source: Release times (JST).
            </p>
          </div>
          <div className="shrink-0">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-slate-400/20 rounded-full animate-pulse opacity-20 duration-3000"></div>
              <div className="text-6xl filter drop-shadow-lg">⚔️</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid gap-6 md:grid-cols-3 mb-8">
          {/* Sunday Night Sprint */}
          <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/30 text-center">
            <div className="text-4xl mb-2">🏃💨</div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
              Sunday Night Sprint
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Sun 20:00 - Mon 05:00
            </p>
            <div className="text-3xl font-black text-slate-700 dark:text-slate-300">
              {sundaySprintPercent}%
            </div>
            <p className="text-xs text-gray-500 mt-1">of all releases</p>
          </div>

          {/* Midnight Oil */}
          <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/30 text-center">
            <div className="text-4xl mb-2">🦉🌙</div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
              Midnight Oil
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              23:00 - 04:00
            </p>
            <div className="text-3xl font-black text-slate-700 dark:text-slate-300">
              {midnightPercent}%
            </div>
            <p className="text-xs text-gray-500 mt-1">of all releases</p>
          </div>

          {/* Daywalker */}
          <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/30 text-center">
            <div className="text-4xl mb-2">☀️☕</div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
              Daywalker
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              09:00 - 18:00
            </p>
            <div className="text-3xl font-black text-slate-700 dark:text-slate-300">
              {daytimePercent}%
            </div>
            <p className="text-xs text-gray-500 mt-1">of all releases</p>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-slate-200/50 dark:border-slate-800/30">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">🛡️</span> The Hobbyist&apos;s Honor
          </h3>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            The high percentage of late-night and Sunday releases reveals the
            true nature of the community: dedicated hobbyists who squeeze every
            ounce of creativity out of their free time before the work week
            begins.
          </p>
        </div>
      </div>
    </section>
  );
}

type HolyDaySectionProps = {
  holyDay: {
    topDays: Array<{ date: string; count: number }>;
  };
};

/**
 * Holy Day Section
 *
 * Identifies the specific date with the historically highest number of releases.
 * Shows the "holiest" days for the community.
 */
function HolyDaySection({ holyDay }: HolyDaySectionProps) {
  const { topDays } = holyDay;

  return (
    <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-800">
      <div className="bg-linear-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-3xl p-8 border border-amber-100 dark:border-amber-800/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 -mt-10 -ml-10 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-800 rounded-full text-amber-600 dark:text-amber-300">
                <IconHoly />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                The Holy Day
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              There are days when the stars align and creativity floods the
              world. These are the holiest days in the ProtoPedia calendar.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              * Source: Aggregated releases by <strong>Month-Day</strong>.
            </p>
          </div>
          <div className="shrink-0">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-pulse opacity-20 duration-3000"></div>
              <div className="text-6xl filter drop-shadow-lg">🙌</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topDays.slice(0, 3).map((day, index) => {
              const [month, date] = day.date.split('-');
              const dateObj = new Date();
              dateObj.setMonth(parseInt(month) - 1);
              dateObj.setDate(parseInt(date));
              const monthName = dateObj.toLocaleString('en-US', {
                month: 'long',
              });

              return (
                <div
                  key={day.date}
                  className="bg-white/60 dark:bg-black/20 rounded-xl p-6 border border-amber-100 dark:border-amber-800/30 flex flex-col items-center text-center relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-400"></div>
                  <div className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider mb-2">
                    Rank #{index + 1}
                  </div>
                  <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">
                    {monthName} {date}
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {day.count} Total Releases
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-amber-200/50 dark:border-amber-800/30">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">📅</span> A Day to Remember
          </h3>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            Whether it&apos;s the deadline of a legendary contest or a day of
            global celebration, these dates have witnessed more births of ideas
            than any other. Mark your calendars!
          </p>
        </div>
      </div>
    </section>
  );
}
