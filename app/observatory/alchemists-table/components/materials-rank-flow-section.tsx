'use client';

/**
 * @fileoverview The Fire of Prometheus — a rank-flow (bump) chart of how the leading
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
  Line,
  LineChart,
  ResponsiveContainer,
  Text,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { PeriodTopMaterial } from '@/lib/observatory/alchemists-table/build-material-insights';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
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

/** Truncate long material names to `max` characters (…-suffixed) for labels. */
function shortLabel(material: string, max = 99): string {
  return material.length > max ? `${material.slice(0, max - 1)}…` : material;
}

/** The Shifting Tides — leading materials trading ranks, by year or month. */
export function MaterialsRankFlowSection({
  yearly,
  monthly,
  copy,
  monthlyWindow = 36,
  defaultTop = 10,
}: MaterialsRankFlowSectionProps) {
  const [granularity, setGranularity] = useState<Granularity>('year');
  const [topN, setTopN] = useState<TopOption>(defaultTop);
  const [range, setRange] = useState<[number, number] | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);

  // Below Tailwind's `sm` breakpoint (< 640px): drop the right-side rank labels
  // and reclaim their width; the bottom legend still identifies each line.
  // (recharts `width`/`tick` are JS props, so this needs a media query rather
  // than a Tailwind `sm:` class.)
  const isNarrow = useMediaQuery('(max-width: 639.98px)');

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

  const { periods, lines, chartData, colorOf } = useMemo(() => {
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

    return { periods, lines, chartData, colorOf };
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

  // Give each rank room by scaling height with depth:
  // 10 -> 400px (x1), 20 -> 600px (x1.5), 30 -> 800px (x2).
  const chartHeight = 400 * (1 + (topN - 10) / 20);

  // Right axis width (narrow / wide); the label wraps within it.
  const yAxisWidth = isNarrow ? 60 : 160;
  // const yAxisWidth = isNarrow ? 250 : 316;
  const labelWidth = yAxisWidth - 12;

  // Right-side Y-axis ticks double as an interactive legend: the material at
  // each rank (from the end period), coloured to match its line, hoverable and
  // clickable. Replaces the per-line end labels; the bottom legend is kept.
  // The name wraps (recharts `<Text>`) to fit `labelWidth`.
  const renderRankTick = (props: {
    x?: number | string;
    y?: number | string;
    payload?: { value?: number };
  }) => {
    const rank = props.payload?.value;
    const material = rank == null ? undefined : lines[rank - 1];
    if (material == null) return <g />;
    const color = colorOf.get(material) ?? RANK_COLORS[0];
    const isHidden = hidden.has(material);
    const dimmed = hovered != null && hovered !== material;
    return (
      <g transform={`translate(${props.x},${props.y})`}>
        <Text
          x={isNarrow ? 4 : 8}
          y={0}
          width={labelWidth}
          verticalAnchor="middle"
          textAnchor="start"
          fontSize={isNarrow ? 10 : 12}
          // fontWeight={hovered === material ? 700 : 500}
          fill={color}
          opacity={isHidden ? 0.35 : dimmed ? 0.3 : 1}
          style={{
            cursor: 'pointer',
            textDecoration: isHidden ? 'line-through' : 'none',
          }}
          onMouseEnter={() => setHovered(material)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => toggle(material)}
        >
          {shortLabel(material, isNarrow ? 999 : 999)}
        </Text>
      </g>
    );
  };

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
        <div className="flex min-w-55 flex-1 items-center gap-2">
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
              '**:data-[slot=slider-track]:bg-violet-200/70',
              'dark:**:data-[slot=slider-track]:bg-violet-900/50',
              '**:data-[slot=slider-range]:bg-violet-500',
              '**:data-[slot=slider-thumb]:border-violet-500!',
              '**:data-[slot=slider-thumb]:ring-violet-400/40',
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
          <div
            className="w-full rounded-xl border border-violet-200/60 bg-white/40 p-3 dark:border-violet-400/15 dark:bg-violet-950/30"
            style={{ height: chartHeight }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 12, right: 4, left: 16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.3}
                  horizontal={false}
                />
                <XAxis
                  dataKey="period"
                  stroke="#8b5cf6"
                  fontSize={12}
                  tickMargin={8}
                  minTickGap={24}
                />
                <YAxis
                  reversed
                  domain={[1, topN]}
                  ticks={Array.from({ length: topN }, (_, i) => i + 1)}
                  orientation="right"
                  width={yAxisWidth}
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                  tick={renderRankTick}
                />
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
                      // type="step"
                      // type="linear"
                      type="monotone"
                      dataKey={m}
                      stroke={color}
                      strokeWidth={hovered === m ? 3.5 : 2}
                      strokeOpacity={dimmed ? 0.1 : 1}
                      connectNulls={false}
                      hide={isHidden}
                      dot={{
                        r: isNarrow ? 3 : 6,
                        strokeWidth: 0,
                        fill: color,
                      }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={false}
                    />
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
