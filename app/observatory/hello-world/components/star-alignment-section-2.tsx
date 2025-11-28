import Link from 'next/link';

import { IconStar } from '../../shared/icons';
import { buildPrototypeLink } from '@/lib/utils/prototype-utils';
import { helloWorldTheme } from '../theme';
import { ObservatorySection } from './observatory-section';

type StarAlignmentSectionProps = {
  alignments: {
    timestamp: string;
    prototypes: { id: number; title: string }[];
  }[];
};

// Helper to generate polygon coordinates for N points
function getStarCoordinates(
  count: number,
  radius: number = 35,
  centerX: number = 50,
  centerY: number = 50,
) {
  // For 2, create a diagonal line
  if (count === 2) {
    return [
      { x: centerX - radius / 1.5, y: centerY + radius / 2 },
      { x: centerX + radius / 1.5, y: centerY - radius / 2 },
    ];
  }
  // For 3+, create a regular polygon
  return Array.from({ length: count }).map((_, i) => {
    // Start from top ( -PI/2 ) to have one point at the top
    const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}

// Background class for a cosmic/space theme
const spaceSectionBg =
  'relative bg-[#050510] bg-[radial-gradient(ellipse_at_60%_20%,#18181f_60%,#050510_100%)] overflow-hidden';

export function StarAlignmentSection2({
  alignments,
}: StarAlignmentSectionProps) {
  // Show the latest 6 alignments
  const topAlignments = [...alignments].reverse().slice(0, 6);

  return (
    <ObservatorySection
      theme={helloWorldTheme.sections.starAlignment.theme}
      icon={<IconStar />}
      title="The Star Alignment"
      description="A miracle of timing. Discover prototypes that were released at the exact same moment, connected by cosmic synchronicity."
      sourceNote={
        <>
          Prototypes with <strong>Identical Release Timestamps</strong> (to the
          second).
        </>
      }
      className={spaceSectionBg} // Apply space background to the whole section
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Decorative constellation in the icon area */}
          <svg viewBox="0 0 100 100" className="w-24 h-24 absolute opacity-80">
            {/* Lines */}
            <line
              x1="20"
              y1="80"
              x2="50"
              y2="20"
              stroke="currentColor"
              strokeWidth="1"
              className="text-purple-300"
            />
            <line
              x1="50"
              y1="20"
              x2="80"
              y2="60"
              stroke="currentColor"
              strokeWidth="1"
              className="text-purple-300"
            />
            <line
              x1="80"
              y1="60"
              x2="20"
              y2="80"
              stroke="currentColor"
              strokeWidth="1"
              className="text-purple-300"
            />
            {/* Stars with pulsing animation */}
            <circle
              cx="20"
              cy="80"
              r="3"
              className="fill-purple-200 animate-pulse"
            />
            <circle
              cx="50"
              cy="20"
              r="4"
              className="fill-purple-100 animate-pulse"
              style={{ animationDelay: '0.1s' }}
            />
            <circle
              cx="80"
              cy="60"
              r="3"
              className="fill-purple-200 animate-pulse"
              style={{ animationDelay: '0.2s' }}
            />
          </svg>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">🌌</span> Constellations of Creativity
          </>
        ),
        content: (
          <p>
            When creators release their work at the exact same second, they form
            a constellation in the ProtoPedia universe. These rare alignments
            connect disparate ideas across space and time.
          </p>
        ),
      }}
      delay="delay-800"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {topAlignments.length > 0 ? (
          topAlignments.map((alignment) => {
            const count = alignment.prototypes.length;
            const date = new Date(alignment.timestamp);
            const points = getStarCoordinates(count); // Get consistent coordinates

            return (
              <div
                key={alignment.timestamp}
                className="group relative rounded-xl overflow-hidden border border-blue-400/20 bg-gray-900/40 p-6 flex flex-col items-center justify-start transition-all duration-300 hover:border-blue-300/50 hover:shadow-[0_0_20px_theme(colors.purple.500/50)]"
              >
                {/* Timestamp */}
                <div className="text-center mb-4">
                  <div className="font-mono text-lg font-bold text-white tracking-wider drop-shadow-[0_0_4px_theme(colors.purple.500/50)]">
                    {date.toLocaleDateString('en-CA')}
                  </div>
                  <div className="font-mono text-3xl font-extrabold text-[#FFE066] tracking-widest drop-shadow-[0_0_8px_#FFE06699]">
                    {date.toLocaleTimeString('en-GB')}
                  </div>
                </div>

                {/* Constellation SVG */}
                <div className="w-40 h-40 relative mb-4 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <filter
                        id="starGlow"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                      >
                        <feGaussianBlur
                          in="SourceGraphic"
                          stdDeviation="2"
                          result="blur"
                        />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    {/* Lines connecting the stars */}
                    {points.map((pt, i) => {
                      const next = points[(i + 1) % count];
                      return (
                        <line
                          key={`line-${i}`}
                          x1={pt.x}
                          y1={pt.y}
                          x2={next.x}
                          y2={next.y}
                          className="stroke-blue-300/50 group-hover:stroke-blue-200/80 transition-all"
                          strokeWidth="1.5"
                        />
                      );
                    })}
                    {/* Stars */}
                    {points.map((pt, i) => (
                      <circle
                        key={`star-${i}`}
                        cx={pt.x}
                        cy={pt.y}
                        r="6"
                        fill="#fff"
                        stroke="#FFE066"
                        strokeWidth="2"
                        className="transition-all duration-300 group-hover:r-7"
                        filter="url(#starGlow)"
                      />
                    ))}
                  </svg>
                </div>

                {/* Prototype titles */}
                <div className="flex flex-wrap gap-2 justify-center mb-4 z-10">
                  {alignment.prototypes.map((p) => (
                    <Link
                      key={p.id}
                      href={buildPrototypeLink(p.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-purple-300 bg-transparent border border-purple-400/50 rounded-full px-3 py-1 transition-colors hover:bg-purple-400/10 hover:text-purple-200"
                    >
                      {p.title}
                    </Link>
                  ))}
                </div>

                {/* "X Stars Aligned" text */}
                <div className="text-white text-xl mt-auto uppercase tracking-wider font-extrabold text-center drop-shadow-[0_0_8px_theme(colors.blue.400/80)]">
                  {count} STARS ALIGNED
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400 bg-slate-900/50 rounded-xl border border-dashed border-gray-700">
            <p>The stars have not yet aligned...</p>
            <p className="text-sm mt-2">
              Waiting for the first simultaneous release.
            </p>
          </div>
        )}
      </div>
    </ObservatorySection>
  );
}
