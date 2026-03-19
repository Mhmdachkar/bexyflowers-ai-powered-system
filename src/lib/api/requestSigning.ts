/**
 * Request Signing Utility
 * 
 * Implements HMAC-based request signing for API security
 * Prevents replay attacks and ensures request integrity
 * 
 * Based on OWASP API Security best practices
 */

/**
 * Generate a secure random nonce
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Sign a request payload using Web Crypto API
 * 
 * @param payload - Request payload to sign
 * @param secret - Secret key for signing (from environment)
 * @returns HMAC SHA-256 signature
 */
export async function signRequest(payload: Record<string, any>, secret: string): Promise<string> {
  const payloadString = JSON.stringify(payload);
  
  // Import secret key
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // Sign payload
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payloadString)
  );
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a request payload with timestamp and nonce for replay protection
 * 
 * SECURITY NOTE: Request signing (HMAC) has been removed from the frontend.
 * Exposing the signing secret in the frontend bundle is a security vulnerability.
 * 
 * The backend now relies on:
 * 1. API key authentication (X-API-Key header)
 * 2. Timestamp freshness check (5 minute window)
 * 3. Nonce uniqueness check (prevents replay attacks)
 * 4. Rate limiting per IP
 * 
 * If HMAC signing is required, it should be done server-side only,
 * using a different authentication flow (e.g., server-to-server).
 * 
 * @param data - Request data (prompt, width, height, model)
 * @returns Request payload with timestamp and nonce (no signature)
 */
export async function createSignedRequest(data: {
  prompt: string;
  width?: number;
  height?: number;
  model?: string;
}): Promise<{
  prompt: string;
  width: number;
  height: number;
  model: string;
  timestamp: number;
  nonce: string;
  signature: string;
}> {
  const timestamp = Date.now();
  const nonce = generateNonce();
  
  return {
    prompt: data.prompt,
    width: data.width || 768,
    height: data.height || 768,
    model: data.model || 'gptimage',
    timestamp,
    nonce,
    signature: '', // Signature removed - authentication via API key
  };
}

/**
 * Validate request signature (for testing/debugging)
 */
export async function validateSignature(
  payload: Record<string, any>,
  signature: string,
  secret: string
): Promise<boolean> {
  const { signature: _, ...payloadWithoutSig } = payload;
  const expectedSignature = await signRequest(payloadWithoutSig, secret);
  
  // Constant-time comparison
  if (signature.length !== expectedSignature.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  
  return result === 0;
}

