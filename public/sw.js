const CACHE_VERSION = 'v1';
const CACHE_NAME = `farmhand-${CACHE_VERSION}-__BUILD_ID__`;
const ROUTES = [
  '/',
  '/jogo/',
  '/jogo/novo/',
  '/rodada/',
  '/cartas/',
  '/regras/',
  '/guia/',
  '/ajustes/',
  '/fim/',
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const assets = await fetch('/precache.json', { cache: 'no-store' }).then(
        (r) => r.json(),
      );
      await cache.addAll([...ROUTES, '/manifest.webmanifest', ...assets]);
      await Promise.allSettled(
        ['saco-5', 'espiga-1', 'rato-menos-1'].map((name) =>
          cache.add(`/assets/tokens/${name}.png`),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (key.startsWith('farmhand-') && key !== CACHE_NAME)
          await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      if (request.mode === 'navigate') {
        try {
          const response = await fetch(request);
          if (response.ok) await cache.put(url.pathname, response.clone());
          return response;
        } catch {
          const path = url.pathname.endsWith('/')
            ? url.pathname
            : `${url.pathname}/`;
          return (
            (await cache.match(path, { ignoreSearch: true })) ||
            Response.error()
          );
        }
      }
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) return cached;
      const response = await fetch(request);
      if (
        response.ok &&
        (url.pathname.startsWith('/_next/static/') ||
          url.pathname.startsWith('/assets/') ||
          url.pathname.endsWith('.txt'))
      )
        await cache.put(request, response.clone());
      return response;
    })(),
  );
});
