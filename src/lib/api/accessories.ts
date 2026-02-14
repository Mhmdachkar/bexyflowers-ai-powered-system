import { db } from './database-client';
import { uploadImage, deleteImage, extractPathFromUrl } from '../supabase-storage';
import type { Database } from '../supabase';

type Accessory = Database['public']['Tables']['accessories']['Row'];
type AccessoryInsert = Database['public']['Tables']['accessories']['Insert'];
type AccessoryUpdate = Database['public']['Tables']['accessories']['Update'];

/**
 * Get all accessories
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function getAccessories(filters?: { category?: string; featured?: boolean; isActive?: boolean }): Promise<Accessory[]> {
  const dbFilters: Record<string, any> = {};

  // Apply filters if provided
  if (filters?.isActive !== undefined) {
    dbFilters.is_active = filters.isActive;
  }

  const data = await db.select<Accessory>('accessories', {
    filters: Object.keys(dbFilters).length > 0 ? dbFilters : undefined,
    orderBy: { column: 'name', ascending: true },
  });

  return data || [];
}

/**
 * Get a single accessory by ID
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function getAccessory(id: string): Promise<Accessory | null> {
  const data = await db.select<Accessory>('accessories', {
    filters: { id },
    limit: 1,
  });

  return data && data.length > 0 ? data[0] : null;
}

/**
 * Create a new accessory
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function createAccessory(
  accessory: Omit<AccessoryInsert, 'id' | 'created_at' | 'updated_at' | 'image_url'>,
  image?: File
): Promise<Accessory> {
  let imageUrl: string | null = null;

  // Upload image if provided
  if (image) {
    try {
      const result = await uploadImage('accessory-images', image);
      imageUrl = result.url;
    } catch (error) {
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const data = await db.insert<Accessory>('accessories', {
    ...accessory,
    image_url: imageUrl,
  });

  if (!data) {
    throw new Error('Failed to create accessory');
  }

  return data;
}

/**
 * Update an accessory
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function updateAccessory(
  id: string,
  updates: AccessoryUpdate,
  newImage?: File,
  deleteOldImage?: boolean
): Promise<Accessory> {
  // Delete old image if requested
  if (deleteOldImage) {
    const currentAccessory = await getAccessory(id);
    if (currentAccessory?.image_url) {
      try {
        const path = extractPathFromUrl(currentAccessory.image_url, 'accessory-images');
        await deleteImage('accessory-images', path);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }
  }

  // Upload new image if provided
  let imageUrl = updates.image_url;
  if (newImage) {
    try {
      const result = await uploadImage('accessory-images', newImage);
      imageUrl = result.url;
    } catch (error) {
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const data = await db.update<Accessory>('accessories', { id }, {
    ...updates,
    image_url: imageUrl,
  });

  if (!data || data.length === 0) {
    throw new Error('Failed to update accessory');
  }

  return data[0];
}

/**
 * Delete an accessory
 */
export async function deleteAccessory(id: string): Promise<void> {
  // Delete associated image
  const accessory = await getAccessory(id);
  if (accessory?.image_url) {
    try {
      const path = extractPathFromUrl(accessory.image_url, 'accessory-images');
      await deleteImage('accessory-images', path);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  await db.delete('accessories', { id });
}

