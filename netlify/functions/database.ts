/**
 * Database API Proxy
 * 
 * SECURITY: Hides database provider (Supabase) from frontend
 * All database operations go through this serverless function
 * 
 * Frontend → Backend API → Database (Supabase)
 * 
 * No Supabase URLs or keys exposed to frontend
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { checkDistributedRateLimit } from './utils/rateLimiter';
import { logSecurityEvent, logPerformanceMetric } from './utils/monitoring';

// Type definitions for Node.js process (Netlify Functions environment)
declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

// Get Supabase credentials from environment (server-side only)
// Get Supabase credentials from environment (server-side only)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[Database API] Missing Supabase environment variables');
}

// Initialize Supabase client (server-side only)
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Allowed origins
const ALLOWED_ORIGINS = [
  'https://bexyflowers.shop',
  'https://www.bexyflowers.shop',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8080',
  'http://localhost:8888', // Netlify dev server port (common)
  'http://localhost:51635', // Netlify dev server port
  'http://localhost:52933', // Netlify dev server port
];

// Rate limiting store (in-memory - use Redis for production)
interface RateLimitData {
  requests: number[];
  blocked: boolean;
  blockUntil: number;
  dailyCount: number;
  lastReset: number;
}

const rateLimitStore = new Map<string, RateLimitData>();

// Rate limiting configuration
const RATE_LIMITS = {
  perMinute: 30,      // 30 requests per minute (higher for database operations)
  perHour: 500,       // 500 requests per hour
  perDay: 2000,       // 2000 requests per day
  minDelay: 100,      // 100ms minimum between requests
};

const MAX_DAILY_REQUESTS = 50000; // Global daily limit
let globalDailyRequests = 0;
let globalDailyReset = Date.now();

interface DatabaseRequest {
  operation: 'select' | 'insert' | 'update' | 'delete' | 'rpc';
  table: string;
  filters?: Record<string, any>;
  data?: Record<string, any>;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  functionName?: string; // For RPC calls
  functionParams?: Record<string, any>;
}

/**
 * Get client IP
 */
function getClientIP(event: HandlerEvent): string {
  return (
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    event.headers['x-real-ip'] ||
    event.headers['cf-connecting-ip'] ||
    'unknown'
  );
}

/**
 * Generate request fingerprint
 */
function generateFingerprint(event: HandlerEvent, ip: string): string {
  const components = [
    ip,
    event.headers['user-agent'] || 'unknown',
    event.headers['accept-language'] || 'unknown',
  ];

  // Simple hash
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).substring(0, 16);
}

/**
 * Validate API key
 * SECURITY: API key is REQUIRED in production, optional in development
 */
function validateAPIKey(event: HandlerEvent): boolean {
  const frontendApiKey = process.env.FRONTEND_API_KEY;
  const isProduction = process.env.CONTEXT === 'production' || process.env.NODE_ENV === 'production';
  
  // PRODUCTION: API key is REQUIRED
  if (isProduction) {
    if (!frontendApiKey) {
      console.error('[Database API] FRONTEND_API_KEY not configured in production!');
      return false;
    }
    const providedKey = event.headers['x-api-key'] || event.headers['X-API-Key'];
    return providedKey === frontendApiKey;
  }
  
  // DEVELOPMENT: API key is optional for backward compatibility
  if (!frontendApiKey) {
    return true; // Allow if not configured in dev
  }
  
  const providedKey = event.headers['x-api-key'] || event.headers['X-API-Key'];
  return providedKey === frontendApiKey;
}

/**
 * Get security headers
 */
function getSecurityHeaders(origin: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    // CRITICAL: Prevent caching of API responses to ensure fresh data
    // This fixes the issue where discount changes don't reflect on live site
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  if (ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Headers'] = 'Content-Type, X-API-Key';
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
  }

  return headers;
}

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

/**
 * Validate table name (prevent SQL injection)
 */
function isValidTableName(table: string | undefined): boolean {
  if (!table || typeof table !== 'string') {
    return false;
  }
  // Only allow alphanumeric, underscore, and hyphen
  if (!/^[a-zA-Z0-9_-]+$/.test(table) || table.length >= 100) {
    return false;
  }
  // SECURITY: Must be in whitelist
  return ALLOWED_TABLES.includes(table);
}

/**
 * Validate RPC function name
 */
function isValidRpcFunction(functionName: string | undefined): boolean {
  if (!functionName || typeof functionName !== 'string') {
    return false;
  }
  // Only allow alphanumeric and underscore
  if (!/^[a-zA-Z0-9_]+$/.test(functionName) || functionName.length >= 100) {
    return false;
  }
  // SECURITY: Must be in whitelist
  return ALLOWED_RPC_FUNCTIONS.includes(functionName);
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
 * Sanitize LIKE/ILIKE patterns (prevent pattern injection)
 */
function sanitizeLikePattern(pattern: string): string {
  if (typeof pattern !== 'string') {
    return '';
  }
  // Escape special characters but allow user's % and _
  // Remove any attempt at SQL injection
  return pattern
    .replace(/'/g, "''") // Escape single quotes
    .replace(/\\/g, '\\\\') // Escape backslashes
    .substring(0, 500); // Limit length
}

/**
 * Validate filter value (prevent injection)
 */
function isValidFilterValue(value: any): boolean {
  // Null is allowed
  if (value === null) return true;
  
  // Primitives are allowed
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    // String length check
    if (typeof value === 'string' && value.length > 10000) {
      return false;
    }
    return true;
  }
  
  // Arrays are allowed (for 'in' operator)
  if (Array.isArray(value)) {
    // Limit array size
    if (value.length > 1000) return false;
    // Validate each element
    return value.every(v => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean');
  }
  
  // Objects with operator are allowed
  if (typeof value === 'object' && value.operator) {
    const validOperators = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike'];
    if (!validOperators.includes(value.operator)) {
      return false;
    }
    // Validate the actual value
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
  
  // Check data size (prevent memory exhaustion)
  const dataString = JSON.stringify(data);
  if (dataString.length > 1000000) { // 1MB limit
    return { valid: false, error: 'Request data too large (max 1MB)' };
  }
  
  // Validate no nested depth attacks
  function checkDepth(obj: any, depth: number = 0): boolean {
    if (depth > 10) return false; // Max 10 levels deep
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
 * Check rate limits
 */
function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number; error?: string } {
  const now = Date.now();

  // Reset daily counters if needed
  if (now - globalDailyReset > 24 * 60 * 60 * 1000) {
    globalDailyRequests = 0;
    globalDailyReset = now;
    rateLimitStore.forEach((data, key) => {
      if (now - data.lastReset > 24 * 60 * 60 * 1000) {
        data.dailyCount = 0;
        data.lastReset = now;
      }
    });
  }

  // Check global daily limit
  if (globalDailyRequests >= MAX_DAILY_REQUESTS) {
    return { allowed: false, error: 'Daily request limit reached. Please try again tomorrow.' };
  }

  // Get or create rate limit data
  let data = rateLimitStore.get(ip);
  if (!data) {
    data = {
      requests: [],
      blocked: false,
      blockUntil: 0,
      dailyCount: 0,
      lastReset: now,
    };
    rateLimitStore.set(ip, data);
  }

  // Check if IP is blocked
  if (data.blocked && now < data.blockUntil) {
    const retryAfter = Math.ceil((data.blockUntil - now) / 1000);
    return { allowed: false, retryAfter, error: `IP temporarily blocked. Retry after ${retryAfter} seconds.` };
  }

  // Reset block if expired
  if (data.blocked && now >= data.blockUntil) {
    data.blocked = false;
    data.blockUntil = 0;
  }

  // Clean old requests (older than 1 hour)
  data.requests = data.requests.filter(timestamp => now - timestamp < 60 * 60 * 1000);

  // Check per-minute limit
  const requestsLastMinute = data.requests.filter(timestamp => now - timestamp < 60 * 1000).length;
  if (requestsLastMinute >= RATE_LIMITS.perMinute) {
    // Block for 1 hour on excessive requests
    data.blocked = true;
    data.blockUntil = now + 60 * 60 * 1000;
    return { allowed: false, retryAfter: 3600, error: 'Rate limit exceeded. IP blocked for 1 hour.' };
  }

  // Check per-hour limit
  const requestsLastHour = data.requests.length;
  if (requestsLastHour >= RATE_LIMITS.perHour) {
    return { allowed: false, retryAfter: 3600, error: 'Hourly rate limit exceeded. Please try again later.' };
  }

  // Check per-day limit
  if (data.dailyCount >= RATE_LIMITS.perDay) {
    return { allowed: false, error: 'Daily rate limit exceeded. Please try again tomorrow.' };
  }

  // Check minimum delay between requests
  if (data.requests.length > 0) {
    const lastRequest = data.requests[data.requests.length - 1];
    const timeSinceLastRequest = now - lastRequest;
    if (timeSinceLastRequest < RATE_LIMITS.minDelay) {
      const retryAfter = Math.ceil((RATE_LIMITS.minDelay - timeSinceLastRequest) / 1000);
      return { allowed: false, retryAfter, error: `Please wait ${retryAfter}ms between requests.` };
    }
  }

  // All checks passed - add request
  data.requests.push(now);
  data.dailyCount++;
  globalDailyRequests++;

  return { allowed: true };
}

/**
 * Execute database operation
 */
async function executeOperation(request: DatabaseRequest): Promise<any> {
  if (!supabase) {
    throw new Error('Database not configured');
  }

  const { operation, table, filters, data, select, orderBy, limit, offset, functionName, functionParams } = request;

  // Note: Table name validation is done before calling this function
  // This function assumes valid input

  try {
    switch (operation) {
      case 'select': {
        let query = supabase.from(table).select(select || '*');

        // Apply filters
        if (filters) {
          for (const [key, value] of Object.entries(filters)) {
            // SECURITY: Validate column names
            if (!isValidColumnName(key)) {
              throw new Error(`Invalid column name: ${key}`);
            }
            
            // SECURITY: Validate filter values
            if (!isValidFilterValue(value)) {
              throw new Error(`Invalid filter value for column: ${key}`);
            }
            
            if (value === null) {
              query = query.is(key, null);
            } else if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'object' && value.operator) {
              // Support operators: eq, neq, gt, gte, lt, lte, like, ilike
              switch (value.operator) {
                case 'eq':
                  query = query.eq(key, value.value);
                  break;
                case 'neq':
                  query = query.neq(key, value.value);
                  break;
                case 'gt':
                  query = query.gt(key, value.value);
                  break;
                case 'gte':
                  query = query.gte(key, value.value);
                  break;
                case 'lt':
                  query = query.lt(key, value.value);
                  break;
                case 'lte':
                  query = query.lte(key, value.value);
                  break;
                case 'like':
                  // SECURITY: Sanitize LIKE patterns
                  query = query.like(key, sanitizeLikePattern(value.value));
                  break;
                case 'ilike':
                  // SECURITY: Sanitize ILIKE patterns
                  query = query.ilike(key, sanitizeLikePattern(value.value));
                  break;
                default:
                  query = query.eq(key, value.value);
              }
            } else {
              query = query.eq(key, value);
            }
          }
        }

        // Apply ordering
        if (orderBy) {
          // SECURITY: Validate column name in orderBy
          if (!isValidColumnName(orderBy.column)) {
            throw new Error(`Invalid orderBy column: ${orderBy.column}`);
          }
          query = query.order(orderBy.column, { ascending: orderBy.ascending !== false });
        }

        // Apply offset (for pagination)
        if (offset !== undefined && offset > 0) {
          query = query.range(offset, offset + (limit || 10) - 1);
        } else if (limit) {
          // Apply limit only (no offset)
          query = query.limit(limit);
        }

        const { data: result, error } = await query;
        if (error) throw error;
        return result;
      }

      case 'insert': {
        if (!data) {
          throw new Error('Insert operation requires data');
        }
        
        // SECURITY: Validate data
        const dataValidation = validateRequestData(data);
        if (!dataValidation.valid) {
          throw new Error(`Invalid insert data: ${dataValidation.error}`);
        }
        
        const { data: result, error } = await supabase
          .from(table)
          .insert(data)
          .select(select || '*');
        if (error) throw error;
        return result;
      }

      case 'update': {
        if (!data) {
          throw new Error('Update operation requires data');
        }
        if (!filters || Object.keys(filters).length === 0) {
          throw new Error('Update operation requires at least one filter (safety measure)');
        }

        // SECURITY: Validate data
        const dataValidation = validateRequestData(data);
        if (!dataValidation.valid) {
          throw new Error(`Invalid update data: ${dataValidation.error}`);
        }

        let query = supabase.from(table).update(data);

        // Apply filters with validation
        for (const [key, value] of Object.entries(filters)) {
          // SECURITY: Validate column names
          if (!isValidColumnName(key)) {
            throw new Error(`Invalid column name in filter: ${key}`);
          }
          // SECURITY: Validate filter values
          if (!isValidFilterValue(value)) {
            throw new Error(`Invalid filter value for column: ${key}`);
          }
          query = query.eq(key, value);
        }

        const { data: result, error } = await query.select(select || '*');
        if (error) throw error;
        return result;
      }

      case 'delete': {
        if (!filters || Object.keys(filters).length === 0) {
          throw new Error('Delete operation requires at least one filter (safety measure)');
        }

        let query = supabase.from(table).delete();

        // Apply filters with validation
        for (const [key, value] of Object.entries(filters)) {
          // SECURITY: Validate column names
          if (!isValidColumnName(key)) {
            throw new Error(`Invalid column name in filter: ${key}`);
          }
          // SECURITY: Validate filter values
          if (!isValidFilterValue(value)) {
            throw new Error(`Invalid filter value for column: ${key}`);
          }
          query = query.eq(key, value);
        }

        const { error } = await query;
        if (error) throw error;
        return { success: true };
      }

      case 'rpc': {
        if (!functionName) {
          throw new Error('RPC operation requires functionName');
        }

        // SECURITY: Validate RPC function name against whitelist
        if (!isValidRpcFunction(functionName)) {
          throw new Error(`RPC function not allowed: ${functionName}`);
        }
        
        // SECURITY: Validate function parameters
        if (functionParams) {
          const paramsValidation = validateRequestData(functionParams);
          if (!paramsValidation.valid) {
            throw new Error(`Invalid RPC parameters: ${paramsValidation.error}`);
          }
        }

        const { data: result, error } = await supabase.rpc(
          functionName,
          functionParams || {}
        );
        if (error) throw error;
        return result;
      }

      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  } catch (error) {
    console.error('[Database API] Operation error:', error);
    throw error;
  }
}

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  const startTime = Date.now();
  const ip = getClientIP(event);
  const origin = event.headers.origin || event.headers.referer || '';

  const headers = getSecurityHeaders(origin);

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only POST allowed
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Only POST requests are accepted.' }),
    };
  }

  // Check origin (allow requests without origin for testing/API clients)
  if (origin && !ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))) {
    logSecurityEvent('error', 'warning', event.path, ip, {
      reason: 'Forbidden origin',
      origin: origin,
    });
    console.warn(`[Database API] Unauthorized origin: ${origin} from IP: ${ip}`);
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Forbidden: Origin not allowed' }),
    };
  }

  // If no origin provided, allow if API key is valid (for API clients/testing)
  // This allows automated tests and API clients to work
  if (!origin) {
    // Will be validated by API key check below
  }

  // Validate API key
  if (!validateAPIKey(event)) {
    logSecurityEvent('auth_failure', 'error', event.path, ip, {
      reason: 'Invalid API key',
    });
    console.warn(`[Database API] Unauthorized API key from IP: ${ip}`);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized: Invalid API key' }),
    };
  }

  // Check rate limits (distributed with Redis fallback to memory)
  const fingerprint = generateFingerprint(event, ip);
  const rateLimitCheck = await checkDistributedRateLimit(ip, fingerprint, {
    perMinute: RATE_LIMITS.perMinute,
    perHour: RATE_LIMITS.perHour,
    perDay: RATE_LIMITS.perDay,
    minDelay: RATE_LIMITS.minDelay,
    maxDailyRequests: MAX_DAILY_REQUESTS,
  });

  if (!rateLimitCheck.allowed) {
    logSecurityEvent('rate_limit', 'warning', event.path, ip, {
      retryAfter: rateLimitCheck.retryAfter,
      error: rateLimitCheck.error,
    });
    const responseHeaders = { ...headers };
    if (rateLimitCheck.retryAfter) {
      responseHeaders['Retry-After'] = rateLimitCheck.retryAfter.toString();
    }
    if (rateLimitCheck.resetAt) {
      responseHeaders['X-RateLimit-Reset'] = new Date(rateLimitCheck.resetAt).toISOString();
    }
    if (rateLimitCheck.remaining !== undefined) {
      responseHeaders['X-RateLimit-Remaining'] = rateLimitCheck.remaining.toString();
    }
    return {
      statusCode: 429,
      headers: responseHeaders,
      body: JSON.stringify({
        error: rateLimitCheck.error || 'Rate limit exceeded',
        retryAfter: rateLimitCheck.retryAfter,
        resetAt: rateLimitCheck.resetAt ? new Date(rateLimitCheck.resetAt).toISOString() : undefined,
      }),
    };
  }

  // Check request body size (limit to 1MB)
  const bodySize = event.body?.length || 0;
  const MAX_BODY_SIZE = 1024 * 1024; // 1MB
  if (bodySize > MAX_BODY_SIZE) {
    return {
      statusCode: 413,
      headers,
      body: JSON.stringify({ error: 'Request body too large. Maximum size: 1MB' }),
    };
  }

  // IMPORTANT: Validate request BEFORE checking database configuration
  // This ensures validation errors return 400, not 500
  let request: DatabaseRequest | null = null;

  try {
    // Parse request body
    try {
      request = JSON.parse(event.body || '{}') as DatabaseRequest;
    } catch (parseError) {
      logSecurityEvent('validation_error', 'warning', event.path, ip, {
        reason: 'Invalid JSON in request body',
        error: parseError instanceof Error ? parseError.message : 'Unknown parse error',
      });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }

    // Validate request - check for missing fields
    if (!request || !request.operation) {
      logSecurityEvent('validation_error', 'warning', event.path, ip, {
        reason: 'Missing required field: operation',
      });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required field: operation' }),
      };
    }

    if (!request || !request.table) {
      logSecurityEvent('validation_error', 'warning', event.path, ip, {
        reason: 'Missing required field: table',
        operation: request?.operation,
      });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required field: table' }),
      };
    }

    // Validate operation type
    const validOperations = ['select', 'insert', 'update', 'delete', 'rpc'];
    if (!validOperations.includes(request.operation)) {
      logSecurityEvent('validation_error', 'warning', event.path, ip, {
        reason: 'Invalid operation',
        operation: request.operation,
      });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Invalid operation: ${request.operation}. Valid operations: ${validOperations.join(', ')}` }),
      };
    }

    // Validate table name (prevent SQL injection) - SKIP for RPC operations
    // RPC operations use functionName instead of table name
    if (request.operation !== 'rpc' && !isValidTableName(request.table)) {
      logSecurityEvent('validation_error', 'warning', event.path, ip, {
        reason: 'Invalid table name',
        table: request.table,
      });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid table name. Only alphanumeric characters, underscores, and hyphens are allowed.' }),
      };
    }

    // For RPC operations, validate functionName against whitelist
    if (request.operation === 'rpc') {
      if (!request.functionName) {
        logSecurityEvent('validation_error', 'warning', event.path, ip, {
          reason: 'Missing functionName for RPC operation',
        });
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'RPC operation requires functionName' }),
        };
      }
      if (!isValidRpcFunction(request.functionName)) {
        logSecurityEvent('validation_error', 'warning', event.path, ip, {
          reason: 'RPC function not in whitelist',
          functionName: request.functionName,
        });
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'RPC function not allowed' }),
        };
      }
    }

    // NOW check if database is configured (after validation passes)
    if (!supabase) {
      console.error('[Database API] Database not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database not configured' }),
      };
    }

    // Execute operation
    const result = await executeOperation(request);

    const responseTime = Date.now() - startTime;
    console.log(`[Database API] ✅ ${request.operation} on ${request.table} - ${responseTime}ms`);

    // Log performance metric
    logPerformanceMetric(event.path, responseTime, 200);
    logSecurityEvent('success', 'info', event.path, ip, {
      operation: request.operation,
      table: request.table,
      responseTime,
    });

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, data: result }),
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Determine if this is a validation error (400) or server error (500)
    const isValidationError =
      errorMessage.includes('Invalid') ||
      errorMessage.includes('Missing required') ||
      errorMessage.includes('requires') ||
      errorMessage.includes('Unsupported operation');

    const statusCode = isValidationError ? 400 : 500;

    // Log error event
    logSecurityEvent(isValidationError ? 'validation_error' : 'error', isValidationError ? 'warning' : 'error', event.path, ip, {
      operation: request?.operation,
      table: request?.table,
      error: errorMessage,
      responseTime,
    });
    logPerformanceMetric(event.path, responseTime, statusCode);
    console.error(`[Database API] ❌ Error: ${errorMessage} - ${responseTime}ms`);

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: isValidationError ? 'Invalid request' : 'Database operation failed',
        message: errorMessage,
      }),
    };
  }
};

