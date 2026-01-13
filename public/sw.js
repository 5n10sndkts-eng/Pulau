/**
 * Pulau Service Worker
 * Story: 26.1 - Implement Service Worker for Ticket Caching
 *
 * Provides offline access to booking tickets with 30-day cache retention.
 * Uses Network-First strategy for ticket data to ensure freshness.
 */

const CACHE_VERSION = 'pulau-tickets-v1';
const CACHE_EXPIRATION_DAYS = 30;
const CACHE_EXPIRATION_MS = CACHE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

// Assets to cache immediately on install
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json'];

// Patterns for ticket-related URLs to cache
const TICKET_URL_PATTERNS = [
  /\/bookings\/.*\/ticket/,
  /\/api\/bookings\/.*/,
  /\/qr-codes\/.*/,
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        // Force immediate activation
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      }),
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_VERSION)
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }),
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        // Take control of all clients immediately
        return self.clients.claim();
      }),
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Check if this is a ticket-related request
  const isTicketRequest = TICKET_URL_PATTERNS.some((pattern) =>
    pattern.test(url.pathname),
  );

  if (isTicketRequest) {
    // Network-First strategy for tickets (fresher data when online)
    event.respondWith(networkFirstStrategy(request));
  } else if (isAsset(url)) {
    // Cache-First strategy for static assets
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // Default: Network-First for everything else
    event.respondWith(networkFirstStrategy(request));
  }
});

/**
 * Network-First caching strategy
 * Try network first, fall back to cache if offline
 */
async function networkFirstStrategy(request) {
  try {
    // Try to fetch from network
    const networkResponse = await fetch(request);

    // If successful, update cache with fresh data
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_VERSION);

      // Clone response before caching (can only read once)
      const responseToCache = networkResponse.clone();

      // Add timestamp metadata for expiration
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: new Headers(responseToCache.headers),
      });

      // Add cache timestamp header
      cachedResponse.headers.set('X-Cache-Timestamp', Date.now().toString());

      // Cache the response
      await cache.put(request, cachedResponse);

      console.log('[Service Worker] Cached fresh data for:', request.url);
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log(
      '[Service Worker] Network failed, trying cache for:',
      request.url,
    );

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      // Check if cache is expired
      const cacheTimestamp = cachedResponse.headers.get('X-Cache-Timestamp');

      if (cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp, 10);

        if (age > CACHE_EXPIRATION_MS) {
          console.warn(
            '[Service Worker] Cached data expired (>30 days):',
            request.url,
          );
          // Return expired data but log warning
          // In production, might want to delete expired entries
        } else {
          console.log(
            '[Service Worker] Serving from cache (age:',
            Math.floor(age / 1000 / 60 / 60),
            'hours)',
          );
        }
      }

      return cachedResponse;
    }

    // No cache available, return error response
    console.error('[Service Worker] No cache available for:', request.url);
    return new Response('Offline and no cached data available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
    });
  }
}

/**
 * Cache-First caching strategy
 * Try cache first, fetch from network if not cached
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log('[Service Worker] Serving from cache:', request.url);
    return cachedResponse;
  }

  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_VERSION);
      await cache.put(request, networkResponse.clone());
      console.log('[Service Worker] Cached new asset:', request.url);
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Failed to fetch:', request.url, error);
    return new Response('Asset not available offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Check if URL is a static asset
 */
function isAsset(url) {
  const assetExtensions = [
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.svg',
    '.woff',
    '.woff2',
    '.ttf',
  ];
  return assetExtensions.some((ext) => url.pathname.endsWith(ext));
}

/**
 * Message handler for cache management commands
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_TICKET') {
    // Manually cache a specific ticket
    const { url } = event.data;
    if (url) {
      fetch(url)
        .then((response) => {
          if (response.ok) {
            return caches
              .open(CACHE_VERSION)
              .then((cache) => cache.put(url, response));
          }
        })
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
        .catch((error) => {
          console.error('[Service Worker] Manual cache failed:', error);
          event.ports[0].postMessage({ success: false, error: error.message });
        });
    }
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    // Clear all caches (for debugging/testing)
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(cacheNames.map((name) => caches.delete(name))),
      )
      .then(() => {
        event.ports[0].postMessage({ success: true });
      })
      .catch((error) => {
        event.ports[0].postMessage({ success: false, error: error.message });
      });
  }
});

console.log('[Service Worker] Loaded successfully');
