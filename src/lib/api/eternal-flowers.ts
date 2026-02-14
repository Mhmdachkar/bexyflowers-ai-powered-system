import { db } from './database-client';

export type FlowerType = 'eternal' | 'real' | 'mixed';

export interface EternalFlowerProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  display_category: string;
  flower_type: FlowerType;
  collection_year: number;
  image_urls: string[];
  featured: boolean;
  is_out_of_stock: boolean;
  discount_percentage: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface CollectionYearStats {
  collection_year: number;
  product_count: number;
  avg_price: number;
  min_price: number;
  max_price: number;
}

/**
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function getProductsByFlowerType(
  flowerType: FlowerType,
  collectionYear?: number
): Promise<EternalFlowerProduct[]> {
  try {
    const filters: Record<string, any> = {
      is_active: true,
      flower_type: flowerType,
    };

    if (collectionYear) {
      filters.collection_year = collectionYear;
    }

    const data = await db.select<EternalFlowerProduct>('products', {
      filters,
      orderBy: { column: 'created_at', ascending: false },
    });

    return data || [];
  } catch (error) {
    console.error('Error in getProductsByFlowerType:', error);
    throw error;
  }
}

export async function getEternalFlowers(collectionYear?: number): Promise<EternalFlowerProduct[]> {
  return getProductsByFlowerType('eternal', collectionYear);
}

export async function getRealFlowers(collectionYear?: number): Promise<EternalFlowerProduct[]> {
  return getProductsByFlowerType('real', collectionYear);
}

/**
 * SECURITY: Uses backend proxy instead of direct Supabase
 * NOTE: Filter collection_year != null in app - SQL "col != NULL" returns no rows
 */
export async function getAvailableCollectionYears(flowerType?: FlowerType): Promise<number[]> {
  try {
    const filters: Record<string, any> = {
      is_active: true,
    };

    if (flowerType) {
      filters.flower_type = flowerType;
    }

    const data = await db.select<EternalFlowerProduct>('products', {
      filters,
      select: 'collection_year',
    });

    // Filter out null in app (SQL neq/null doesn't work as expected)
    const years = [...new Set(
      (data || [])
        .map(item => item.collection_year)
        .filter((y): y is number => y != null)
    )];
    return years.sort((a, b) => b - a);
  } catch (error) {
    console.error('Error in getAvailableCollectionYears:', error);
    throw error;
  }
}

/**
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function getCollectionYearStats(flowerType: FlowerType): Promise<CollectionYearStats[]> {
  try {
    const viewName = flowerType === 'eternal' ? 'eternal_flowers_by_year' : 'real_flowers_by_year';
    
    const data = await db.select<CollectionYearStats>(viewName, {
      orderBy: { column: 'collection_year', ascending: false },
    });

    return data || [];
  } catch (error) {
    console.error('Error in getCollectionYearStats:', error);
    throw error;
  }
}

/**
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function createEternalFlowerProduct(
  productData: Omit<EternalFlowerProduct, 'id' | 'created_at' | 'updated_at'>
): Promise<EternalFlowerProduct> {
  try {
    const data = await db.insert<EternalFlowerProduct>('products', {
      ...productData,
      flower_type: 'eternal',
      is_active: true,
    });

    if (!data) {
      throw new Error('Failed to create eternal flower product');
    }

    return data;
  } catch (error) {
    console.error('Error in createEternalFlowerProduct:', error);
    throw error;
  }
}

/**
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function updateEternalFlowerProduct(
  id: string,
  updates: Partial<EternalFlowerProduct>
): Promise<EternalFlowerProduct> {
  try {
    const data = await db.update<EternalFlowerProduct>('products', { id }, updates);

    if (!data || data.length === 0) {
      throw new Error('Failed to update eternal flower product');
    }

    return data[0];
  } catch (error) {
    console.error('Error in updateEternalFlowerProduct:', error);
    throw error;
  }
}

/**
 * SECURITY: Uses backend proxy instead of direct Supabase (soft delete)
 */
export async function deleteEternalFlowerProduct(id: string): Promise<void> {
  try {
    await db.update('products', { id }, { is_active: false });
  } catch (error) {
    console.error('Error in deleteEternalFlowerProduct:', error);
    throw error;
  }
}

/**
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function updateProductFlowerType(
  id: string,
  flowerType: FlowerType,
  collectionYear: number
): Promise<void> {
  try {
    await db.update('products', { id }, { 
      flower_type: flowerType,
      collection_year: collectionYear 
    });
  } catch (error) {
    console.error('Error in updateProductFlowerType:', error);
    throw error;
  }
}
