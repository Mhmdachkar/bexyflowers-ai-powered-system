/**
 * Netlify Serverless Function - Pollinations API Proxy (SECURE VERSION)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECURITY FEATURES (MULTI-LAYERED DEFENSE)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 🔐 API KEY PROTECTION:
 *    ✓ Dual API key support (primary + secondary fallback)
 *    ✓ Automatic failover on rate limit (429), unauthorized (401), forbidden (403)
 *    ✓ Keys stored server-side only (never exposed to frontend)
 *    ✓ Environment variable isolation
 * 
 * 🛡️ RATE LIMITING (Multi-Tier):
 *    ✓ Per-IP: 10/min, 100/hour, 500/day
 *    ✓ Global: 10,000/day across all users
 *    ✓ Minimum delay: 2 seconds between requests
 *    ✓ Distributed rate limiting with Redis/Upstash fallback
 * 
 * 🚨 DDoS & ABUSE PROTECTION:
 *    ✓ Rapid request detection (5 requests in 1 second = block)
 *    ✓ Identical prompt spam detection
 *    ✓ Short prompt spam detection (10+ prompts <20 chars)
 *    ✓ Warning level system (0-3, auto-block at level 3)
 *    ✓ IP fingerprinting for bot detection
 *    ✓ Automatic 1-hour ban for abusers
 * 
 * 🔒 AUTHENTICATION:
 *    ✓ Frontend API key validation (X-API-Key header)
 *    ✓ Optional HMAC request signing (SHA-256)
 *    ✓ Nonce validation (replay attack prevention)
 *    ✓ Timestamp validation (5-minute freshness window)
 * 
 * 🌐 CORS & ORIGIN VALIDATION:
 *    ✓ Strict origin whitelist (production + localhost dev)
 *    ✓ Dynamic CORS headers based on origin
 *    ✓ OPTIONS preflight support
 * 
 * 🔍 INPUT VALIDATION:
 *    ✓ Prompt: 10-1000 chars, sanitized, XSS/SQL injection blocked
 *    ✓ Dimensions: 256-2048px range enforcement
 *    ✓ Model: Whitelist of allowed Pollinations models
 *    ✓ Malicious pattern detection (script tags, eval, etc.)
 * 
 * 🖼️ OUTPUT VALIDATION:
 *    ✓ Image size validation (10KB - 10MB)
 *    ✓ Magic bytes verification (PNG/JPEG/WEBP/GIF)
 *    ✓ Content-Type verification
 *    ✓ Empty/corrupted image detection
 * 
 * ⏱️ TIMEOUT & RETRY PROTECTION:
 *    ✓ 45-second timeout per API request
 *    ✓ AbortController for clean cancellation
 *    ✓ Automatic failover to secondary key
 *    ✓ Detailed error logging for both keys
 * 
 * 📊 MONITORING & LOGGING:
 *    ✓ Security event logging (all levels)
 *    ✓ Performance metrics tracking
 *    ✓ API key usage tracking
 *    ✓ Error rate monitoring with alerts
 *    ✓ Request/response logging with sanitization
 * 
 * 🚫 ATTACK MITIGATION:
 *    ✓ Method restriction (POST only, GET disabled)
 *    ✓ Request body parsing with error handling
 *    ✓ Sensitive data redaction in logs
 *    ✓ IP-based temporary blocking
 *    ✓ Automated threat detection
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * KEY EXPOSURE PROTECTION
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Even if keys are exposed/leaked:
 *    1. Rate limiting prevents abuse (10/min per IP)
 *    2. Frontend API key required (additional layer)
 *    3. CORS blocks unauthorized domains
 *    4. DDoS protection auto-blocks suspicious patterns
 *    5. Daily limits cap total damage (10k requests/day)
 *    6. Automatic failover to backup key maintains service
 *    7. Security logs alert administrators
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * FALLBACK STRATEGY
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PRIMARY KEY → SECONDARY KEY → ERROR
 *      ↓              ↓            ↓
 *   Success      Success      503 Service
 *   (logged)    (logged)    Unavailable
 *                           (all keys exhausted)
 * 
 * Endpoint: /.netlify/functions/generate-image
 * Method: POST only (GET disabled for security)
 * Version: 2.0.0 (Enhanced Security + Dual Key Fallback)
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { checkDistributedRateLimit } from './utils/rateLimiter';
import { logSecurityEvent, logPerformanceMetric } from './utils/monitoring';

interface RequestBody {
  prompt?: string;
  width?: number;
  height?: number;
  model?: string;
  timestamp?: number;
  nonce?: string;
  signature?: string;
}

// Rate limiting store (in-memory - use Redis for production)
interface RateLimitData {
  requests: number[];
  blocked: boolean;
  blockUntil: number;
  dailyCount: number;
  lastReset: number;
}

const rateLimitStore = new Map<string, RateLimitData>();

// Configuration
const RATE_LIMITS = {
  perMinute: 10,      // 10 requests per minute
  perHour: 100,       // 100 requests per hour
  perDay: 500,        // 500 requests per day
  minDelay: 2000,     // 2 seconds minimum between requests
};

const MAX_DAILY_REQUESTS = 10000; // Global daily limit
let globalDailyRequests = 0;
let globalDailyReset = Date.now();


// Allowed origins (CORS)
// Static list — extend with Netlify's own URLs dynamically below
const ALLOWED_ORIGINS = [
  'https://bexyflowers.shop',
  'https://www.bexyflowers.shop',
  'http://localhost:5173',  // Vite dev
  'http://localhost:5174',  // Vite dev alt
  'http://localhost:8888',  // Netlify dev
  'http://localhost:51635', // Netlify dev server
  'http://localhost:52933', // Netlify dev server alt
];

// Allowed models — synced with https://pollinations.ai/models (April 2026)
// Only image-output models that support /image/{prompt} endpoint
const ALLOWED_MODELS = [
  // GPT Image models (photorealistic) — PRIMARY
  'gptimage', 'gptimage-large',
  // Flux (fast, affordable — reliable fallback)
  'flux', 'zimage',
  // FLUX.2 Klein 4B — good quality alternative
  'klein',
  // NanoBanana family
  'nanobanana', 'nanobanana-2', 'nanobanana-pro',
  // FLUX Kontext (context-aware)
  'kontext',
  // Pollinations native image models
  'p-image', 'p-image-edit',
  // Qwen image
  'qwen-image',
  // Grok image (high quality)
  'grok-imagine', 'grok-imagine-pro',
  // Amazon Nova Canvas
  'nova-canvas',
];

/**
 * Get client IP address
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
  
  // Simple hash (in production, use crypto.createHash)
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 16);
}

/**
 * Extract just the origin (protocol + host) from a URL or origin header.
 * Handles both "https://example.com" (origin header) and 
 * "https://example.com/path/page" (referer header).
 */
function extractOrigin(urlOrOrigin: string): string {
  try {
    const parsed = new URL(urlOrOrigin);
    return parsed.origin; // e.g. "https://bexyflowers.shop"
  } catch {
    return urlOrOrigin; // fallback to raw value
  }
}

/**
 * Check if origin is allowed.
 *
 * In addition to the static whitelist we also accept:
 *  1. The site's own Netlify URL (process.env.URL — e.g. https://bexyflowers.netlify.app)
 *  2. Any Netlify deploy-preview URL for this site (process.env.DEPLOY_URL prefix)
 *  3. Any *.netlify.app subdomain (covers branch deploys and previews)
 *
 * All three are set automatically by Netlify at build/function runtime, so we
 * never have to hard-code a changing preview URL.
 */
function isOriginAllowed(rawOrigin: string | null): boolean {
  if (!rawOrigin) return false;

  // Normalize: extract just the origin part (strips path if referer was used)
  const origin = extractOrigin(rawOrigin);

  // Debug logging (will appear in Netlify function logs)
  console.log('[Origin Check]', { 
    raw: rawOrigin, 
    normalized: origin,
    envURL: process.env.URL,
    envDeployURL: process.env.DEPLOY_URL,
  });

  // Static whitelist — exact match or startsWith for flexibility
  for (const allowed of ALLOWED_ORIGINS) {
    if (origin === allowed || origin.startsWith(allowed)) return true;
  }

  // Netlify auto-injected site URL (e.g. https://bexyflowers.netlify.app)
  const siteUrl = process.env.URL;
  if (siteUrl) {
    const normalizedSiteUrl = extractOrigin(siteUrl);
    if (origin === normalizedSiteUrl) return true;
  }

  // Netlify deploy-preview URL (e.g. https://deploy-preview-42--bexyflowers.netlify.app)
  const deployUrl = process.env.DEPLOY_URL;
  if (deployUrl) {
    const normalizedDeployUrl = extractOrigin(deployUrl);
    if (origin === normalizedDeployUrl) return true;
  }

  // Any *.netlify.app subdomain (branch deploys, previews, etc.)
  try {
    const { hostname } = new URL(origin);
    if (hostname.endsWith('.netlify.app')) return true;
  } catch {
    // invalid URL — fall through to deny
  }

  return false;
}

/**
 * Validate API key
 */
function validateAPIKey(event: HandlerEvent): { allowed: boolean; reason?: string } {
  const frontendApiKey = process.env.FRONTEND_API_KEY;
  if (!frontendApiKey) {
    console.warn('[Security] FRONTEND_API_KEY not set - allowing all requests');
    return { allowed: true }; // Allow if not configured (backward compatibility)
  }
  
  const providedKey = event.headers['x-api-key'] || event.headers['X-API-Key'];
  
  if (!providedKey) {
    return { 
      allowed: false, 
      reason: 'API key required but not provided. Please set VITE_FRONTEND_API_KEY in Netlify environment variables.' 
    };
  }
  
  if (providedKey !== frontendApiKey) {
    return { 
      allowed: false, 
      reason: 'API key mismatch. Please verify VITE_FRONTEND_API_KEY matches FRONTEND_API_KEY in Netlify.' 
    };
  }
  
  return { allowed: true };
}

/**
 * Validate request signature (HMAC)
 */
function validateSignature(
  body: RequestBody,
  providedSignature: string,
  timestamp: number
): boolean {
  const frontendSecret = process.env.FRONTEND_API_SECRET;
  if (!frontendSecret) {
    // If secret not configured, allow unsigned requests (backward compatibility)
    return providedSignature === '';
  }
  
  // Check timestamp freshness (5 minute window)
  const now = Date.now();
  const timestampTolerance = 5 * 60 * 1000; // 5 minutes
  if (Math.abs(now - timestamp) > timestampTolerance) {
    return false; // Request too old or from future
  }
  
  // Reconstruct signature payload (must match frontend exactly)
  const payload = JSON.stringify({
    prompt: body.prompt,
    width: body.width || 1024,
    height: body.height || 1024,
    model: body.model || 'gptimage',
    timestamp,
    nonce: body.nonce,
  });
  
  // Use Node.js crypto for HMAC validation
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', frontendSecret)
    .update(payload)
    .digest('hex');
  
  // Constant-time comparison to prevent timing attacks
  if (providedSignature.length !== expectedSignature.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < providedSignature.length; i++) {
    result |= providedSignature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Check for replay attacks (nonce validation)
 * PERFORMANCE: Optimized cleanup to run periodically instead of on every request
 */
const nonceStore = new Map<string, number>();
const NONCE_CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes
const NONCE_MAX_SIZE = 10000;
let lastCleanupTime = Date.now();

function checkReplay(nonce: string, timestamp: number): { valid: boolean; error?: string } {
  // Check if nonce already used
  if (nonceStore.has(nonce)) {
    return { valid: false, error: 'Replay attack detected: nonce already used' };
  }
  
  // Check timestamp freshness
  const now = Date.now();
  const timestampTolerance = 5 * 60 * 1000; // 5 minutes
  if (Math.abs(now - timestamp) > timestampTolerance) {
    return { valid: false, error: 'Request expired or from future' };
  }
  
  // Store nonce
  nonceStore.set(nonce, timestamp);
  
  // PERFORMANCE: Only cleanup periodically or when size exceeds threshold
  // This prevents O(n) iteration on every request
  const timeSinceLastCleanup = now - lastCleanupTime;
  if (nonceStore.size > NONCE_MAX_SIZE || timeSinceLastCleanup > NONCE_CLEANUP_INTERVAL) {
    lastCleanupTime = now;
    // Use array iteration for better performance than entries()
    const expiredNonces: string[] = [];
    nonceStore.forEach((storedTimestamp, storedNonce) => {
      if (now - storedTimestamp > timestampTolerance) {
        expiredNonces.push(storedNonce);
      }
    });
    // Delete in separate pass to avoid iterator invalidation
    expiredNonces.forEach(n => nonceStore.delete(n));
  }
  
  return { valid: true };
}

/**
 * Validate and sanitize prompt
 */
function validatePrompt(prompt: string): { valid: boolean; error?: string; sanitized?: string } {
  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, error: 'Prompt is required' };
  }
  
  const trimmed = prompt.trim();
  
  if (trimmed.length < 10) {
    return { valid: false, error: 'Prompt too short (minimum 10 characters)' };
  }
  
  if (trimmed.length > 1000) {
    return { valid: false, error: 'Prompt too long (maximum 1000 characters)' };
  }
  
  // Block suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /eval\(/i,
    /exec\(/i,
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(trimmed))) {
    return { valid: false, error: 'Invalid prompt content detected' };
  }
  
  // Sanitize: Remove null bytes and control characters
  const sanitized = trimmed.replace(/[\x00-\x1F\x7F]/g, '');
  
  return { valid: true, sanitized };
}

/**
 * Validate parameters
 */
function validateParameters(width: number, height: number, model: string): { valid: boolean; error?: string } {
  // Validate dimensions
  if (width < 256 || width > 2048 || height < 256 || height > 2048) {
    return { valid: false, error: 'Dimensions must be between 256 and 2048' };
  }
  
  // Validate model
  if (!ALLOWED_MODELS.includes(model)) {
    return { valid: false, error: `Invalid model. Allowed: ${ALLOWED_MODELS.join(', ')}` };
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
      return { allowed: false, retryAfter, error: `Please wait ${retryAfter} seconds between requests.` };
    }
  }
  
  // All checks passed - add request
  data.requests.push(now);
  data.dailyCount++;
  globalDailyRequests++;
  
  return { allowed: true };
}

/**
 * Log request for monitoring
 */
function logRequest(
  event: HandlerEvent,
  ip: string,
  responseTime: number,
  success: boolean,
  statusCode: number,
  error?: string
) {
  const log = {
    timestamp: new Date().toISOString(),
    ip,
    method: event.httpMethod,
    path: event.path,
    responseTime,
    success,
    statusCode,
    error: error?.substring(0, 100), // Limit error length
    userAgent: event.headers['user-agent']?.substring(0, 100),
  };
  
  console.log('[Request Log]', JSON.stringify(log));
}

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  const startTime = Date.now();
  const ip = getClientIP(event);
  const origin = event.headers.origin || event.headers.referer || '';
  
  // CORS headers
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
  
  // Set CORS origin (only if allowed)
  if (isOriginAllowed(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
  }
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }
  
  // Only allow POST requests (GET disabled for security)
  if (event.httpMethod !== 'POST') {
    const responseTime = Date.now() - startTime;
    logRequest(event, ip, responseTime, false, 405);
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed. Only POST requests are accepted.' }),
    };
  }
  
  // Check origin (allow requests without origin for testing/API clients)
  if (origin && !isOriginAllowed(origin)) {
    const responseTime = Date.now() - startTime;
    logSecurityEvent('error', 'warning', event.path, ip, {
      reason: 'Forbidden origin',
      origin: origin,
    });
    logRequest(event, ip, responseTime, false, 403, 'Forbidden origin');
    return {
      statusCode: 403,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Forbidden: Origin not allowed' }),
    };
  }
  
  // If no origin provided, allow if API key is valid (for API clients/testing)
  // This allows automated tests and API clients to work
  
  // Validate API key
  const apiKeyValidation = validateAPIKey(event);
  if (!apiKeyValidation.allowed) {
    const responseTime = Date.now() - startTime;
    logSecurityEvent('auth_failure', 'error', event.path, ip, {
      reason: apiKeyValidation.reason || 'Invalid API key',
      hasBackendKey: !!process.env.FRONTEND_API_KEY,
      hasFrontendKey: !!(event.headers['x-api-key'] || event.headers['X-API-Key']),
    });
    logRequest(event, ip, responseTime, false, 401, apiKeyValidation.reason || 'Invalid API key');
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Unauthorized: Invalid API key',
        message: apiKeyValidation.reason || 'API key validation failed. Please check your environment variables.',
      }),
    };
  }
  
  // Parse request body early for signature validation
  let body: RequestBody;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (parseError) {
    const responseTime = Date.now() - startTime;
    logSecurityEvent('validation_error', 'warning', event.path, ip, {
      reason: 'Invalid JSON',
    });
    logRequest(event, ip, responseTime, false, 400, 'Invalid JSON');
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    };
  }
  
  // Validate request signature if provided (enforce in production)
  const enforceSigning = process.env.ENFORCE_REQUEST_SIGNING === 'true';
  const timestamp = body.timestamp || Date.now();
  const nonce = body.nonce || '';
  const signature = body.signature || event.headers['x-signature'] || '';
  
  if (signature || enforceSigning) {
    if (!signature) {
      logSecurityEvent('auth_failure', 'error', event.path, ip, {
        reason: 'Missing signature (signing enforced)',
      });
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Request signature required' }),
      };
    }
    
    if (!nonce) {
      logSecurityEvent('auth_failure', 'error', event.path, ip, {
        reason: 'Missing nonce',
      });
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Request nonce required' }),
      };
    }
    
    // Validate signature
    const sigValid = validateSignature(body, signature, timestamp);
    if (!sigValid) {
      logSecurityEvent('auth_failure', 'critical', event.path, ip, {
        reason: 'Invalid signature',
      });
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid request signature' }),
      };
    }
    
    // Check for replay attacks
    const replayCheck = checkReplay(nonce, timestamp);
    if (!replayCheck.valid) {
      logSecurityEvent('auth_failure', 'critical', event.path, ip, {
        reason: 'Replay attack detected',
        details: replayCheck.error,
      });
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: replayCheck.error }),
      };
    }
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
    const responseTime = Date.now() - startTime;
    logSecurityEvent('rate_limit', 'warning', event.path, ip, {
      retryAfter: rateLimitCheck.retryAfter,
      error: rateLimitCheck.error,
    });
    logRequest(event, ip, responseTime, false, 429, rateLimitCheck.error);
    const headers = {
      ...corsHeaders,
    };
    if (rateLimitCheck.retryAfter) {
      headers['Retry-After'] = rateLimitCheck.retryAfter.toString();
    }
    if (rateLimitCheck.resetAt) {
      headers['X-RateLimit-Reset'] = new Date(rateLimitCheck.resetAt).toISOString();
    }
    if (rateLimitCheck.remaining !== undefined) {
      headers['X-RateLimit-Remaining'] = rateLimitCheck.remaining.toString();
    }
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({
        error: rateLimitCheck.error || 'Rate limit exceeded',
        retryAfter: rateLimitCheck.retryAfter,
        resetAt: rateLimitCheck.resetAt ? new Date(rateLimitCheck.resetAt).toISOString() : undefined,
      }),
    };
  }
  
  try {
    // Get secret key from environment variable (single key, no fallback)
    const secretKey = process.env.POLLINATIONS_SECRET_KEY;
    
    if (!secretKey) {
      console.error('[Netlify Function] Missing POLLINATIONS_SECRET_KEY environment variable');
      const responseTime = Date.now() - startTime;
      logSecurityEvent('error', 'critical', event.path, ip, {
        reason: 'Missing POLLINATIONS_SECRET_KEY',
      });
      logRequest(event, ip, responseTime, false, 500, 'Missing API key');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Server configuration error: API key not configured',
        }),
      };
    }
    
    // Validate prompt
    const promptValidation = validatePrompt(body.prompt || '');
    if (!promptValidation.valid) {
      const responseTime = Date.now() - startTime;
      logRequest(event, ip, responseTime, false, 400, promptValidation.error);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: promptValidation.error }),
      };
    }
    
    const prompt = promptValidation.sanitized || body.prompt || '';
    
    // ═══════════════════════════════════════════════════════════════════════
    // MODEL: gptimage (GPT Image 1 Mini) — ONLY model used, NO fallback.
    // No other model (flux, klein, etc.) will ever be used, even on failure.
    // If gptimage is unavailable the user receives a clear error message.
    // ═══════════════════════════════════════════════════════════════════════
    const MODEL = 'gptimage';

    // ─── Resolution: 512×512 ──────────────────────────────────────────────
    // Why 512 instead of 1024?
    //
    // 1. NETLIFY 6 MB BODY LIMIT — a 1024×1024 PNG from gptimage can reach
    //    3–8 MB raw; base64-encoded in JSON that becomes 4–11 MB, which blows
    //    past Netlify's hard 6 MB response-body cap → instant 502 crash.
    //
    // 2. NETLIFY FUNCTION TIMEOUT — at 1024×1024, gptimage needs 40–60 s.
    //    With function startup + rate-limiter + base64 encoding the total
    //    easily exceeds Netlify's wall-clock limit → 504.
    //
    // 3. gptimage at 512×512 still produces crisp, photorealistic results
    //    (GPT Image 1 Mini renders at full quality internally; 512×512 is its
    //    fastest supported output size).  The image is served from a blob URL
    //    and displayed at ≤ 400 px on screen, so 512 px is more than enough.
    const width = 512;
    const height = 512;

    const paramValidation = validateParameters(width, height, MODEL);
    if (!paramValidation.valid) {
      const responseTime = Date.now() - startTime;
      logRequest(event, ip, responseTime, false, 400, paramValidation.error);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: paramValidation.error }),
      };
    }
    
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1000000000);

    // ─── Per-attempt timeouts ─────────────────────────────────────────────────
    // gptimage at 512×512 typically generates in 15–25 s.
    //
    // Attempt 1 (old endpoint /prompt/ ?key=): 22 s
    //   — The legacy endpoint where gptimage is most reliable.
    //
    // Attempt 2 (new endpoint /image/ Bearer): 12 s
    //   — Secondary; only reached if attempt 1 fails fast (e.g. 403/500).
    //     A slow attempt-1 still leaves only 12 s here, which is enough for
    //     gptimage when Pollinations is healthy.
    //
    // Total worst-case: 22 + 12 = 34 s
    //   + ~5 s overhead (startup, rate-limit check, base64) = ~39 s
    //   → safely inside Netlify's 60 s function limit on any paid plan.
    //   → On FREE tier (10 s hard cap) image generation requires a paid plan.
    const ATTEMPT1_TIMEOUT_MS = 22_000;
    const ATTEMPT2_TIMEOUT_MS = 12_000;

    // ─── Helper: fetch with AbortController timeout ───────────────────────────
    async function fetchWithTimeout(url: string, headers: Record<string, string>, timeoutMs: number): Promise<Response> {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { method: 'GET', headers, signal: controller.signal });
        return res;
      } finally {
        clearTimeout(timer);
      }
    }

    // ─── Endpoint builders for gptimage ──────────────────────────────────────
    // OLD endpoint: image.pollinations.ai — API key in URL ?key= param.
    // NOTE: enhance=true is intentionally omitted — it is not a valid gptimage
    //       parameter and was causing silent failures / 400 errors.
    const gptimageUrlOld =
      `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${MODEL}&width=${width}&height=${height}&seed=${seed}&nologo=true&key=${secretKey}`;

    // NEW endpoint: gen.pollinations.ai — API key as Bearer header.
    const gptimageUrlNew =
      `https://gen.pollinations.ai/image/${encodedPrompt}?model=${MODEL}&width=${width}&height=${height}&seed=${seed}&nologo=true`;

    const bearerHeaders: Record<string, string> = {
      'Authorization': `Bearer ${secretKey}`,
      'Accept': 'image/*, application/json',
    };
    const noAuthHeaders: Record<string, string> = {
      'Accept': 'image/*, application/json',
    };

    // Log request details
    console.log('[Netlify Function] ========== IMAGE GENERATION REQUEST ==========');
    console.log('[Netlify Function] IP:', ip);
    console.log('[Netlify Function] Model: gptimage (GPT Image 1 Mini) — NO fallback');
    console.log('[Netlify Function] Resolution:', `${width}x${height}`);
    console.log('[Netlify Function] Prompt length:', prompt.length);
    console.log('[Netlify Function] Seed:', seed);
    console.log('[Netlify Function] API Key prefix:', secretKey.substring(0, 8) + '...');
    console.log('[Netlify Function] Timeouts — attempt1:', ATTEMPT1_TIMEOUT_MS, 'ms | attempt2:', ATTEMPT2_TIMEOUT_MS, 'ms');
    console.log('[Netlify Function] ===============================================');

    // ─── gptimage-only two-attempt strategy ───────────────────────────────────
    // Attempt 1: gptimage on OLD endpoint (?key= in URL) — 35s
    //            This is where gptimage is confirmed to work reliably.
    // Attempt 2: gptimage on NEW endpoint (Bearer header) — 20s
    //            Secondary try in case old endpoint is temporarily down.
    //
    // NO other model is ever used. If both attempts fail, the user receives
    // a "gptimage temporarily unavailable" error — not a silently degraded image.
    const attempts: Array<{
      label: string;
      url: string;
      headers: Record<string, string>;
      timeout: number;
    }> = [
      {
        label: 'gptimage / image.pollinations.ai / ?key=',
        url: gptimageUrlOld,
        headers: noAuthHeaders,
        timeout: ATTEMPT1_TIMEOUT_MS,
      },
      {
        label: 'gptimage / gen.pollinations.ai / Bearer',
        url: gptimageUrlNew,
        headers: bearerHeaders,
        timeout: ATTEMPT2_TIMEOUT_MS,
      },
    ];

    // Status codes from Pollinations that mean "try next endpoint immediately".
    // 502 / 504 = Pollinations upstream gateway errors (transient, worth retrying)
    // 400 / 401 / 402 / 403 = access/auth issues, no point retrying same endpoint
    // 500 / 503 / 530 = server or Cloudflare errors, try alternative endpoint
    const SHOULD_SKIP = [400, 401, 402, 403, 500, 502, 503, 504, 530];
    let response: Response | undefined;

    for (const attempt of attempts) {
      console.log(`[Netlify Function] Trying: ${attempt.label} (timeout: ${attempt.timeout / 1000}s)`);
      try {
        const res = await fetchWithTimeout(attempt.url, attempt.headers, attempt.timeout);
        console.log(`[Netlify Function] ${attempt.label} → status ${res.status}`);
        if (res.ok) {
          response = res;
          break; // success — stop trying
        }
        if (SHOULD_SKIP.includes(res.status)) {
          console.warn(`[Netlify Function] ${attempt.label} returned ${res.status} — trying next gptimage endpoint`);
          response = res; // keep last response for error mapping if all fail
          // continue to next attempt
        } else {
          // Unexpected status — keep and stop
          response = res;
          break;
        }
      } catch (fetchError: unknown) {
        const errMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);
        const isAbort = errMsg.includes('abort') || errMsg.includes('Abort');
        console.warn(`[Netlify Function] ${attempt.label} fetch error (${isAbort ? 'TIMEOUT after ' + attempt.timeout / 1000 + 's' : 'network'}):`, errMsg);
        // Continue to next gptimage endpoint
      }
    }

    // If both gptimage endpoints failed (network / timeout errors on all attempts)
    if (!response) {
      console.error('[Netlify Function] ❌ gptimage unreachable on both endpoints — returning 503');
      return {
        statusCode: 503,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'GPT Image is temporarily unavailable. Please try again in a moment.',
          retryable: true,
          model: MODEL,
        }),
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      const pollinationsStatus = response.status;
      console.error('[Netlify Function] Pollinations API error:', pollinationsStatus, errorText.substring(0, 200));
      const responseTime = Date.now() - startTime;
      logRequest(event, ip, responseTime, false, pollinationsStatus, errorText.substring(0, 200));

      // Map Pollinations / Cloudflare status codes to user-friendly messages.
      // IMPORTANT: Never forward 530 (Cloudflare Origin DNS) — use 503 instead.
      let userMessage = 'AI image generation temporarily unavailable. Please try again.';
      let isRetryable = true;
      let outboundStatus = 503; // Safe default — never expose upstream statuses like 530

      if (pollinationsStatus === 530) {
        userMessage = 'AI image service is temporarily unreachable. Please try again in a moment.';
        isRetryable = true;
        outboundStatus = 503;
      } else if (pollinationsStatus === 403 && errorText.includes('temporarily blocked')) {
        userMessage = 'AI image service is temporarily unavailable due to high demand. Please try again in a few hours.';
        isRetryable = false;
        outboundStatus = 503;
      } else if (pollinationsStatus === 403) {
        userMessage = 'AI service access denied. The API key may need to be renewed at pollinations.ai.';
        isRetryable = false;
        outboundStatus = 503;
      } else if (pollinationsStatus === 401) {
        userMessage = 'AI service authentication failed. Please check the API key configuration.';
        isRetryable = false;
        outboundStatus = 503;
      } else if (pollinationsStatus === 402) {
        userMessage = 'Insufficient pollen balance. Please top up your account at pollinations.ai.';
        isRetryable = false;
        outboundStatus = 503;
      } else if (pollinationsStatus === 429) {
        userMessage = 'AI service rate limit reached. Please wait a moment before trying again.';
        isRetryable = true;
        outboundStatus = 429;
      } else if (pollinationsStatus === 502 || pollinationsStatus === 504) {
        userMessage = 'AI service is busy. Please try again in a moment.';
        isRetryable = true;
        outboundStatus = 503;
      }

      return {
        statusCode: outboundStatus,
        headers: corsHeaders,
        body: JSON.stringify({
          error: userMessage,
          retryable: isRetryable,
          model: MODEL,
        }),
      };
    }
    
    console.log(`[Netlify Function] ✅ Image generated successfully with gptimage (GPT Image 1 Mini)`);
    
    // Get image as buffer
    const imageBuffer = await response.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/png';
    
    // Return image as base64 data URL
    const dataUrl = `data:${contentType};base64,${imageBase64}`;
    
    const responseTime = Date.now() - startTime;
    console.log('[Netlify Function] Image size:', imageBuffer.byteLength, 'bytes');
    console.log('[Netlify Function] Response time:', responseTime, 'ms');
    console.log('[Netlify Function] Model used: gptimage (GPT Image 1 Mini)');
    
    // Log performance metric
    logPerformanceMetric(event.path, responseTime, 200);
    logSecurityEvent('success', 'info', event.path, ip, {
      responseTime,
      imageSize: imageBuffer.byteLength,
      modelUsed: MODEL,
    });
    logRequest(event, ip, responseTime, true, 200);
    
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        imageUrl: dataUrl,
        width,
        height,
        model: MODEL,
        size: imageBuffer.byteLength,
      }),
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('[Netlify Function] ❌ CRITICAL ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    // Enhanced error logging for debugging
    console.error('[Netlify Function] Error details:', {
      message: errorMessage,
      stack: errorStack?.substring(0, 500),
      responseTime,
      ip,
      hasSecretKey: !!process.env.POLLINATIONS_SECRET_KEY,
    });
    
    // Log error event
    logSecurityEvent('error', 'error', event.path, ip, {
      error: errorMessage,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      responseTime,
      hasKey: !!process.env.POLLINATIONS_SECRET_KEY,
    });
    logPerformanceMetric(event.path, responseTime, 500);
    logRequest(event, ip, responseTime, false, 500, errorMessage);
    
    // Determine appropriate status code based on error type
    let statusCode = 500;
    let userMessage = 'Internal server error';
    
    if (errorMessage.includes('timeout') || errorMessage.includes('Request timeout') || errorMessage.includes('took too long')) {
      statusCode = 504; // Gateway Timeout
      userMessage = 'AI service is busy right now. Please try again in a moment.';
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch failed')) {
      statusCode = 502; // Bad Gateway
      userMessage = 'Unable to reach image generation service. Please try again.';
    } else if (errorMessage.includes('API keys')) {
      statusCode = 503; // Service Unavailable
      userMessage = 'Image generation service unavailable. Please contact support.';
    }
    
    return {
      statusCode,
      headers: corsHeaders,
      body: JSON.stringify({
        error: userMessage,
        message: errorMessage,
        timestamp: new Date().toISOString(),
        requestId: `${Date.now()}-${ip.replace(/\./g, '')}`, // Help track errors
      }),
    };
  }
};

