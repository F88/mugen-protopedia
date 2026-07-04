'use client';

/**
 * @fileoverview The Shifting Tides — a comparative yearly (per-year) trend of
 * the leading materials for The Alchemist's Table. A per-month counterpart would
 * live in a separate `materials-monthly-trend-section.tsx`.
 *
 * Unlike the per-material sparklines elsewhere on the page (Monumental,
 * Primordial, Rising Vapors, ...), this overlays the top materials on ONE shared
 * timeline so their relative rise and fall — crossovers, eclipses, neck-and-neck
 * rivalries — become visible. Recharts needs the DOM, so this is a client leaf;
 * the server passes plain serializable props (see `content.tsx`).
 */
import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { MonumentalEntry } from '@/lib/analysis/batch/build-material-insights';
import { cn } from '@/lib/utils';

import { RANK_COLORS } from './rank-colors';
import {
  SectionHeading,
  SectionNotes,
  type SectionCopy,
} from './section-heading';

interface MaterialsYearlyTrendSectionProps {
  materials: MonumentalEntry[];
  latestYear: number;
  copy: SectionCopy;
  /** How many of the top materials to overlay (default 20). */
  limit?: number;
}

/** Tooltip payload shape we rely on from Recharts. */
interface TrendTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: Array<{
    dataKey?: string | number;
    value?: number;
    color?: string;
  }>;
}

/** Tooltip listing that year's materials sorted by usage, high to low. */
function TrendTooltip({ active, label, payload }: TrendTooltipProps) {
  if (active !== true || payload == null || payload.length === 0) return null;
  const rows = payload
    .filter((p) => typeof p.value === 'number' && p.value > 0)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  if (rows.length === 0) return null;
  return (
    <div className="rounded-lg border border-violet-200 bg-white/95 px-3 py-2 text-xs shadow-lg dark:border-violet-400/20 dark:bg-violet-950/95">
      <div className="mb-1 font-semibold text-violet-900 dark:text-violet-100">
        {label}
      </div>
      <ul className="space-y-0.5">
        {rows.map((p) => (
          <li key={String(p.dataKey)} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-violet-800 dark:text-violet-200">
              {p.dataKey}
            </span>
            <span className="ml-auto font-mono text-violet-900 dark:text-violet-100">
              {p.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The Shifting Tides — leading materials overlaid on one yearly timeline. */
export function MaterialsYearlyTrendSection({
  materials,
  latestYear,
  copy,
  limit = 20,
}: MaterialsYearlyTrendSectionProps) {
  const { top, chartData } = useMemo(() => {
    const top = materials.slice(0, limit);
    const seriesLen = top.reduce((max, m) => Math.max(max, m.series.length), 0);
    const firstYear = latestYear - seriesLen + 1;
    const chartData = Array.from({ length: seriesLen }, (_, i) => {
      const point: Record<string, string | number> = {
        year: String(firstYear + i),
      };
      for (const m of top) point[m.material] = m.series[i] ?? 0;
      return point;
    });
    return { top, chartData };
  }, [materials, limit, latestYear]);

  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);

  const toggle = (material: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(material)) next.delete(material);
      else next.add(material);
      return next;
    });
  };

  return (
    <section aria-labelledby="shifting-tides-heading" className="mt-12">
      <SectionHeading id="shifting-tides-heading" copy={copy} />
      {top.length === 0 || chartData.length === 0 ? (
        <p className="text-sm text-violet-700/70 dark:text-violet-300/60">
          Not enough history to chart the tides.
        </p>
      ) : (
        <>
          <div
            className="w-full rounded-xl border border-violet-200/60 bg-white/40 p-3 dark:border-violet-400/15 dark:bg-violet-950/30"
            style={{ height: 400 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="year"
                  stroke="#8b5cf6"
                  fontSize={12}
                  tickMargin={8}
                />
                <YAxis
                  stroke="#8b5cf6"
                  fontSize={12}
                  width={32}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<TrendTooltip />}
                  cursor={{ stroke: '#a78bfa', strokeWidth: 1 }}
                />
                {top.map((m, i) => {
                  const color = RANK_COLORS[i % RANK_COLORS.length];
                  return (
                    <Line
                      key={m.material}
                      type="monotone"
                      dataKey={m.material}
                      stroke={color}
                      strokeWidth={hovered === m.material ? 3.5 : 2}
                      strokeOpacity={
                        hovered != null && hovered !== m.material ? 0.15 : 1
                      }
                      hide={hidden.has(m.material)}
                      dot={false}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {top.map((m, i) => {
              const color = RANK_COLORS[i % RANK_COLORS.length];
              const isHidden = hidden.has(m.material);
              return (
                <button
                  key={m.material}
                  type="button"
                  onClick={() => toggle(m.material)}
                  onMouseEnter={() => setHovered(m.material)}
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
                    {m.material}
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
