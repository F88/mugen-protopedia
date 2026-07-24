export interface DashboardProps {
  prototypeCount: number;
  inFlightRequests: number;
  maxConcurrentFetches: number;
  size?: 'normal' | 'compact';
}

export const Dashboard = ({
  prototypeCount,
  // inFlightRequests,
  // maxConcurrentFetches,
  size = 'normal',
}: DashboardProps) => {
  const isCompact = size === 'compact';
  return (
    <div className="flex justify-center gap-1.5 sm:gap-2">
      {/* Prototypes */}
      <div
        className={
          'rounded border border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 transition-colors duration-200 ' +
          (isCompact ? 'px-2 py-1' : 'px-3 py-2')
        }
      >
        <span
          className={`font-semibold text-gray-900 dark:text-white ${
            isCompact ? 'text-sm' : 'text-lg'
          }`}
        >
          {/* The unit scales with the count (em), so no per-mode branch. */}
          {prototypeCount.toLocaleString()}
          <span className="text-[0.85em]"> P</span>
        </span>
      </div>

      {/* In-flight Requests */}
      {/* <div
        className={
          'hidden sm:block rounded border border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 transition-colors duration-200 ' +
          (isCompact ? 'px-2 py-1 text-sm' : 'px-3 py-2')
        }
      >
        <div
          className={
            isCompact
              ? 'text-base font-semibold text-gray-900 dark:text-white'
              : 'text-lg font-semibold text-gray-900 dark:text-white'
          }
        >
          {inFlightRequests.toLocaleString()} / {maxConcurrentFetches.toLocaleString()}
        </div>
      </div> */}
    </div>
  );
};
