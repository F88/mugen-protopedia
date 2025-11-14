/**
 * @file React hook for managing prototype slots and request concurrency.
 *
 * Overview:
 * - Centralizes slot CRUD (append/replace/error/remove/clear) and exposes
 *   backpressure via a simple concurrency cap API.
 * - Keeps UI logic declarative in components while encapsulating mutable
 *   counters and refs within the hook.
 *
 * Inputs/Outputs:
 * - Inputs: optional `maxConcurrentFetches`, optional delay simulation range.
 * - Outputs: slots array, mutation helpers, and concurrency signals/mutators.
 *
 * Edge cases:
 * - All mutations are idempotent where practical (missing id → no-op).
 * - Concurrency decrement is clamped at 0.
 *
 * Related:
 * - Scrolling behavior and focus management are handled by
 *   `useScrollingBehavior`.
 * - Behavior spec in `docs/specs/slot-and-scroll-behavior.md`.
 */

import { useCallback, useRef, useState } from 'react';

import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';

/**
 * A single UI slot representing one fetch operation and its renderable state.
 * - While `isLoading` is true, a skeleton is shown.
 * - On success, `prototype` is populated and `isLoading` becomes false.
 * - On error, `errorMessage` is set and `isLoading` becomes false.
 */
export type PrototypeSlot = {
  id: number;
  prototype?: Prototype;
  expectedPrototypeId?: number;
  errorMessage?: string | null;
  isLoading: boolean;
};

/**
 * Configuration for the slots/concurrency manager.
 */
export type UsePrototypeSlotsOptions = {
  maxConcurrentFetches?: number;
  simulateDelayRangeMs?: { min: number; max: number } | null;
};

/**
 * Public API returned from {@link usePrototypeSlots}.
 */
export type UsePrototypeSlotsResult = {
  prototypeSlots: PrototypeSlot[];
  setPrototypeSlots: React.Dispatch<React.SetStateAction<PrototypeSlot[]>>;
  appendPlaceholder: (params?: { expectedPrototypeId?: number }) => number;
  replacePrototypeInSlot: (
    slotId: number,
    prototype: Prototype,
  ) => Promise<void>;
  setSlotError: (slotId: number, message: string) => void;
  removeSlotById: (slotId: number) => void;
  clearSlots: () => void;
  // concurrency
  inFlightRequests: number;
  canFetchMorePrototypes: boolean;
  tryIncrementInFlightRequests: () => boolean;
  decrementInFlightRequests: () => void;
  maxConcurrentFetches: number;
};

/**
 * Manage prototype slots and simple fetch concurrency caps.
 *
 * Responsibilities:
 * - Provide an append/replace/error/remove CRUD interface for slots.
 * - Track in-flight request count and expose a backpressure signal.
 * - Optionally simulate network delay for deterministic UI behavior in demos/tests.
 *
 * Contract:
 * - `appendPlaceholder` returns a unique slot id for later updates.
 * - `tryIncrementInFlightRequests` returns false when concurrency cap is reached.
 * - `decrementInFlightRequests` never decreases below 0.
 *
 * Edge cases:
 * - Removing a slot that does not exist is a no-op.
 * - Replacing a slot that does not exist is a no-op.
 */
export function usePrototypeSlots(
  options: UsePrototypeSlotsOptions = {},
): UsePrototypeSlotsResult {
  const maxConcurrentFetches = options.maxConcurrentFetches ?? 6;
  const simulateDelay = options.simulateDelayRangeMs ?? null;

  const [prototypeSlots, setPrototypeSlots] = useState<PrototypeSlot[]>([]);

  const slotIdRef = useRef(0);
  const [inFlightRequests, setInFlightRequests] = useState(0);
  const [canFetchMorePrototypes, setCanFetchMorePrototypes] = useState(true);
  const inFlightRequestsRef = useRef(inFlightRequests);

  const updateInFlightState = useCallback(
    (next: number) => {
      inFlightRequestsRef.current = next;
      setInFlightRequests(next);
      setCanFetchMorePrototypes(next < maxConcurrentFetches);
    },
    [maxConcurrentFetches],
  );

  const tryIncrementInFlightRequests = useCallback(() => {
    const current = inFlightRequestsRef.current;
    if (current >= maxConcurrentFetches) {
      setCanFetchMorePrototypes(false);
      return false;
    }
    const next = current + 1;
    updateInFlightState(next);
    return true;
  }, [updateInFlightState, maxConcurrentFetches]);

  const decrementInFlightRequests = useCallback(() => {
    const current = inFlightRequestsRef.current;
    const next = Math.max(0, current - 1);
    updateInFlightState(next);
  }, [updateInFlightState]);

  const appendPlaceholder = useCallback(
    ({ expectedPrototypeId }: { expectedPrototypeId?: number } = {}) => {
      const slotId = slotIdRef.current;
      slotIdRef.current += 1;
      setPrototypeSlots((prev) => [
        ...prev,
        {
          id: slotId,
          prototype: undefined,
          expectedPrototypeId,
          errorMessage: null,
          isLoading: true,
        },
      ]);
      return slotId;
    },
    [],
  );

  const replacePrototypeInSlot = useCallback(
    async (slotId: number, prototype: Prototype) => {
      if (simulateDelay) {
        const { min, max } = simulateDelay;
        const randomDelayMs = Math.random() * (max - min) + min;
        await new Promise((resolve) => {
          window.setTimeout(resolve, randomDelayMs);
        });
      }
      setPrototypeSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId
            ? { ...slot, prototype, errorMessage: null, isLoading: false }
            : slot,
        ),
      );
    },
    [simulateDelay],
  );

  const setSlotError = useCallback((slotId: number, message: string) => {
    setPrototypeSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              prototype: undefined,
              errorMessage: message,
              isLoading: false,
            }
          : slot,
      ),
    );
  }, []);

  const removeSlotById = useCallback((slotId: number) => {
    setPrototypeSlots((prev) => prev.filter((slot) => slot.id !== slotId));
  }, []);

  const clearSlots = useCallback(() => {
    setPrototypeSlots([]);
  }, []);

  return {
    prototypeSlots,
    setPrototypeSlots,
    appendPlaceholder,
    replacePrototypeInSlot,
    setSlotError,
    removeSlotById,
    clearSlots,
    inFlightRequests,
    canFetchMorePrototypes,
    tryIncrementInFlightRequests,
    decrementInFlightRequests,
    maxConcurrentFetches,
  };
}
