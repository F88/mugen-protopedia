import { http, HttpResponse, delay } from 'msw';
import { loadSnapshot } from './snapshot-utils';

/**
 * Mock GET /v2/api/prototype/list endpoint handler
 *
 * Returns a snapshot of prototype list data
 * Used in tests to simulate fetching prototype data
 *
 * Returns empty results if snapshot not found
 * @see tools/get-sample-data.ts
 * @example
 * ```typescript
 * // In your test file
 * import { server } from './mocks/server';
 * import { rest } from 'msw';
 * server.use(
 *  rest.get('https://api.local.test/v2/api/prototype/list', (req, res, ctx) => {
 *   return res(ctx.json({ results: [...] }));
 * })
 * );
 * ```
 *
 * @see mocks/server.ts
 */
const listPrototypesHandler = http.get(
  // Match the path regardless of the base URL (works for both test and dev environments)
  '*/v2/api/prototype/list',
  async ({ request }) => {
    // Simulate network delay in development environment
    if (process.env.NODE_ENV !== 'test') {
      await delay(Math.random() * 400 + 100); // 100-500ms delay
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10000', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const prototypeIdParam = url.searchParams.get('prototypeId');
    const prototypeId = prototypeIdParam ? parseInt(prototypeIdParam, 10) : NaN;

    const snapshot = loadSnapshot('prototypes.json');
    if (snapshot && Array.isArray(snapshot.results)) {
      // Filter by prototypeId when requested, mirroring the real API's
      // `prototypeId` filter. Without this the mock ignored the id and the
      // SHOW-by-id flow always returned the first snapshot entry.
      const filteredResults = Number.isFinite(prototypeId)
        ? snapshot.results.filter(
            (prototype: { id?: number }) => prototype?.id === prototypeId,
          )
        : snapshot.results;

      // Apply pagination
      const slicedResults = filteredResults.slice(offset, offset + limit);
      return HttpResponse.json({
        ...snapshot,
        results: slicedResults,
      });
    }
    // By default return empty results to keep tests explicit about success paths
    return HttpResponse.json({ results: [] });
  },
);

// Default handler: can be overridden per test using server.use(...)
export const handlers = [listPrototypesHandler];
