import { IconFlame } from '../../shared/icons';
import { helloWorldTheme } from '../theme';
import { ObservatorySection } from './observatory-section';

type EternalFlameSectionProps = {
  streak: {
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
    intensity?: Array<{ date: string; count: number }>;
    longestStreakIntensity?: Array<{ date: string; count: number }>;
  };
  longestStreakPeriod: string | null;
};

export function EternalFlameSection({
  streak,
  longestStreakPeriod,
}: EternalFlameSectionProps) {
  const renderIntensityChart = (
    data: Array<{ date: string; count: number }> | undefined,
    title: string,
    colorClass: string,
  ) => {
    if (!data || data.length === 0) return null;

    const localMax = Math.max(...data.map((d) => d.count), 0);

    return (
      <div className="mb-8 bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-red-100 dark:border-red-800/30">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
          <span className="text-lg">🔥</span>
          {title} ({data.length} Days)
        </h3>
        <div className="flex items-end gap-px h-32 w-full overflow-x-auto pb-2">
          {data.map((day) => {
            const heightPercent =
              localMax > 0 ? (day.count / localMax) * 100 : 0;
            const height = Math.max(heightPercent, day.count > 0 ? 5 : 0);

            return (
              <div
                key={day.date}
                className={`group relative flex-1 min-w-1 max-w-8 rounded-t-sm transition-colors ${colorClass}`}
                style={{ height: `${height}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                  {day.date}: {day.count} releases
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <ObservatorySection
      theme={helloWorldTheme.sections.eternalFlame.theme}
      icon={<IconFlame />}
      title="The Eternal Flame"
      description="The Eternal Flame represents the unbroken chain of creativity."
      sourceNote={
        <>
          Consecutive days with at least one <strong>Release</strong> (All
          time).
        </>
      }
      visualContent={
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-4 bg-red-500/20 rounded-full animate-pulse opacity-30"></div>
          <div className="text-8xl filter drop-shadow-lg animate-bounce duration-2000">
            🔥
          </div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">📜</span> The Story of the Flame
          </>
        ),
        content: (
          <div className="grid md:grid-cols-2 gap-8">
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
        ),
      }}
      delay="delay-200"
    >
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-800/30 flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-800/30 rounded-full text-2xl">
              🔥
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Current Streak
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {streak.currentStreak.toLocaleString()} Days
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Consecutive days with releases
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-4 border border-orange-100 dark:border-orange-800/30 flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-800/30 rounded-full text-2xl">
              🏆
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Longest Streak
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {streak.longestStreak.toLocaleString()} Days
              </div>
              {longestStreakPeriod && (
                <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                  {longestStreakPeriod}
                </div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-4 border border-yellow-100 dark:border-yellow-800/30 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-800/30 rounded-full text-2xl">
              📅
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Total Active Days
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {streak.totalActiveDays.toLocaleString()} Days
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Days with at least one release
              </div>
            </div>
          </div>
        </div>

        {renderIntensityChart(
          streak.intensity,
          'Current Flame Intensity',
          'bg-red-400 dark:bg-red-500 hover:bg-red-500 dark:hover:bg-red-400',
        )}

        {renderIntensityChart(
          streak.longestStreakIntensity,
          'Longest Streak Intensity (The Golden Era)',
          'bg-orange-300 dark:bg-orange-600 hover:bg-orange-400 dark:hover:bg-orange-500',
        )}
      </div>
    </ObservatorySection>
  );
}
