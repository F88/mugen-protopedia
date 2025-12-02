'use client';

import { useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { IconTool } from '../../shared/icons';
import { helloWorldTheme } from '../theme';
import { ObservatorySection } from './observatory-section';

type GatewayDrugTrendSectionProps = {
  topMaterials: { material: string; count: number }[];
  yearlyTopMaterials: Record<number, { material: string; count: number }[]>;
};

const CHART_COLORS = [
  '#84cc16', // lime-500
  '#10b981', // emerald-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#d946ef', // fuchsia-500
  '#f43f5e', // rose-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#64748b', // slate-500
];

export function GatewayDrugTrendSection({
  topMaterials,
  yearlyTopMaterials,
}: GatewayDrugTrendSectionProps) {
  const [hoveredMaterial, setHoveredMaterial] = useState<string | null>(null);

  // 1. Identify target materials: Top 10 Overall + Top 10 from the Latest Year
  const years = Object.keys(yearlyTopMaterials)
    .map(Number)
    .sort((a, b) => a - b); // Ascending for chart

  const latestYear = years[years.length - 1];
  const latestYearMaterials =
    yearlyTopMaterials[latestYear]?.slice(0, 10).map((m) => m.material) || [];
  const overallTopMaterials = topMaterials.slice(0, 10).map((m) => m.material);

  // Merge and deduplicate
  const targetMaterials = Array.from(
    new Set([...overallTopMaterials, ...latestYearMaterials]),
  );

  // 2. Transform data for Recharts
  // Format: [{ year: 2020, 'Unity': 10, 'Arduino': 5 }, ...]
  const chartData = years.map((year) => {
    const yearData = yearlyTopMaterials[year] || [];
    const dataPoint: Record<string, string | number> = {
      year: year.toString(),
    };

    targetMaterials.forEach((material) => {
      const found = yearData.find((m) => m.material === material);
      dataPoint[material] = found ? found.count : 0;
    });

    return dataPoint;
  });

  const handleLegendMouseEnter = (o: { dataKey?: unknown }) => {
    if (typeof o.dataKey === 'string') {
      setHoveredMaterial(o.dataKey);
    }
  };

  const handleLegendMouseLeave = () => {
    setHoveredMaterial(null);
  };

  return (
    <ObservatorySection
      theme={helloWorldTheme.sections.gatewayDrug.theme}
      icon={<IconTool />}
      title="The Gateway Drug Trend"
      description="Trends change, tools evolve. See how the preferred prototyping materials have shifted over the years."
      sourceNote={
        <>
          <strong>Top 10 Materials/Tools</strong> (All Time & Latest Year)
          trends by release year.
        </>
      }
      visualContent={
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-lime-400/20 rounded-full animate-pulse opacity-20 duration-3000"></div>
          <div className="text-6xl filter drop-shadow-lg">📈</div>
        </div>
      }
      narrative={{
        title: (
          <>
            <span className="text-xl">📅</span> Era of Tools
          </>
        ),
        content: (
          <p>
            From physical computing to AI-assisted coding, the tools we use
            reflect the era we create in.
          </p>
        ),
      }}
      delay="delay-400"
    >
      <div className="h-[400px] w-full bg-white/50 dark:bg-black/20 rounded-xl p-4 border border-lime-100 dark:border-lime-800/30 gateway-drug-chart-container">
        <style jsx global>{`
          .gateway-drug-chart-container {
            --tooltip-bg: rgba(255, 255, 255, 0.95);
            --tooltip-border: #d9f99d; /* lime-200 */
            --tooltip-text: #3f6212; /* lime-800 */
            --tooltip-label: #365314; /* lime-900 */
          }
          @media (prefers-color-scheme: dark) {
            .gateway-drug-chart-container {
              --tooltip-bg: rgba(23, 23, 23, 0.95);
              --tooltip-border: rgba(54, 83, 20, 0.5); /* lime-900/50 */
              --tooltip-text: #ecfccb; /* lime-100 */
              --tooltip-label: #bef264; /* lime-200 */
            }
          }
          :global(.dark) .gateway-drug-chart-container {
            --tooltip-bg: rgba(23, 23, 23, 0.95);
            --tooltip-border: rgba(54, 83, 20, 0.5); /* lime-900/50 */
            --tooltip-text: #ecfccb; /* lime-100 */
            --tooltip-label: #bef264; /* lime-200 */
          }
        `}</style>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="year"
              stroke="#65a30d" // lime-600
              fontSize={12}
              tickMargin={10}
            />
            <YAxis
              stroke="#65a30d" // lime-600
              fontSize={12}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg)',
                borderRadius: '8px',
                border: '1px solid var(--tooltip-border)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                color: 'var(--tooltip-text)',
              }}
              itemStyle={{ fontSize: '12px', padding: '2px 0' }}
              labelStyle={{
                fontWeight: 'bold',
                marginBottom: '4px',
                color: 'var(--tooltip-label)',
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              onMouseEnter={handleLegendMouseEnter}
              onMouseLeave={handleLegendMouseLeave}
              formatter={(value) => (
                <span
                  className={`text-xs font-medium ml-1 transition-opacity duration-300 ${
                    hoveredMaterial && hoveredMaterial !== value
                      ? 'text-gray-300 dark:text-gray-700'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {value}
                </span>
              )}
            />
            {targetMaterials.map((material, index) => (
              <Line
                key={material}
                type="monotoneX"
                dataKey={material}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={hoveredMaterial === material ? 4 : 2}
                strokeOpacity={
                  hoveredMaterial && hoveredMaterial !== material ? 0.1 : 1
                }
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ObservatorySection>
  );
}
