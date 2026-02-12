/**
 * Generate descriptive alt text for product/bouquet images.
 * Improves SEO and accessibility for image search.
 */

export interface ProductAltInput {
  name: string;
  category?: string;
  displayCategory?: string;
  flower_type?: 'eternal' | 'real' | 'mixed';
  description?: string;
}

/**
 * Returns a short, descriptive alt (e.g. "Red rose bouquet with eucalyptus - luxury florist Lebanon")
 */
export function getProductImageAlt(product: ProductAltInput): string {
  const name = product.name?.trim() || 'Floral arrangement';
  const category = product.displayCategory || product.category || '';
  const flowerType = product.flower_type;

  const parts: string[] = [name];

  if (flowerType === 'eternal') {
    parts.push('eternal flowers');
  } else if (flowerType === 'real') {
    parts.push('fresh flower bouquet');
  } else if (flowerType === 'mixed') {
    parts.push('mixed floral arrangement');
  }

  if (category) {
    parts.push(`- ${category}`);
  }

  parts.push('Bexy Flowers Lebanon');

  return parts.join(' ');
}

/**
 * Alt for product thumbnail in gallery (index-specific)
 */
export function getProductGalleryAlt(product: ProductAltInput, index: number): string {
  const base = getProductImageAlt(product);
  return `${base} - view ${index + 1}`;
}
