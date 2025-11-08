import { http, HttpResponse } from 'msw';

// Default handler: can be overridden per test using server.use(...)
export const handlers = [
  http.get(/https:\/\/api\.local\.test\/v2\/api\/prototype\/list.*/, () =>
    // By default return empty results to keep tests explicit about success paths
    HttpResponse.json({ results: [] }),
  ),
];
