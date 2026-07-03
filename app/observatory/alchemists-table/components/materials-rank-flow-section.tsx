'use client';

/**
 * @fileoverview The Shifting Tides — a rank-flow (bump) chart of how the leading
 * materials trade places over time, with year / month granularity and a
 * top-10 / 20 / 30 depth control.
 *
 * Each period's ranking is a TRUE per-period top list (see `yearlyTopMaterials` /
 * `monthlyTopMaterials` in `build-material-insights.ts`), aggregated
 * independently — so switching granularity is just switching the data source.
 * A line only exists in the periods where its material was in the top-N; a
 * crossing is an overtake, an entrance is a newcomer climbing in. Recharts needs
 * the DOM, so this is a client leaf fed plain serializable props.
 */
import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { PeriodTopMaterial } from '@/lib/analysis/batch/build-material-insights';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

import { RANK_COLORS } from './rank-colors';
import {
  SectionHeading,
  SectionNotes,
  type SectionCopy,
} from './section-heading';

type Granularity = 'year' | 'month';
const TOP_OPTIONS = [10, 20, 30] as const;
type TopOption = (typeof TOP_OPTIONS)[number];

interface MaterialsRankFlowSectionProps {
  yearly: Record<string, PeriodTopMaterial[]>;
  monthly: Record<string, PeriodTopMaterial[]>;
  copy: SectionCopy;
  /** Months shown in month mode (recent window, to tame rank jitter). */
  monthlyWindow?: number;
  /** Initial depth (top N). */
  defaultTop?: TopOption;
}

interface RankTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: Array<{
    dataKey?: string | number;
    value?: number;
    color?: string;
  }>;
}

/** Tooltip listing that period's standings, best rank first. */
function RankTooltip({ active, label, payload }: RankTooltipProps) {
  if (active !== true || payload == null || payload.length === 0) return null;
  const rows = payload
    .filter((p) => typeof p.value === 'number')
    .sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
  if (rows.length === 0) return null;
  return (
    <div className="rounded-lg border border-violet-200 bg-white/95 px-3 py-2 text-xs shadow-lg dark:border-violet-400/20 dark:bg-violet-950/95">
      <div className="mb-1 font-semibold text-violet-900 dark:text-violet-100">
        {label}
      </div>
      <ul className="space-y-0.5">
        {rows.map((p) => (
          <li key={String(p.dataKey)} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-right font-mono text-violet-500 dark:text-violet-400">
              #{p.value}
            </span>
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-violet-800 dark:text-violet-200">
              {p.dataKey}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Truncate long material names used as end-of-line labels. */
function shortLabel(material: string): string {
  return material.length > 16 ? `${material.slice(0, 15)}…` : material;
}

/** The Shifting Tides — leading materials trading ranks, by year or month. */
export function MaterialsRankFlowSection({
  yearly,
  monthly,
  copy,
  monthlyWindow = 36,
  defaultTop = 20,
}: MaterialsRankFlowSectionProps) {
  const [granularity, setGranularity] = useState<Granularity>('year');
  const [topN, setTopN] = useState<TopOption>(defaultTop);
  const [range, setRange] = useState<[number, number] | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);

  const allPeriods = useMemo(
    () => Object.keys(granularity === 'year' ? yearly : monthly).sort(),
    [granularity, yearly, monthly],
  );
  const lastPos = Math.max(allPeriods.length - 1, 0);
  // Default span: all years, or the recent `monthlyWindow` months (tames jitter).
  const defaultStart =
    granularity === 'month' ? Math.max(0, lastPos - (monthlyWindow - 1)) : 0;
  // `range` (null = default) is the slider's FIRST/LAST period selection.
  const startPos = Math.min(range?.[0] ?? defaultStart, lastPos);
  const endPos = Math.min(range?.[1] ?? lastPos, lastPos);
  const startPeriod = allPeriods[startPos];
  const endPeriod = allPeriods[endPos];

  const changeGranularity = (g: Granularity) => {
    setGranularity(g);
    setRange(null); // year/month indices differ — reset the span to its default
  };

  const { periods, lines, chartData, labelEnd, colorOf } = useMemo(() => {
    const dataset = granularity === 'year' ? yearly : monthly;
    const periods = allPeriods.slice(startPos, endPos + 1);

    // Lines = the LAST (end) period's top-N materials, traced back across the
    // span. The union of every period's top-N explodes (~100 lines over many
    // years); this keeps it to N and tells "how the leaders at the end of the
    // span got there". A line gaps out where its material was not in the top-N.
    const lines = (dataset[endPeriod] ?? [])
      .slice(0, topN)
      .map((e) => e.material);
    const colorOf = new Map<string, string>();
    lines.forEach((m, i) =>
      colorOf.set(m, RANK_COLORS[i % RANK_COLORS.length]),
    );

    const chartData = periods.map((p) => {
      const point: Record<string, string | number | null> = { period: p };
      const ranked = (dataset[p] ?? []).slice(0, topN);
      const rankOf = new Map(ranked.map((e, i) => [e.material, i + 1]));
      for (const m of lines) point[m] = rankOf.get(m) ?? null;
      return point;
    });

    const labelEnd: Record<string, number> = {};
    for (const m of lines) {
      let last = -1;
      for (let i = 0; i < chartData.length; i++) {
        if (chartData[i][m] != null) last = i;
      }
      labelEnd[m] = last;
    }

    return { periods, lines, chartData, labelEnd, colorOf };
  }, [
    yearly,
    monthly,
    granularity,
    topN,
    allPeriods,
    startPos,
    endPos,
    endPeriod,
  ]);

  const toggle = (material: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(material)) next.delete(material);
      else next.add(material);
      return next;
    });
  };

  const controlBtn = (active: boolean) =>
    cn(
      'rounded-md px-2.5 py-1 text-xs font-medium transition',
      active
        ? 'bg-violet-600 text-white dark:bg-violet-500'
        : 'bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:hover:bg-violet-900/60',
    );

  return (
    <section aria-labelledby="rank-flow-heading" className="mt-12">
      <SectionHeading id="rank-flow-heading" copy={copy} />

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-violet-700/70 dark:text-violet-300/60">
            By
          </span>
          <button
            type="button"
            onClick={() => changeGranularity('year')}
            className={controlBtn(granularity === 'year')}
          >
            Year
          </button>
          <button
            type="button"
            onClick={() => changeGranularity('month')}
            className={controlBtn(granularity === 'month')}
          >
            Month
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-violet-700/70 dark:text-violet-300/60">
            Top
          </span>
          {TOP_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setTopN(n)}
              className={controlBtn(topN === n)}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex min-w-[220px] flex-1 items-center gap-2">
          <span className="w-14 shrink-0 text-right font-mono text-xs font-semibold text-violet-800 dark:text-violet-200">
            {startPeriod}
          </span>
          <Slider
            min={0}
            max={lastPos}
            value={[startPos, endPos]}
            onValueChange={(v) => setRange([v[0], v[1]])}
            minStepsBetweenThumbs={1}
            aria-label="First and last period"
            className={cn(
              'flex-1',
              // Violet-theme the shadcn slider from the consumer side (track /
              // range are backgrounds; the thumb border needs `!` to beat the
              // global unlayered `* { border-color }` rule in globals.css).
              '[&_[data-slot=slider-track]]:bg-violet-200/70',
              'dark:[&_[data-slot=slider-track]]:bg-violet-900/50',
              '[&_[data-slot=slider-range]]:bg-violet-500',
              '[&_[data-slot=slider-thumb]]:border-violet-500!',
              '[&_[data-slot=slider-thumb]]:ring-violet-400/40',
            )}
          />
          <span className="w-14 shrink-0 font-mono text-xs font-semibold text-violet-800 dark:text-violet-200">
            {endPeriod}
          </span>
        </div>
      </div>

      {periods.length === 0 || lines.length === 0 ? (
        <p className="text-sm text-violet-700/70 dark:text-violet-300/60">
          Not enough history to chart the tides.
        </p>
      ) : (
        <>
          <div className="h-[480px] w-full rounded-xl border border-violet-200/60 bg-white/40 p-3 dark:border-violet-400/15 dark:bg-violet-950/30">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 104, left: 16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.2}
                  horizontal={false}
                />
                <XAxis
                  dataKey="period"
                  stroke="#8b5cf6"
                  fontSize={12}
                  tickMargin={8}
                  minTickGap={24}
                />
                <YAxis reversed domain={[1, topN]} hide />
                <Tooltip
                  content={<RankTooltip />}
                  cursor={{ stroke: '#a78bfa', strokeWidth: 1 }}
                />
                {lines.map((m) => {
                  const color = colorOf.get(m) ?? RANK_COLORS[0];
                  const isHidden = hidden.has(m);
                  const dimmed = hovered != null && hovered !== m;
                  return (
                    <Line
                      key={m}
                      type="monotone"
                      dataKey={m}
                      stroke={color}
                      strokeWidth={hovered === m ? 3.5 : 2}
                      strokeOpacity={dimmed ? 0.1 : 1}
                      connectNulls={false}
                      hide={isHidden}
                      dot={{ r: 2.5, strokeWidth: 0, fill: color }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    >
                      <LabelList
                        dataKey={m}
                        content={(props) => {
                          const idx = Number(
                            (props as { index?: number }).index,
                          );
                          if (idx !== labelEnd[m]) return null;
                          const px = (props as { x?: number }).x;
                          const py = (props as { y?: number }).y;
                          if (px == null || py == null || dimmed) return null;
                          return (
                            <text
                              x={Number(px) + 8}
                              y={Number(py)}
                              dy={4}
                              fontSize={11}
                              fill={color}
                              fontWeight={hovered === m ? 700 : 500}
                            >
                              {shortLabel(m)}
                            </text>
                          );
                        }}
                      />
                    </Line>
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {lines.map((m) => {
              const color = colorOf.get(m) ?? RANK_COLORS[0];
              const isHidden = hidden.has(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggle(m)}
                  onMouseEnter={() => setHovered(m)}
                  onMouseLeave={() => setHovered(null)}
                  className={cn(
                    'flex items-center gap-1.5 text-xs transition',
                    isHidden ? 'opacity-40' : 'opacity-100',
                  )}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span
                    className={cn(
                      'text-violet-800 dark:text-violet-200',
                      isHidden && 'line-through',
                    )}
                  >
                    {m}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
      <SectionNotes notes={copy.notes} />
    </section>
  );
}
