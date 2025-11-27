import { cn } from '@/lib/utils';

import { Bar } from '@/components/observatory/bar';

import { IconHospital } from '../../shared/icons';
import { ObservatorySection } from './observatory-section';
import { clampPercent } from '@/lib/utils/math';

type MaternityHospitalSectionProps = {
  maternityHospital: {
    topEvents: Array<{ event: string; count: number }>;
    independentRatio: number;
  };
};

export function MaternityHospitalSection({
  maternityHospital,
}: MaternityHospitalSectionProps) {
  const { topEvents, independentRatio } = maternityHospital;
  const independentPercentValue = independentRatio * 100;
  const eventPercentValue = 100 - independentPercentValue;
  const independentPercent = independentPercentValue.toFixed(1);
  const eventPercent = eventPercentValue.toFixed(1);

  const legendTextClassName = cn('break-words', 'leading-tight');
  const eventNameClassName = cn(
    'font-medium',
    'text-gray-900',
    'dark:text-white',
    'break-words',
    'leading-tight',
  );

  return (
    <ObservatorySection
      theme="blue"
      icon={<IconHospital />}
      title="The Maternity Hospital"
      description="Where are ideas born? Some in the bustling delivery rooms of hackathons, others in the quiet solitude of a home lab."
      sourceNote={
        <>
          <strong>Event Tags</strong> attached to prototypes.
        </>
      }
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-pulse opacity-20 duration-3000"></div>
          <div className="text-6xl filter drop-shadow-lg">🏥</div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">👶</span> Nature vs Nurture
          </>
        ),
        content: (
          <p>
            Events like hackathons act as powerful catalysts, forcing ideas into
            existence through deadlines and peer pressure. Yet, the high number
            of independent releases shows that the urge to create often strikes
            without any external prompt.
          </p>
        ),
      }}
      delay="delay-500"
    >
      <div className="grid gap-8 lg:grid-cols-2 mb-8">
        {/* Birthplace Distribution */}
        <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30 flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">
            Birthplace Distribution
          </h3>
          <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex mb-4">
            <Bar
              className="h-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white whitespace-nowrap transition-all duration-1000"
              style={{
                width: `${clampPercent(eventPercentValue)}%`,
              }}
            >
              {eventPercent}%
            </Bar>
            <Bar
              className="h-full bg-blue-400 flex items-center justify-center text-xs font-bold text-white whitespace-nowrap transition-all duration-1000"
              style={{
                width: `${clampPercent(independentPercentValue)}%`,
              }}
            >
              {independentPercent}%
            </Bar>
          </div>
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400 px-2">
            <div className="flex items-center gap-2 max-w-full">
              <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0"></span>
              <span className={legendTextClassName}>Born at Events</span>
            </div>
            <div className="flex items-center gap-2 max-w-full">
              <span className="w-3 h-3 rounded-full bg-blue-400 shrink-0"></span>
              <span className={legendTextClassName}>Home Births</span>
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
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className={eventNameClassName}>{item.event}</span>
                </div>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 ml-4">
                  {item.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ObservatorySection>
  );
}
