import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collectionQueryKeys } from './useCollectionProducts';
import { getCollectionProducts } from '@/lib/api/collection-products';
import { getCheckoutOrders } from '@/lib/api/checkout';

/**
 * Comprehensive React Query-based navigation prefetching
 * Prefetches data for all major routes based on user navigation patterns
 */
export const useNavigationPrefetch = () => {
  const queryClient = useQueryClient();
  const location = useLocation();

  // Prefetch collection products (used across multiple pages)
  const prefetchCollectionProducts = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: collectionQueryKeys.list({ isActive: true }),
      queryFn: () => getCollectionProducts({ isActive: true }),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, [queryClient]);

  // Prefetch specific route data
  const prefetchRoute = useCallback((path: string) => {
    switch (path) {
      case '/collection':
        prefetchCollectionProducts();
        break;
      
      case '/':
        // Homepage needs featured products
        queryClient.prefetchQuery({
          queryKey: collectionQueryKeys.list({ featured: true, isActive: true }),
          queryFn: () => getCollectionProducts({ featured: true, isActive: true }),
          staleTime: 5 * 60 * 1000,
        });
        break;
      
      case '/admin/dashboard':
        // Dashboard needs orders and products
        queryClient.prefetchQuery({
          queryKey: ['checkout-orders'],
          queryFn: getCheckoutOrders,
          staleTime: 5 * 60 * 1000,
        });
        prefetchCollectionProducts();
        break;
      
      case '/admin/products':
        prefetchCollectionProducts();
        break;
      
      default:
        break;
    }
  }, [queryClient, prefetchCollectionProducts]);

  // Prefetch on hover
  const handleLinkHover = useCallback((path: string) => {
    prefetchRoute(path);
  }, [prefetchRoute]);

  // Prefetch on focus (keyboard navigation)
  const handleLinkFocus = useCallback((path: string) => {
    prefetchRoute(path);
  }, [prefetchRoute]);

  // Auto-prefetch likely next pages based on current location
  useEffect(() => {
    const currentPath = location.pathname;
    const prefetchDelay = 500; // Wait 500ms after navigation before prefetching

    const timeoutId = setTimeout(() => {
      // Homepage -> likely to go to Collection
      if (currentPath === '/') {
        prefetchRoute('/collection');
      }
      
      // Collection -> likely to go back to Home or to Product Detail
      else if (currentPath === '/collection') {
        prefetchRoute('/');
      }
      
      // Admin Dashboard -> likely to go to Products
      else if (currentPath === '/admin/dashboard') {
        prefetchRoute('/admin/products');
      }
      
      // Admin Products -> likely to go back to Dashboard
      else if (currentPath.startsWith('/admin/products')) {
        prefetchRoute('/admin/dashboard');
      }
    }, prefetchDelay);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, prefetchRoute]);

  return {
    prefetchRoute,
    handleLinkHover,
    handleLinkFocus,
    prefetchCollectionProducts,
  };
};
