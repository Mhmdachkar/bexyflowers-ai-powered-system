/**
 * Bulk SMS Function (Twilio)
 * 
 * SECURITY: Rate limited to prevent abuse and protect Twilio credits
 */
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { checkDistributedRateLimit } from './utils/rateLimiter';

declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

// SECURITY: Strict rate limits for SMS (expensive resource)
const RATE_LIMITS = {
  perMinute: 3,     // 3 bulk SMS batches per minute
  perHour: 20,      // 20 batches per hour
  perDay: 100,      // 100 batches per day
  minDelay: 5000,   // 5 seconds minimum between requests
};

const ALLOWED_ORIGINS = [
  'https://bexyflowers.shop',
  'https://www.bexyflowers.shop',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8080',
  'http://localhost:8888',
  'http://localhost:51635',
  'http://localhost:52933',
];

function getHeaders(origin: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };

  if (ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed))) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Headers'] = 'Content-Type, X-API-Key';
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
  }

  return headers;
}

function validateApiKey(event: HandlerEvent): boolean {
  const frontendApiKey = process.env.FRONTEND_API_KEY;
  if (!frontendApiKey) return true;
  const providedKey = event.headers['x-api-key'] || event.headers['X-API-Key'];
  return providedKey === frontendApiKey;
}

async function sendTwilioMessage({
  accountSid,
  authToken,
  fromNumber,
  toNumber,
  message,
}: {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  toNumber: string;
  message: string;
}) {
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams();
  params.set('To', toNumber);
  params.set('From', fromNumber);
  params.set('Body', message);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Twilio error: ${response.status} ${errorBody}`);
  }
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const origin = event.headers.origin || event.headers.referer || '';
  const headers = getHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Only POST is supported.' }),
    };
  }

  if (origin && !ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed))) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Forbidden: Origin not allowed' }),
    };
  }

  if (!validateApiKey(event)) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized: Invalid API key' }),
    };
  }

  // SECURITY: Rate limiting to prevent abuse
  const ip = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  const fingerprint = `bulk-sms-${ip}`;
  const rateLimitCheck = await checkDistributedRateLimit(ip, fingerprint, RATE_LIMITS);
  if (!rateLimitCheck.allowed) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({ 
        error: 'Too many requests', 
        message: rateLimitCheck.error,
        retryAfter: rateLimitCheck.retryAfter 
      }),
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}') as {
      message?: string;
      recipients?: string[];
    };

    const message = payload.message?.trim();
    
    // SECURITY: Validate phone numbers (E.164 format or common formats)
    const isValidPhone = (phone: string): boolean => {
      if (typeof phone !== 'string') return false;
      const cleaned = phone.replace(/[\s\-\(\)]/g, '');
      // E.164 format or starts with + followed by digits
      return /^\+?[1-9]\d{6,14}$/.test(cleaned);
    };
    
    const rawRecipients = Array.isArray(payload.recipients) ? payload.recipients.filter(Boolean) : [];
    const recipients = rawRecipients.filter(isValidPhone);

    if (!message || recipients.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing message or recipients.' }),
      };
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Twilio is not configured. Missing credentials.' }),
      };
    }

    let sent = 0;
    let failed = 0;

    const chunkSize = 10;
    for (let i = 0; i < recipients.length; i += chunkSize) {
      const chunk = recipients.slice(i, i + chunkSize);
      const results = await Promise.allSettled(
        chunk.map((toNumber) =>
          sendTwilioMessage({
            accountSid,
            authToken,
            fromNumber,
            toNumber,
            message,
          })
        )
      );
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          sent += 1;
        } else {
          failed += 1;
        }
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, sent, failed }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Bulk SMS failed', message }),
    };
  }
};
