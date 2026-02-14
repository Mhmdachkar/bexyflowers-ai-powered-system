import { db } from './database-client';
import { uploadImage, uploadMultipleImages, deleteImage, extractPathFromUrl } from '../supabase-storage';
import type { Database } from '../supabase';

type CollectionProduct = Database['public']['Tables']['collection_products']['Row'];
type CollectionProductInsert = Database['public']['Tables']['collection_products']['Insert'];
type CollectionProductUpdate = Database['public']['Tables']['collection_products']['Update'];

/**
 * Get all collection products
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function getCollectionProducts(filters?: {
  category?: string;
  featured?: boolean;
  isActive?: boolean;
}): Promise<CollectionProduct[]> {
  const dbFilters: Record<string, any> = {};
  
  if (filters?.category) {
    dbFilters.category = filters.category;
  }
  if (filters?.featured !== undefined) {
    dbFilters.featured = filters.featured;
  }
  if (filters?.isActive !== undefined) {
    dbFilters.is_active = filters.isActive;
  }

  const data = await db.select<CollectionProduct>('collection_products', {
    filters: Object.keys(dbFilters).length > 0 ? dbFilters : undefined,
    orderBy: { column: 'created_at', ascending: false },
  });

  return data;
}

/**
 * Get a single collection product by ID
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function getCollectionProduct(id: string): Promise<CollectionProduct | null> {
  const data = await db.select<CollectionProduct>('collection_products', {
    filters: { id },
    limit: 1,
  });

  return data && data.length > 0 ? data[0] : null;
}

/**
 * Create a new collection product
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function createCollectionProduct(
  product: Omit<CollectionProductInsert, 'id' | 'created_at' | 'updated_at'>,
  images?: File[]
): Promise<CollectionProduct> {
  let imageUrls: string[] = [];

  // Upload images if provided
  if (images && images.length > 0) {
    try {
      imageUrls = await uploadMultipleImages('product-images', images);
    } catch (error) {
      throw new Error(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const data = await db.insert<CollectionProduct>('collection_products', {
    ...product,
    image_urls: imageUrls.length > 0 ? imageUrls : product.image_urls || [],
  });

  if (!data) {
    throw new Error('Failed to create collection product');
  }

  return data;
}

/**
 * Update a collection product
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function updateCollectionProduct(
  id: string,
  updates: CollectionProductUpdate,
  newImages?: File[],
  imagesToDelete?: string[]
): Promise<CollectionProduct> {
  // Delete old images if specified
  if (imagesToDelete && imagesToDelete.length > 0) {
    const deletePromises = imagesToDelete.map((url) => {
      try {
        const path = extractPathFromUrl(url, 'product-images');
        return deleteImage('product-images', path);
      } catch (error) {
        console.error('Error deleting image:', error);
        return Promise.resolve();
      }
    });
    await Promise.all(deletePromises);
  }

  // Upload new images if provided
  let newImageUrls: string[] = [];
  if (newImages && newImages.length > 0) {
    try {
      newImageUrls = await uploadMultipleImages('product-images', newImages);
    } catch (error) {
      throw new Error(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update image URLs
  const currentImageUrls = updates.image_urls || [];
  const remainingUrls = currentImageUrls.filter((url) => !imagesToDelete?.includes(url));
  const finalImageUrls = [...remainingUrls, ...newImageUrls];

  const data = await db.update<CollectionProduct>('collection_products', { id }, {
    ...updates,
    image_urls: finalImageUrls.length > 0 ? finalImageUrls : updates.image_urls,
  });

  if (!data || data.length === 0) {
    throw new Error('Failed to update collection product');
  }

  return data[0];
}

/**
 * Delete a collection product
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function deleteCollectionProduct(id: string): Promise<void> {
  // Get product to delete images
  const product = await getCollectionProduct(id);
  if (product && product.image_urls) {
    // Delete all associated images
    const deletePromises = product.image_urls.map((url) => {
      try {
        const path = extractPathFromUrl(url, 'product-images');
        return deleteImage('product-images', path);
      } catch (error) {
        console.error('Error deleting image:', error);
        return Promise.resolve();
      }
    });
    await Promise.all(deletePromises);
  }

  await db.delete('collection_products', { id });
}

/**
 * Add tags to a product
 */
export async function addTagsToProduct(id: string, tags: string[]): Promise<CollectionProduct> {
  const product = await getCollectionProduct(id);
  if (!product) {
    throw new Error('Product not found');
  }

  const currentTags = product.tags || [];
  const newTags = [...new Set([...currentTags, ...tags])]; // Remove duplicates

  return updateCollectionProduct(id, { tags: newTags });
}

/**
 * Remove tags from a product
 */
export async function removeTagsFromProduct(id: string, tagsToRemove: string[]): Promise<CollectionProduct> {
  const product = await getCollectionProduct(id);
  if (!product) {
    throw new Error('Product not found');
  }

  const currentTags = product.tags || [];
  const newTags = currentTags.filter((tag) => !tagsToRemove.includes(tag));

  return updateCollectionProduct(id, { tags: newTags });
}

/**
 * Get all unique tags from all products
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function getAllTags(): Promise<string[]> {
  const data = await db.select<CollectionProduct>('collection_products', {
    select: 'tags',
  });

  const allTags = new Set<string>();
  data.forEach((product) => {
    if (product.tags) {
      product.tags.forEach((tag) => allTags.add(tag));
    }
  });

  return Array.from(allTags).sort();
}

