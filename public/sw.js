const CACHE_NAME = 'mab-mab-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
];

// Install: clear all old caches and precache essentials
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(PRECACHE_URLS);
      });
    }).then(() => {
      // Force activate — don't wait for existing pages
      return self.skipWaiting();
    })
  );
});

// Activate: claim all clients and clean up
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      // Notify all clients that the SW is active
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_ACTIVATED', version: CACHE_NAME });
        });
      });
    })
  );
});

// Fetch: network-first strategy — always go to network, fall back to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension: and other non-http(s) requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for offline fallback
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(event.request);
      })
  );
});
