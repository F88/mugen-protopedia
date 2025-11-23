---
lang: en
title: UI Fetch Paths
title-en: UI Fetch Paths
title-ja: UIからの通信経路
related:
    - docs/specs/data-fetching-strategy.md "Data Fetching Strategy"
    - app/mugen-protopedia.tsx "Main UI Surface"
instructions-for-ais:
    - This document should be written in English for AI readability.
    - Content within code fences may be written in languages other than English.
    - Prohibit updating this front-matter.
    - Prohibit updating title line (1st line) in this document.
---

# UI Fetch Paths

This document describes concrete, implementation-level fetch paths initiated from
UI interactions. It complements `docs/specs/data-fetching-strategy.md` by
focusing on **how** the UI is wired to server actions and the ProtoPedia API.

## Overview: Data Sources per UI Flow

- [PROTOTYPE Button: Random Prototype Fetch](#prototype-button-random-prototype-fetch)
- [SHOW Button: ID-Based Prototype Fetch](#show-button-id-based-prototype-fetch)
- [PLAYLIST Mode: Direct-Launch ID Queue](#playlist-mode-direct-launch-id-queue)

| Flow                                     | Primary Data Source                  | `prototypeMapStore` Usage                            | Freshness vs. Cache Trade-off                                                                                                          |
| ---------------------------------------- | ------------------------------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| PROTOTYPE Button: Random Prototype Fetch | Map snapshot (`prototypeMapStore`)   | **Preferred**: `getRandomPrototypeFromMapOrFetch`    | Favors cache efficiency and fast random selection; falls back to a bounded upstream random fetch when the map snapshot is unavailable. |
| SHOW Button: ID-Based Prototype Fetch    | ProtoPedia API via `fetchPrototypes` | **Never used**: always bypasses the map snapshot     | Optimized for latest data for a specific ID; each click issues a fresh upstream call, with only SWR providing client-side reuse.       |
| PLAYLIST Mode: Direct-Launch ID Queue    | ProtoPedia API via `fetchPrototypes` | **Never used** for individual ID fetches in playlist | Orchestrates a sequence of SHOW-equivalent fresh ID fetches based on URL parameters; prioritizes up-to-date data over cache reuse.     |

## PROTOTYPE Button: Random Prototype Fetch

### Summary

When a user clicks the **PROTOTYPE** button in the control panel (or presses
the Enter key shortcut), the application appends a placeholder slot and fetches
one random prototype. This path prefers the in-memory `prototypeMapStore` when
available and falls back to a direct upstream random-fetch server action.

### High-Level Flow

1. User clicks **PROTOTYPE** in the main control panel.
2. The app checks concurrency limits and appends a placeholder slot.
3. A client hook (`useRandomPrototype`) calls a fetcher that prefers
   `getRandomPrototypeFromMapOrFetch`.
4. On a map-store hit, a random prototype is returned from the snapshot.
   Otherwise, the fetcher falls back to `fetchRandomPrototype`, which hits the
   upstream API directly.
5. On success, the placeholder slot is replaced with the loaded prototype
   card; on failure, an error message is rendered in the slot.

### Component-Level Wiring (PROTOTYPE)

#### Control Panel → Page Component (PROTOTYPE)

- Component: `components/control-panel.tsx`
- Prop: `onGetRandomPrototype`
- Wiring in `app/mugen-protopedia.tsx`:

```tsx
<ControlPanel
  ...
  onGetRandomPrototype={handleGetRandomPrototype}
  ...
/>
```

Additionally, keyboard shortcuts bind Enter to the same handler via
`useKeyboardShortcuts`.

#### Slot Creation & Random Fetch

- Function: `handleGetRandomPrototype`
- File: `app/mugen-protopedia.tsx`

```ts
const handleGetRandomPrototype = useCallback(async () => {
    if (isPlaylistPlaying) {
        logger.warn('Cannot fetch random prototype while playlist is playing.');
        return;
    }
    if (!tryIncrementInFlightRequests()) {
        console.warn('Maximum concurrent fetches reached.');
        return;
    }

    const slotId = appendPlaceholder();
    try {
        const prototype = await getRandomPrototypeFromResults();
        if (!prototype) {
            setSlotError(slotId, 'Failed to load.');
            return;
        }

        await replacePrototypeInSlot(slotId, prototype);
    } catch (err) {
        console.error('Failed to fetch prototypes.', err);
        let message = 'Failed to load.';
        if (err instanceof Error) {
            if (err.message === 'Failed to fetch') {
                message =
                    'Failed to fetch. ' +
                    'Possible causes: Offline, DNS, CORS, or Server Down.';
            } else {
                message = err.message;
            }
        }
        setSlotError(slotId, message);
    } finally {
        decrementInFlightRequests();
    }
}, [
    tryIncrementInFlightRequests,
    appendPlaceholder,
    getRandomPrototypeFromResults,
    replacePrototypeInSlot,
    decrementInFlightRequests,
    isPlaylistPlaying,
    setSlotError,
]);
```

Responsibilities:

- Ensure random fetches are disabled while a playlist is actively playing.
- Enforce the global in-flight concurrency cap before issuing a fetch.
- Append a placeholder slot for the incoming random prototype.
- Call `getRandomPrototypeFromResults()` and populate the slot on success.
- Map network failures (including generic `Failed to fetch`) to explicit,
  technically descriptive error messages for power users.

### Hook & Fetcher Layer

#### `useRandomPrototype` Hook

- Hook: `useRandomPrototype`
- File: `lib/hooks/use-random-prototype.ts`

```ts
export function useRandomPrototype(): UseRandomPrototypeResult {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<RandomPrototypeError>(null);

    const getRandomPrototype =
        useCallback(async (): Promise<NormalizedPrototype | null> => {
            setIsLoading(true);
            setError(null);

            try {
                return await getRandomPrototypeData();
            } catch (caught) {
                const message =
                    caught instanceof Error
                        ? caught.message
                        : 'Failed to fetch random prototype.';
                setError(message);
                throw caught;
            } finally {
                setIsLoading(false);
            }
        }, []);

    return {
        getRandomPrototype,
        isLoading,
        error,
    };
}
```

Responsibilities:

- Provide an imperative `getRandomPrototype()` function without SWR caching so
  that each call can return a fresh random result.
- Track `isLoading` and `error` state for UI feedback.
- Delegate actual data retrieval to `getRandomPrototypeData`.

#### Client Fetcher → Server Actions

- Function: `getRandomPrototypeData`
- File: `lib/fetcher/get-random-prototype.ts`

```ts
const FALLBACK_LIMIT = 500;
const FALLBACK_OFFSET = 0;

export const getRandomPrototypeData =
    async (): Promise<NormalizedPrototype | null> => {
        const mapResult = await getRandomPrototypeFromMapOrFetch();

        if (mapResult.ok) {
            return mapResult.data;
        }

        if (mapResult.status === 404) {
            return null;
        }

        if (mapResult.status !== 503) {
            const displayMessage = constructDisplayMessage(mapResult);
            logger.error('getRandomPrototypeData failed via map fetch', {
                status: mapResult.status,
                message: displayMessage,
            });
            throw new Error(displayMessage);
        }

        const fallback = await fetchRandomPrototype({
            limit: FALLBACK_LIMIT,
            offset: FALLBACK_OFFSET,
        });

        if (!fallback.ok) {
            const displayMessage = constructDisplayMessage(fallback);
            logger.error('getRandomPrototypeData failed via fallback fetch', {
                status: fallback.status,
                message: displayMessage,
            });
            throw new Error(displayMessage);
        }

        return fallback.data;
    };
```

Responsibilities:

- Prefer `getRandomPrototypeFromMapOrFetch` (server action backed by
  `prototypeMapStore`) for random selection when the canonical snapshot is
  available.
- Interpret a `404` from the map-backed path as "no prototypes available" and
  return `null` to the caller.
- Treat non-`503` errors from the map-backed path as hard failures and surface
  them as thrown `Error` instances with technical messages.
- When the map store is unavailable (`503`), fall back to `fetchRandomPrototype`
  with a bounded `limit` and `offset` to perform random selection directly
  against the upstream API.

### Server-Side Path

On the server, the PROTOTYPE button path exercises two server actions defined
in `app/actions/prototypes.ts`:

- `getRandomPrototypeFromMapOrFetch()`: preferred path using the in-memory
  `prototypeMapStore` for O(1) random selection from the canonical snapshot.
- `fetchRandomPrototype(params)`: fallback path that always calls the upstream
  list endpoint and performs random selection over the returned page.

The exact behavior of these actions (TTL handling, snapshot refresh, and
payload guards) is specified in `docs/specs/data-fetching-strategy.md` and the
map-store documentation.

### Effective Network Path (PROTOTYPE Button)

Clicking **PROTOTYPE** with sufficient concurrency budget drives the following
chain:

- UI / client:
    - `ControlPanel` → `onGetRandomPrototype` → `handleGetRandomPrototype`
    - `handleGetRandomPrototype` → `getRandomPrototypeFromResults()`
    - `getRandomPrototypeFromResults` → `getRandomPrototype()`
    - `getRandomPrototype()` → `getRandomPrototypeData()`
- Server:
    - `getRandomPrototypeData()` → `getRandomPrototypeFromMapOrFetch()`
      (preferred) → `prototypeMapStore.getRandom()` and, if needed,
      TTL-triggered snapshot refresh.
    - When the map-backed path is unavailable with `503`, the fallback path
      invokes `fetchRandomPrototype({ limit: 500, offset: 0 })`, which in turn
      calls the upstream `listPrototypes` endpoint and performs server-side
      random selection over that page.

As a result, random fetches primarily hit the in-memory canonical snapshot when
present, minimizing repeated upstream calls, and only fall back to direct
upstream random selection when the map store cannot be used.

## SHOW Button: ID-Based Prototype Fetch

### Summary (SHOW)

When a user types an ID into the control panel and clicks the **SHOW** button,
the application validates the input, performs a single-ID fetch via a server
action, and inserts the resulting prototype into a new slot in the grid.

No in-memory `prototypeMapStore` is involved in this path; each SHOW click
results in a fresh upstream call for that ID, with SWR providing browser-side
caching.

**Design intent**: The SHOW button is explicitly optimized for **freshness** of
data rather than minimizing upstream calls. Because this interaction is
typically used for targeted, infrequent lookups (e.g. checking the latest
status of a specific prototype ID), it always bypasses `prototypeMapStore` and
fetches the latest data from the ProtoPedia API via `fetchPrototypes` /
`fetchPrototypeById`. Any in-memory snapshot is treated as an optimization for
other flows (e.g. random selection, analysis), not as a source of truth for
this ID-based fetch.

### High-Level Flow (SHOW)

1. User enters a prototype ID in the control panel input.
2. User clicks **SHOW**.
3. The app validates the input and calls a handler on `MugenProtoPedia`.
4. The handler appends a placeholder slot and calls an imperative fetcher
   backed by SWR.
5. The fetcher calls a server action, which in turn calls the ProtoPedia API
   with a `prototypeId` filter.
6. On success, the placeholder slot is replaced with the loaded prototype card;
   on failure, an error card is shown instead.

### Component-Level Wiring (SHOW)

#### Control Panel → Page Component (SHOW)

- Component: `components/control-panel.tsx`
- Prop: `onGetPrototypeById`
- Wiring in `app/mugen-protopedia.tsx`:

```tsx
<ControlPanel
  ...
  onGetPrototypeById={handleGetPrototypeByIdFromInput}
  ...
/>
```

#### Input Validation & ID Parsing

- Function: `handleGetPrototypeByIdFromInput`
- File: `app/mugen-protopedia.tsx`

```ts
const handleGetPrototypeByIdFromInput = async () => {
    logger.debug('Fetching prototype by ID from input:', prototypeIdInput);

    const trimmed = prototypeIdInput.trim();
    if (trimmed === '') {
        setPrototypeIdError('Please enter a prototype ID.');
        return;
    }

    const parsedId = Number.parseInt(trimmed, 10);
    if (Number.isNaN(parsedId) || parsedId < 0) {
        setPrototypeIdError('Prototype ID must be a non-negative number.');
        return;
    }

    await handleGetPrototypeById(parsedId);
};
```

Responsibilities:

- Ensure the input is non-empty.
- Parse a base-10 integer and reject `NaN` and negative values.
- Delegate to `handleGetPrototypeById(parsedId)` when validation passes.

#### Slot Creation & ID-Based Fetch

- Function: `handleGetPrototypeById`
- File: `app/mugen-protopedia.tsx`

```ts
const handleGetPrototypeById = useCallback(
    async (id: number, options?: { isFromPlaylist?: boolean }) => {
        logger.debug('Fetching prototype by ID', { id });

        if (id < 0) {
            console.error('Invalid prototype ID:', id);
            return;
        }

        if (!tryIncrementInFlightRequests()) {
            console.warn('Maximum concurrent fetches reached.');
            return;
        }

        const slotId = appendPlaceholder({ expectedPrototypeId: id });
        setPrototypeIdError(null);

        try {
            const prototype = await fetchPrototype(id);
            if (!prototype) {
                setPrototypeIdError('Not found.');
                setSlotError(slotId, 'Not found.');
                return;
            }

            const clonedPrototype = clonePrototype(prototype);
            await replacePrototypeInSlot(slotId, clonedPrototype);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to fetch prototype.';
            setPrototypeIdError(message);
            setSlotError(slotId, message);
        } finally {
            decrementInFlightRequests();
            if (options?.isFromPlaylist) {
                setProcessedCount((c) => c + 1);
            }
        }
    },
    [
        tryIncrementInFlightRequests,
        appendPlaceholder,
        fetchPrototype,
        setPrototypeIdError,
        setSlotError,
        clonePrototype,
        replacePrototypeInSlot,
        decrementInFlightRequests,
        setProcessedCount,
    ],
);
```

Responsibilities:

- Guard against invalid IDs and concurrency cap violations.
- Append a **placeholder slot** with `expectedPrototypeId` for consistent UI
  behavior.
- Clear previous `prototypeIdError` state.
- Call `fetchPrototype(id)` to perform the actual fetch.
- On success, deep-clone the prototype and replace the placeholder slot.
- On failure, surface the error message both on the control panel and the
  affected slot.
- When `options.isFromPlaylist` is true, increment the playlist processed
  counter.

### Hook & Fetcher Layer (SHOW)

#### `usePrototype` Hook (SWR-backed)

- Hook: `usePrototype`
- File: `lib/hooks/use-prototype.ts`

In `MugenProtoPedia`, the hook is configured as:

```ts
const { fetchPrototype } = usePrototype(
    {},
    {
        revalidateOnFocus: false,
        revalidateOnMount: false,
        revalidateIfStale: false,
        errorRetryCount: 2,
        errorRetryInterval: 5_000,
    },
);
```

Relevant implementation excerpt:

```ts
const fetchPrototypeById = useCallback(
    async (prototypeId: number) => {
        const result = await getPrototype(prototypeId);
        if (hasId && prototypeId === id) {
            await mutate(result, { revalidate: false });
        }
        return result;
    },
    [hasId, id, mutate],
);

return {
    prototype: data ?? null,
    error: error ? error.message : null,
    isLoading: hasId ? isLoading || isValidating : false,
    fetchPrototype: fetchPrototypeById,
};
```

Responsibilities:

- Provide an **imperative** `fetchPrototype(id)` function to call from UI
  event handlers.
- Use `getPrototype(id)` as the source of truth for prototype data.
- Keep SWR cache (`mutate`) in sync when the hook is also bound to a specific
  `id`.

#### Client Fetcher → Server Action

- Function: `getPrototype`
- File: `lib/fetcher/get-prototype.ts`

```ts
import { fetchPrototypeById } from '@/app/actions/prototypes';

export const getPrototype = async (
    id: number,
): Promise<NormalizedPrototype | undefined> => {
    const result = await fetchPrototypeById(String(id));
    if (!result.ok) {
        const displayMessage = constructDisplayMessage(result);
        logger.error('Failed to fetch prototype via server function', {
            id,
            status: result.status,
            message: displayMessage,
        });
        throw new Error(displayMessage);
    }
    return result.data;
};
```

Responsibilities:

- Bridge client code to the server action `fetchPrototypeById`.
- Convert a `FetchPrototypeByIdResult` into either:
    - a `NormalizedPrototype` on success, or
    - a thrown `Error(displayMessage)` with a technical, user-visible message on
      failure.

### Server-Side Path (SHOW)

#### Server Action: `fetchPrototypeById`

- File: `app/actions/prototypes.ts`

```ts
export async function fetchPrototypeById(
    idParam: string,
): Promise<FetchPrototypeByIdResult> {
    const logger = baseLogger.child({ action: 'fetchPrototypeById' });

    logger.info({ idParam }, 'Fetching prototype by id via server function');

    const parsed = parsePositiveId(idParam, logger);
    if (!parsed.ok) {
        logger.warn({ idParam }, 'Prototype id parameter is invalid');
        return {
            ok: false,
            status: parsed.response.status,
            error: 'Invalid prototype id',
        };
    }

    const id = parsed.value;

    const result = await fetchPrototypes({
        prototypeId: id,
        limit: 1,
        offset: 0,
    });

    if (!result.ok) {
        return result;
    }

    const prototype = result.data[0];

    if (!prototype) {
        return {
            ok: false,
            status: 404,
            error: 'Not found',
        };
    }

    return {
        ok: true,
        data: prototype,
    };
}
```

Responsibilities:

- Validate `idParam` using `parsePositiveId` and reject invalid IDs without
  calling upstream.
- Delegate to `fetchPrototypes({ prototypeId: id, limit: 1, offset: 0 })`.
- Map an empty result set to a `404 Not found` error.
- Propagate upstream errors (status code, message) unchanged.

#### Upstream Call: `fetchPrototypes` → ProtoPedia API

- Function: `fetchPrototypes`
- File: `app/actions/prototypes.ts`

For ID-based calls, `fetchPrototypes` eventually executes:

```ts
const upstream = await protopedia.listPrototypes({
    limit,
    offset,
    prototypeId,
});
```

Responsibilities:

- Call the ProtoPedia API (`protopedia.listPrototypes`) with `prototypeId`,
  `limit`, and `offset`.
- Normalize results into `NormalizedPrototype[]` via `normalizePrototype`.
- Return either `{ ok: true, data: NormalizedPrototype[] }` or an error result
  containing `status`, `error`, and optional diagnostics.

### Effective Network Path (SHOW Button)

Putting it all together, clicking **SHOW** with a valid ID drives the following
chain:

- UI / client:
    - `ControlPanel` → `onGetPrototypeById` →
      `handleGetPrototypeByIdFromInput`
    - `handleGetPrototypeByIdFromInput` → `handleGetPrototypeById(id)`
    - `handleGetPrototypeById` → `fetchPrototype(id)` (`usePrototype`)
    - `fetchPrototype(id)` → `getPrototype(id)`
- Server:
    - `getPrototype(id)` → `fetchPrototypeById(String(id))`
    - `fetchPrototypeById` → `fetchPrototypes({ prototypeId: id, limit: 1, offset: 0 })`
    - `fetchPrototypes` → `protopedia.listPrototypes({ prototypeId: id, limit: 1, offset: 0 })`

Each SHOW click therefore issues exactly one upstream `listPrototypes` request
for the specified ID. The in-memory `prototypeMapStore` is **not** consulted on
this path; caching is handled solely by SWR on the client side for repeated
reads of the same ID.

## PLAYLIST Mode: Direct-Launch ID Queue

### Summary (PLAYLIST)

When the application is opened with playlist query parameters (e.g.
`?id=7103,6774,...&title=My%20Playlist`), it enters **PLAYLIST** mode
automatically. The app then processes the validated ID list as a queue and
fetches each prototype in order using the same ID-based fetch path as the SHOW
button, marking progress and avoiding user interaction for each step.

### High-Level Flow (PLAYLIST)

1. User opens a URL that contains `id` (comma-separated IDs) and/or a non-empty
   `title` query parameter.
2. `useDirectLaunch` parses and validates the query parameters into a
   `directLaunchResult` object.
3. `resolvePlayMode({ directLaunchResult })` computes a `PlayModeState`:
    - `type: 'playlist'` with `ids: number[]` and optional `title` when a valid
      playlist is detected.
    - otherwise `type: 'normal'`.
4. When `PlayModeState.type === 'playlist'`, the app enqueues the IDs into
   `playlistQueueRef` and starts playback (`isPlaylistPlaying = true`).
5. A playlist processing loop repeatedly dequeues IDs and calls
   `handleGetPrototypeById(id, { isFromPlaylist: true })` for each, until all
   items are processed and in-flight requests reach zero.

### Component-Level Wiring (PLAYLIST)

- File: `app/mugen-protopedia.tsx`
- Initial play mode resolution:

```ts
const directLaunchResult = useDirectLaunch();
const [playModeState, setPlayModeState] = useState<PlayModeState>(() =>
    resolvePlayMode({ directLaunchResult }),
);

useEffect(() => {
    const resolvedPlayMode = resolvePlayMode({ directLaunchResult });
    setPlayModeState((previousState) => {
        const newPlayMode = arePlayModeStatesEqual(
            previousState,
            resolvedPlayMode,
        )
            ? previousState
            : resolvedPlayMode;
        logger.debug(
            'Play mode:',
            `${previousState.type} -> ${newPlayMode.type}`,
        );
        return newPlayMode;
    });
}, [directLaunchResult]);
```

- Playlist queue setup when entering playlist mode:

```ts
useEffect(() => {
    logger.debug('Processing play mode state change:', playModeState);

    if (playModeState.type !== 'playlist') {
        lastProcessedPlaylistSignatureRef.current = null;
        playlistQueueRef.current = [];
        setIsPlaylistPlaying(false);
        setIsPlaylistCompleted(false);
        setProcessedCount(0);
    }

    switch (playModeState.type) {
        case 'normal':
            logger.debug('Switched to normal play mode');
            break;

        case 'playlist':
            logger.debug('Switched to playlist play mode');
            const { ids, title } = playModeState;
            if (ids.length === 0) {
                lastProcessedPlaylistSignatureRef.current = null;
                playlistQueueRef.current = [];
                setIsPlaylistPlaying(false);
                setProcessedCount(0);
                return;
            }

            const signature = `${ids.join(',')}|${title ?? ''}`;
            if (lastProcessedPlaylistSignatureRef.current === signature) {
                return;
            }

            logger.debug({ ids, title }, 'Starting playlist playback');
            lastProcessedPlaylistSignatureRef.current = signature;
            playlistQueueRef.current = [...ids];
            setProcessedCount(0);
            setIsPlaylistPlaying(true);
            setIsPlaylistCompleted(false);
    }
}, [playModeState]);
```

### Playlist Processing Loop & Fetch Path

Once in playlist mode, a dedicated effect processes the queue while
`isPlaylistPlaying` is true:

```ts
useEffect(() => {
    if (playlistProcessingTimeoutRef.current !== null) {
        window.clearTimeout(playlistProcessingTimeoutRef.current);
        playlistProcessingTimeoutRef.current = null;
    }

    if (playModeState.type !== 'playlist') {
        return undefined;
    }

    if (!isPlaylistPlaying) {
        return undefined;
    }

    const processNext = () => {
        playlistProcessingTimeoutRef.current = null;

        if (playlistQueueRef.current.length === 0) {
            if (inFlightRequests === 0) {
                logger.debug('Playlist playback completed');
                setIsPlaylistPlaying(false);
                setIsPlaylistCompleted(true);
            }
            return;
        }

        if (!canFetchMorePrototypes) {
            console.warn(
                'Cannot fetch more prototypes while playlist is playing. Retry in ' +
                    PLAYLIST_FETCH_INTERVAL_MS +
                    'ms' +
                    ' for processing next id',
            );
            playlistProcessingTimeoutRef.current = window.setTimeout(
                processNext,
                PLAYLIST_FETCH_INTERVAL_MS,
            );
            return;
        }

        const id = playlistQueueRef.current.shift();
        logger.debug('Processing playlist ID:', id);

        if (id !== undefined) {
            void handleGetPrototypeById(id, { isFromPlaylist: true });

            playlistProcessingTimeoutRef.current = window.setTimeout(
                processNext,
                PLAYLIST_FETCH_INTERVAL_MS,
            );
        }
    };

    playlistProcessingTimeoutRef.current = window.setTimeout(processNext, 0);

    return () => {
        if (playlistProcessingTimeoutRef.current !== null) {
            window.clearTimeout(playlistProcessingTimeoutRef.current);
            playlistProcessingTimeoutRef.current = null;
        }
    };
}, [
    playModeState,
    isPlaylistPlaying,
    canFetchMorePrototypes,
    inFlightRequests,
    handleGetPrototypeById,
]);
```

Key points:

- The playlist loop reuses `handleGetPrototypeById` with
  `{ isFromPlaylist: true }`, so the **actual fetch path** for each ID is
  identical to the SHOW button path described above.
- `PLAYLIST_FETCH_INTERVAL_MS` controls the pacing between ID fetches, giving
  the UI time to render and preventing bursty concurrency.
- Playback completion is detected only when both the queue is empty and
  `inFlightRequests` reaches zero.

### Effective Network Path (PLAYLIST Mode)

For each ID in the playlist queue, the network path is effectively:

- UI / client:
    - `playlistQueueRef` → `processNext()` →
      `handleGetPrototypeById(id, { isFromPlaylist: true })`
    - `handleGetPrototypeById` → `fetchPrototype(id)` (`usePrototype`)
    - `fetchPrototype(id)` → `getPrototype(id)`
- Server:
    - `getPrototype(id)` → `fetchPrototypeById(String(id))`
    - `fetchPrototypeById` → `fetchPrototypes({ prototypeId: id, limit: 1, offset: 0 })`
    - `fetchPrototypes` → `protopedia.listPrototypes({ prototypeId: id, limit: 1, offset: 0 })`

In other words, PLAYLIST mode orchestrates **a sequence of SHOW-equivalent
fetches** driven by URL query parameters and the internal queue, without
introducing a new fetch mechanism.
