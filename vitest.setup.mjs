import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server.js';
import fetch, { Headers, Request, Response } from 'node-fetch';

// Force runtime to treat all Date parsing/comparisons as UTC for deterministic tests
process.env.TZ = 'UTC';

// Ensure API client does not throw on missing token during tests
process.env.PROTOPEDIA_API_V2_TOKEN ||= 'test';
// Route client traffic to a mock origin MSW can intercept
process.env.PROTOPEDIA_API_V2_BASE_URL ||= 'https://api.local.test/v2/api';
// Disable retry backoff during tests for speed and determinism
process.env.PROTOTYPE_RETRY_BACKOFF_MS = '0';

// Override global fetch so it goes through Node's http/https stack (MSW-interceptable)
globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.Request = Request;
globalThis.Response = Response;

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));

afterEach(() => server.resetHandlers());

afterAll(() => server.close());
