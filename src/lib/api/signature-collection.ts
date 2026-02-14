import { db } from './database-client';
import { uploadMultipleImages } from '../supabase-storage';
import { createCollectionProduct } from './collection-products';
import type { Database } from '../supabase';

type SignatureCollection = Database['public']['Tables']['signature_collections']['Row'];
type SignatureCollectionInsert = Database['public']['Tables']['signature_collections']['Insert'];
type SignatureCollectionUpdate = Database['public']['Tables']['signature_collections']['Update'];

export interface SignatureCollectionWithProduct extends SignatureCollection {
  product: Database['public']['Tables']['collection_products']['Row'] | null;
}

/**
 * Get all signature collection items with product details
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function getSignatureCollections(): Promise<SignatureCollectionWithProduct[]> {
  const data = await db.select<SignatureCollectionWithProduct>('signature_collections', {
    select: `
      *,
      product:collection_products(*)
    `,
    orderBy: { column: 'display_order', ascending: true },
  });

  return data;
}

/**
 * Get active signature collection items for frontend
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function getActiveSignatureCollections(): Promise<SignatureCollectionWithProduct[]> {
  const data = await db.select<SignatureCollectionWithProduct>('signature_collections', {
    select: `
      *,
      product:collection_products(*)
    `,
    filters: { is_active: true },
    orderBy: { column: 'display_order', ascending: true },
  });

  return data;
}

/**
 * Add a product to signature collection
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function addToSignatureCollection(
  productId: string,
  displayOrder?: number
): Promise<SignatureCollection> {
  // Get max display order if not provided
  let order = displayOrder;
  if (order === undefined) {
    const maxOrderData = await db.select<SignatureCollection>('signature_collections', {
      select: 'display_order',
      orderBy: { column: 'display_order', ascending: false },
      limit: 1,
    });

    order = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].display_order + 1 : 0;
  }

  const data = await db.insert<SignatureCollection>('signature_collections', {
    product_id: productId,
    display_order: order,
    is_active: true,
  });

  if (!data) {
    throw new Error('Failed to add to signature collection');
  }

  return data;
}

/**
 * Create a custom product and add it to signature collection
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function createCustomSignatureProduct(
  productData: {
    title: string;
    description: string;
    price: number;
    category?: string;
    display_category?: string;
    tags?: string[];
    imageFiles?: File[];
  },
  displayOrder?: number
): Promise<SignatureCollectionWithProduct> {
  // Get max display order if not provided
  let order = displayOrder;
  if (order === undefined) {
    const maxOrderData = await db.select<SignatureCollection>('signature_collections', {
      select: 'display_order',
      orderBy: { column: 'display_order', ascending: false },
      limit: 1,
    });

    order = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].display_order + 1 : 0;
  }

  // Step 1: Create product in collection_products
  const newProduct = await createCollectionProduct(
    {
      title: productData.title,
      description: productData.description,
      price: productData.price,
      category: productData.category || 'signature',
      display_category: productData.display_category || 'Signature Collection',
      tags: productData.tags || ['signature', 'custom'],
      is_active: true,
      featured: true,
    },
    productData.imageFiles
  );

  // Step 2: Add to signature_collections
  const signatureItem = await addToSignatureCollection(newProduct.id, order);

  // Step 3: Fetch and return with product data
  const result = await db.select<SignatureCollectionWithProduct>('signature_collections', {
    select: `
      *,
      product:collection_products(*)
    `,
    filters: { id: signatureItem.id },
    limit: 1,
  });

  if (!result || result.length === 0) {
    throw new Error('Failed to fetch created signature collection');
  }

  return result[0];
}

/**
 * Remove a product from signature collection
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function removeFromSignatureCollection(id: string): Promise<void> {
  await db.delete('signature_collections', { id });
}

/**
 * Update signature collection item
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function updateSignatureCollection(
  id: string,
  updates: SignatureCollectionUpdate
): Promise<SignatureCollection> {
  const data = await db.update<SignatureCollection>('signature_collections', { id }, updates);

  if (!data || data.length === 0) {
    throw new Error('Failed to update signature collection');
  }

  return data[0];
}

/**
 * Reorder signature collection items
 * SECURITY: Uses backend proxy instead of direct Supabase
 */
export async function reorderSignatureCollections(
  items: { id: string; display_order: number }[]
): Promise<void> {
  // Update each item individually through the proxy
  const updatePromises = items.map((item) =>
    db.update('signature_collections', { id: item.id }, { display_order: item.display_order })
  );

  try {
    await Promise.all(updatePromises);
  } catch (error) {
    throw new Error(`Failed to reorder signature collections: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Toggle active status of signature collection item
 */
export async function toggleSignatureCollectionActive(
  id: string,
  isActive: boolean
): Promise<SignatureCollection> {
  return updateSignatureCollection(id, { is_active: isActive });
}

