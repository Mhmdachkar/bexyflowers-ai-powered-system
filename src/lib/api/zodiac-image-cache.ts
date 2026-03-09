import { db } from './database-client';
import { uploadImage } from '@/lib/supabase-storage';
import type { Database } from '@/lib/supabase';

type ZodiacImageRow = Database['public']['Tables']['zodiac_generated_images']['Row'];

/**
 * Look up a previously generated zodiac bouquet image.
 * Returns the public Storage URL if a match exists, null otherwise.
 */
export async function findCachedZodiacImage(
  gender: string,
  zodiacSign: string,
  bouquetId: string
): Promise<string | null> {
  try {
    const row = await db.selectOne<ZodiacImageRow>('zodiac_generated_images', {
      gender,
      zodiac_sign: zodiacSign,
      bouquet_id: bouquetId,
    });
    return row?.image_url ?? null;
  } catch {
    return null;
  }
}

/**
 * Upload the generated image to Supabase Storage and record it in the
 * cache table so future visitors with the same combo get it instantly.
 *
 * @param gender   - 'male' | 'female'
 * @param zodiacSign - e.g. 'aries', 'taurus'
 * @param bouquetId  - the ZodiacBouquet.id
 * @param blobUrl    - the local blob: URL returned by the image generator
 */
export async function cacheZodiacImage(
  gender: string,
  zodiacSign: string,
  bouquetId: string,
  blobUrl: string
): Promise<string | null> {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();

    const fileName = `${gender}_${zodiacSign}_${bouquetId}.webp`;
    const file = new File([blob], fileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });

    const { url, path } = await uploadImage('zodiac-images', file, 'generated');

    // Check if a row already exists (race-condition guard)
    const existing = await db.selectOne<ZodiacImageRow>('zodiac_generated_images', {
      gender,
      zodiac_sign: zodiacSign,
      bouquet_id: bouquetId,
    });

    if (existing) {
      await db.update('zodiac_generated_images', { id: existing.id }, {
        image_url: url,
        storage_path: path,
      });
    } else {
      await db.insert('zodiac_generated_images', {
        gender,
        zodiac_sign: zodiacSign,
        bouquet_id: bouquetId,
        image_url: url,
        storage_path: path,
      });
    }

    return url;
  } catch (err) {
    console.error('[ZodiacCache] Failed to cache image:', err);
    return null;
  }
}
