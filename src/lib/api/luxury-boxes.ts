import { db } from './database-client';
import type { Database } from '../supabase';

type LuxuryBox = Database['public']['Tables']['luxury_boxes']['Row'];
type LuxuryBoxInsert = Database['public']['Tables']['luxury_boxes']['Insert'];
type LuxuryBoxUpdate = Database['public']['Tables']['luxury_boxes']['Update'];

type BoxColor = Database['public']['Tables']['box_colors']['Row'];
type BoxColorInsert = Database['public']['Tables']['box_colors']['Insert'];
type BoxColorUpdate = Database['public']['Tables']['box_colors']['Update'];

type BoxSize = Database['public']['Tables']['box_sizes']['Row'];
type BoxSizeInsert = Database['public']['Tables']['box_sizes']['Insert'];
type BoxSizeUpdate = Database['public']['Tables']['box_sizes']['Update'];

export interface LuxuryBoxWithDetails extends LuxuryBox {
  colors: BoxColor[];
  sizes: BoxSize[];
}

// ==================== Luxury Boxes ====================

/**
 * Get all luxury boxes
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function getLuxuryBoxes(type?: 'box' | 'wrap'): Promise<LuxuryBox[]> {
  const filters = type ? { type } : undefined;
  
  const data = await db.select<LuxuryBox>('luxury_boxes', {
    filters,
    orderBy: { column: 'created_at', ascending: false },
  });

  return data;
}

/**
 * Get a single luxury box by ID
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function getLuxuryBox(id: string): Promise<LuxuryBox | null> {
  const data = await db.select<LuxuryBox>('luxury_boxes', {
    filters: { id },
    limit: 1,
  });

  return data && data.length > 0 ? data[0] : null;
}

/**
 * Get luxury box with colors and sizes
 * PERFORMANCE: Use single query with joins to avoid N+1
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function getLuxuryBoxWithDetails(id: string): Promise<LuxuryBoxWithDetails | null> {
  // Use nested select to get box with related colors and sizes in one query
  const data = await db.select<any>('luxury_boxes', {
    filters: { id },
    select: `
      *,
      box_colors(*),
      box_sizes(*)
    `,
    limit: 1,
  });

  if (!data || data.length === 0) {
    return null;
  }

  const box = data[0];

  // Transform nested objects to match expected type
  const colors = (box.box_colors || []).sort((a: any, b: any) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  const sizes = (box.box_sizes || []).sort((a: any, b: any) => 
    a.capacity - b.capacity
  );

  // Remove nested objects from box and add as top-level arrays
  const { box_colors, box_sizes, ...boxData } = box;

  return {
    ...boxData,
    colors,
    sizes,
  };
}

/**
 * Create a luxury box
 */
export async function createLuxuryBox(box: Omit<LuxuryBoxInsert, 'id' | 'created_at' | 'updated_at'>): Promise<LuxuryBox> {
  const data = await db.insert<LuxuryBox>('luxury_boxes', box);
  if (!data) {
    throw new Error('Failed to create luxury box');
  }
  return data;
}

/**
 * Update a luxury box
 */
export async function updateLuxuryBox(id: string, updates: LuxuryBoxUpdate): Promise<LuxuryBox> {
  const data = await db.update<LuxuryBox>('luxury_boxes', { id }, updates);
  if (!data || data.length === 0) {
    throw new Error('Failed to update luxury box');
  }
  return data[0];
}

/**
 * Delete a luxury box (cascades to colors and sizes)
 */
export async function deleteLuxuryBox(id: string): Promise<void> {
  await db.delete('luxury_boxes', { id });
}

// ==================== Box Colors ====================

/**
 * Get colors for a box
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function getBoxColors(boxId: string): Promise<BoxColor[]> {
  const data = await db.select<BoxColor>('box_colors', {
    filters: { box_id: boxId },
    orderBy: { column: 'created_at', ascending: true },
  });

  return data || [];
}

/**
 * Create a box color
 */
export async function createBoxColor(color: Omit<BoxColorInsert, 'id' | 'created_at' | 'updated_at'>): Promise<BoxColor> {
  const data = await db.insert<BoxColor>('box_colors', color);
  if (!data) {
    throw new Error('Failed to create box color');
  }
  return data;
}

/**
 * Update a box color
 */
export async function updateBoxColor(id: string, updates: BoxColorUpdate): Promise<BoxColor> {
  const data = await db.update<BoxColor>('box_colors', { id }, updates);
  if (!data || data.length === 0) {
    throw new Error('Failed to update box color');
  }
  return data[0];
}

/**
 * Delete a box color
 */
export async function deleteBoxColor(id: string): Promise<void> {
  await db.delete('box_colors', { id });
}

// ==================== Box Sizes ====================

/**
 * Get sizes for a box
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function getBoxSizes(boxId: string): Promise<BoxSize[]> {
  const data = await db.select<BoxSize>('box_sizes', {
    filters: { box_id: boxId },
    orderBy: { column: 'capacity', ascending: true },
  });

  return data || [];
}

/**
 * Create a box size
 */
export async function createBoxSize(size: Omit<BoxSizeInsert, 'id' | 'created_at' | 'updated_at'>): Promise<BoxSize> {
  const data = await db.insert<BoxSize>('box_sizes', size);
  if (!data) {
    throw new Error('Failed to create box size');
  }
  return data;
}

/**
 * Update a box size
 */
export async function updateBoxSize(id: string, updates: BoxSizeUpdate): Promise<BoxSize> {
  const data = await db.update<BoxSize>('box_sizes', { id }, updates);
  if (!data || data.length === 0) {
    throw new Error('Failed to update box size');
  }
  return data[0];
}

/**
 * Delete a box size
 */
export async function deleteBoxSize(id: string): Promise<void> {
  await db.delete('box_sizes', { id });
}

