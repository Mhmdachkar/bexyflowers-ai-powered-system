import { useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from '@/lib/navigation-compat';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Navigation patterns and their likely next destinations
 * Based on user behavior analysis and site structure
 */
const NAVIGATION_PATTERNS = {
  '/': ['/collection', '/wedding-and-events', '/customize', '/checkout', '/cart'],
  '/collection': ['/product/:id', '/wedding-and-events', '/favorites', '/checkout', '/cart'],
  '/product/:id': ['/checkout', '/collection', '/cart'],
  '/wedding-and-events': ['/collection', '/customize', '/'],
  '/customize': ['/checkout', '/wedding-and-events', '/collection'],
  '/checkout': ['/cart', '/', '/favorites'],
  '/cart': ['/checkout', '/collection', '/favorites'],
  '/favorites': ['/cart', '/checkout', '/collection'],
  '/about': ['/collection', '/wedding-and-events', '/'],
} as const;

/**
 * Components that are commonly shared across pages
 * These get pre-loaded for better performance
 */
const SHARED_COMPONENTS = [
  'UltraNavigation',
  'Footer',
  'UltraHero',
  'UltraCategories',
  'UltraFeaturedBouquets',
  'CollectionHero',
  'CategoryNavigation',
  'BouquetGrid',
  'FeaturedCarousel',
] as const;

/**
 * Hook for intelligent component pre-loading based on navigation patterns
 * Uses React Query's prefetch capabilities and lazy loading predictions
 */
export const useComponentPrefetch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefetchedComponentsRef = useRef<Set<string>>(new Set());
  const MAX_PREFETCHED_SIZE = 50; // Limit prefetch cache size to prevent memory leaks

  /**
   * Get likely next routes based on current location
   */
  const getLikelyNextRoutes = useCallback((currentPath: string) => {
    // Handle dynamic routes like /product/:id
    const basePath = currentPath.split('/').slice(0, 2).join('/');
    return NAVIGATION_PATTERNS[basePath as keyof typeof NAVIGATION_PATTERNS] || [];
  }, []);

  /**
   * Pre-load components for a specific route
   */
  const prefetchRouteComponents = useCallback((route: string) => {
    // Prevent duplicate prefetching
    if (prefetchedComponentsRef.current.has(route)) {
      return;
    }

    // Limit cache size to prevent memory leaks - remove oldest entries if limit exceeded
    if (prefetchedComponentsRef.current.size >= MAX_PREFETCHED_SIZE) {
      const firstEntry = prefetchedComponentsRef.current.values().next().value;
      prefetchedComponentsRef.current.delete(firstEntry);
    }

    prefetchedComponentsRef.current.add(route);

    // Import and cache components based on route
    switch (route) {
      case '/collection':
        // Pre-load collection-specific components
        import('@/components/collection/CollectionHero').catch(() => {});
        import('@/components/collection/CategoryNavigation').catch(() => {});
        import('@/components/collection/BouquetGrid').catch(() => {});
        import('@/components/collection/FeaturedCarousel').catch(() => {});
        break;

      case '/product/:id':
        // Pre-load product detail components
        import('@/views/ProductDetailPage').catch(() => {});
        break;

      case '/wedding-and-events':
        // Pre-load wedding-specific components
        import('@/views/WeddingAndEvents').catch(() => {});
        import('@/components/culture/FlowerCareGuide').catch(() => {});
        break;

      case '/customize':
        // Pre-load customization components
        import('@/views/Customize').catch(() => {});
        import('@/components/bouquet/BouquetBuilder').catch(() => {});
        break;

      case '/checkout':
        // Pre-load checkout components
        import('@/views/Checkout').catch(() => {});
        break;

      case '/cart':
        // Pre-load cart components
        import('@/components/cart/CartPage').catch(() => {});
        break;

      case '/favorites':
        // Pre-load favorites components
        import('@/views/Favorites').catch(() => {});
        break;
    }
  }, []);

  /**
   * Pre-load shared components that are used across multiple pages
   */
  const prefetchSharedComponents = useCallback(() => {
    SHARED_COMPONENTS.forEach((componentName) => {
      if (!prefetchedComponentsRef.current.has(`shared-${componentName}`)) {
        prefetchedComponentsRef.current.add(`shared-${componentName}`);

        // Import shared components with error handling
        switch (componentName) {
          case 'UltraNavigation':
            import('@/components/UltraNavigation').catch(() => {});
            break;
          case 'Footer':
            import('@/components/Footer').catch(() => {});
            break;
          case 'UltraHero':
            import('@/components/UltraHero').catch(() => {});
            break;
          case 'UltraCategories':
            import('@/components/UltraCategories').catch(() => {});
            break;
          case 'UltraFeaturedBouquets':
            import('@/components/UltraFeaturedBouquets').catch(() => {});
            break;
        }
      }
    });
  }, []);

  /**
   * Smart prefetch based on current route and user behavior
   */
  const smartPrefetch = useCallback(() => {
    const currentPath = location.pathname;
    const likelyRoutes = getLikelyNextRoutes(currentPath);

    // Clear any existing prefetch timeout
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }

    // Prefetch after a short delay to avoid unnecessary work on quick navigation
    prefetchTimeoutRef.current = setTimeout(() => {
      // Pre-load shared components first
      prefetchSharedComponents();

      // Pre-load components for likely next routes
      likelyRoutes.forEach((route) => {
        prefetchRouteComponents(route);
      });

      // Pre-load data for likely routes using React Query
      likelyRoutes.forEach((route) => {
        if (route === '/collection') {
          // Pre-fetch collection data
          queryClient.prefetchQuery({
            queryKey: ['collection-products', 'list', { isActive: true }],
            queryFn: () => import('@/lib/api/collection-products').then(m => m.getCollectionProducts({ isActive: true })),
            staleTime: 5 * 60 * 1000,
          });
        }

        if (route === '/wedding-and-events') {
          // Pre-fetch wedding creations data
          queryClient.prefetchQuery({
            queryKey: ['wedding-creations', 'list', { isActive: true }],
            queryFn: () => import('@/lib/api/wedding-creations').then(m => m.getWeddingCreations({ isActive: true })),
            staleTime: 5 * 60 * 1000,
          });
        }
      });
    }, 200); // 200ms delay for smart prefetching
  }, [location.pathname, getLikelyNextRoutes, prefetchSharedComponents, prefetchRouteComponents, queryClient]);

  /**
   * Enhanced navigation with prefetch cancellation
   */
  const navigateWithPrefetch = useCallback((to: string, options?: { state?: any; replace?: boolean }) => {
    // Cancel any pending prefetches
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
      prefetchTimeoutRef.current = null;
    }

    // Navigate
    navigate(to, options);

    // Immediately prefetch components for the destination
    setTimeout(() => prefetchRouteComponents(to), 100);
  }, [navigate, prefetchRouteComponents]);

  // Smart prefetch on route change
  useEffect(() => {
    smartPrefetch();

    // Cleanup on unmount
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, [location.pathname, smartPrefetch]);

  return {
    navigateWithPrefetch,
    prefetchRouteComponents,
    prefetchSharedComponents,
    smartPrefetch,
  };
};




