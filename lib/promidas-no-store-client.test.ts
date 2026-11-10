import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchPrototypesViaPromidasNoStore } from './promidas-no-store-client';

describe('fetchPrototypesViaPromidasNoStore', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return 504 when the response body is not received within timeout', async () => {
    vi.useFakeTimers();

    // Return headers immediately, then keep the body pending until aborted
    fetchSpy.mockImplementation((_url: unknown, init: RequestInit) => {
      const response = new Response(null, { status: 200 });
      vi.spyOn(response, 'text').mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => {
              reject(init.signal?.reason);
            });
          }),
      );
      return Promise.resolve(response);
    });

    const promise = fetchPrototypesViaPromidasNoStore({ prototypeId: 1001 });

    await vi.advanceTimersByTimeAsync(31000);

    expect(await promise).toMatchObject({ ok: false, status: 504 });
  });

  it('should bypass the Next.js Data Cache', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ results: [] }), { status: 200 }),
    );

    await fetchPrototypesViaPromidasNoStore({ prototypeId: 1001 });

    expect(fetchSpy.mock.calls[0][1]).toMatchObject({
      cache: 'no-store',
      next: { revalidate: 0 },
    });
  });

  it('should not report a failure with a successful status', async () => {
    fetchSpy.mockResolvedValue(
      new Response('<html>maintenance</html>', { status: 200 }),
    );

    const result = await fetchPrototypesViaPromidasNoStore({
      prototypeId: 1001,
    });

    expect(result).toMatchObject({ ok: false, status: 503 });
  });
});
