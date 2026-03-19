/**
 * Database API Route Handler for Next.js
 * Ported from Netlify function to Next.js API route
 * Provides secure proxy to Supabase database operations
 * 
 * SECURITY: All inputs are validated to prevent SQL injection
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[Database API] Missing Supabase environment variables');
}

// Initialize Supabase client
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// SECURITY: Whitelist of allowed tables (prevents arbitrary table access)
const ALLOWED_TABLES = [
  'collection_products',
  'signature_collections',
  'flower_type_categories',
  'flower_types',
  'flower_colors',
  'accessories',
  'luxury_boxes',
  'box_colors',
  'box_sizes',
  'wedding_creations',
  'eternal_flowers',
  'owner_availability',
  'consultation_bookings',
  'visitor_cart',
  'visitor_favorites',
  'zodiac_generated_images',
  'checkout_orders',
];

// SECURITY: Whitelist of allowed RPC functions
const ALLOWED_RPC_FUNCTIONS = [
  'get_active_products',
  'get_featured_products',
  'search_products',
];

interface DatabaseRequest {
  operation: 'select' | 'insert' | 'update' | 'delete' | 'rpc';
  table: string;
  filters?: Record<string, any>;
  data?: Record<string, any>;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  functionName?: string;
  functionParams?: Record<string, any>;
}

// ========== SECURITY VALIDATION FUNCTIONS ==========

/**
 * Validate table name (prevent SQL injection)
 */
function isValidTableName(table: string | undefined): boolean {
  if (!table || typeof table !== 'string') {
    return false;
  }
  // Only allow alphanumeric, underscore, and hyphen
  if (!/^[a-zA-Z0-9_-]+$/.test(table) || table.length > 100) {
    return false;
  }
  // SECURITY: Must be in whitelist
  return ALLOWED_TABLES.includes(table);
}

/**
 * Validate column name (prevent SQL injection in filters and orderBy)
 */
function isValidColumnName(column: string | undefined): boolean {
  if (!column || typeof column !== 'string') {
    return false;
  }
  // Allow alphanumeric, underscore, dot (for joins), and arrow (for JSON)
  return /^[a-zA-Z0-9_.-]+(\->>?[a-zA-Z0-9_'"]+)?$/.test(column) && column.length < 200;
}

/**
 * Validate RPC function name
 */
function isValidRpcFunction(functionName: string | undefined): boolean {
  if (!functionName || typeof functionName !== 'string') {
    return false;
  }
  // Only allow alphanumeric and underscore
  if (!/^[a-zA-Z0-9_]+$/.test(functionName) || functionName.length > 100) {
    return false;
  }
  // SECURITY: Must be in whitelist
  return ALLOWED_RPC_FUNCTIONS.includes(functionName);
}

/**
 * Sanitize LIKE/ILIKE patterns (prevent pattern injection)
 */
function sanitizeLikePattern(pattern: string): string {
  if (typeof pattern !== 'string') {
    return '';
  }
  return pattern
    .replace(/'/g, "''") // Escape single quotes
    .replace(/\\/g, '\\\\') // Escape backslashes
    .substring(0, 500); // Limit length
}

/**
 * Validate filter value (prevent injection)
 */
function isValidFilterValue(value: any): boolean {
  if (value === null) return true;
  
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    if (typeof value === 'string' && value.length > 10000) {
      return false;
    }
    return true;
  }
  
  if (Array.isArray(value)) {
    if (value.length > 1000) return false;
    return value.every(v => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean');
  }
  
  if (typeof value === 'object' && value.operator) {
    const validOperators = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike'];
    if (!validOperators.includes(value.operator)) {
      return false;
    }
    return isValidFilterValue(value.value);
  }
  
  return false;
}

/**
 * Validate request data (prevent malicious payloads)
 */
function validateRequestData(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data format' };
  }
  
  const dataString = JSON.stringify(data);
  if (dataString.length > 1000000) { // 1MB limit
    return { valid: false, error: 'Request data too large (max 1MB)' };
  }
  
  function checkDepth(obj: any, depth: number = 0): boolean {
    if (depth > 10) return false;
    if (typeof obj !== 'object' || obj === null) return true;
    
    for (const key in obj) {
      if (!checkDepth(obj[key], depth + 1)) return false;
    }
    return true;
  }
  
  if (!checkDepth(data)) {
    return { valid: false, error: 'Request data too deeply nested' };
  }
  
  return { valid: true };
}

/**
 * Validate API key
 */
function validateAPIKey(request: NextRequest): boolean {
  const frontendApiKey = process.env.NEXT_PUBLIC_FRONTEND_API_KEY;
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    if (!frontendApiKey) {
      console.error('[Database API] NEXT_PUBLIC_FRONTEND_API_KEY not configured in production!');
      return false;
    }
    const providedKey = request.headers.get('x-api-key');
    return providedKey === frontendApiKey;
  }
  
  if (!frontendApiKey) {
    return true;
  }
  
  const providedKey = request.headers.get('x-api-key');
  return providedKey === frontendApiKey;
}

// ========== MAIN HANDLER ==========

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!validateAPIKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if Supabase is initialized
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database client not initialized' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: DatabaseRequest = await request.json();
    const { operation, table, filters, data, select, orderBy, limit, functionName, functionParams } = body;

    // ========== SECURITY VALIDATIONS ==========

    // Validate table name for non-RPC operations
    if (operation !== 'rpc') {
      if (!isValidTableName(table)) {
        return NextResponse.json(
          { error: `Invalid or disallowed table name: ${table}` },
          { status: 400 }
        );
      }
    }

    // Validate filters
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (!isValidColumnName(key)) {
          return NextResponse.json(
            { error: `Invalid filter column name: ${key}` },
            { status: 400 }
          );
        }
        if (!isValidFilterValue(value)) {
          return NextResponse.json(
            { error: `Invalid filter value for column: ${key}` },
            { status: 400 }
          );
        }
      }
    }

    // Validate orderBy
    if (orderBy && !isValidColumnName(orderBy.column)) {
      return NextResponse.json(
        { error: `Invalid orderBy column: ${orderBy.column}` },
        { status: 400 }
      );
    }

    // Validate data for insert/update
    if (data) {
      const dataValidation = validateRequestData(data);
      if (!dataValidation.valid) {
        return NextResponse.json(
          { error: dataValidation.error },
          { status: 400 }
        );
      }
    }

    // ========== EXECUTE DATABASE OPERATION ==========

    let query: any;

    switch (operation) {
      case 'select': {
        query = supabase.from(table).select(select || '*');
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null && value.operator) {
              // Handle operator-based filters
              const { operator, value: filterValue } = value;
              switch (operator) {
                case 'like':
                  query = query.like(key, sanitizeLikePattern(filterValue));
                  break;
                case 'ilike':
                  query = query.ilike(key, sanitizeLikePattern(filterValue));
                  break;
                case 'gt':
                  query = query.gt(key, filterValue);
                  break;
                case 'gte':
                  query = query.gte(key, filterValue);
                  break;
                case 'lt':
                  query = query.lt(key, filterValue);
                  break;
                case 'lte':
                  query = query.lte(key, filterValue);
                  break;
                case 'neq':
                  query = query.neq(key, filterValue);
                  break;
                default:
                  query = query.eq(key, filterValue);
              }
            } else {
              query = query.eq(key, value);
            }
          });
        }
        
        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending !== false });
        }
        
        if (limit && typeof limit === 'number' && limit > 0 && limit <= 1000) {
          query = query.limit(limit);
        }
        
        break;
      }

      case 'insert': {
        if (!data) {
          return NextResponse.json(
            { error: 'Data is required for insert operation' },
            { status: 400 }
          );
        }
        query = supabase.from(table).insert(data).select();
        break;
      }

      case 'update': {
        if (!data) {
          return NextResponse.json(
            { error: 'Data is required for update operation' },
            { status: 400 }
          );
        }
        
        // SECURITY: Require at least one filter for update to prevent mass updates
        if (!filters || Object.keys(filters).length === 0) {
          return NextResponse.json(
            { error: 'At least one filter is required for update operation' },
            { status: 400 }
          );
        }
        
        query = supabase.from(table).update(data);
        
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        
        query = query.select();
        break;
      }

      case 'delete': {
        // SECURITY: Require at least one filter for delete to prevent mass deletes
        if (!filters || Object.keys(filters).length === 0) {
          return NextResponse.json(
            { error: 'At least one filter is required for delete operation' },
            { status: 400 }
          );
        }
        
        query = supabase.from(table).delete();
        
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        
        query = query.select();
        break;
      }

      case 'rpc': {
        if (!functionName) {
          return NextResponse.json(
            { error: 'Function name is required for RPC operation' },
            { status: 400 }
          );
        }
        
        // SECURITY: Validate RPC function name against whitelist
        if (!isValidRpcFunction(functionName)) {
          return NextResponse.json(
            { error: `RPC function not allowed: ${functionName}` },
            { status: 400 }
          );
        }
        
        // Validate function params
        if (functionParams) {
          const paramsValidation = validateRequestData(functionParams);
          if (!paramsValidation.valid) {
            return NextResponse.json(
              { error: paramsValidation.error },
              { status: 400 }
            );
          }
        }
        
        query = supabase.rpc(functionName, functionParams || {});
        break;
      }

      default: {
        return NextResponse.json(
          { error: `Unsupported operation: ${operation}` },
          { status: 400 }
        );
      }
    }

    const { data: result, error } = await query;

    if (error) {
      console.error('[Database API] Database error:', error);
      // SECURITY: Don't expose internal error details
      return NextResponse.json(
        { success: false, error: 'Database operation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[Database API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    },
  });
}
