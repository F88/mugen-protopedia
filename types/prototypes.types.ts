import type { NormalizedPrototype } from '@/lib/api/prototypes';

/**
 * Parameters for fetching prototypes from the API.
 */
export type FetchPrototypesParams = {
  /** Maximum number of prototypes to fetch (default: 50, max: 100) */
  limit?: number;
  /** Number of prototypes to skip for pagination (default: 0) */
  offset?: number;
  /** Specific prototype ID to fetch (if provided, returns only that prototype) */
  prototypeId?: number;
};

/**
 * Successful response from fetchPrototypes containing an array of prototypes.
 *
 * @property ok - Discriminator field, always true for success.
 * @property data - Array of normalized prototype objects ready for UI consumption.
 */
export type FetchPrototypesSuccess = {
  ok: true;
  data: NormalizedPrototype[];
};

/**
 * Failed response from fetchPrototypes with error details.
 *
 * @property ok - Discriminator field, always false for failure.
 * @property status - HTTP status code (e.g., 400, 404, 500) or internal error code.
 * @property error - Human-readable error message describing what went wrong.
 * @property details - Optional structured error information for debugging and advanced UI feedback.
 * @property details.statusText - HTTP status text (e.g., "Bad Request", "Service Unavailable").
 * @property details.code - System or library-specific error code (e.g., "ECONNREFUSED").
 * @property details.url - The URL endpoint that triggered the error (useful for debugging).
 * @property details.requestId - Unique identifier for the request (useful for tracing logs).
 */
export type FetchPrototypesFailure = {
  ok: false;
  status: number;
  error: string;
  details?: {
    statusText?: string;
    code?: string;
    url?: string;
    requestId?: string;
  };
};

/**
 * Result type for fetchPrototypes function - either success with data or failure with error.
 */
export type FetchPrototypesResult =
  | FetchPrototypesSuccess
  | FetchPrototypesFailure;

/**
 * Successful response from fetchRandomPrototype containing a single prototype.
 */
export type FetchRandomPrototypeSuccess = {
  ok: true;
  data: NormalizedPrototype;
};

/**
 * Failed response from fetchRandomPrototype (same as FetchPrototypesFailure).
 */
export type FetchRandomPrototypeFailure = FetchPrototypesFailure;

/**
 * Result type for fetchRandomPrototype function - either success with single prototype or failure.
 */
export type FetchRandomPrototypeResult =
  | FetchRandomPrototypeSuccess
  | FetchRandomPrototypeFailure;

/**
 * Result type for fetchPrototypeById function - either success with single prototype or failure.
 */
export type FetchPrototypeByIdResult =
  | { ok: true; data: NormalizedPrototype }
  | FetchPrototypesFailure;
