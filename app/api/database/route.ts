/**
 * Database API Route Handler for Next.js
 * Ported from Netlify function to Next.js API route
 * Provides secure proxy to Supabase database operations
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

// Get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');
  
  return forwarded?.split(',')[0]?.trim() || realIp || cfIp || 'unknown';
}

// Validate API key
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

// Main POST handler
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

    // Execute database operation
    let query: any;

    switch (operation) {
      case 'select': {
        query = supabase.from(table).select(select || '*');
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        
        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending !== false });
        }
        
        if (limit) {
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
        query = supabase.from(table).update(data);
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        
        query = query.select();
        break;
      }

      case 'delete': {
        query = supabase.from(table).delete();
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        
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
      return NextResponse.json(
        { success: false, error: error.message || 'Database operation failed' },
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
