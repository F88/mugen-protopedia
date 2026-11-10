import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server.js';

// Force runtime to treat all Date parsing/comparisons as UTC for deterministic tests
process.env.TZ = 'UTC';

// Ensure API client does not throw on missing token during tests
process.env.PROTOPEDIA_API_V2_TOKEN ||= 'test';
// Route client traffic to a mock origin MSW can intercept
process.env.PROTOPEDIA_API_V2_BASE_URL ||= 'https://api.local.test/v2/api';
// Disable retry backoff during tests for speed and determinism
process.env.PROTOTYPE_RETRY_BACKOFF_MS = '0';

// Mock ResizeObserver for Radix UI
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

beforeAll(() => server.listen({ onUnhandledFrame: 'bypass' }));

afterEach(() => server.resetHandlers());

afterAll(() => server.close());
