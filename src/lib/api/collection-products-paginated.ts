/**
 * Paginated Collection Products API
 * 
 * Optimized for scalability with large datasets
 * Supports pagination, filtering, and efficient data fetching
 */

import { db } from './database-client';

interface PaginationParams {
  page: number;
  pageSize: number;
  filters?: {
    category?: string;
    featured?: boolean;
    isActive?: boolean;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Get paginated collection products
 */
export async function getCollectionProductsPaginated(
  params: PaginationParams
): Promise<PaginatedResponse<any>> {
  const { page, pageSize, filters } = params;
  const offset = (page - 1) * pageSize;

  // Build filters
  const whereFilters: Record<string, any> = {};
  if (filters?.category) {
    whereFilters.category = filters.category;
  }
  if (filters?.featured !== undefined) {
    whereFilters.featured = filters.featured;
  }
  if (filters?.isActive !== undefined) {
    whereFilters.is_active = filters.isActive;
  }

  // Get total count first (for pagination info)
  const countResult = await db.select('collection_products', {
    filters: whereFilters,
    select: 'id', // Only select id for count
  });

  const total = Array.isArray(countResult) ? countResult.length : 0;

  // Get paginated data with offset
  const data = await db.select('collection_products', {
    filters: whereFilters,
    orderBy: { column: 'created_at', ascending: false },
    limit: pageSize,
    offset: offset,
  });

  const totalPages = Math.ceil(total / pageSize);
  const hasMore = page < totalPages;

  return {
    data: Array.isArray(data) ? data : [],
    page,
    pageSize,
    total,
    totalPages,
    hasMore,
  };
}
