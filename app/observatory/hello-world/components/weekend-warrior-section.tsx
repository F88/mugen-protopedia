import { IconWarrior } from '../../shared/icons';
import { ObservatorySection } from './observatory-section';

type WeekendWarriorSectionProps = {
  weekendWarrior: {
    sundaySprintCount: number;
    midnightCount: number;
    daytimeCount: number;
    totalCount: number;
  };
};

export function WeekendWarriorSection({
  weekendWarrior,
}: WeekendWarriorSectionProps) {
  const { sundaySprintCount, midnightCount, daytimeCount, totalCount } =
    weekendWarrior;

  const sundaySprintPercent =
    totalCount > 0 ? ((sundaySprintCount / totalCount) * 100).toFixed(1) : '0';
  const midnightPercent =
    totalCount > 0 ? ((midnightCount / totalCount) * 100).toFixed(1) : '0';
  const daytimePercent =
    totalCount > 0 ? ((daytimeCount / totalCount) * 100).toFixed(1) : '0';

  return (
    <ObservatorySection
      theme="slate"
      icon={<IconWarrior />}
      title="The Weekend Warrior's Crunch"
      description="The battle against time. Witness the heroic efforts of makers who burn the midnight oil and sprint through Sunday nights."
      sourceNote={<>Release times (JST).</>}
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-400/20 rounded-full animate-pulse opacity-20 duration-3000"></div>
          <div className="text-6xl filter drop-shadow-lg">⚔️</div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">🛡️</span> The Hobbyist&apos;s Honor
          </>
        ),
        content: (
          <p>
            The high percentage of late-night and Sunday releases reveals the
            true nature of the community: dedicated hobbyists who squeeze every
            ounce of creativity out of their free time before the work week
            begins.
          </p>
        ),
      }}
      delay="delay-700"
    >
      <div className="grid gap-6 md:grid-cols-3 mb-8">
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
    </ObservatorySection>
  );
}
