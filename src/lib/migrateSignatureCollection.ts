/**
 * Migration utility to import signature collection products into Supabase
 * 
 * SECURITY: Uses the secure db proxy client, not direct Supabase access.
 * This migrates the 6 hardcoded products from UltraFeaturedBouquets.tsx
 */

import { db } from './api/database-client';
import type { Database } from './supabase';

type CollectionProductInsert = Database['public']['Tables']['collection_products']['Insert'];
type SignatureCollectionInsert = Database['public']['Tables']['signature_collections']['Insert'];

interface SignatureBouquet {
  id: number;
  name: string;
  price: string; // e.g., "$299"
  image: string;
  description: string;
}

const SIGNATURE_BOUQUETS: SignatureBouquet[] = [
  {
    id: 1,
    name: "Royal Red Elegance",
    price: "$299",
    image: "/assets/red roses/medium red roses flower in a black box.webp",
    description: "Luxurious red roses with glittering accents"
  },
  {
    id: 2,
    name: "Wedding Serenity",
    price: "$349",
    image: "/assets/wedding-events/IMG_1673.webp",
    description: "Pure elegant arrangement for special moments"
  },
  {
    id: 3,
    name: "Golden Heart",
    price: "$425",
    image: "/assets/red roses/red roses in a golden heart shaped box.webp",
    description: "Premium roses in a stunning golden heart box"
  },
  {
    id: 4,
    name: "Event Grandeur",
    price: "$289",
    image: "/assets/wedding-events/events/IMG-20251126-WA0024.webp",
    description: "Spectacular floral design for grand events"
  },
  {
    id: 5,
    name: "Heart's Desire",
    price: "$399",
    image: "/assets/heart shape/IMG-20251001-WA0018.webp",
    description: "Romantic heart-shaped arrangement"
  },
  {
    id: 6,
    name: "Glittering Passion",
    price: "$329",
    image: "/assets/red roses/red roses bouquet with red glitter.webp",
    description: "Radiant red roses with a touch of sparkle"
  }
];

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
 * Parse price string to number (removes $ and converts to number)
 */
function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Determine category from product name/image
 */
function determineCategory(name: string, image: string): { category: string; displayCategory: string } {
  const lowerName = name.toLowerCase();
  const lowerImage = image.toLowerCase();

  if (lowerName.includes('wedding') || lowerImage.includes('wedding')) {
    return { category: 'wedding', displayCategory: 'Wedding & Events' };
  }
  if (lowerName.includes('heart') || lowerImage.includes('heart')) {
    return { category: 'romance', displayCategory: 'Romantic Collection' };
  }
  if (lowerImage.includes('red roses')) {
    return { category: 'romance', displayCategory: 'Romantic Collection' };
  }
  return { category: 'signature', displayCategory: 'Signature Collection' };
}

/**
 * Migrate signature collection products
 */
export async function migrateSignatureCollection(): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  console.log(`Starting migration of ${SIGNATURE_BOUQUETS.length} signature collection products...`);

  for (let i = 0; i < SIGNATURE_BOUQUETS.length; i++) {
    const bouquet = SIGNATURE_BOUQUETS[i];
    try {
      // Step 1: Check if product exists in collection_products
      const existingProduct = await db.selectOne<{ id: string }>('collection_products', {
        title: bouquet.name,
      });

      let productId: string;

      if (existingProduct) {
        // Product already exists, use its ID
        productId = existingProduct.id;
        console.log(`  Product "${bouquet.name}" already exists (ID: ${productId})`);
      } else {
        // Create product in collection_products first
        const category = determineCategory(bouquet.name, bouquet.image);
        const price = parsePrice(bouquet.price);
        const normalizedImage = normalizeImagePath(bouquet.image);

        const productData: Omit<CollectionProductInsert, 'id' | 'created_at' | 'updated_at'> = {
          title: bouquet.name,
          description: bouquet.description,
          price: price,
          category: category.category,
          display_category: category.displayCategory,
          featured: true, // Signature collection items are featured
          tags: [category.category, 'signature', 'featured'],
          image_urls: [normalizedImage],
          is_active: true,
        };

        const newProduct = await db.insert<{ id: string }>('collection_products', productData);

        if (!newProduct) {
          throw new Error('Failed to create product: no data returned');
        }

        productId = newProduct.id;
        console.log(`  Created product "${bouquet.name}" (ID: ${productId})`);
      }

      // Step 2: Check if already in signature_collections
      const existingSignature = await db.selectOne<{ id: string }>('signature_collections', {
        product_id: productId,
      });

      if (existingSignature) {
        console.log(`  Product "${bouquet.name}" already in signature collection, skipping...`);
        continue;
      }

      // Step 3: Add to signature_collections with display_order
      const signatureData: Omit<SignatureCollectionInsert, 'id' | 'created_at'> = {
        product_id: productId,
        display_order: i, // Use index as display order to maintain the same order
        is_active: true,
      };

      const signatureItem = await db.insert<{ id: string }>('signature_collections', signatureData);

      if (!signatureItem) {
        throw new Error('Failed to add to signature collection: no data returned');
      }

      console.log(`✓ Migrated signature item: ${bouquet.name} (order: ${i})`);
      success++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`✗ Failed to migrate "${bouquet.name}":`, errorMessage);
      errors.push(`${bouquet.name}: ${errorMessage}`);
      failed++;
    }
  }

  console.log(`\nSignature Collection migration complete!`);
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
export async function runSignatureCollectionMigration(): Promise<void> {
  const result = await migrateSignatureCollection();
  
  const message = `Signature Collection migration complete!\n\nSuccess: ${result.success}\nFailed: ${result.failed}`;
  console.log(message);
  alert(message);
}
