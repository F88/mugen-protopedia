import { IconDeadline } from '../../shared/icons';
import { helloWorldTheme } from '../theme';
import { ObservatorySection } from './observatory-section';

type PowerOfDeadlinesSectionProps = {
  powerOfDeadlines: {
    spikes: Array<{ date: string; count: number; score: number }>;
  };
  dailyReleaseCounts: Record<number, Record<number, Record<number, number>>>;
};

export function PowerOfDeadlinesSection({
  powerOfDeadlines,
  dailyReleaseCounts,
}: PowerOfDeadlinesSectionProps) {
  const { spikes } = powerOfDeadlines;
  const topSpike = spikes[0];
  const otherSpikes = spikes.slice(1, 7); // Top 2-7

  const getDailyCount = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return dailyReleaseCounts[year]?.[month]?.[day] || 0;
  };

  const renderSpikeChart = (spike: { date: string; count: number }) => {
    const centerDate = new Date(spike.date);
    const days = [];
    for (let i = -5; i <= 1; i++) {
      const d = new Date(centerDate);
      d.setDate(centerDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        count: getDailyCount(dateStr),
        isCenter: i === 0,
        label: d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      });
    }

    const maxCount = Math.max(...days.map((d) => d.count), 1);

    return (
      <div className="flex justify-center gap-2 w-full">
        {days.map((day) => {
          const heightPercent = (day.count / maxCount) * 100;
          const height = Math.max(heightPercent, 5); // Min height 5%

          return (
            <div
              key={day.date}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                {day.count}
              </div>
              <div className="h-16 w-full flex items-end justify-center">
                <div
                  className={`w-full rounded-t-sm transition-all duration-500 ${
                    day.isCenter
                      ? 'bg-fuchsia-500 dark:bg-fuchsia-500'
                      : 'bg-fuchsia-200 dark:bg-fuchsia-900/30'
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <div
                className={`text-[10px] whitespace-nowrap ${
                  day.isCenter
                    ? 'font-bold text-fuchsia-600 dark:text-fuchsia-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {day.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <ObservatorySection
      theme={helloWorldTheme.sections.powerOfDeadlines.theme}
      icon={<IconDeadline />}
      title="The Power of Deadlines"
      description="Deadlines are the mother of invention. Observe the massive spikes in creativity that occur just before the clock strikes zero."
      sourceNote={
        <>
          Days with <strong>Abnormal Release Counts</strong>.
        </>
      }
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-fuchsia-400/20 rounded-full animate-ping opacity-20 duration-1000"></div>
          <div className="text-6xl filter drop-shadow-lg">💣</div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">🔥</span> The Last Minute Rush
          </>
        ),
        content: (
          <p>
            Just like summer homework, the biggest innovations often happen at
            the very last moment. These spikes represent the collective
            adrenaline rush of the community pushing to meet a contest deadline.
          </p>
        ),
      }}
      delay="delay-600"
    >
      {/* Hero Card for the Record */}
      {topSpike && (
        <div className="mb-8 bg-fuchsia-50 dark:bg-fuchsia-900/10 rounded-2xl p-6 border border-fuchsia-100 dark:border-fuchsia-800/30 flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-fuchsia-100 dark:bg-fuchsia-800/30 rounded-full text-4xl animate-pulse hidden md:block">
            💥
          </div>
          <div className="flex-1 w-full text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-wider mb-1">
                  All-Time Record
                </div>
                <div className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                  {topSpike.count} Releases
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-300 font-mono">
                  on{' '}
                  {new Date(topSpike.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
              {/* Chart for the top spike */}
              <div className="w-full md:flex-1 mt-6 md:mt-0">
                {renderSpikeChart(topSpike)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {otherSpikes.map((spike, index) => (
          <div
            key={spike.date}
            className="bg-white/60 dark:bg-black/20 rounded-xl p-4 border border-fuchsia-100 dark:border-fuchsia-800/30 flex flex-col items-center text-center"
          >
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Rank #{index + 2}
            </div>
            <div className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">
              {spike.count} Releases
            </div>
            <div className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-2">
              {new Date(spike.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <div className="w-full pt-2 border-t border-fuchsia-100 dark:border-fuchsia-800/30">
              {renderSpikeChart(spike)}
            </div>
          </div>
        ))}
      </div>
    </ObservatorySection>
  );
}
