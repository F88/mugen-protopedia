// Minimal service worker for Mugen ProtoPedia
// Network-first for navigations + stale-while-revalidate for static assets.

const STATIC_CACHE = 'mp-static-v2'; // bump version due to shell strategy change
const APP_SHELL = ['/'];

// Extract /_next/static/*.css|.js asset URLs from HTML string
function extractStaticAssets(html) {
  const assets = new Set();
  const origin = self.location.origin;
  const cssRegex = /href="([^\"]+\.css)"/g;
  const jsRegex = /src="([^\"]+\.js)"/g;
  for (const m of html.matchAll(cssRegex)) {
    const u = m[1];
    if (u.startsWith('/_next/static/'))
      assets.add(new URL(u, origin).toString());
  }
  for (const m of html.matchAll(jsRegex)) {
    const u = m[1];
    if (u.startsWith('/_next/static/'))
      assets.add(new URL(u, origin).toString());
  }
  return Array.from(assets);
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      // 1. Precache base shell (root HTML)
      await cache.addAll(APP_SHELL);

      // 2. Fetch '/' and parse out critical hashed CSS/JS assets
      try {
        const res = await fetch('/');
        if (!res.ok)
          throw new Error('Failed to fetch root HTML for asset discovery');
        const html = await res.text();
        const assets = extractStaticAssets(html);
        if (assets.length > 0) {
          await cache.addAll(assets);
        }
      } catch (err) {
        // Failing to discover static assets is non-fatal; offline will still show basic shell.
        console.warn('[sw] asset discovery skipped', err);
      }
    })().catch((err) => {
      console.error('[sw] install failed; aborting activation', err);
      throw err; // Abort install so browser retries later
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
  const isAsset =
    /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2|woff|ttf|eot|webmanifest)$/.test(
      url.pathname,
    );
  if (isSameOrigin && isAsset) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(req);
        const networkPromise = fetch(req)
          .then((res) => {
            cache
              .put(req, res.clone())
              .catch((err) =>
                console.error(`[sw] Failed to cache ${req.url}:`, err),
              );
            return res;
          })
          .catch(() => undefined);
        // Avoid issuing a duplicate network request; surface a network error if both cache and network miss.
        return cached ?? (await networkPromise) ?? Response.error();
      })(),
    );
  }
});
