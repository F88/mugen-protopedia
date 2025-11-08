import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';
// Use node-fetch so MSW (Node) can intercept HTTP(S) requests in tests
import fetch, { Headers, Request, Response } from 'node-fetch';

// Ensure API client does not throw on missing token during tests
process.env.PROTOPEDIA_API_V2_TOKEN ||= 'test';
// Route client traffic to a mock origin MSW can intercept
process.env.PROTOPEDIA_API_V2_BASE_URL ||= 'https://api.local.test/v2/api';

// Polyfill and override global fetch implementation for Node tests
// so it goes through Node's http/https stack (intercepted by MSW).
// We intentionally override the global fetch & related classes for tests
// so that requests go through Node's http/https stack (interceptable by MSW).
globalThis.fetch = fetch as unknown as typeof globalThis.fetch;
globalThis.Headers = Headers as unknown as typeof globalThis.Headers;
globalThis.Request = Request as unknown as typeof globalThis.Request;
globalThis.Response = Response as unknown as typeof globalThis.Response;

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));

afterEach(() => server.resetHandlers());

afterAll(() => server.close());
