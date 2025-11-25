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
import { getLatestAnalysis } from '@/app/actions/analysis';
import { StatusBadge } from '@/components/ui/badges/status-badge';
import type { AnniversaryCandidatePrototype } from '@/lib/utils/prototype-analysis.types';

// Icons
const IconRocket = () => <span>🚀</span>;
const IconGlobe = () => <span>🌐</span>;
const IconSparkles = () => <span>✨</span>;
const IconDNA = () => <span>🧬</span>;
const IconFlame = () => <span>🔥</span>;
const IconClock = () => <span>⏰</span>;

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
    totalCount,
    statusDistribution,
    topTags,
    releaseTimeDistribution,
    creationStreak,
  } = analysis;

  // Determine "Today" based on JST (Asia/Tokyo) for server-side processing
  const now = new Date();
  const jstTodayString = now.toLocaleDateString('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }); // YYYY-MM-DD

  // Filter newborns: Prototypes released "Today" (YYYY-MM-DD match in JST)
  const newbornPrototypes = anniversaryCandidates.mmdd.filter(
    (p: AnniversaryCandidatePrototype) => {
      const pDate = new Date(p.releaseDate);
      const pJstDateString = pDate.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      // Handle invalid dates
      if (Number.isNaN(pDate.getTime())) return false;

      return pJstDateString === jstTodayString;
    },
  );

  const newbornCount = newbornPrototypes.length;

  // Sort newborns by release date (newest first)
  const sortedNewborns = [...newbornPrototypes].sort(
    (a: AnniversaryCandidatePrototype, b: AnniversaryCandidatePrototype) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
  );

  // Prepare Maker's Rhythm Data
  const dayCounts = Object.values(
    releaseTimeDistribution?.dayOfWeek || {},
  ) as number[];
  const maxDayCount = dayCounts.length > 0 ? Math.max(...dayCounts) : 0;

  const hourCounts = Object.values(
    releaseTimeDistribution?.hour || {},
  ) as number[];
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
            world. (All times and dates are based on Japan Standard Time - JST)
          </p>
        </header>

        {/* Newborns Section */}
        <section className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <IconSparkles />
              <span>The Newborn Stars</span>
            </h2>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              {newbornCount} arrivals today
            </span>
          </div>

          {newbornCount === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
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
              {sortedNewborns.map((proto: AnniversaryCandidatePrototype) => (
                <Link
                  key={proto.id}
                  href={`https://protopedia.net/prototype/${proto.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 p-5"
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 transition-colors">
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
        </section>

        {/* Maker's Rhythm Section */}
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
                  Every creation has a pulse. Observe the heartbeat of the
                  community through time.
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
                    const count =
                      releaseTimeDistribution?.dayOfWeek?.[index] || 0;
                    const heightPercent =
                      maxDayCount > 0 ? (count / maxDayCount) * 100 : 0;
                    return (
                      <div
                        key={day}
                        className="flex flex-col items-center flex-1 gap-2 group"
                      >
                        <div className="relative w-full flex-1 flex items-end">
                          <div
                            className="w-full bg-orange-400 dark:bg-orange-500 rounded-t-md transition-all duration-500 group-hover:bg-orange-500 dark:group-hover:bg-orange-400"
                            style={{ height: `${heightPercent}%` }}
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
                    const count = releaseTimeDistribution?.hour?.[hour] || 0;
                    const heightPercent =
                      maxHourCount > 0 ? (count / maxHourCount) * 100 : 0;
                    return (
                      <div
                        key={hour}
                        className="flex flex-col items-center flex-1 gap-2 group"
                      >
                        <div className="relative w-full flex-1 flex items-end">
                          <div
                            className="w-full bg-indigo-400 dark:bg-indigo-500 rounded-t-sm transition-all duration-500 group-hover:bg-indigo-500 dark:group-hover:bg-indigo-400"
                            style={{ height: `${heightPercent}%` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                              {hour}:00 - {count}
                            </div>
                          </div>
                        </div>
                        {hour % 6 === 0 && (
                          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 absolute bottom-6">
                            {hour}
                          </span>
                        )}
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
                    Data shows a surge of prototypes born on weekends. This is
                    proof that creation is fueled not by obligation, but by pure
                    passion. When the work week ends, the real work begins for
                    many makers.
                  </p>
                </div>
                <div>
                  <p className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                    The Midnight Oil
                  </p>
                  <p>
                    The spikes in the late hours tell a story of inspiration
                    striking in the silence of the night. For many, the best
                    code is written and the wildest ideas are born when the
                    world sleeps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Eternal Flame Section */}
        <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="bg-linear-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-3xl p-8 border border-red-100 dark:border-red-800/50 relative overflow-hidden">
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
                    {creationStreak.currentStreak.toLocaleString()}
                  </span>{' '}
                  days, at least one new prototype has been released every
                  single day.
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
                  {creationStreak.longestStreak.toLocaleString()} Days
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
                  {creationStreak.totalActiveDays.toLocaleString()} Days
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
                    visualizes the collective heartbeat of ProtoPedia. A long
                    streak signifies a healthy ecosystem where the baton of
                    inspiration is constantly passed from one creator to the
                    next.
                  </p>
                </div>
                <div>
                  <p>
                    <strong>The Golden Era</strong>
                    <br />
                    The record of{' '}
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {creationStreak.longestStreak.toLocaleString()} days
                    </span>{' '}
                    set between {longestStreakPeriod || 'unknown dates'}{' '}
                    represents a period of intense creativity. Whether driven by
                    events or sheer passion, this era proves that innovation
                    never truly sleeps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="grid gap-8 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          {/* Total Population */}
          <div className="bg-linear-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl p-8 border border-indigo-100 dark:border-indigo-800/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 mb-8">
              <div className="flex-1 w-full text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-300">
                    <IconRocket />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Universe Population
                  </h3>
                </div>
              </div>

              <div className="shrink-0">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping opacity-20 duration-1000"></div>
                  <div className="absolute inset-4 bg-purple-500/20 rounded-full animate-pulse opacity-30"></div>
                  <div className="text-7xl filter drop-shadow-lg animate-bounce">
                    🚀
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 space-y-6">
              <div>
                <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight text-center lg:text-left">
                  {totalCount.toLocaleString()}
                </div>
                <p className="text-sm font-medium text-indigo-600/80 dark:text-indigo-300/80 mt-1 uppercase tracking-wide text-center lg:text-left">
                  Total Lifeforms Detected
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-indigo-200 dark:border-indigo-800">
                {Object.entries(statusDistribution)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 4)
                  .map(([status, count]) => (
                    <div
                      key={status}
                      className="flex flex-col items-center lg:items-start"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={Number(status)} />
                      </div>
                      <span className="text-lg font-bold text-gray-700 dark:text-gray-200">
                        {(count as number).toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* DNA / Tags */}
          <div className="bg-linear-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-3xl p-8 border border-teal-100 dark:border-teal-800/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 mb-8">
              <div className="flex-1 w-full text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg text-teal-600 dark:text-teal-300">
                    <IconDNA />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Dominant Traits
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  The most common DNA sequences (tags) found in the current
                  population.
                </p>
              </div>

              <div className="shrink-0">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <div className="absolute inset-0 bg-teal-500/20 rounded-full animate-spin-slow opacity-20 duration-3000"></div>
                  <div className="absolute inset-4 bg-emerald-500/20 rounded-full animate-pulse opacity-30"></div>
                  <div className="text-7xl filter drop-shadow-lg animate-pulse">
                    🧬
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                {topTags
                  .slice(0, 12)
                  .map(({ tag, count }: { tag: string; count: number }) => (
                    <div
                      key={tag}
                      className="flex items-center bg-white/80 dark:bg-black/20 rounded-full px-3 py-1.5 border border-teal-100 dark:border-teal-800/50"
                    >
                      <span className="text-sm font-medium text-teal-800 dark:text-teal-200 mr-2">
                        {tag}
                      </span>
                      <span className="text-xs font-bold text-teal-500 dark:text-teal-500/80 bg-teal-50 dark:bg-teal-900/50 px-1.5 rounded-full">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
