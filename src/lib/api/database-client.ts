/**
 * Database Client (Frontend)
 * 
 * SECURITY: This client communicates with backend API proxy
 * No direct database access from frontend
 * Database provider (Supabase) is completely hidden
 * 
 * Frontend → Backend API → Database
 */

const API_ENDPOINT = '/.netlify/functions/database';

// Track if we've already warned about Netlify functions (prevents console spam)
let hasWarnedAboutNetlify = false;

interface DatabaseRequest {
  operation: 'select' | 'insert' | 'update' | 'delete' | 'rpc';
  table: string;
  filters?: Record<string, any>;
  data?: Record<string, any>;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  functionName?: string;
  functionParams?: Record<string, any>;
}

interface DatabaseResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

/**
 * Make database request to backend API with timeout
 */
async function databaseRequest<T = any>(request: DatabaseRequest): Promise<T> {
  const frontendApiKey = import.meta.env.VITE_FRONTEND_API_KEY;
  
  // CRITICAL FIX: Add timeout to prevent infinite hanging
  const TIMEOUT_MS = import.meta.env.DEV ? 3000 : 10000; // 3s in dev, 10s in prod
  
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(frontendApiKey && { 'X-API-Key': frontendApiKey }),
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Handle 404 specifically (Netlify Functions not available)
        if (response.status === 404) {
          if (import.meta.env.DEV) {
            // Only warn once to prevent console spam
            if (!hasWarnedAboutNetlify) {
              hasWarnedAboutNetlify = true;
              console.info('[Database] Netlify Functions not available in local dev. Using localStorage fallback.');
            }
            // Return empty result instead of throwing - let the calling code use localStorage fallback
            throw new Error('NETLIFY_FUNCTIONS_UNAVAILABLE');
          }
          throw new Error('Database endpoint not found. Please ensure Netlify Functions are deployed.');
        }
        
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.message || `Database request failed: ${response.status}`);
      }
      
      const result: DatabaseResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Database operation failed');
      }
      
      return result.data;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle abort/timeout
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        if (import.meta.env.DEV) {
          if (!hasWarnedAboutNetlify) {
            hasWarnedAboutNetlify = true;
            console.info('[Database] Request timed out. Netlify Functions not available in local dev. Using localStorage fallback.');
          }
          throw new Error('NETLIFY_FUNCTIONS_UNAVAILABLE');
        }
        throw new Error('Database request timed out');
      }
      
      throw fetchError;
    }
  } catch (error) {
    // Re-throw if it's already an Error with a message
    if (error instanceof Error) {
      throw error;
    }
    // Handle network errors
    if (import.meta.env.DEV) {
      throw new Error(
        `Network error: ${error}. Make sure Netlify Dev is running with \`npm run dev:netlify\``
      );
    }
    throw new Error(`Database request failed: ${error}`);
  }
}

/**
 * Database Client API
 */
export const db = {
  /**
   * Select data from table
   */
  async select<T = any>(
    table: string,
    options?: {
      filters?: Record<string, any>;
      select?: string;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
    }
  ): Promise<T[]> {
    return databaseRequest<T[]>({
      operation: 'select',
      table,
      ...options,
    });
  },
  
  /**
   * Select single record
   */
  async selectOne<T = any>(
    table: string,
    filters: Record<string, any>,
    options?: {
      select?: string;
    }
  ): Promise<T | null> {
    const results = await databaseRequest<T[]>({
      operation: 'select',
      table,
      filters,
      select: options?.select,
      limit: 1,
    });
    return results[0] || null;
  },
  
  /**
   * Insert data into table
   * For single object: returns the inserted row. For array: returns array of rows.
   */
  async insert<T = any>(
    table: string,
    data: Record<string, any> | Record<string, any>[],
    options?: {
      select?: string;
    }
  ): Promise<T> {
    const isSingle = !Array.isArray(data);
    const result = await databaseRequest<T | T[]>({
      operation: 'insert',
      table,
      data: Array.isArray(data) ? data : [data],
      select: options?.select,
    });
    // Supabase returns array; unwrap for single-row inserts
    return (isSingle && Array.isArray(result) && result.length > 0 ? result[0] : result) as T;
  },
  
  /**
   * Update data in table
   */
  async update<T = any>(
    table: string,
    filters: Record<string, any>,
    data: Record<string, any>,
    options?: {
      select?: string;
    }
  ): Promise<T[]> {
    return databaseRequest<T[]>({
      operation: 'update',
      table,
      filters,
      data,
      select: options?.select,
    });
  },
  
  /**
   * Delete data from table
   */
  async delete(
    table: string,
    filters: Record<string, any>
  ): Promise<void> {
    await databaseRequest({
      operation: 'delete',
      table,
      filters,
    });
  },
  
  /**
   * Call database function (RPC)
   */
  async rpc<T = any>(
    functionName: string,
    params?: Record<string, any>
  ): Promise<T> {
    return databaseRequest<T>({
      operation: 'rpc',
      table: '', // Not used for RPC
      functionName,
      functionParams: params,
    });
  },
};

/**
 * Helper: Build filter with operator
 */
export function filter(column: string, operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike', value: any) {
  return { [column]: { operator, value } };
}

/**
 * Helper: Build null filter
 */
export function isNull(column: string) {
  return { [column]: null };
}

