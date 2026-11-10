import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
  protopediaForceCacheClient,
  protopediaNoStoreClient,
} from './protopedia-client';

describe('protopedia-client', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('timeout behavior', () => {
    describe('protopediaForceCacheClient (listPrototypes)', () => {
      it('should abort request when timeout is exceeded', async () => {
        vi.useFakeTimers();

        // Mock fetch to hang indefinitely but respect abort signal
        fetchSpy.mockImplementation((_url: unknown, init: RequestInit) => {
          return new Promise((_resolve, reject) => {
            const signal = init?.signal;
            if (signal) {
              if (signal.aborted) {
                reject(
                  new DOMException('This operation was aborted', 'AbortError'),
                );
                return;
              }
              signal.addEventListener('abort', () => {
                reject(
                  new DOMException('This operation was aborted', 'AbortError'),
                );
              });
            }
          });
        });

        // Start the request
        const promise = protopediaForceCacheClient.listPrototypes({
          limit: 1,
        });

        // Fast-forward time past the timeout (30s + buffer)
        vi.advanceTimersByTime(31000);

        // Expect the promise to reject with an AbortError
        await expect(promise).rejects.toThrow();

        // Verify that fetch was called with a signal
        expect(fetchSpy).toHaveBeenCalled();
        const callArgs = fetchSpy.mock.calls[0];
        const init = callArgs[1];
        expect(init).toHaveProperty('signal');
        expect(init.signal.aborted).toBe(true);
      });

      it('should not abort if request completes within timeout', async () => {
        vi.useFakeTimers();

        // Mock fetch to return successfully immediately
        fetchSpy.mockResolvedValue(
          new Response(JSON.stringify({ results: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );

        const promise = protopediaForceCacheClient.listPrototypes({
          limit: 1,
        });

        // Advance time slightly but not enough to timeout
        vi.advanceTimersByTime(1000);

        await expect(promise).resolves.toBeDefined();
      });

      it('should time out when the response body is not received within timeout', async () => {
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

        const promise = protopediaForceCacheClient.listPrototypes({
          limit: 1,
        });
        const assertion = expect(promise).rejects.toMatchObject({
          name: 'TimeoutError',
        });

        await vi.advanceTimersByTimeAsync(31000);

        await assertion;
      });

      it('should forward caller cancellation to fetch', async () => {
        // Mock fetch to hang until the forwarded signal is aborted
        fetchSpy.mockImplementation((_url: unknown, init: RequestInit) => {
          return new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => {
              reject(init.signal?.reason);
            });
          });
        });

        const controller = new AbortController();
        const promise = protopediaForceCacheClient.listPrototypes(
          { limit: 1 },
          { signal: controller.signal },
        );

        controller.abort(new DOMException('Cancelled', 'AbortError'));

        await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
        const init = fetchSpy.mock.calls[0][1];
        expect(init.signal.aborted).toBe(true);
      });
    });
  });

  describe('cache options', () => {
    const mockSuccess = () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({ results: [] }), { status: 200 }),
      );
    };

    it('should use the Next.js Data Cache for protopediaForceCacheClient', async () => {
      mockSuccess();

      await protopediaForceCacheClient.listPrototypes({ limit: 1 });

      expect(fetchSpy.mock.calls[0][1]).toMatchObject({
        cache: 'force-cache',
        next: { revalidate: 60 },
      });
    });

    it('should bypass the Next.js Data Cache for protopediaNoStoreClient', async () => {
      mockSuccess();

      await protopediaNoStoreClient.listPrototypes({ limit: 1 });

      expect(fetchSpy.mock.calls[0][1]).toMatchObject({
        cache: 'no-store',
        next: { revalidate: 0 },
      });
    });
  });
});
