import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PrototypeForMpp } from '@/lib/api/prototypes';
import type { HelloWorldInsights } from '@/lib/observatory/hello-world/build-hello-world-insights';

/**
 * Verifies the Hello World memoization in {@link AnalysisRepository} keys on the
 * dataset generation (`lastFetchedAt`), NOT on `data.length`. A same-count
 * content change advances the generation and MUST invalidate the memo — the bug
 * the length-only key had.
 */
const mocks = vi.hoisted(() => ({
  getAllPrototypes: vi.fn(),
  buildHelloWorldInsights: vi.fn(),
}));

vi.mock('@/app/actions/prototypes-gateway', () => ({
  getAllPrototypes: mocks.getAllPrototypes,
}));

vi.mock('@/lib/observatory/hello-world/build-hello-world-insights', () => ({
  buildHelloWorldInsights: mocks.buildHelloWorldInsights,
}));

import { analysisRepository } from '@/lib/repositories/analysis-repository';

/** N minimal prototypes; content is irrelevant because the builder is mocked. */
const dataset = (n: number): PrototypeForMpp[] =>
  Array.from({ length: n }, () => ({}) as PrototypeForMpp);

const okResult = (data: PrototypeForMpp[], lastFetchedAt: Date) => ({
  ok: true as const,
  data,
  lastFetchedAt,
});

describe('AnalysisRepository.getHelloWorldAnalysis memoization', () => {
  beforeEach(() => {
    mocks.getAllPrototypes.mockReset();
    mocks.buildHelloWorldInsights.mockReset();
    mocks.buildHelloWorldInsights.mockImplementation(
      () => ({ marker: 'insights' }) as unknown as HelloWorldInsights,
    );
  });

  it('reuses the memo while the fetch generation is unchanged', async () => {
    const gen = new Date('2026-07-14T00:00:00Z');
    const data = dataset(3);
    mocks.getAllPrototypes.mockResolvedValue(okResult(data, gen));

    await analysisRepository.getHelloWorldAnalysis();
    await analysisRepository.getHelloWorldAnalysis();

    // Same lastFetchedAt on both calls -> build runs once.
    expect(mocks.buildHelloWorldInsights).toHaveBeenCalledTimes(1);
  });

  it('recomputes when the generation changes even if the count is identical', async () => {
    // Prime the memo with generation T1 (3 prototypes).
    const t1 = new Date('2026-07-14T00:00:00Z');
    mocks.getAllPrototypes.mockResolvedValue(okResult(dataset(3), t1));
    await analysisRepository.getHelloWorldAnalysis();
    const callsAfterPrime = mocks.buildHelloWorldInsights.mock.calls.length;

    // A same-count content change advances the generation to T2. A length-only
    // key would wrongly serve the stale memo here; the generation key must not.
    const t2 = new Date('2026-07-14T01:00:00Z');
    mocks.getAllPrototypes.mockResolvedValue(okResult(dataset(3), t2));
    await analysisRepository.getHelloWorldAnalysis();

    expect(mocks.buildHelloWorldInsights.mock.calls.length).toBe(
      callsAfterPrime + 1,
    );
  });

  it('recomputes when the JST day changes even if the generation is unchanged', async () => {
    // Same dataset generation on both calls, but `now` rolls over to the next
    // JST day. Streak / anniversary-candidate windows are date-relative, so the
    // memo must recompute rather than serve yesterday's daily metrics.
    const gen = new Date('2026-07-20T00:00:00Z');
    mocks.getAllPrototypes.mockResolvedValue(okResult(dataset(3), gen));

    const day1 = new Date('2026-07-20T03:00:00Z'); // JST 2026-07-20 12:00
    const day2 = new Date('2026-07-21T03:00:00Z'); // JST 2026-07-21 12:00

    await analysisRepository.getHelloWorldAnalysis(day1);
    const callsAfterDay1 = mocks.buildHelloWorldInsights.mock.calls.length;
    await analysisRepository.getHelloWorldAnalysis(day2);

    expect(mocks.buildHelloWorldInsights.mock.calls.length).toBe(
      callsAfterDay1 + 1,
    );
  });
});
