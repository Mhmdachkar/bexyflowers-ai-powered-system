import { useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from '@/lib/navigation-compat';
import { useQueryClient } from '@tanstack/react-query';
import { useComponentPrefetch } from './useComponentPrefetch';

/**
 * Enhanced route prefetching that combines:
 * 1. Route chunk prefetching (existing)
 * 2. Component pre-loading (new)
 * 3. Data pre-fetching via React Query (new)
 * 4. Intersection Observer for lazy loading (new)
 */
export const useEnhancedRoutePrefetch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { prefetchRouteComponents } = useComponentPrefetch();

  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const prefetchedRoutesRef = useRef<Set<string>>(new Set());
  const createdLinksRef = useRef<HTMLLinkElement[]>([]);

  // ⚡ PERFORMANCE FIX: Cleanup on unmount - disconnect observer and remove prefetch links
  useEffect(() => {
    return () => {
      // Cleanup prefetch links to prevent DOM node accumulation
      createdLinksRef.current.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
      createdLinksRef.current = [];

      // Disconnect IntersectionObserver to prevent memory leaks
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
        intersectionObserverRef.current = null;
      }

      // Clear timeout if pending
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
        prefetchTimeoutRef.current = null;
      }
    };
  }, []);

  /**
   * Enhanced prefetch that includes route, components, and data
   */
  const enhancedPrefetch = useCallback((path: string) => {
    // Don't prefetch if already done or if it's the current route
    if (prefetchedRoutesRef.current.has(path) || location.pathname === path) {
      return;
    }

    // Mark as prefetched
    prefetchedRoutesRef.current.add(path);

    // 1. Route chunk prefetching (existing logic) - CHECK IF EXISTS FIRST
    const existingLink = document.querySelector(`link[rel="prefetch"][href="${path}"]`);
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'document';
      link.href = path;
      document.head.appendChild(link);
      createdLinksRef.current.push(link); // Track for cleanup
    }

    // 2. Component pre-loading (new)
    prefetchRouteComponents(path);

    // 3. Data pre-fetching based on route (new)
    prefetchRouteData(path);
  }, [location.pathname, prefetchRouteComponents]);

  /**
   * Pre-fetch data for specific routes using React Query
   */
  const prefetchRouteData = useCallback((path: string) => {
    // Extract route parameters and prefetch relevant data
    if (path.startsWith('/collection')) {
      // Prefetch collection products
      queryClient.prefetchQuery({
        queryKey: ['collection-products', 'list', { isActive: true }],
        queryFn: () => import('@/lib/api/collection-products').then(m => m.getCollectionProducts({ isActive: true })),
        staleTime: 5 * 60 * 1000,
      });
    }

    if (path.startsWith('/wedding-and-events')) {
      // Prefetch wedding creations
      queryClient.prefetchQuery({
        queryKey: ['wedding-creations', 'list', { isActive: true }],
        queryFn: () => import('@/lib/api/wedding-creations').then(m => m.getWeddingCreations({ isActive: true })),
        staleTime: 5 * 60 * 1000,
      });
    }

    if (path.startsWith('/product/')) {
      // For product pages, prefetch might be handled by the collection query
      // But we can prefetch related products or recommendations
      const productId = path.split('/product/')[1];
      if (productId) {
        queryClient.prefetchQuery({
          queryKey: ['collection-products', 'detail', productId],
          queryFn: () => import('@/lib/api/collection-products').then(m => m.getCollectionProduct(productId)),
          staleTime: 5 * 60 * 1000,
        });
      }
    }

    // Add more route-specific data prefetching as needed
  }, [queryClient]);

  /**
   * Handle hover event with enhanced prefetching
   */
  const handlePrefetch = useCallback((path: string, delay: number = 100) => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }

    prefetchTimeoutRef.current = setTimeout(() => {
      enhancedPrefetch(path);
    }, delay);
  }, [enhancedPrefetch]);

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
   * Enhanced navigation with prefetch cleanup
   */
  const navigateWithPrefetch = useCallback((
    path: string,
    options?: { state?: any; replace?: boolean }
  ) => {
    cancelPrefetch();
    navigate(path, options);
  }, [navigate, cancelPrefetch]);

  /**
   * Set up Intersection Observer for lazy loading components
   * ⚡ PERFORMANCE FIX: Properly disconnect observer on cleanup
   */
  const setupIntersectionObserver = useCallback((element: HTMLElement, callback: () => void) => {
    if (!intersectionObserverRef.current) {
      intersectionObserverRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              callback();
              // Once triggered, unobserve the element
              intersectionObserverRef.current?.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before element enters viewport
          threshold: 0.1,
        }
      );
    }

    intersectionObserverRef.current.observe(element);

    // Return cleanup function
    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.unobserve(element);
      }
    };
  }, []);

  /**
   * Lazy load component when it comes into view
   */
  const lazyLoadComponent = useCallback((
    element: HTMLElement,
    importFn: () => Promise<any>
  ): Promise<any> => {
    return new Promise((resolve) => {
      const cleanup = setupIntersectionObserver(element, async () => {
        try {
          const module = await importFn();
          resolve(module);
        } catch (error) {
          console.error('Failed to lazy load component:', error);
          resolve(null);
        }
        cleanup();
      });
    });
  }, [setupIntersectionObserver]);

  return {
    enhancedPrefetch,
    handlePrefetch,
    cancelPrefetch,
    navigate: navigateWithPrefetch,
    setupIntersectionObserver,
    lazyLoadComponent,
    prefetchedRoutes: prefetchedRoutesRef.current,
  };
};




