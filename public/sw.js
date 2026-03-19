// Service Worker for Bexy Flowers - Advanced Caching Strategy
const CACHE_VERSION = 'bexy-flowers-v1.1.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Cache duration in milliseconds
const CACHE_DURATION = {
  static: 30 * 24 * 60 * 60 * 1000, // 30 days
  dynamic: 7 * 24 * 60 * 60 * 1000, // 7 days
  images: 30 * 24 * 60 * 60 * 1000, // 30 days
  api: 5 * 60 * 1000, // 5 minutes
};

// Static assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/bexy-flowers-logo.webp',
  '/assets/favicon.ico',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error('[SW] Failed to cache static assets:', err);
      });
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('bexy-flowers-') && !cacheName.startsWith(CACHE_VERSION)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Helper function to check if cache is expired
function isCacheExpired(cachedResponse, maxAge) {
  if (!cachedResponse) return true;
  
  const cachedTime = cachedResponse.headers.get('sw-cached-time');
  if (!cachedTime) return true;
  
  const age = Date.now() - parseInt(cachedTime, 10);
  return age > maxAge;
}

// Helper function to add timestamp to cached response
function addTimestampToResponse(response) {
  const clonedResponse = response.clone();
  const headers = new Headers(clonedResponse.headers);
  headers.append('sw-cached-time', Date.now().toString());
  
  return clonedResponse.blob().then((body) => {
    return new Response(body, {
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
      headers: headers,
    });
  });
}

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Strategy 1: Cache First for Images (with expiration)
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // Check if cache is expired
          if (cachedResponse && !isCacheExpired(cachedResponse, CACHE_DURATION.images)) {
            return cachedResponse;
          }

          // Fetch from network and update cache
          return fetch(request).then((networkResponse) => {
            if (networkResponse.ok && networkResponse.status === 200) {
              return addTimestampToResponse(networkResponse).then((responseWithTimestamp) => {
                cache.put(request, responseWithTimestamp.clone());
                return networkResponse;
              });
            }
            return networkResponse;
          }).catch(() => {
            // Return cached version even if expired when offline
            return cachedResponse || new Response('Image not available', { status: 404 });
          });
        });
      })
    );
    return;
  }

  // Strategy 2: Stale-While-Revalidate for API calls
  // ⚡ On mobile, serve the cached response IMMEDIATELY (zero wait) while refreshing in background.
  // This makes the signature-collection, products, etc. feel instant on repeat visits.
  // On the very first visit there is no cache entry, so it falls back to network-first.
  if (url.pathname.includes('/.netlify/functions/') || url.pathname.includes('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        // Background revalidation — always fetch fresh data and update cache
        const networkFetch = fetch(request).then(async (networkResponse) => {
          if (networkResponse.ok && networkResponse.status === 200) {
            const responseWithTimestamp = await addTimestampToResponse(networkResponse);
            cache.put(request, responseWithTimestamp.clone());
          }
          return networkResponse;
        }).catch(() => null);

        if (cachedResponse && !isCacheExpired(cachedResponse, CACHE_DURATION.api)) {
          // Serve stale-while-revalidate: return cached instantly, revalidate in background
          return cachedResponse;
        }

        // No valid cache: wait for network
        const networkResponse = await networkFetch;
        if (networkResponse) return networkResponse;

        // Offline fallback: serve even expired cache rather than an error
        if (cachedResponse) return cachedResponse;

        return new Response(JSON.stringify({ error: 'Network unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // Strategy 3: Cache First for Static Assets (JS, CSS, Fonts)
  if (url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/i)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse && !isCacheExpired(cachedResponse, CACHE_DURATION.static)) {
            return cachedResponse;
          }

          return fetch(request).then((networkResponse) => {
            if (networkResponse.ok && networkResponse.status === 200) {
              return addTimestampToResponse(networkResponse).then((responseWithTimestamp) => {
                cache.put(request, responseWithTimestamp.clone());
                return networkResponse;
              });
            }
            return networkResponse;
          }).catch(() => {
            return cachedResponse || new Response('Asset not available', { status: 404 });
          });
        });
      })
    );
    return;
  }

  // Strategy 4: Network First for HTML pages (with cache fallback)
  if (request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(request).then((networkResponse) => {
        return caches.open(DYNAMIC_CACHE).then((cache) => {
          if (networkResponse.ok && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        });
      }).catch(() => {
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || caches.match('/index.html');
        });
      })
    );
    return;
  }

  // Default: Network First with cache fallback (skip caching 206 Partial - Cache API doesn't support it)
  event.respondWith(
    fetch(request).then((networkResponse) => {
      return caches.open(DYNAMIC_CACHE).then((cache) => {
        if (networkResponse.ok && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      });
    }).catch(() => {
      return caches.match(request);
    })
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('bexy-flowers-')) {
              return caches.delete(cacheName);
            }
          })
        );
      }).then(() => {
        return self.clients.matchAll();
      }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'CACHE_CLEARED' });
        });
      })
    );
  }
});
