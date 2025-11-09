// Minimal service worker for Mugen ProtoPedia
// Network-first for navigations + stale-while-revalidate for static assets.

const STATIC_CACHE = 'mp-static-v1';
const APP_SHELL = ['/'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      try {
        // Fail fast if any critical shell asset can't be cached; browser will retry install later.
        await cache.addAll(APP_SHELL);
      } catch (err) {
        console.error(
          '[sw] failed to pre-cache app shell; aborting install',
          err,
        );
        // Rethrow so install rejects and SW does not activate with a broken offline state.
        throw err;
      }
    }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Navigations: try network, fallback to shell
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          const cache = await caches.open(STATIC_CACHE);
          const offline = await cache.match('/');
          return offline ?? Response.error();
        }
      })(),
    );
    return;
  }

  // Static assets: stale-while-revalidate
  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isAsset = /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js)$/.test(
    url.pathname,
  );
  if (isSameOrigin && isAsset) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(req);
        const networkPromise = fetch(req)
          .then((res) => {
            cache.put(req, res.clone()).catch(() => undefined);
            return res;
          })
          .catch(() => undefined);
        // Avoid issuing a duplicate network request; surface a network error if both cache and network miss.
        return cached ?? (await networkPromise) ?? Response.error();
      })(),
    );
  }
});
