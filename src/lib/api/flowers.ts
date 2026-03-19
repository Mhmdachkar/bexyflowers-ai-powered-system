/**
 * Flowers API
 * 
 * SECURITY: All database access goes through the secure backend proxy (db client)
 * No direct Supabase access from frontend - prevents SQL injection
 */

import { db } from './database-client';
import { uploadImage, deleteImage, extractPathFromUrl } from '../supabase-storage';
import type { Database } from '../supabase';

type FlowerType = Database['public']['Tables']['flower_types']['Row'];
type FlowerTypeInsert = Database['public']['Tables']['flower_types']['Insert'];
type FlowerTypeUpdate = Database['public']['Tables']['flower_types']['Update'];

type FlowerColor = Database['public']['Tables']['flower_colors']['Row'];
type FlowerColorInsert = Database['public']['Tables']['flower_colors']['Insert'];
type FlowerColorUpdate = Database['public']['Tables']['flower_colors']['Update'];

export interface FlowerTypeWithColors extends FlowerType {
  colors: FlowerColor[];
}

// Flower Type Categories (Parent types like "Roses", "Tulips")
export interface FlowerTypeCategory {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== Flower Type Categories ====================

/**
 * Get all flower type categories
 */
export async function getFlowerTypeCategories(): Promise<FlowerTypeCategory[]> {
  const data = await db.select<FlowerTypeCategory>('flower_type_categories', {
    orderBy: { column: 'display_order', ascending: true },
  });
  return data || [];
}

/**
 * Get active flower type categories
 */
export async function getActiveFlowerTypeCategories(): Promise<FlowerTypeCategory[]> {
  const data = await db.select<FlowerTypeCategory>('flower_type_categories', {
    filters: { is_active: true },
    orderBy: { column: 'display_order', ascending: true },
  });
  return data || [];
}

/**
 * Create a new flower type category
 */
export async function createFlowerTypeCategory(
  category: Omit<FlowerTypeCategory, 'id' | 'created_at' | 'updated_at'>
): Promise<FlowerTypeCategory> {
  const data = await db.insert<FlowerTypeCategory>('flower_type_categories', category);
  if (!data) {
    throw new Error('Failed to create flower type category');
  }
  return data;
}

/**
 * Update a flower type category
 */
export async function updateFlowerTypeCategory(
  id: string,
  updates: Partial<Omit<FlowerTypeCategory, 'id' | 'created_at' | 'updated_at'>>
): Promise<FlowerTypeCategory> {
  const data = await db.update<FlowerTypeCategory>(
    'flower_type_categories',
    { id },
    { ...updates, updated_at: new Date().toISOString() }
  );
  if (!data || data.length === 0) {
    throw new Error('Failed to update flower type category');
  }
  return data[0];
}

/**
 * Delete a flower type category
 */
export async function deleteFlowerTypeCategory(id: string): Promise<void> {
  await db.delete('flower_type_categories', { id });
}

// ==================== Flower Types ====================

/**
 * Get all flower types
 */
export async function getFlowerTypes(): Promise<FlowerType[]> {
  const data = await db.select<FlowerType>('flower_types', {
    orderBy: { column: 'name', ascending: true },
  });
  return data || [];
}

/**
 * Get flower types by category
 */
export async function getFlowerTypesByCategory(categoryId: string): Promise<FlowerType[]> {
  const data = await db.select<FlowerType>('flower_types', {
    filters: { category_id: categoryId, is_active: true },
    orderBy: { column: 'name', ascending: true },
  });
  return data || [];
}

/**
 * Get flower type with colors
 */
export async function getFlowerTypeWithColors(id: string): Promise<FlowerTypeWithColors | null> {
  const flower = await db.selectOne<FlowerType>('flower_types', { id });
  
  if (!flower) {
    return null;
  }

  const colors = await db.select<FlowerColor>('flower_colors', {
    filters: { flower_id: id },
    orderBy: { column: 'name', ascending: true },
  });

  return {
    ...flower,
    colors: colors || [],
  };
}

/**
 * Create a flower type
 */
export async function createFlowerType(
  flower: Omit<FlowerTypeInsert, 'id' | 'created_at' | 'updated_at' | 'image_url'>,
  image?: File
): Promise<FlowerType> {
  let imageUrl: string | null = null;

  // Upload image if provided (storage is separate from DB proxy)
  if (image) {
    try {
      const result = await uploadImage('flower-images', image);
      imageUrl = result.url;
    } catch (error) {
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const data = await db.insert<FlowerType>('flower_types', {
    ...flower,
    image_url: imageUrl,
  });

  if (!data) {
    throw new Error('Failed to create flower type');
  }

  return data;
}

/**
 * Update a flower type
 */
export async function updateFlowerType(
  id: string,
  updates: FlowerTypeUpdate,
  newImage?: File,
  deleteOldImage?: boolean
): Promise<FlowerType> {
  // Delete old image if requested
  if (deleteOldImage) {
    const currentFlower = await getFlowerTypeWithColors(id);
    if (currentFlower?.image_url) {
      try {
        const path = extractPathFromUrl(currentFlower.image_url, 'flower-images');
        await deleteImage('flower-images', path);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }
  }

  // Upload new image if provided
  let imageUrl = updates.image_url;
  if (newImage) {
    try {
      const result = await uploadImage('flower-images', newImage);
      imageUrl = result.url;
    } catch (error) {
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const data = await db.update<FlowerType>(
    'flower_types',
    { id },
    { ...updates, image_url: imageUrl }
  );

  if (!data || data.length === 0) {
    throw new Error('Failed to update flower type');
  }

  return data[0];
}

/**
 * Delete a flower type (cascades to colors)
 */
export async function deleteFlowerType(id: string): Promise<void> {
  // Delete associated image
  const flower = await getFlowerTypeWithColors(id);
  if (flower?.image_url) {
    try {
      const path = extractPathFromUrl(flower.image_url, 'flower-images');
      await deleteImage('flower-images', path);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  await db.delete('flower_types', { id });
}

// ==================== Flower Colors ====================

/**
 * Get colors for a flower type
 */
export async function getFlowerColors(flowerId: string): Promise<FlowerColor[]> {
  const data = await db.select<FlowerColor>('flower_colors', {
    filters: { flower_id: flowerId },
    orderBy: { column: 'name', ascending: true },
  });
  return data || [];
}

/**
 * Create a flower color
 */
export async function createFlowerColor(
  color: Omit<FlowerColorInsert, 'id' | 'created_at' | 'updated_at'>
): Promise<FlowerColor> {
  const data = await db.insert<FlowerColor>('flower_colors', color);
  if (!data) {
    throw new Error('Failed to create flower color');
  }
  return data;
}

/**
 * Update a flower color
 */
export async function updateFlowerColor(id: string, updates: FlowerColorUpdate): Promise<FlowerColor> {
  const data = await db.update<FlowerColor>('flower_colors', { id }, updates);
  if (!data || data.length === 0) {
    throw new Error('Failed to update flower color');
  }
  return data[0];
}

/**
 * Delete a flower color
 */
export async function deleteFlowerColor(id: string): Promise<void> {
  await db.delete('flower_colors', { id });
}

// ==================== Customize Page Mapping ====================

/**
 * Enhanced flower format for Customize page
 * Maps database structure (flower_types + flower_colors) to individual flowers
 */
export interface CustomizeFlower {
  id: string; // Format: "{family}-{colorName}" (e.g., "roses-red")
  name: string; // Format: "{Color} {Family}" (e.g., "Red Rose")
  price: number;
  family: string;
  colorName: string;
  imageUrl: string;
  description: string;
  category: string;
  seasons?: string[]; // Can be enhanced with database column
  availabilityMode?: 'specific' | 'mix' | 'both'; // Where the flower appears in Customize page
  categoryId?: string; // Flower type category ID
  categoryName?: string; // Category name (e.g., "roses")
  categoryDisplayName?: string; // Category display name (e.g., "Roses")
  categoryIcon?: string; // Category icon (e.g., "🌹")
  quantity: number; // Available quantity in stock
  filterCategories?: string[]; // Filter categories: popular, romantic, minimal, luxury, seasonal
}

// Season mapping based on flower families (can be moved to database later)
// Uses the 'family' field from the mapping (matches static data)
const SEASON_MAPPING: Record<string, string[]> = {
  'roses': ['all-year'],
  'tulips': ['winter', 'spring'],
  'peonies': ['summer'],
  'chrysanthemum': ['all-year'], // Note: singular to match static data
  'gypsum': ['all-year'],
  'daisies': ['summer'],
  'sunflower': ['summer'], // Note: singular to match static data
  'lily': ['winter'], // Note: singular to match static data
  'orchid': ['winter'], // Note: singular to match static data
  'hydrangea': ['summer'], // Note: singular to match static data
  'gerbera': ['summer'], // Note: singular to match static data
  'lavender': ['summer'],
  'carnation': ['all-year'], // Note: singular to match static data
};

/**
 * Get all flowers in Customize page format
 * Maps database flower_types (each flower is now a separate type) to CustomizeFlower format
 * Only returns active flowers with quantity > 0
 */
export async function getFlowersForCustomize(): Promise<CustomizeFlower[]> {
  // Fetch all active flower types with quantity > 0, including category information
  // Each flower_type now represents an individual flower variant
  try {
    // First try with all fields including category join
    const flowerTypes = await db.select<any>('flower_types', {
      select: `
        id,
        name,
        title,
        price_per_stem,
        image_url,
        quantity,
        is_active,
        availability_mode,
        category_id,
        filter_categories,
        flower_type_categories (
          id,
          name,
          display_name,
          icon
        )
      `,
      filters: { is_active: true },
      orderBy: { column: 'name', ascending: true },
    });

    // Filter for quantity > 0 in JS (db proxy may not support gt operator in all cases)
    const filtered = (flowerTypes || []).filter((f: any) => f.quantity > 0);
    
    if (filtered.length === 0) {
      return [];
    }
    
    return mapFlowerTypesToCustomizeFlowers(filtered, false);
  } catch (error) {
    // BACKWARD COMPATIBLE: If error is due to missing columns, try without them
    console.warn('[getFlowersForCustomize] Full query failed, trying basic query:', error);
    
    try {
      const fallbackFlowerTypes = await db.select<any>('flower_types', {
        select: 'id, name, title, price_per_stem, image_url, quantity, is_active',
        filters: { is_active: true },
        orderBy: { column: 'name', ascending: true },
      });
      
      const filtered = (fallbackFlowerTypes || []).filter((f: any) => f.quantity > 0);
      
      if (filtered.length === 0) {
        return [];
      }
      
      return mapFlowerTypesToCustomizeFlowers(filtered, true);
    } catch (fallbackError) {
      console.error('[getFlowersForCustomize] Fallback query also failed:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Helper function to map flower types to CustomizeFlower format
 * @param flowerTypes - Array of flower types from database
 * @param isLegacy - Whether this is legacy data without new columns
 */
function mapFlowerTypesToCustomizeFlowers(flowerTypes: any[], isLegacy: boolean): CustomizeFlower[] {
  // Map each flower_type directly to CustomizeFlower format
  const flowers: CustomizeFlower[] = [];
  
  // Mapping from flower name to static data ID and family
  const FLOWER_NAME_TO_ID: Record<string, { id: string; family: string; colorName: string }> = {
    // Roses
    'Red Rose': { id: 'rose-red', family: 'roses', colorName: 'red' },
    'White Rose': { id: 'rose-white', family: 'roses', colorName: 'white' },
    'Pink Rose': { id: 'rose-pink', family: 'roses', colorName: 'pink' },
    'Yellow Rose': { id: 'rose-yellow', family: 'roses', colorName: 'yellow' },
    'Blue Rose': { id: 'rose-blue', family: 'roses', colorName: 'blue' },
    'Peach Rose': { id: 'rose-peach', family: 'roses', colorName: 'peach' },
    
    // Tulips
    'Red Tulip': { id: 'tulip-red', family: 'tulips', colorName: 'red' },
    'White Tulip': { id: 'tulip-white', family: 'tulips', colorName: 'white' },
    'Pink Tulip': { id: 'tulip-pink', family: 'tulips', colorName: 'pink' },
    'Yellow Tulip': { id: 'tulip-yellow', family: 'tulips', colorName: 'yellow' },
    'Blue Tulip': { id: 'tulip-blue', family: 'tulips', colorName: 'blue' },
    'Peach Tulip': { id: 'tulip-peach', family: 'tulips', colorName: 'peach' },
    
    // Peonies
    'Pink Peony': { id: 'peony-pink', family: 'peonies', colorName: 'pink' },
    'Fushia Peony': { id: 'peony-fushia', family: 'peonies', colorName: 'fushia' },
    'White Peony': { id: 'peony-white', family: 'peonies', colorName: 'white' },
    
    // Chrysanthemums
    'White Chrysanthemum': { id: 'chrys-white', family: 'chrysanthemum', colorName: 'white' },
    'Yellow Chrysanthemum': { id: 'chrys-yellow', family: 'chrysanthemum', colorName: 'yellow' },
    'Orange Chrysanthemum': { id: 'chrys-orange', family: 'chrysanthemum', colorName: 'orange' },
    'Purple Chrysanthemum': { id: 'chrys-purple', family: 'chrysanthemum', colorName: 'purple' },
    
    // Gypsum
    'White Gypsum': { id: 'gypsum-white', family: 'gypsum', colorName: 'white' },
    'Pink Gypsum': { id: 'gypsum-pink', family: 'gypsum', colorName: 'pink' },
    'Blue Gypsum': { id: 'gypsum-blue', family: 'gypsum', colorName: 'blue' },
    'Dark Blue Gypsum': { id: 'gypsum-dark-blue', family: 'gypsum', colorName: 'dark blue' },
    'Purple Gypsum': { id: 'gypsum-purple', family: 'gypsum', colorName: 'purple' },
    'Terracotta Gypsum': { id: 'gypsum-terracotta', family: 'gypsum', colorName: 'terracotta' },
    'Yellow Gypsum': { id: 'gypsum-yellow', family: 'gypsum', colorName: 'yellow' },
    
    // Daisies
    'White Daisy': { id: 'daisy-white', family: 'daisies', colorName: 'white' },
    'Yellow Daisy': { id: 'daisy-yellow', family: 'daisies', colorName: 'yellow' },
    
    // Sunflowers
    'Big Sunflower': { id: 'sunflower-big', family: 'sunflower', colorName: 'yellow' },
    'Small Sunflower': { id: 'sunflower-small', family: 'sunflower', colorName: 'yellow' },
    
    // Lilies
    'White Lily': { id: 'lily-white', family: 'lily', colorName: 'white' },
    'Pink Lily': { id: 'lily-pink', family: 'lily', colorName: 'pink' },
    'Yellow Lily': { id: 'lily-yellow', family: 'lily', colorName: 'yellow' },
    'Orange Lily': { id: 'lily-orange', family: 'lily', colorName: 'orange' },
    
    // Orchids
    'White Orchid': { id: 'orchid-white', family: 'orchid', colorName: 'white' },
    'Pink Orchid': { id: 'orchid-pink', family: 'orchid', colorName: 'pink' },
    'Blue Orchid': { id: 'orchid-blue', family: 'orchid', colorName: 'blue' },
    
    // Hydrangeas
    'White Hydrangea': { id: 'hydrangea-white', family: 'hydrangea', colorName: 'white' },
    'Pink Hydrangea': { id: 'hydrangea-pink', family: 'hydrangea', colorName: 'pink' },
    'Blue Hydrangea': { id: 'hydrangea-blue', family: 'hydrangea', colorName: 'blue' },
    
    // Gerberas
    'Red Gerbera': { id: 'gerbera-red', family: 'gerbera', colorName: 'red' },
    'Yellow Gerbera': { id: 'gerbera-yellow', family: 'gerbera', colorName: 'yellow' },
    'Orange Gerbera': { id: 'gerbera-orange', family: 'gerbera', colorName: 'orange' },
    
    // Lavender
    'Lavender': { id: 'lavender', family: 'lavender', colorName: 'purple' },
    
    // Carnations
    'Red Carnation': { id: 'carnation-red', family: 'carnation', colorName: 'red' },
    'White Carnation': { id: 'carnation-white', family: 'carnation', colorName: 'white' },
    'Pink Carnation': { id: 'carnation-pink', family: 'carnation', colorName: 'pink' },
    'Purple Carnation': { id: 'carnation-purple', family: 'carnation', colorName: 'purple' },
    'Yellow Carnation': { id: 'carnation-yellow', family: 'carnation', colorName: 'yellow' },
  };
  
  // Use a Set to track seen IDs and prevent duplicates
  const seenIds = new Set<string>();
  
  for (const flowerType of flowerTypes) {
    // Get mapping for this flower name
    const mapping = FLOWER_NAME_TO_ID[flowerType.name] || {
      // Fallback: generate ID from name if not in mapping
      id: flowerType.name.toLowerCase().replace(/\s+/g, '-'),
      family: flowerType.name.toLowerCase().split(' ')[0],
      colorName: flowerType.name.toLowerCase().split(' ').slice(1).join('-') || 'default',
    };
    
    // Check for duplicate IDs and skip if found
    if (seenIds.has(mapping.id)) {
      console.warn(`[getFlowersForCustomize] Duplicate flower ID detected in database: ${mapping.id} (${flowerType.name}). Skipping duplicate.`);
      continue;
    }
    
    seenIds.add(mapping.id);
    
    // Extract category information if available (only for new schema)
    const category = !isLegacy ? (flowerType as any).flower_type_categories : null;
    
    // Use category name as family if available, otherwise fallback to mapping
    const familyName = category?.name || mapping.family;
    
    // BACKWARD COMPATIBLE: Handle both legacy and new schema
    const flowerData: CustomizeFlower = {
      id: mapping.id,
      name: flowerType.name,
      price: flowerType.price_per_stem,
      family: familyName, // Use category name if available
      colorName: mapping.colorName,
      imageUrl: flowerType.image_url || '',
      description: flowerType.title || flowerType.name,
      category: familyName, // Use category name if available
      seasons: SEASON_MAPPING[familyName] || SEASON_MAPPING[mapping.family] || ['all-year'],
      availabilityMode: !isLegacy ? ((flowerType.availability_mode as 'specific' | 'mix' | 'both') || 'both') : 'both',
      quantity: flowerType.quantity || 0, // Include quantity from database
    };
    
    // Add new fields only if not legacy
    if (!isLegacy) {
      flowerData.categoryId = category?.id;
      flowerData.categoryName = category?.name;
      flowerData.categoryDisplayName = category?.display_name;
      flowerData.categoryIcon = category?.icon;
      flowerData.filterCategories = (flowerType.filter_categories as string[]) || [];
    }
    
    flowers.push(flowerData);
  }

  return flowers;
}

// ==================== Export Aliases for useFlowers Hook ====================
// These aliases match the expected imports in useFlowers.ts

/**
 * Alias for getFlowerTypes - returns all flower types
 */
export const getFlowers = getFlowerTypes;

/**
 * Alias for getFlowerTypeWithColors - returns a single flower type with colors
 */
export async function getFlower(id: string): Promise<FlowerTypeWithColors | null> {
  return getFlowerTypeWithColors(id);
}

/**
 * Alias for createFlowerType - creates a new flower type
 */
export async function createFlower(
  flower: Omit<FlowerTypeInsert, 'id' | 'created_at' | 'updated_at' | 'image_url'>,
  images?: File[]
): Promise<FlowerType> {
  // Use first image if multiple provided
  const image = images && images.length > 0 ? images[0] : undefined;
  return createFlowerType(flower, image);
}

/**
 * Alias for updateFlowerType - updates an existing flower type
 */
export async function updateFlower(
  id: string,
  updates: FlowerTypeUpdate,
  newImages?: File[],
  imagesToDelete?: string[]
): Promise<FlowerType> {
  // Use first image if multiple provided
  const newImage = newImages && newImages.length > 0 ? newImages[0] : undefined;
  const deleteOldImage = imagesToDelete && imagesToDelete.length > 0;
  return updateFlowerType(id, updates, newImage, deleteOldImage);
}

/**
 * Alias for deleteFlowerType - deletes a flower type
 */
export const deleteFlower = deleteFlowerType;
