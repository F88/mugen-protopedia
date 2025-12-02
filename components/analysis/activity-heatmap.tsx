import { cn } from '@/lib/utils';

type ColorScheme = 'green' | 'orange' | 'purple';

type ActivityHeatmapProps = {
  heatmap: number[][];
  className?: string;
  colorScheme?: ColorScheme;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const COLOR_MAP: Record<
  ColorScheme,
  {
    level1: string;
    level2: string;
    level3: string;
    level4: string;
  }
> = {
  green: {
    level1: 'bg-green-200 dark:bg-green-900/40',
    level2: 'bg-green-300 dark:bg-green-800/60',
    level3: 'bg-green-400 dark:bg-green-700/80',
    level4: 'bg-green-500 dark:bg-green-600',
  },
  orange: {
    level1: 'bg-orange-200 dark:bg-orange-900/40',
    level2: 'bg-orange-300 dark:bg-orange-800/60',
    level3: 'bg-orange-400 dark:bg-orange-700/80',
    level4: 'bg-orange-500 dark:bg-orange-600',
  },
  purple: {
    level1: 'bg-purple-200 dark:bg-purple-900/40',
    level2: 'bg-purple-300 dark:bg-purple-800/60',
    level3: 'bg-purple-400 dark:bg-purple-700/80',
    level4: 'bg-purple-500 dark:bg-purple-600',
  },
};

export function ActivityHeatmap({
  heatmap,
  className,
  colorScheme = 'green',
}: ActivityHeatmapProps) {
  // Find max value for scaling colors
  const maxCount = Math.max(...heatmap.flat());
  const colors = COLOR_MAP[colorScheme];

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (maxCount === 0) return 'bg-gray-100 dark:bg-gray-800';

    const ratio = count / maxCount;
    if (ratio < 0.25) return colors.level1;
    if (ratio < 0.5) return colors.level2;
    if (ratio < 0.75) return colors.level3;
    return colors.level4;
  };

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <div className="min-w-[300px] p-2 sm:p-4">
        <div className="flex">
          {/* Y-axis labels (Days) */}
          <div className="flex flex-col justify-between pr-2 pt-6 pb-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            {DAYS.map((day) => (
              <div key={day} className="h-3 leading-3">
                {day}
              </div>
            ))}
          </div>

          <div className="flex-1">
            {/* X-axis labels (Hours) */}
            <div className="flex justify-between pb-2 pl-px text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              {HOURS.filter((h) => h % 3 === 0).map((hour) => (
                <div key={hour} className="w-4 text-center sm:w-8">
                  {hour}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex flex-col gap-1">
              {heatmap.map((dayData, dayIndex) => (
                <div key={DAYS[dayIndex]} className="flex gap-0.5 sm:gap-1">
                  {dayData.map((count, hour) => (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className={cn(
                        'h-3 flex-1 rounded-sm transition-colors hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-500',
                        getColorClass(count),
                      )}
                      title={`${DAYS[dayIndex]} ${hour}:00 - ${count} prototypes`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
            <div className={cn('h-3 w-3 rounded-sm', colors.level1)} />
            <div className={cn('h-3 w-3 rounded-sm', colors.level2)} />
            <div className={cn('h-3 w-3 rounded-sm', colors.level3)} />
            <div className={cn('h-3 w-3 rounded-sm', colors.level4)} />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
