import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWeddingCreations,
  getWeddingCreation,
  createWeddingCreation,
  updateWeddingCreation,
  deleteWeddingCreation
} from '@/lib/api/wedding-creations';

// Query keys for better cache management
export const weddingQueryKeys = {
  all: ['wedding-creations'] as const,
  lists: () => [...weddingQueryKeys.all, 'list'] as const,
  list: (filters?: { category?: string; featured?: boolean; isActive?: boolean }) =>
    [...weddingQueryKeys.lists(), filters] as const,
  details: () => [...weddingQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...weddingQueryKeys.details(), id] as const,
};

/**
 * React Query hook for fetching wedding creations with advanced caching
 */
export const useWeddingCreations = (filters?: {
  category?: string;
  featured?: boolean;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: weddingQueryKeys.list(filters),
    queryFn: () => getWeddingCreations(filters),
    // ⚡ PERFORMANCE: Increased cache times to reduce API calls and improve loading
    staleTime: 30 * 60 * 1000, // 30 minutes - wedding data doesn't change frequently
    gcTime: 60 * 60 * 1000, // 60 minutes - keep cached data longer for repeat visits
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Use cached data if available
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });
};

/**
 * React Query hook for fetching a single wedding creation
 */
export const useWeddingCreation = (id: string | undefined) => {
  return useQuery({
    queryKey: weddingQueryKeys.detail(id!),
    queryFn: () => getWeddingCreation(id!),
    enabled: !!id,
    // ⚡ PERFORMANCE: Increased cache times for faster detail loading
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

/**
 * Mutation hook for creating wedding creations
 */
export const useCreateWeddingCreation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ creation, images }: {
      creation: Parameters<typeof createWeddingCreation>[0];
      images?: File[];
    }) => createWeddingCreation(creation, images?.[0] as File),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: weddingQueryKeys.lists() });
    },
  });
};

/**
 * Mutation hook for updating wedding creations
 */
export const useUpdateWeddingCreation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
      newImages,
      imagesToDelete
    }: {
      id: string;
      updates: Parameters<typeof updateWeddingCreation>[1];
      newImages?: File[];
      imagesToDelete?: string[];
    }) => updateWeddingCreation(id, updates, newImages?.[0], (imagesToDelete?.length ?? 0) > 0),
    onSuccess: (data) => {
      queryClient.setQueryData(weddingQueryKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: weddingQueryKeys.lists() });
    },
  });
};

/**
 * Mutation hook for deleting wedding creations
 */
export const useDeleteWeddingCreation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWeddingCreation,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: weddingQueryKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: weddingQueryKeys.lists() });
    },
  });
};




