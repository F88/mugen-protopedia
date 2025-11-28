import { IconWarrior } from '../../shared/icons';
import { helloWorldTheme } from '../theme';
import { ObservatorySection } from './observatory-section';

type WeekendWarriorSectionProps = {
  weekendWarrior: {
    weekendHourlyCounts: number[];
    totalWeekendCount: number;
  };
};

export function WeekendWarriorSection({
  weekendWarrior,
}: WeekendWarriorSectionProps) {
  const { weekendHourlyCounts } = weekendWarrior;

  // Find the peak hour
  const maxCount = Math.max(...weekendHourlyCounts, 1);

  // Helper to get label for index
  const getLabel = (index: number) => {
    // 0-5: Fri 18-23
    // 6-29: Sat 00-23
    // 30-53: Sun 00-23
    // 54-77: Mon 00-23
    if (index === 0) return 'Fri 18:00';
    if (index === 6) return 'Sat 00:00';
    if (index === 18) return 'Sat 12:00';
    if (index === 30) return 'Sun 00:00';
    if (index === 42) return 'Sun 12:00';
    if (index === 54) return 'Mon 00:00';
    if (index === 66) return 'Mon 12:00';
    if (index === 77) return 'Mon 23:00';
    return '';
  };

  // Helper to get bar color based on time
  const getBarColor = (index: number) => {
    // Night time (23:00 - 05:00)
    // Fri 23-24 (5-6), Sat 0-5 (6-11), Sat 23-24 (29-30), Sun 0-5 (30-35), Sun 23-24 (53-54), Mon 0-5 (54-59)
    const isNight =
      (index >= 5 && index <= 11) ||
      (index >= 29 && index <= 35) ||
      (index >= 53 && index <= 59);

    if (isNight) return 'bg-indigo-500 dark:bg-indigo-400';

    // Sunday Night Sprint (Sun 20:00 - Mon 05:00) -> Index 50 - 59
    if (index >= 50 && index <= 59) return 'bg-teal-500 dark:bg-teal-400';

    return 'bg-slate-300 dark:bg-slate-600';
  };

  return (
    <ObservatorySection
      theme={helloWorldTheme.sections.weekendWarrior.theme}
      icon={<IconWarrior />}
      title="The Weekend Warrior's Crunch"
      description="The battle against time. Witness the heroic efforts of makers who burn the midnight oil and sprint through Sunday nights."
      sourceNote={<>Release times (JST).</>}
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-teal-400/20 rounded-full animate-pulse opacity-20"></div>
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
      <div className="mb-8 overflow-x-auto pb-4">
        <div className="min-w-[600px] h-48 flex items-end gap-0.5">
          {weekendHourlyCounts.map((count, index) => {
            const heightPercent = (count / maxCount) * 100;
            const height = Math.max(heightPercent, 5);
            const label = getLabel(index);

            return (
              <div
                key={index}
                className="flex-1 h-full flex flex-col justify-end items-center group relative"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                  {index < 6
                    ? `Fri ${18 + index}:00`
                    : index < 30
                      ? `Sat ${index - 6}:00`
                      : index < 54
                        ? `Sun ${index - 30}:00`
                        : `Mon ${index - 54}:00`}
                  : {count} releases
                </div>

                <div
                  className={`w-full rounded-t-sm transition-all duration-300 ${getBarColor(
                    index,
                  )}`}
                  style={{ height: `${height}%` }}
                />
                {label && (
                  <div className="absolute top-full mt-1 text-[9px] text-gray-400 whitespace-nowrap -rotate-45 origin-top-left">
                    {label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center text-xs text-gray-500 dark:text-gray-400 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-indigo-500 dark:bg-indigo-400 rounded-sm" />
          <span>Night Ops (23:00-05:00)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-teal-500 dark:bg-teal-400 rounded-sm" />
          <span>Sunday Sprint (Sun 20:00-Mon 05:00)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-sm" />
          <span>Regular Hours</span>
        </div>
      </div>
    </ObservatorySection>
  );
}
