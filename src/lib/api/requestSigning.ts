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
 * Create a signed request payload
 * 
 * @param data - Request data (prompt, width, height, model)
 * @returns Signed request payload with timestamp, nonce, and signature
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
  const secret = process.env.NEXT_PUBLIC_FRONTEND_API_SECRET;
  
  if (!secret) {
    console.warn('[Request Signing] NEXT_PUBLIC_FRONTEND_API_SECRET not set - sending unsigned request');
    return {
      ...data,
      width: data.width || 768,
      height: data.height || 768,
      model: data.model || 'gptimage',
      timestamp: Date.now(),
      nonce: generateNonce(),
      signature: '', // Empty signature - server will allow if signing not enforced
    };
  }
  
  const timestamp = Date.now();
  const nonce = generateNonce();
  
  const payload = {
    prompt: data.prompt,
    width: data.width || 768,
    height: data.height || 768,
    model: data.model || 'gptimage',
    timestamp,
    nonce,
  };
  
  const signature = await signRequest(payload, secret);
  
  return {
    ...payload,
    signature,
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

