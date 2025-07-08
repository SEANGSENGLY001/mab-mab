// Service Worker for Birthday Website
// Provides offline caching and performance improvements

const CACHE_NAME = 'birthday-website-v1.0';
const STATIC_CACHE = 'birthday-static-v1.0';
const DYNAMIC_CACHE = 'birthday-dynamic-v1.0';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index-mobile-optimized.html',
    '/styles-mobile-optimized.css',
    '/script-mobile-optimized.js',
    '/data.js',
    // Add other critical assets as needed
];

// Assets to cache dynamically
const DYNAMIC_ASSETS = [
    '/firebase-config.js',
    '/admin-script.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((error) => {
                console.error('Service Worker: Failed to cache static assets', error);
            })
    );
    
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete old caches
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Take control of all clients immediately
    self.clients.claim();
});

// Fetch event - serve cached content when possible
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    
                    // For HTML files, also fetch fresh version in background
                    if (event.request.headers.get('Accept').includes('text/html')) {
                        fetchAndCache(event.request);
                    }
                    
                    return cachedResponse;
                }
                
                // Fetch from network and cache
                return fetchAndCache(event.request);
            })
            .catch((error) => {
                console.error('Service Worker: Fetch failed', error);
                
                // Provide offline fallback for HTML requests
                if (event.request.headers.get('Accept').includes('text/html')) {
                    return caches.match('/index-mobile-optimized.html');
                }
                
                // For other requests, return a simple offline response
                return new Response('Offline content not available', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                        'Content-Type': 'text/plain'
                    })
                });
            })
    );
});

// Helper function to fetch and cache requests
function fetchAndCache(request) {
    return fetch(request)
        .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Determine which cache to use
            const cacheName = isStaticAsset(request.url) ? STATIC_CACHE : DYNAMIC_CACHE;
            
            // Cache the response
            caches.open(cacheName)
                .then((cache) => {
                    console.log('Service Worker: Caching new resource', request.url);
                    cache.put(request, responseToCache);
                })
                .catch((error) => {
                    console.error('Service Worker: Failed to cache', request.url, error);
                });
            
            return response;
        });
}

// Check if URL is a static asset
function isStaticAsset(url) {
    return STATIC_ASSETS.some(asset => url.includes(asset)) ||
           url.includes('.css') ||
           url.includes('.js') ||
           url.includes('.png') ||
           url.includes('.jpg') ||
           url.includes('.jpeg') ||
           url.includes('.svg') ||
           url.includes('.ico');
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Perform background tasks here
            syncOfflineActions()
        );
    }
});

// Sync offline actions when back online
function syncOfflineActions() {
    return new Promise((resolve) => {
        // Check if there are any offline actions to sync
        const offlineActions = getOfflineActions();
        
        if (offlineActions.length > 0) {
            console.log('Service Worker: Syncing offline actions', offlineActions.length);
            
            // Process offline actions
            Promise.all(
                offlineActions.map(action => processOfflineAction(action))
            ).then(() => {
                clearOfflineActions();
                resolve();
            }).catch((error) => {
                console.error('Service Worker: Failed to sync offline actions', error);
                resolve();
            });
        } else {
            resolve();
        }
    });
}

// Get offline actions from IndexedDB or localStorage
function getOfflineActions() {
    try {
        const actions = localStorage.getItem('offlineActions');
        return actions ? JSON.parse(actions) : [];
    } catch (error) {
        console.error('Service Worker: Failed to get offline actions', error);
        return [];
    }
}

// Process a single offline action
function processOfflineAction(action) {
    return new Promise((resolve) => {
        // Example: Send analytics data, form submissions, etc.
        console.log('Service Worker: Processing offline action', action);
        
        // Simulate processing
        setTimeout(() => {
            resolve();
        }, 100);
    });
}

// Clear offline actions after successful sync
function clearOfflineActions() {
    try {
        localStorage.removeItem('offlineActions');
        console.log('Service Worker: Cleared offline actions');
    } catch (error) {
        console.error('Service Worker: Failed to clear offline actions', error);
    }
}

// Handle push notifications (optional)
self.addEventListener('push', (event) => {
    if (event.data) {
        const options = {
            body: event.data.text(),
            icon: '/icon-192x192.png',
            badge: '/icon-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            },
            actions: [
                {
                    action: 'explore',
                    title: 'View',
                    icon: '/icon-192x192.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/icon-192x192.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification('Birthday Website', options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE).then((cache) => {
                return cache.addAll(event.data.payload);
            })
        );
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
        event.waitUntil(
            syncContent()
        );
    }
});

// Sync content in background
function syncContent() {
    return new Promise((resolve) => {
        console.log('Service Worker: Performing periodic content sync');
        
        // Check for updated content
        fetch('/api/check-updates')
            .then(response => response.json())
            .then(data => {
                if (data.hasUpdates) {
                    // Notify clients about updates
                    self.clients.matchAll().then(clients => {
                        clients.forEach(client => {
                            client.postMessage({
                                type: 'CONTENT_UPDATED',
                                data: data
                            });
                        });
                    });
                }
                resolve();
            })
            .catch((error) => {
                console.error('Service Worker: Content sync failed', error);
                resolve();
            });
    });
}
