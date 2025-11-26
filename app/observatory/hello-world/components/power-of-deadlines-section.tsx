import { IconDeadline } from '../../components/icons';
import { ObservatorySection } from './observatory-section';

type PowerOfDeadlinesSectionProps = {
  powerOfDeadlines: {
    spikes: Array<{ date: string; count: number; score: number }>;
  };
};

export function PowerOfDeadlinesSection({
  powerOfDeadlines,
}: PowerOfDeadlinesSectionProps) {
  const { spikes } = powerOfDeadlines;

  return (
    <ObservatorySection
      theme="red"
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
          <div className="absolute inset-0 bg-red-400/20 rounded-full animate-ping opacity-20 duration-1000"></div>
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
    </ObservatorySection>
  );
}
