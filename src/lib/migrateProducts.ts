/**
 * Migration utility to import existing products from generatedBouquets.ts into Supabase
 * 
 * This can be run once to migrate all existing products to the database.
 * Run this from browser console or create a one-time migration page.
 */

import { db } from './api/database-client';
import { supabase } from './supabase';
import type { Database } from './supabase';

type CollectionProductInsert = Database['public']['Tables']['collection_products']['Insert'];
type Bouquet = {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  category: string;
  displayCategory?: string;
  featured?: boolean;
};

/**
 * Normalize image path - use paths as-is for public assets
 * Public assets work with spaces and special characters
 */
function normalizeImagePath(image: string): string {
  if (!image) return image;
  
  // Return paths as-is - they're public assets and work directly
  // The browser/Vite will handle encoding when needed
  return image;
}

/**
 * Migrate products from generatedBouquets array to Supabase
 */
export async function migrateProductsToSupabase(bouquets: Bouquet[]): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  console.log(`Starting migration of ${bouquets.length} products...`);

  for (const bouquet of bouquets) {
    try {
      // Check if product already exists (by checking if any product has the same title)
      const { data: existing } = await supabase
        .from('collection_products')
        .select('id')
        .eq('title', bouquet.name)
        .single();

      if (existing) {
        console.log(`Product "${bouquet.name}" already exists, skipping...`);
        continue;
      }

      // Transform bouquet data to collection_products format
      // Normalize image path to handle spaces and special characters
      const normalizedImage = normalizeImagePath(bouquet.image);
      
      const productData: CollectionProductInsert = {
        title: bouquet.name,
        description: bouquet.description || '',
        price: bouquet.price,
        category: bouquet.category,
        display_category: bouquet.displayCategory || bouquet.category, // Use category as fallback
        featured: bouquet.featured || false,
        tags: [bouquet.category], // Use category as initial tag
        image_urls: [normalizedImage], // Use normalized image path
        is_active: true,
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('collection_products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      console.log(`✓ Migrated: ${bouquet.name} (ID: ${data.id})`);
      success++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`✗ Failed to migrate "${bouquet.name}":`, errorMessage);
      errors.push(`${bouquet.name}: ${errorMessage}`);
      failed++;
    }
  }

  console.log(`\nMigration complete!`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
  if (errors.length > 0) {
    console.log(`Errors:`, errors);
  }

  return { success, failed, errors };
}

/**
 * One-time migration function that can be called from admin dashboard
 */
export async function runMigration(): Promise<void> {
  // Dynamically import generatedBouquets
  const { generatedBouquets } = await import('@/data/generatedBouquets');
  
  const result = await migrateProductsToSupabase(generatedBouquets);
  
  // Show result in console and alert
  const message = `Migration complete!\n\nSuccess: ${result.success}\nFailed: ${result.failed}`;
  console.log(message);
  alert(message);
}

