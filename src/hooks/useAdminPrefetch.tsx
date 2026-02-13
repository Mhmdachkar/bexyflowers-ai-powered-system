import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { collectionQueryKeys } from '@/hooks/useCollectionProducts';
import { getCheckoutOrders } from '@/lib/api/checkout';

/**
 * Hook to prefetch admin page data for faster navigation
 * Prefetches data for likely next pages based on current location
 */
export const useAdminPrefetch = () => {
  const queryClient = useQueryClient();
  const location = useLocation();

  useEffect(() => {
    const prefetchData = async () => {
      const currentPath = location.pathname;

      // Don't prefetch if not on admin pages
      if (!currentPath.startsWith('/admin')) return;

      // Prefetch common data needed across admin pages
      // Only prefetch if not already cached
      
      // Dashboard -> likely to navigate to Products
      if (currentPath === '/admin/dashboard') {
        queryClient.prefetchQuery({
          queryKey: collectionQueryKeys.list({ isActive: true }),
          staleTime: 5 * 60 * 1000, // Keep for 5 minutes
        });
      }

      // Products -> likely to navigate to Dashboard or Signature
      if (currentPath.startsWith('/admin/products')) {
        queryClient.prefetchQuery({
          queryKey: ['checkout-orders'],
          queryFn: getCheckoutOrders,
          staleTime: 5 * 60 * 1000,
        });
      }
    };

    // Prefetch with a slight delay to not block current page rendering
    const timeoutId = setTimeout(prefetchData, 300);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname, queryClient]);
};
