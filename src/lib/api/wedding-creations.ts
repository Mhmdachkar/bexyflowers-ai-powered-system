import { db } from './database-client';
import { uploadImage, deleteImage, extractPathFromUrl } from '../supabase-storage';
import type { Database } from '../supabase';

type WeddingCreation = Database['public']['Tables']['wedding_creations']['Row'];
type WeddingCreationInsert = Database['public']['Tables']['wedding_creations']['Insert'];
type WeddingCreationUpdate = Database['public']['Tables']['wedding_creations']['Update'];

/**
 * Get wedding creations with optional filters
 */
export async function getWeddingCreations(filters?: {
  category?: string;
  featured?: boolean;
  isActive?: boolean;
}): Promise<WeddingCreation[]> {
  const queryFilters: Record<string, any> = {};
  
  if (filters?.isActive !== undefined) {
    queryFilters.is_active = filters.isActive;
  }
  
  if (filters?.featured !== undefined) {
    queryFilters.featured = filters.featured;
  }
  
  if (filters?.category) {
    queryFilters.category = filters.category;
  }
  
  return await db.select<WeddingCreation>('wedding_creations', {
    filters: Object.keys(queryFilters).length > 0 ? queryFilters : undefined,
    orderBy: { column: 'display_order', ascending: true }
  });
}

/**
 * Get active wedding creations (public - only active)
 */
export async function getActiveWeddingCreations(): Promise<WeddingCreation[]> {
  return await db.select<WeddingCreation>('wedding_creations', {
    filters: { is_active: true },
    orderBy: { column: 'display_order', ascending: true }
  });
}

/**
 * Get a single wedding creation by ID
 */
export async function getWeddingCreation(id: string): Promise<WeddingCreation | null> {
  return await db.selectOne<WeddingCreation>('wedding_creations', { id });
}

/**
 * Create a new wedding creation
 */
export async function createWeddingCreation(
  creation: Omit<WeddingCreationInsert, 'id' | 'created_at' | 'updated_at' | 'image_url'>,
  image: File
): Promise<WeddingCreation> {
  // Upload image
  let imageUrl: string;
  try {
    const result = await uploadImage('wedding-creations', image);
    imageUrl = result.url;
  } catch (error) {
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const data = await db.insert<WeddingCreation>('wedding_creations', {
      ...creation,
      image_url: imageUrl,
  });

  if (!data) {
    // Delete uploaded image if database insert fails
    try {
      const path = extractPathFromUrl(imageUrl, 'wedding-creations');
      await deleteImage('wedding-creations', path);
    } catch (deleteError) {
      console.error('Failed to delete uploaded image after insert failure:', deleteError);
    }
    throw new Error('Failed to create wedding creation');
  }

  return data;
}

/**
 * Update a wedding creation
 */
export async function updateWeddingCreation(
  id: string,
  updates: WeddingCreationUpdate,
  newImage?: File,
  deleteOldImage?: boolean
): Promise<WeddingCreation> {
  // Delete old image if requested
  if (deleteOldImage) {
    const currentCreation = await getWeddingCreation(id);
    if (currentCreation?.image_url) {
      try {
        const path = extractPathFromUrl(currentCreation.image_url, 'wedding-creations');
        await deleteImage('wedding-creations', path);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }
  }

  // Upload new image if provided
  let imageUrl: string | undefined = undefined;
  if (newImage) {
    try {
      const result = await uploadImage('wedding-creations', newImage);
      imageUrl = result.url;
      
      // Delete old image from Supabase Storage if we're replacing it
      // Only delete if the old URL is from Supabase Storage (contains the bucket name)
      const currentCreation = await getWeddingCreation(id);
      if (currentCreation?.image_url && currentCreation.image_url !== imageUrl) {
        // Check if old URL is from Supabase Storage
        if (currentCreation.image_url.includes('supabase') || currentCreation.image_url.includes('storage')) {
          try {
            const path = extractPathFromUrl(currentCreation.image_url, 'wedding-creations');
            await deleteImage('wedding-creations', path);
          } catch (error) {
            console.error('Error deleting old image from storage:', error);
          }
        }
      }
    } catch (error) {
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Build update data - only include image_url if we have a new one
  const updateData: any = { ...updates };
  if (imageUrl !== undefined) {
    updateData.image_url = imageUrl;
  } else if (updates.image_url !== undefined) {
    // Keep existing image_url if provided in updates (for local asset paths)
    updateData.image_url = updates.image_url;
  }

  const data = await db.update<WeddingCreation>('wedding_creations', { id }, updateData);

  if (!data || data.length === 0) {
    throw new Error('Failed to update wedding creation');
  }

  return data[0];
}

/**
 * Delete a wedding creation
 */
export async function deleteWeddingCreation(id: string): Promise<void> {
  // Delete associated image
  const creation = await getWeddingCreation(id);
  if (creation?.image_url) {
    try {
      const path = extractPathFromUrl(creation.image_url, 'wedding-creations');
      await deleteImage('wedding-creations', path);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  await db.delete('wedding_creations', { id });
}

