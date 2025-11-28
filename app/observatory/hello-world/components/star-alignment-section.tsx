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
  if (count === 2) {
    return [
      { x: centerX - radius / 1.5, y: centerY + radius / 2 },
      { x: centerX + radius / 1.5, y: centerY - radius / 2 },
    ];
  }
  return Array.from({ length: count }).map((_, i) => {
    // Start from top ( -PI/2 )
    const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}

// 宇宙テーマ用の背景クラス
const spaceSectionBg =
  'relative bg-[#050510] bg-[radial-gradient(ellipse_at_60%_20%,#18181f_60%,#050510_100%)] overflow-hidden';

export function StarAlignmentSection({
  alignments,
}: StarAlignmentSectionProps) {
  // Show the latest 6 alignments (assuming input is chronological, take end and reverse)
  const topAlignments = [...alignments].reverse().slice(0, 6);

  return (
    <ObservatorySection
      theme={{ ...helloWorldTheme.sections.starAlignment.theme, space: true }}
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
          {/* 星空の粒子エフェクト */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 128 128"
              className="w-full h-full"
            >
              <circle cx="10" cy="20" r="1.2" fill="#fff" opacity="0.7" />
              <circle cx="40" cy="80" r="0.8" fill="#fff" opacity="0.5" />
              <circle cx="90" cy="30" r="1.5" fill="#FFE066" opacity="0.7" />
              <circle cx="120" cy="100" r="1.1" fill="#fff" opacity="0.4" />
              <circle cx="60" cy="60" r="0.7" fill="#fff" opacity="0.6" />
              <circle cx="80" cy="110" r="1.3" fill="#FFE066" opacity="0.5" />
              <circle cx="30" cy="110" r="0.9" fill="#fff" opacity="0.5" />
            </svg>
          </div>
          {/* Simple decorative constellation in the icon area */}
          <svg viewBox="0 0 100 100" className="w-24 h-24 absolute opacity-80">
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
              className="fill-purple-100 animate-pulse delay-75"
            />
            <circle
              cx="80"
              cy="60"
              r="3"
              className="fill-purple-200 animate-pulse delay-150"
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
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ${spaceSectionBg}`}
        style={{
          boxShadow: '0 0 120px #000c',
        }}
      >
        {topAlignments.length > 0 ? (
          topAlignments.map((alignment) => {
            const count = alignment.prototypes.length;
            const date = new Date(alignment.timestamp);

            return (
              <div
                key={alignment.timestamp}
                className="group relative bg-[#050510] rounded-xl overflow-hidden border-2 border-[#FFE066] shadow-lg flex flex-col items-center justify-center py-8"
                style={{ boxShadow: '0 0 32px #FFE06688, 0 0 0 #000' }}
              >
                {/* 日時表示（2行・中央・白＋ゴールド） */}
                <div className="w-full px-2 mb-2 flex flex-col items-center justify-center">
                  <div className="font-mono text-base md:text-lg font-bold text-white text-center mb-0.5 tracking-widest">
                    {date.toLocaleDateString('ja-JP')}
                  </div>
                  <div className="font-mono text-2xl md:text-3xl font-extrabold text-[#FFE066] text-center tracking-widest">
                    {date.toLocaleTimeString('ja-JP', { hour12: false })}
                  </div>
                </div>
                {/* 星座SVG（白＋ゴールド光輪） */}
                <div className="w-40 h-40 relative mb-4 z-10 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {(() => {
                      if (count === 2) {
                        const patterns = [
                          [
                            { x: 30, y: 30 },
                            { x: 70, y: 70 },
                          ],
                          [
                            { x: 30, y: 70 },
                            { x: 70, y: 30 },
                          ],
                          [
                            { x: 20, y: 50 },
                            { x: 80, y: 50 },
                          ],
                          [
                            { x: 50, y: 20 },
                            { x: 50, y: 80 },
                          ],
                        ];
                        const idx = Math.floor(
                          date.getTime() % patterns.length,
                        );
                        const [a, b] = patterns[idx];
                        return [
                          <line
                            key="line-2"
                            x1={a.x}
                            y1={a.y}
                            x2={b.x}
                            y2={b.y}
                            stroke="#fff"
                            strokeWidth="2.5"
                            strokeOpacity="0.9"
                          />, // 白い線
                          <circle
                            key="star-2a"
                            cx={a.x}
                            cy={a.y}
                            r="9"
                            fill="#fff"
                            stroke="#FFE066"
                            strokeWidth="3"
                            filter="url(#glow)"
                          />,
                          <circle
                            key="star-2b"
                            cx={b.x}
                            cy={b.y}
                            r="9"
                            fill="#fff"
                            stroke="#FFE066"
                            strokeWidth="3"
                            filter="url(#glow)"
                          />,
                        ];
                      } else {
                        const seed = date.getTime();
                        const points = Array.from({ length: count }).map(
                          (_, i) => {
                            const angle =
                              ((seed / (i + 1)) % 360) * (Math.PI / 180);
                            const r = 30 + ((seed >> (i + 2)) % 20);
                            return {
                              x: 50 + r * Math.cos(angle + i),
                              y: 50 + r * Math.sin(angle + i),
                            };
                          },
                        );
                        const lines = points.map((pt, i) => {
                          const next = points[(i + 1) % count];
                          return (
                            <line
                              key={`line-${i}`}
                              x1={pt.x}
                              y1={pt.y}
                              x2={next.x}
                              y2={next.y}
                              stroke="#fff"
                              strokeWidth="2.5"
                              strokeOpacity="0.9"
                            />
                          );
                        });
                        const stars = points.map((pt, i) => (
                          <circle
                            key={`star-${i}`}
                            cx={pt.x}
                            cy={pt.y}
                            r="9"
                            fill="#fff"
                            stroke="#FFE066"
                            strokeWidth="3"
                            filter="url(#glow)"
                          />
                        ));
                        return [...lines, ...stars];
                      }
                    })()}
                    <defs>
                      <filter
                        id="glow"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                      >
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                  </svg>
                </div>
                {/* 作品名リスト（大きく・中央・ゴールド単色バッジ） */}
                <div className="flex flex-wrap gap-2 justify-center mb-4 z-20">
                  {alignment.prototypes.map((p) => (
                    <a
                      key={p.id}
                      href={buildPrototypeLink(p.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base md:text-lg font-bold text-black bg-[#FFE066] px-3 py-1 rounded-full shadow border-2 border-[#FFE066] hover:bg-white transition-colors"
                    >
                      {p.title}
                    </a>
                  ))}
                </div>
                {/* n stars aligned（白＋ゴールド・大きく・中央） */}
                <div className="text-white text-xl mt-2 uppercase tracking-wider font-extrabold drop-shadow-[0_0_8px_#FFE066] text-center">
                  {count} STARS ALIGNED
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
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
