import { supabase } from '@/lib/supabase';

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

export async function getProductsByFlowerType(
  flowerType: FlowerType,
  collectionYear?: number
): Promise<EternalFlowerProduct[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('flower_type', flowerType)
      .order('created_at', { ascending: false });

    if (collectionYear) {
      query = query.eq('collection_year', collectionYear);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products by flower type:', error);
      throw error;
    }

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

export async function getAvailableCollectionYears(flowerType?: FlowerType): Promise<number[]> {
  try {
    let query = supabase
      .from('products')
      .select('collection_year')
      .eq('is_active', true)
      .not('collection_year', 'is', null);

    if (flowerType) {
      query = query.eq('flower_type', flowerType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching collection years:', error);
      throw error;
    }

    const years = [...new Set(data?.map(item => item.collection_year) || [])];
    return years.sort((a, b) => b - a);
  } catch (error) {
    console.error('Error in getAvailableCollectionYears:', error);
    throw error;
  }
}

export async function getCollectionYearStats(flowerType: FlowerType): Promise<CollectionYearStats[]> {
  try {
    const viewName = flowerType === 'eternal' ? 'eternal_flowers_by_year' : 'real_flowers_by_year';
    
    const { data, error } = await supabase
      .from(viewName)
      .select('*')
      .order('collection_year', { ascending: false });

    if (error) {
      console.error('Error fetching collection year stats:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCollectionYearStats:', error);
    throw error;
  }
}

export async function createEternalFlowerProduct(
  productData: Omit<EternalFlowerProduct, 'id' | 'created_at' | 'updated_at'>
): Promise<EternalFlowerProduct> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...productData,
        flower_type: 'eternal',
        is_active: true,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating eternal flower product:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createEternalFlowerProduct:', error);
    throw error;
  }
}

export async function updateEternalFlowerProduct(
  id: string,
  updates: Partial<EternalFlowerProduct>
): Promise<EternalFlowerProduct> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating eternal flower product:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateEternalFlowerProduct:', error);
    throw error;
  }
}

export async function deleteEternalFlowerProduct(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting eternal flower product:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteEternalFlowerProduct:', error);
    throw error;
  }
}

export async function updateProductFlowerType(
  id: string,
  flowerType: FlowerType,
  collectionYear: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .update({ 
        flower_type: flowerType,
        collection_year: collectionYear 
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating product flower type:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateProductFlowerType:', error);
    throw error;
  }
}
