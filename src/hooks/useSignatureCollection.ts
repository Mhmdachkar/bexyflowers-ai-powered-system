import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSignatureCollections,
  getActiveSignatureCollections,
  addToSignatureCollection,
  removeFromSignatureCollection,
  updateSignatureCollection
} from '@/lib/api/signature-collection';

// Query keys for better cache management
export const signatureQueryKeys = {
  all: ['signature-collection'] as const,
  lists: () => [...signatureQueryKeys.all, 'list'] as const,
  list: (filters?: { category?: string; featured?: boolean; isActive?: boolean }) =>
    [...signatureQueryKeys.lists(), filters] as const,
  details: () => [...signatureQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...signatureQueryKeys.details(), id] as const,
};

/**
 * React Query hook for fetching signature collection with advanced caching.
 * ⚡ Frontend always fetches only ACTIVE items (smaller payload, faster parse).
 *    The admin panel can import getSignatureCollections() directly when it needs all items.
 */
export const useSignatureCollection = (filters?: {
  category?: string;
  featured?: boolean;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: signatureQueryKeys.list(filters),
    // ⚡ Use active-only endpoint on the frontend — filters out inactive items server-side,
    //    reducing payload size and parse time on mobile.
    queryFn: () => getActiveSignatureCollections(),
    staleTime: 10 * 60 * 1000, // 10 minutes — signature collection rarely changes
    gcTime: 15 * 60 * 1000,    // 15 minutes — keep in cache longer
    refetchOnWindowFocus: false,
    refetchOnMount: false,      // Use cached data if available
    refetchOnReconnect: false,
  });
};


/**
 * Mutation hook for adding product to signature collection
 */
export const useAddToSignatureCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, displayOrder }: {
      productId: string;
      displayOrder?: number;
    }) => addToSignatureCollection(productId, displayOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: signatureQueryKeys.lists() });
    },
  });
};

/**
 * Mutation hook for removing product from signature collection
 */
export const useRemoveFromSignatureCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => removeFromSignatureCollection(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: signatureQueryKeys.lists() });
    },
  });
};

/**
 * Mutation hook for updating signature collection item
 */
export const useUpdateSignatureCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: {
      id: string;
      updates: Parameters<typeof updateSignatureCollection>[1];
    }) => updateSignatureCollection(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: signatureQueryKeys.lists() });
    },
  });
};
