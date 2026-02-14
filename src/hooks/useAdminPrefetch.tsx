import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { collectionQueryKeys } from '@/hooks/useCollectionProducts';
import { getCheckoutOrders } from '@/lib/api/checkout';
import { getCollectionProducts } from '@/lib/api/collection-products';

/**
 * Hook to prefetch admin page data for faster navigation
 * Prefetches data for likely next pages based on current location
 */
export const useAdminPrefetch = () => {
  const queryClient = useQueryClient();
  const location = useLocation();

  // Prefetch function that can be called on demand
  const prefetchRoute = useCallback((path: string) => {
    // Dashboard -> prefetch Products
    if (path === '/admin/dashboard') {
      queryClient.prefetchQuery({
        queryKey: ['checkout-orders'],
        queryFn: getCheckoutOrders,
        staleTime: 5 * 60 * 1000,
      });
      queryClient.prefetchQuery({
        queryKey: collectionQueryKeys.list({ isActive: true }),
        queryFn: () => getCollectionProducts({ isActive: true }),
        staleTime: 5 * 60 * 1000,
      });
    }

    // Products -> prefetch Dashboard data
    if (path.startsWith('/admin/products')) {
      queryClient.prefetchQuery({
        queryKey: ['checkout-orders'],
        queryFn: getCheckoutOrders,
        staleTime: 5 * 60 * 1000,
      });
    }

    // Signature/Eternal/Other -> prefetch Products
    if (path.includes('/signature') || path.includes('/eternal') || path.includes('/wedding')) {
      queryClient.prefetchQuery({
        queryKey: collectionQueryKeys.list({ isActive: true }),
        queryFn: () => getCollectionProducts({ isActive: true }),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [queryClient]);

  // Auto-prefetch based on current page
  useEffect(() => {
    const currentPath = location.pathname;

    // Don't prefetch if not on admin pages
    if (!currentPath.startsWith('/admin')) return;

    // Prefetch with a slight delay to not block current page rendering
    const timeoutId = setTimeout(() => {
      // Dashboard -> likely to navigate to Products
      if (currentPath === '/admin/dashboard') {
        prefetchRoute('/admin/products');
      }

      // Products -> likely to navigate to Dashboard
      if (currentPath.startsWith('/admin/products')) {
        prefetchRoute('/admin/dashboard');
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname, prefetchRoute]);

  return {
    prefetchRoute,
  };
};
