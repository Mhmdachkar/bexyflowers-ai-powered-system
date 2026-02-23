import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from '@/lib/navigation-compat';
import type { NavigateFunction, Location } from '@/lib/navigation-compat';

/**
 * Hook for prefetching routes on hover to enable instant navigation
 * Preloads route components and assets for faster page transitions
 */
export const useRoutePrefetch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefetchedRoutesRef = useRef<Set<string>>(new Set());

  /**
   * Prefetch a route component and its dependencies
   * Uses link rel="prefetch" for optimal browser prefetching
   */
  const prefetchRoute = useCallback((path: string) => {
    // Don't prefetch if already prefetched or if it's the current route
    if (prefetchedRoutesRef.current.has(path) || location.pathname === path) {
      return;
    }

    // Mark as prefetched immediately to prevent duplicate prefetches
    prefetchedRoutesRef.current.add(path);

    // Use native browser prefetching for route chunk
    // This tells the browser to prefetch the route HTML
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'document';
    link.href = path;
    document.head.appendChild(link);

    // Note: React Router lazy-loaded routes are automatically prefetched
    // by the browser when the route chunks are loaded. We don't need to
    // manually import them here as it would cause duplicate loading.
  }, [location.pathname]);

  /**
   * Handle hover event with debounce to prefetch route
   */
  const handlePrefetch = useCallback((path: string, delay: number = 100) => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }

    prefetchTimeoutRef.current = setTimeout(() => {
      prefetchRoute(path);
    }, delay);
  }, [prefetchRoute]);

  /**
   * Cancel pending prefetch
   */
  const cancelPrefetch = useCallback(() => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
      prefetchTimeoutRef.current = null;
    }
  }, []);

  /**
   * Navigate with optional state and prefetch cleanup
   */
  const navigateWithPrefetch = useCallback((
    path: string, 
    options?: { state?: any; replace?: boolean }
  ) => {
    cancelPrefetch();
    navigate(path, options);
  }, [navigate, cancelPrefetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelPrefetch();
    };
  }, [cancelPrefetch]);

  return {
    prefetchRoute,
    handlePrefetch,
    cancelPrefetch,
    navigate: navigateWithPrefetch,
    prefetchedRoutes: prefetchedRoutesRef.current
  };
};

