// Service Worker Registration for Bexy Flowers
// This file handles the registration and lifecycle of the service worker

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${'/'}sw.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('[SW] Service Worker registered successfully:', registration.scope);

          // Service worker will check for updates automatically on page load
          // No need for continuous background checking

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log('[SW] New content is available; please refresh.');
                  
                  // Notify user about update
                  if (window.confirm('New version available! Reload to update?')) {
                    installingWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                } else {
                  // Content is cached for offline use
                  console.log('[SW] Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.error('[SW] Service Worker registration failed:', error);
        });

      // Handle controller change (new SW activated)
      let refreshing = false;
      const handleControllerChange = () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      };
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      // NOTE: Event listener removal is not needed here because:
      // 1. This runs inside window.addEventListener('load', ...) which only runs once
      // 2. The page reloads when controller changes, so cleanup happens naturally
      // 3. Service worker lifecycle events are global and expected to persist
      // However, if unregister() is called, it should handle cleanup (see unregister function)
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('[SW] Error unregistering service worker:', error);
      });
  }
}

// Clear all caches
export function clearCache() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    
    return new Promise((resolve) => {
      navigator.serviceWorker.addEventListener('message', function handler(event) {
        if (event.data && event.data.type === 'CACHE_CLEARED') {
          navigator.serviceWorker.removeEventListener('message', handler);
          console.log('[SW] All caches cleared');
          resolve(true);
        }
      });
    });
  }
  return Promise.resolve(false);
}
