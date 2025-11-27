import Link from 'next/link';
import { IconStar } from '../../shared/icons';
import { buildPrototypeLink } from '@/lib/utils/prototype-utils';
import { ObservatorySection } from './observatory-section';

type StarAlignmentSectionProps = {
  alignments: {
    timestamp: string;
    prototypes: { id: number; title: string }[];
  }[];
};

export function StarAlignmentSection({
  alignments,
}: StarAlignmentSectionProps) {
  return (
    <ObservatorySection
      theme="purple"
      icon={<IconStar />}
      title="The Star Alignment"
      description="A miracle of timing. Discover prototypes that were released at the exact same moment, connected by cosmic synchronicity."
      sourceNote={
        <>
          Prototypes with <strong>Identical Release Timestamps</strong> (to the
          second).
        </>
      }
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-spin-slow opacity-20 duration-5000"></div>
          <div className="text-6xl filter drop-shadow-lg">🌠</div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">🤝</span> Cosmic Connection
          </>
        ),
        content: (
          <p>
            Two creators, likely miles apart, pressing the &quot;Release&quot;
            button at the exact same second. It&apos;s a rare phenomenon that
            reminds us we are never truly creating alone.
          </p>
        ),
      }}
      delay="delay-800"
    >
      <div className="space-y-4 mb-8">
        {alignments.length > 0 ? (
          alignments.slice(0, 3).map((alignment) => (
            <div
              key={alignment.timestamp}
              className="bg-white/60 dark:bg-black/20 rounded-xl p-5 border border-purple-100 dark:border-purple-800/30"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">
                  {new Date(alignment.timestamp).toLocaleString('ja-JP', {
                    timeZone: 'Asia/Tokyo',
                  })}
                </span>
                <span className="h-px flex-1 bg-purple-200 dark:bg-purple-800/50"></span>
                <span className="text-xs text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
                  {alignment.prototypes.length} Simultaneous Releases
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {alignment.prototypes.map((p) => (
                  <Link
                    key={p.id}
                    href={buildPrototypeLink(p.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-purple-100 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-500 transition-colors shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {p.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No cosmic alignments detected yet.
          </div>
        )}
      </div>
    </ObservatorySection>
  );
}
