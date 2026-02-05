/**
 * Bulk Email Function (SendGrid)
 */
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

declare const process: {
  env: {
    [key: string]: string | undefined;
  };
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

async function sendSendGridBatch({
  apiKey,
  fromEmail,
  fromName,
  subject,
  body,
  recipients,
}: {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
  subject: string;
  body: string;
  recipients: string[];
}) {
  const payload = {
    personalizations: [
      {
        to: recipients.map((email) => ({ email })),
        subject,
      },
    ],
    from: fromName ? { email: fromEmail, name: fromName } : { email: fromEmail },
    content: [{ type: 'text/plain', value: body }],
  };

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`SendGrid error: ${response.status} ${errorBody}`);
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

  try {
    const body = JSON.parse(event.body || '{}') as {
      subject?: string;
      body?: string;
      recipients?: string[];
    };

    const subject = body.subject?.trim();
    const message = body.body?.trim();
    const recipients = Array.isArray(body.recipients) ? body.recipients.filter(Boolean) : [];

    if (!subject || !message || recipients.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing subject, body, or recipients.' }),
      };
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const fromName = process.env.SENDGRID_FROM_NAME;

    if (!apiKey || !fromEmail) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'SendGrid is not configured. Missing API key or from email.' }),
      };
    }

    const chunkSize = 1000;
    for (let i = 0; i < recipients.length; i += chunkSize) {
      const chunk = recipients.slice(i, i + chunkSize);
      await sendSendGridBatch({
        apiKey,
        fromEmail,
        fromName,
        subject,
        body: message,
        recipients: chunk,
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, sent: recipients.length }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Bulk email failed', message }),
    };
  }
};
