import { supabase } from './supabase';

// Default WebP quality for client-side conversion (0-1 range)
const DEFAULT_WEBP_QUALITY = 0.82;

/**
 * Convert an image File to WebP in the browser. On the server (Node scripts), this is a no-op.
 */
async function ensureWebpFile(file: File): Promise<File> {
  // Node path: skip conversion to avoid DOM APIs
  if (typeof window === 'undefined') return file;
  if (file.type === 'image/webp') return file;

  // Convert using a canvas
  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(imageBitmap, 0, 0);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(
      (b) => resolve(b),
      'image/webp',
      DEFAULT_WEBP_QUALITY
    )
  );
  if (!blob) return file;

  const newName = file.name.replace(/\.[^.]+$/, '.webp');
  return new File([blob], newName, { type: 'image/webp', lastModified: Date.now() });
}

export type StorageBucket = 'product-images' | 'flower-images' | 'accessory-images' | 'wedding-creations';

/**
 * Upload an image file to Supabase Storage
 * @param bucket - The storage bucket name
 * @param file - The file to upload
 * @param folder - Optional folder path within the bucket
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(
  bucket: StorageBucket,
  file: File,
  folder?: string
): Promise<{ url: string; path: string }> {
  // Ensure new uploads are WebP on the client; Node scripts skip conversion
  const uploadFile = await ensureWebpFile(file);

  try {
    // Generate unique filename
    const fileExt = uploadFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload file
    // ⚡ PERFORMANCE: Increased cache duration from 1 hour to 1 year (31536000 seconds)
    // Images rarely change, so long cache = faster repeat visits
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, uploadFile, {
        cacheControl: '31536000',
        upsert: false,
        contentType: uploadFile.type || 'image/webp',
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path to delete
 */
export async function deleteImage(bucket: StorageBucket, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * Upload multiple images
 * @param bucket - The storage bucket name
 * @param files - Array of files to upload
 * @param folder - Optional folder path within the bucket
 * @returns Array of public URLs
 */
export async function uploadMultipleImages(
  bucket: StorageBucket,
  files: File[],
  folder?: string
): Promise<string[]> {
  try {
    const uploadPromises = files.map((file) => uploadImage(bucket, file, folder));
    const results = await Promise.all(uploadPromises);
    return results.map((result) => result.url);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
}

/**
 * Extract file path from Supabase Storage URL
 * @param url - The public URL
 * @returns The file path
 */
export function extractPathFromUrl(url: string, bucket: StorageBucket): string {
  const urlObj = new URL(url);
  // Supabase storage URLs typically have the bucket name in the path
  const pathMatch = urlObj.pathname.match(new RegExp(`/${bucket}/(.+)`));
  return pathMatch ? pathMatch[1] : urlObj.pathname;
}

