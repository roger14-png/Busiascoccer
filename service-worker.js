/* Richer service worker caching strategy
   - Precache core assets (index, offline, manifest, icons, css)
   - Runtime cache for images (cache-first)
   - Network-first for navigation and API calls with offline fallback
   - Cache versioning and cleanup
*/

const CACHE_VERSION = 'v2';
const PRECACHE = `precache-${CACHE_VERSION}`;
const RUNTIME = `runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/index.css',
  '/manifest.json',
  '/icons/icon.svg'
];

// Utility: trim cache to max entries
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxItems);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(k => k !== PRECACHE && k !== RUNTIME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Simple network-first strategy for navigation and API
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    const precached = await caches.open(PRECACHE).then(c => c.match('/offline.html'));
    return precached;
  }
}

// Cache-first for images and static assets
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
      // keep images cache small
      if (request.destination === 'image') trimCache(RUNTIME, 60);
    }
    return response;
  } catch (err) {
    // fallback to precache if available
    return caches.open(PRECACHE).then(c => c.match('/offline.html'));
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return; // only cache GET

  const url = new URL(request.url);

  // Navigation requests (SPA) -> network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // API requests (assume /api/) -> network-first, cache responses for later
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/data/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Images -> cache-first
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Styles/scripts/icons -> stale-while-revalidate (serve cache then update)
  if (request.destination === 'style' || request.destination === 'script' || url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.endsWith('.webmanifest') || url.pathname.endsWith('.json')) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME);
      const cached = await cache.match(request);
      const networkPromise = fetch(request).then((response) => {
        if (response && response.ok) cache.put(request, response.clone());
        return response;
      }).catch(() => null);
      return cached || (await networkPromise) || (await caches.open(PRECACHE).then(c => c.match('/offline.html')));
    })());
    return;
  }

  // Default: try cache first then network
  event.respondWith((async () => {
    const cached = await caches.match(request);
    return cached || fetch(request).catch(() => caches.open(PRECACHE).then(c => c.match('/offline.html')));
  })());
});

// Allow web app to trigger skipWaiting when updating
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

