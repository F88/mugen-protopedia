import { http, HttpResponse } from 'msw';
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
  () => {
    const snapshot = loadSnapshot('prototypes.json');
    if (snapshot) {
      return HttpResponse.json(snapshot);
    }
    // By default return empty results to keep tests explicit about success paths
    return HttpResponse.json({ results: [] });
  },
);

// Default handler: can be overridden per test using server.use(...)
export const handlers = [listPrototypesHandler];
