/**
 * Benchmark assorted prototype-sorting strategies using data exported from the Protopedia API.
 *
 * Run via `NODE_OPTIONS=--expose-gc npx tsx tools/benchmark-prototype-sort.ts <file>
 * [--iterations <count>]` to compare the runtime characteristics and memory usage of different
 * Array sorting approaches while ensuring they produce stable, ascending order by prototype id.
 */
import { readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { ResultOfListPrototypesApiResponse } from 'protopedia-api-v2-client';
import { sortPrototypesById as appSortPrototypesById } from '../lib/utils/prototype-utils';

type PrototypeRecord = ResultOfListPrototypesApiResponse;
type PrototypeWithId = { id?: number | null };
type SortDirection = 'asc' | 'desc';

type MemoryUsageSnapshot = ReturnType<typeof process.memoryUsage>;

type MemorySample = {
  before: MemoryUsageSnapshot;
  after: MemoryUsageSnapshot;
};

type MemorySummary = {
  peakHeapUsed: number;
  peakRss: number;
  averageDeltaHeapUsed: number;
  maxDeltaHeapUsed: number;
  minDeltaHeapUsed: number;
};

/**
 * Invoke the garbage collector when Node is started with --expose-gc.
 */
const runGarbageCollectorIfAvailable = () => {
  const maybeGc = (globalThis as { gc?: () => void }).gc;
  if (typeof maybeGc === 'function') {
    maybeGc();
  }
};

/**
 * Capture the current process memory usage snapshot.
 * @returns Current memory usage values reported by Node.
 */
const captureMemoryUsage = (): MemoryUsageSnapshot => {
  return process.memoryUsage();
};

/**
 * Human readable formatting for byte sizes.
 * @param bytes Raw byte count that may be negative when memory is released.
 * @returns Formatted string with appropriate unit.
 */
const formatBytes = (bytes: number): string => {
  const sign = bytes < 0 ? '-' : '';
  const absoluteValue = Math.abs(bytes);
  if (absoluteValue === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.max(
    0,
    Math.min(Math.floor(Math.log10(absoluteValue) / 3), units.length - 1),
  );
  const scaled = absoluteValue / 1000 ** index;
  const formatted =
    scaled >= 100
      ? scaled.toFixed(0)
      : scaled >= 10
        ? scaled.toFixed(1)
        : scaled.toFixed(2);
  return `${sign}${formatted} ${units[index]}`;
};

/**
 * Build summary statistics for a series of memory usage samples.
 * @param samples Memory measurements collected across benchmark iterations.
 * @returns Aggregated peak and delta values for reporting.
 */
const summarizeMemorySamples = (samples: MemorySample[]): MemorySummary => {
  if (samples.length === 0) {
    return {
      peakHeapUsed: 0,
      peakRss: 0,
      averageDeltaHeapUsed: 0,
      maxDeltaHeapUsed: 0,
      minDeltaHeapUsed: 0,
    };
  }

  let peakHeapUsed = 0;
  let peakRss = 0;
  let maxDeltaHeapUsed = Number.NEGATIVE_INFINITY;
  let minDeltaHeapUsed = Number.POSITIVE_INFINITY;
  let deltaHeapUsedTotal = 0;

  for (const sample of samples) {
    const { before, after } = sample;
    peakHeapUsed = Math.max(peakHeapUsed, after.heapUsed);
    peakRss = Math.max(peakRss, after.rss);
    const deltaHeapUsed = after.heapUsed - before.heapUsed;
    maxDeltaHeapUsed = Math.max(maxDeltaHeapUsed, deltaHeapUsed);
    minDeltaHeapUsed = Math.min(minDeltaHeapUsed, deltaHeapUsed);
    deltaHeapUsedTotal += deltaHeapUsed;
  }

  return {
    peakHeapUsed,
    peakRss,
    averageDeltaHeapUsed: deltaHeapUsedTotal / samples.length,
    maxDeltaHeapUsed,
    minDeltaHeapUsed,
  };
};

/**
 * Normalize a prototype identifier to a comparable numeric value.
 * @param value Raw identifier value that may be numeric or string-like.
 * @returns Finite numeric representation or +Infinity for missing ids.
 */
const normalizePrototypeId = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) {
    return numericValue;
  }

  return Number.POSITIVE_INFINITY;
};

/**
 * Compare two prototype-like records by their identifiers.
 * @param left First record to compare.
 * @param right Second record to compare.
 * @returns Negative when left < right, positive when left > right, else zero.
 */
const comparePrototypeIds = <T extends PrototypeWithId>(
  left: T,
  right: T,
  direction: SortDirection = 'asc',
): number => {
  const diff = normalizePrototypeId(left.id) - normalizePrototypeId(right.id);
  return direction === 'asc' ? diff : -diff;
};

/**
 * Return a new array sorted by prototype id without mutating the input.
 * @param records Records to sort.
 * @returns Sorted clone of the provided records.
 */
const localSortPrototypesById = <T extends PrototypeWithId>(
  records: T[],
  direction: SortDirection = 'asc',
): T[] => {
  return records
    .slice()
    .sort((left, right) => comparePrototypeIds(left, right, direction));
};

type SortStrategy = {
  name: string;
  description: string;
  run: (
    records: PrototypeRecord[],
    direction: SortDirection,
  ) => PrototypeRecord[];
};

type BenchmarkResult = {
  strategy: SortStrategy;
  durations: number[];
  sortedSample: PrototypeRecord[];
  memorySamples: MemorySample[];
  direction: SortDirection;
};

type ParsedArguments = {
  filePath?: string;
  iterations: number;
  helpRequested: boolean;
};

// const DEFAULT_ITERATIONS = 5;
const DEFAULT_ITERATIONS = 20;

const countFormatter = new Intl.NumberFormat();
const durationFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatDurationMs = (durationMs: number) =>
  durationFormatter.format(Math.round(durationMs));

const formatCount = (count: number) => countFormatter.format(count);

const strategies: SortStrategy[] = [
  {
    name: 'nativeSort',
    description:
      'In-place Array.prototype.sort on a shallow copy using comparePrototypeIds',
    run: (records, direction) => {
      records.sort((left, right) =>
        comparePrototypeIds(left, right, direction),
      );
      return records;
    },
  },
  {
    name: 'spreadSort',
    description: 'Clone via spread before sorting to emphasize copy cost',
    run: (records, direction) => {
      return [...records].sort((left, right) =>
        comparePrototypeIds(left, right, direction),
      );
    },
  },
  {
    name: 'toSorted',
    description:
      'Use Array.prototype.toSorted when available (falls back to slice+sort)',
    run: (records, direction) => {
      if (typeof records.toSorted === 'function') {
        return records.toSorted((left, right) =>
          comparePrototypeIds(left, right, direction),
        );
      }

      return records
        .slice()
        .sort((left, right) => comparePrototypeIds(left, right, direction));
    },
  },
  {
    name: 'decorateSortUndecorate',
    description:
      'Schwartzian transform: decorate with normalized ids, sort, then undecorate',
    run: (records, direction) => {
      const directionFactor = direction === 'asc' ? 1 : -1;
      const decorated = records.map((record, index) => ({
        key: normalizePrototypeId(record.id),
        index,
        record,
      }));

      decorated.sort((left, right) => {
        const diff = (left.key - right.key) * directionFactor;
        if (diff !== 0) {
          return diff;
        }

        return left.index - right.index;
      });

      return decorated.map((entry) => entry.record);
    },
  },
  {
    name: 'localSortPrototypesById',
    description:
      'Local helper that clones before sorting with comparePrototypeIds',
    run: (records, direction) => {
      return localSortPrototypesById(records, direction);
    },
  },
  {
    name: 'appSortPrototypesById',
    description: 'sort-utils implementation used in the application',
    run: (records, direction) => {
      return appSortPrototypesById<ResultOfListPrototypesApiResponse>(
        records,
        direction,
      );
    },
  },
];

/**
 * Parse CLI arguments into strongly typed benchmark options.
 * @param argv Argument vector excluding node and script entries.
 * @returns Parsed arguments including file path and iteration count.
 */
const parseArguments = (argv: string[]): ParsedArguments => {
  let filePath: string | undefined;
  let iterations = DEFAULT_ITERATIONS;
  let helpRequested = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      helpRequested = true;
      continue;
    }

    if (arg.startsWith('--iterations=')) {
      const value = arg.split('=', 2)[1];
      iterations = parseIterations(value);
      continue;
    }

    if (arg === '--iterations' || arg === '-n') {
      const value = argv[index + 1];
      if (value === undefined) {
        throw new Error('Expected a numeric value after --iterations or -n');
      }

      iterations = parseIterations(value);
      index += 1;
      continue;
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (!filePath) {
      filePath = arg;
      continue;
    }

    throw new Error(`Unexpected extra argument: ${arg}`);
  }

  return { filePath, iterations, helpRequested };
};

/**
 * Validate the iterations flag and coerce it to a positive integer.
 * @param value Raw iterations value from CLI input.
 * @returns Rounded-down positive iteration count.
 */
const parseIterations = (value: string): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid iterations value: ${value}`);
  }

  return Math.floor(parsed);
};

const printUsage = () => {
  console.log(
    'Usage: node benchmark-prototype-sort.js <path-to-json> [--iterations <count>]',
  );
};

/**
 * Execute a single strategy repeatedly and capture timing and memory statistics.
 * @param strategy Sorting strategy to benchmark.
 * @param sourceRecords Input records that remain untouched.
 * @param iterations Number of times to run the strategy.
 * @returns Benchmark result with durations, memory samples, and a sample output.
 */
const runBenchmark = (
  strategy: SortStrategy,
  sourceRecords: PrototypeRecord[],
  direction: SortDirection,
  iterations: number,
): BenchmarkResult => {
  const durations: number[] = [];
  const memorySamples: MemorySample[] = [];
  let sortedSample: PrototypeRecord[] = [];

  for (let index = 0; index < iterations; index += 1) {
    runGarbageCollectorIfAvailable();
    const before = captureMemoryUsage();
    const input = sourceRecords.slice();
    const start = performance.now();
    sortedSample = strategy.run(input, direction);
    durations.push(performance.now() - start);
    const after = captureMemoryUsage();
    memorySamples.push({ before, after });
  }

  return { strategy, durations, sortedSample, memorySamples, direction };
};

/**
 * Ensure the provided records are ordered by id in ascending order.
 * @param records Sorted records to validate.
 * @param strategyName Strategy name for error context.
 */
const assertSortedById = (
  records: PrototypeRecord[],
  strategyName: string,
  direction: SortDirection,
) => {
  for (let index = 1; index < records.length; index += 1) {
    const previousId = normalizePrototypeId(records[index - 1].id);
    const currentId = normalizePrototypeId(records[index].id);
    const isOutOfOrder =
      direction === 'asc' ? previousId > currentId : previousId < currentId;
    if (isOutOfOrder) {
      throw new Error(
        `${strategyName} (${direction}) produced an unsorted result at positions ${index - 1} and ${index}`,
      );
    }
  }
};

/**
 * Collect a comparable signature of normalized ids from sorted records.
 * @param records Records returned by a sorting strategy.
 * @returns Array of numeric ids used for equality checks.
 */
const collectIdSignature = (records: PrototypeRecord[]): number[] => {
  return records.map((record) => normalizePrototypeId(record.id));
};

/**
 * Compare two id signatures for strict equality.
 * @param expected Baseline signature.
 * @param actual Signature produced by a subsequent strategy.
 * @returns True when both signatures match entry-by-entry.
 */
const signaturesMatch = (expected: number[], actual: number[]): boolean => {
  if (expected.length !== actual.length) {
    return false;
  }

  for (let index = 0; index < expected.length; index += 1) {
    if (expected[index] !== actual[index]) {
      return false;
    }
  }

  return true;
};

/**
 * Summarize a list of duration samples into aggregate metrics.
 * @param durations Timing samples collected for a strategy.
 * @returns Total, min, max, and average durations.
 */
const summarizeDurations = (durations: number[]) => {
  const total = durations.reduce((sum, value) => sum + value, 0);
  const min = durations.reduce(
    (current, value) => Math.min(current, value),
    Number.POSITIVE_INFINITY,
  );
  const max = durations.reduce(
    (current, value) => Math.max(current, value),
    Number.NEGATIVE_INFINITY,
  );
  const average = total / durations.length;

  return {
    total,
    min,
    max,
    average,
  };
};

/**
 * Emit a formatted summary of the benchmark result.
 * @param result Strategy benchmark result to display.
 * @param iterationCount Number of iterations executed.
 * @param recordCount Records processed per iteration.
 */
const logBenchmarkResult = (
  result: BenchmarkResult,
  iterationCount: number,
  recordCount: number,
) => {
  const { total, min, max, average } = summarizeDurations(result.durations);
  const memorySummary = summarizeMemorySamples(result.memorySamples);

  console.log(`\n${result.strategy.name} (${result.direction})`);
  console.log(`  description: ${result.strategy.description}`);
  console.log(`  iterations: ${formatCount(iterationCount)}`);
  console.log(`  records per iteration: ${formatCount(recordCount)}`);
  console.log(`  total: ${formatDurationMs(total)}ms`);
  console.log(`  average: ${formatDurationMs(average)}ms`);
  console.log(`  min: ${formatDurationMs(min)}ms`);
  console.log(`  max: ${formatDurationMs(max)}ms`);
  console.log(`  peak heapUsed: ${formatBytes(memorySummary.peakHeapUsed)}`);
  console.log(`  peak rss: ${formatBytes(memorySummary.peakRss)}`);
  console.log(
    `  avg ΔheapUsed: ${formatBytes(memorySummary.averageDeltaHeapUsed)} (max ${formatBytes(memorySummary.maxDeltaHeapUsed)}, min ${formatBytes(memorySummary.minDeltaHeapUsed)})`,
  );
};

/**
 * Entry point for the benchmark CLI, orchestrating parsing and execution.
 */
const main = async () => {
  const args = parseArguments(process.argv.slice(2));

  if (args.helpRequested) {
    printUsage();
    return;
  }

  if (!args.filePath) {
    printUsage();
    throw new Error('JSON file path is required.');
  }

  const gcAvailable =
    typeof (globalThis as { gc?: () => void }).gc === 'function';
  if (!gcAvailable) {
    console.warn(
      'GC is not exposed; memory stats may be noisy. Use NODE_OPTIONS=--expose-gc.',
    );
  }

  const resolvedPath = resolve(process.cwd(), args.filePath);
  const raw = await readFile(resolvedPath, 'utf8');

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Failed to parse JSON from ${args.filePath}: ${(error as Error).message}`,
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error(
      'Expected the JSON file to contain an array of prototypes.',
    );
  }

  const prototypes = parsed as PrototypeRecord[];
  if (prototypes.length === 0) {
    throw new Error('The provided JSON array is empty.');
  }

  console.log(
    `Benchmarking ${formatCount(prototypes.length)} prototypes from ${relative(
      process.cwd(),
      resolvedPath,
    )} (${formatCount(args.iterations)} iterations per strategy)...`,
  );

  const directions: SortDirection[] = ['asc', 'desc'];

  for (const direction of directions) {
    console.log(`\n=== direction: ${direction} ===`);
    let expectedSignature: number[] | undefined;

    for (const strategy of strategies) {
      const result = runBenchmark(
        strategy,
        prototypes,
        direction,
        args.iterations,
      );

      assertSortedById(result.sortedSample, strategy.name, direction);

      const signature = collectIdSignature(result.sortedSample);
      if (!expectedSignature) {
        expectedSignature = signature;
      } else if (!signaturesMatch(expectedSignature, signature)) {
        throw new Error(
          `${strategy.name} (${direction}) produced a different ordering than the baseline.`,
        );
      }

      logBenchmarkResult(result, args.iterations, prototypes.length);
    }

    const firstStrategy = strategies[0];
    console.log(
      `\nBaseline order established by ${firstStrategy.name} (${direction}); verified ${formatCount(
        prototypes.length,
      )} entries are identically ordered across strategies.`,
    );
  }
};

const isExecutedDirectly = (() => {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }

  return import.meta.url === pathToFileURL(entry).href;
})();

if (isExecutedDirectly) {
  void (async () => {
    try {
      await main();
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  })();
}
