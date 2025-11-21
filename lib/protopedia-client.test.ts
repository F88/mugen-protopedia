import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { getPrototypeById, protopedia } from './protopedia-client';

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
    describe('protopedia client (listPrototypes)', () => {
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
        const promise = protopedia.listPrototypes({ limit: 1 });

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

        const promise = protopedia.listPrototypes({ limit: 1 });

        // Advance time slightly but not enough to timeout
        vi.advanceTimersByTime(1000);

        await expect(promise).resolves.toBeDefined();
      });
    });

    describe('getPrototypeById', () => {
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
        const promise = getPrototypeById(123);

        // Fast-forward time past the timeout (30s + buffer)
        vi.advanceTimersByTime(31000);

        // Expect the promise to reject with an AbortError (DOMException)
        await expect(promise).rejects.toThrow();

        // Verify signal
        expect(fetchSpy).toHaveBeenCalled();
        const callArgs = fetchSpy.mock.calls[0];
        const init = callArgs[1];
        expect(init).toHaveProperty('signal');
        expect(init.signal.aborted).toBe(true);
      });

      it('should not abort if request completes within timeout', async () => {
        vi.useFakeTimers();

        // Mock fetch to return successfully
        fetchSpy.mockResolvedValue(
          new Response(JSON.stringify({ prototypeNm: 'Test' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );

        const promise = getPrototypeById(123);

        vi.advanceTimersByTime(1000);

        await expect(promise).resolves.toEqual({ prototypeNm: 'Test' });
      });
    });
  });
});
