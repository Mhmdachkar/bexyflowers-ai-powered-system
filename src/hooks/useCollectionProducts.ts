import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCollectionProducts,
  getCollectionProduct,
  createCollectionProduct,
  updateCollectionProduct,
  deleteCollectionProduct,
  addTagsToProduct,
  removeTagsFromProduct,
  getAllTags
} from '@/lib/api/collection-products';
import type { Database } from '@/lib/supabase';

type CollectionProduct = Database['public']['Tables']['collection_products']['Row'];

// Query keys for better cache management
export const collectionQueryKeys = {
  all: ['collection-products'] as const,
  lists: () => [...collectionQueryKeys.all, 'list'] as const,
  list: (filters?: { category?: string; featured?: boolean; isActive?: boolean }) =>
    [...collectionQueryKeys.lists(), filters] as const,
  details: () => [...collectionQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...collectionQueryKeys.details(), id] as const,
  tags: () => [...collectionQueryKeys.all, 'tags'] as const,
};

/**
 * React Query hook for fetching collection products with advanced caching
 */
export const useCollectionProducts = (filters?: {
  category?: string;
  featured?: boolean;
  isActive?: boolean;
}) => {
  return useQuery<CollectionProduct[]>({
    queryKey: collectionQueryKeys.list(filters),
    queryFn: () => getCollectionProducts(filters),
    // ⚡ PERFORMANCE: Increased cache times to reduce API calls and improve mobile loading
    staleTime: 30 * 60 * 1000, // 30 minutes - products don't change frequently
    gcTime: 60 * 60 * 1000, // 60 minutes - keep cached data longer for repeat visits
    refetchOnWindowFocus: false, // Don't refetch on window focus for better UX
    refetchOnMount: false, // Use cached data if available
    refetchOnReconnect: false, // Don't refetch on network reconnect
    placeholderData: (previousData) => previousData, // Use previous data while fetching
  });
};

/**
 * React Query hook for fetching a single collection product
 */
export const useCollectionProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: collectionQueryKeys.detail(id!),
    queryFn: () => getCollectionProduct(id!),
    enabled: !!id,
    // ⚡ PERFORMANCE: Increased cache times for faster product detail loading
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

/**
 * React Query hook for fetching all tags
 */
export const useCollectionTags = () => {
  return useQuery({
    queryKey: collectionQueryKeys.tags(),
    queryFn: getAllTags,
    // ⚡ PERFORMANCE: Tags rarely change, cache for longer
    staleTime: 60 * 60 * 1000, // 60 minutes - tags change very rarely
    gcTime: 120 * 60 * 1000, // 2 hours - keep tags cached
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Mutation hook for creating collection products
 */
export const useCreateCollectionProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ product, images }: {
      product: Parameters<typeof createCollectionProduct>[0];
      images?: File[];
    }) => createCollectionProduct(product, images),
    onSuccess: () => {
      // Invalidate and refetch product lists
      queryClient.invalidateQueries({ queryKey: collectionQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: collectionQueryKeys.tags() });
    },
  });
};

/**
 * Mutation hook for updating collection products
 */
export const useUpdateCollectionProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
      newImages,
      imagesToDelete
    }: {
      id: string;
      updates: Parameters<typeof updateCollectionProduct>[1];
      newImages?: File[];
      imagesToDelete?: string[];
    }) => updateCollectionProduct(id, updates, newImages, imagesToDelete),
    onSuccess: (data) => {
      // Update the specific product in cache
      queryClient.setQueryData(collectionQueryKeys.detail(data.id), data);
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: collectionQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: collectionQueryKeys.tags() });
    },
  });
};

/**
 * Mutation hook for deleting collection products
 */
export const useDeleteCollectionProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCollectionProduct,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: collectionQueryKeys.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: collectionQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: collectionQueryKeys.tags() });
    },
  });
};

/**
 * Mutation hook for adding tags to products
 */
export const useAddTagsToProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) =>
      addTagsToProduct(id, tags),
    onSuccess: (data) => {
      // Update the specific product in cache
      queryClient.setQueryData(collectionQueryKeys.detail(data.id), data);
      // Invalidate tags list
      queryClient.invalidateQueries({ queryKey: collectionQueryKeys.tags() });
    },
  });
};

/**
 * Mutation hook for removing tags from products
 */
export const useRemoveTagsFromProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tagsToRemove }: { id: string; tagsToRemove: string[] }) =>
      removeTagsFromProduct(id, tagsToRemove),
    onSuccess: (data) => {
      // Update the specific product in cache
      queryClient.setQueryData(collectionQueryKeys.detail(data.id), data);
      // Invalidate tags list
      queryClient.invalidateQueries({ queryKey: collectionQueryKeys.tags() });
    },
  });
};




