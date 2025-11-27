import { IconHoly } from '../../shared/icons';
import { ObservatorySection } from './observatory-section';

type HolyDaySectionProps = {
  holyDay: {
    topDays: Array<{ date: string; count: number }>;
  };
};

export function HolyDaySection({ holyDay }: HolyDaySectionProps) {
  const { topDays } = holyDay;

  return (
    <ObservatorySection
      theme="amber"
      icon={<IconHoly />}
      title="The Holy Day"
      description="There are days when the stars align and creativity floods the world. These are the holiest days in the ProtoPedia calendar."
      sourceNote={
        <>
          Aggregated releases by <strong>Month-Day</strong>.
        </>
      }
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-pulse opacity-20 duration-3000"></div>
          <div className="text-6xl filter drop-shadow-lg">🙌</div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">📅</span> A Day to Remember
          </>
        ),
        content: (
          <p>
            Whether it&apos;s the deadline of a legendary contest or a day of
            global celebration, these dates have witnessed more births of ideas
            than any other. Mark your calendars!
          </p>
        ),
      }}
      delay="delay-800"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topDays.slice(0, 3).map((day, index) => {
          const MONTH_NAMES = [
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
          const [month, date] = day.date.split('-');
          const monthName = MONTH_NAMES[parseInt(month) - 1];

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
    </ObservatorySection>
  );
}
