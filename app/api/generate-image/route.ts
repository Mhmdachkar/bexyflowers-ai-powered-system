/**
 * Image Generation API Route for Next.js
 * Fetches image from Pollinations AI server-side and returns as base64 data URL.
 * Matches the response format expected by imageGeneration.ts
 * 
 * Default model: 'gptimage' (GPT Image 1 Mini) - Best for photorealistic flower arrangements
 */

import { NextRequest, NextResponse } from 'next/server';

interface GenerateImageRequest {
  prompt: string;
  width?: number;
  height?: number;
  model?: string;
  timestamp?: number;
  nonce?: string;
  signature?: string;
}

// Validate API key
function validateAPIKey(request: NextRequest): boolean {
  const frontendApiKey = process.env.NEXT_PUBLIC_FRONTEND_API_KEY;
  if (!frontendApiKey) return true; // No key configured – allow all
  const providedKey = request.headers.get('x-api-key');
  return providedKey === frontendApiKey;
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!validateAPIKey(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateImageRequest = await request.json();
    const {
      prompt,
      width = 512,
      height = 512,
      model = 'gptimage',
    } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    // Retrieve Pollinations secret key (server-only, never exposed to client)
    const pollinationsKey = process.env.POLLINATIONS_SECRET_KEY || process.env.POLLINATIONS_SECRET_KEY2;

    // Build Pollinations URL using OFFICIAL gen.pollinations.ai endpoint
    // DEPRECATED: image.pollinations.ai — do not use, requests don't count toward usage
    const encodedPrompt = encodeURIComponent(prompt.trim());
    const seed = Math.floor(Math.random() * 1000000000);
    
    const params = new URLSearchParams({
      model,
      width: width.toString(),
      height: height.toString(),
      seed: seed.toString(),
    });

    if (pollinationsKey) {
      params.append('key', pollinationsKey);
    }

    const pollinationsUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?${params.toString()}`;

    // Fetch the image server-side (keeps API key secret and avoids CORS)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

    let imageResponse: Response;
    try {
      imageResponse = await fetch(pollinationsUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'BexyFlowers/1.0',
          'Accept': 'image/png, image/jpeg, image/webp, */*',
          ...(pollinationsKey && { 'Authorization': `Bearer ${pollinationsKey}` }),
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!imageResponse.ok) {
      console.error('[Generate Image API] Pollinations error:', imageResponse.status);
      return NextResponse.json(
        { success: false, error: `Image generation failed: ${imageResponse.status}` },
        { status: imageResponse.status >= 500 ? 502 : imageResponse.status }
      );
    }

    // Convert to base64 data URL (same format as Netlify function)
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const base64 = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    // Validate minimum size (50KB)
    if (imageBuffer.byteLength < 50000) {
      return NextResponse.json(
        { success: false, error: `Received invalid image (size: ${(imageBuffer.byteLength / 1024).toFixed(1)}KB)` },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      prompt: prompt.trim(),
      width,
      height,
      model,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ success: false, error: 'Image generation timed out' }, { status: 504 });
    }
    console.error('[Generate Image API] Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    },
  });
}
