import Link from 'next/link';

import { buildPrototypeLink } from '@/lib/utils/prototype-utils';

import { Bar } from '@/components/observatory/bar';

import { IconGift } from '../../shared/icons';
import { ObservatorySection } from './observatory-section';
import { clampPercent } from '@/lib/utils/math';

type AnniversaryEffectSectionProps = {
  holidays: {
    name: string;
    date: string;
    count: number;
    examples: { id: number; title: string; year: number }[];
  }[];
};

export function AnniversaryEffectSection({
  holidays,
}: AnniversaryEffectSectionProps) {
  const maxCount = Math.max(...holidays.map((h) => h.count));

  return (
    <ObservatorySection
      theme="rose"
      icon={<IconGift />}
      title="The Anniversary Effect"
      description="Special days inspire special creations. See how holidays and anniversaries spark the community's imagination."
      sourceNote={
        <>
          Release dates matching <strong>Specific Holidays</strong> (JST).
        </>
      }
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-rose-400/20 rounded-full animate-pulse opacity-20"></div>
          <div className="text-6xl filter drop-shadow-lg">🎁</div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">📅</span> Holiday Magic
          </>
        ),
        content: (
          <p>
            Whether it&apos;s a Christmas gadget, a Valentine&apos;s gift, or an
            April Fool&apos;s joke, makers love to sync their releases with the
            calendar. These spikes reveal the playful heart of the community.
          </p>
        ),
      }}
      delay="delay-900"
    >
      <div className="space-y-3">
        {holidays.map((holiday) => {
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
                <Bar
                  className="bg-rose-500 dark:bg-rose-400 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${clampPercent(percent)}%` }}
                />
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
    </ObservatorySection>
  );
}
