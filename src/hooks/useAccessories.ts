import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAccessories,
  getAccessory,
  createAccessory,
  updateAccessory,
  deleteAccessory
} from '@/lib/api/accessories';

// Query keys for better cache management
export const accessoriesQueryKeys = {
  all: ['accessories'] as const,
  lists: () => [...accessoriesQueryKeys.all, 'list'] as const,
  list: (filters?: { category?: string; featured?: boolean; isActive?: boolean }) =>
    [...accessoriesQueryKeys.lists(), filters] as const,
  details: () => [...accessoriesQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...accessoriesQueryKeys.details(), id] as const,
};

/**
 * React Query hook for fetching accessories with advanced caching
 */
export const useAccessories = (filters?: {
  category?: string;
  featured?: boolean;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: accessoriesQueryKeys.list(filters),
    queryFn: () => getAccessories(filters),
    staleTime: 2 * 60 * 1000, // Reduced from 5 min to prevent memory buildup
    gcTime: 5 * 60 * 1000, // Reduced from 10 min to prevent memory leaks
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Use cached data if available
    // Removed onSuccess prefetching to prevent memory accumulation
  });
};

/**
 * React Query hook for fetching a single accessory
 */
export const useAccessory = (id: string | undefined) => {
  return useQuery({
    queryKey: accessoriesQueryKeys.detail(id!),
    queryFn: () => getAccessory(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // Reduced from 5 min to prevent memory buildup
    gcTime: 5 * 60 * 1000, // Reduced from 10 min to prevent memory leaks
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Mutation hook for creating accessories
 */
export const useCreateAccessory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accessory, images }: {
      accessory: Parameters<typeof createAccessory>[0];
      images?: File[];
    }) => createAccessory(accessory, images?.[0]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessoriesQueryKeys.lists() });
    },
  });
};

/**
 * Mutation hook for updating accessories
 */
export const useUpdateAccessory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
      newImages,
      imagesToDelete
    }: {
      id: string;
      updates: Parameters<typeof updateAccessory>[1];
      newImages?: File[];
      imagesToDelete?: string[];
    }) => updateAccessory(id, updates, newImages?.[0], (imagesToDelete?.length ?? 0) > 0),
    onSuccess: (data) => {
      queryClient.setQueryData(accessoriesQueryKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: accessoriesQueryKeys.lists() });
    },
  });
};

/**
 * Mutation hook for deleting accessories
 */
export const useDeleteAccessory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccessory,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: accessoriesQueryKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: accessoriesQueryKeys.lists() });
    },
  });
};




