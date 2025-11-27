import { IconFlame } from '../../shared/icons';
import { ObservatorySection } from './observatory-section';

type EternalFlameSectionProps = {
  streak: {
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
  };
  longestStreakPeriod: string | null;
};

export function EternalFlameSection({
  streak,
  longestStreakPeriod,
}: EternalFlameSectionProps) {
  return (
    <ObservatorySection
      theme="red"
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
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          For the past{' '}
          <span className="font-bold text-red-600 dark:text-red-400">
            {streak.currentStreak.toLocaleString()}
          </span>{' '}
          days, at least one new prototype has been released every single day.
        </p>
        <div className="flex flex-wrap justify-center md:justify-start gap-4">
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
      </div>
    </ObservatorySection>
  );
}
