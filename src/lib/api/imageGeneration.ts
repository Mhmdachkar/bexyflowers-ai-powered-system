/**
 * AI Image Generation Service
 * 
 * Uses multiple free AI APIs with intelligent fallback:
 * 1. Pollinations AI (Primary)
 * 2. HuggingFace Inference (Backup)
 * 3. Improved prompts and error handling
 * 
 * Enhanced Features:
 * - Negative prompts for better results
 * - Image caching by configuration hash
 * - Progressive loading support
 * - Prompt history tracking
 */

import AI_CONFIG, { buildPollinationsUrl, isApiEnabled } from './aiConfig';
import { getCachedImage, cacheImage, blobUrlToBase64 } from './imageCache';
import { addToHistory, PromptHistoryEntry } from './promptHistory';
import { buildNegativePrompt } from './promptEngine';

interface GenerationOptions {
    width?: number;
    height?: number;
    enhancePrompt?: boolean;
    negativePrompt?: string;
    useCache?: boolean;
    cacheHash?: string;
    onProgress?: (stage: ProgressStage) => void;
    configuration?: PromptConfiguration;
}

export type ProgressStage = 
    | 'checking-cache'
    | 'building-prompt'
    | 'connecting'
    | 'generating'
    | 'processing'
    | 'caching'
    | 'complete';

export interface PromptConfiguration {
    packageType: 'box' | 'wrap';
    boxShape?: string;
    size: string;
    color: string;
    flowers: Array<{ id: string; name: string; quantity: number }>;
    withGlitter: boolean;
    accessories: string[];
    stylePreset?: string;
    template?: string;
}

interface GenerationResult {
    imageUrl: string;
    source: 'pollinations' | 'huggingface' | 'placeholder' | 'cache';
    cached?: boolean;
    hash?: string;
    prompt?: string;
    negativePrompt?: string;
}

/**
 * Build structured prompt optimized for Flux model
 * Flux works best with structured, detailed prompts that include:
 * - Subject description
 * - Composition/camera angle
 * - Lighting setup
 * - Quality keywords
 * - Style/aesthetic
 * - Background
 * - Brand context
 */
/**
 * Process prompt for Pollinations/Flux API
 * 
 * NOTE: The promptEngine.ts now handles all detailed prompt construction
 * including flower visuals, arrangements, accessories, and quality keywords.
 * This function only does minimal processing to avoid duplicate enhancement.
 * 
 * Pollinations/Flux behavior:
 * - Follows prompts with high fidelity
 * - Responds to specific details (exact numbers, colors, positions)
 * - Can generate text/names when explicitly requested
 * - Understands professional photography terminology
 */
function buildStructuredPrompt(basePrompt: string): string {
    // The promptEngine.ts now builds comprehensive prompts with all details
    // No additional enhancement needed - just return the prompt as-is
    // This prevents duplicate quality keywords and brand mentions
    return basePrompt;
}

/**
 * Process prompt for API submission
 * (Simplified - promptEngine.ts handles detailed construction)
 */
function enhancePrompt(basePrompt: string): string {
    return buildStructuredPrompt(basePrompt);
}

/**
 * Clean and optimize prompt to avoid API errors.
 * Only strips control characters and truly dangerous sequences.
 * Punctuation like colons, parentheses, and quotes are intentionally
 * preserved — stripping them degrades prompt quality and structure.
 */
function cleanPrompt(prompt: string): string {
    return prompt
        .replace(/[\x00-\x1F\x7F]/g, '')  // Remove control characters only
        .replace(/<[^>]*>/g, '')            // Strip any stray HTML tags
        .replace(/\s+/g, ' ')              // Normalize whitespace
        .trim()
        .slice(0, AI_CONFIG.generation.maxPromptLength); // Enforce length limit
}

/**
 * Generate image using Pollinations API via serverless function (Unlimited rate limits)
 */
async function generateWithPollinationsServerless(
    prompt: string,
    options: GenerationOptions
): Promise<GenerationResult> {
    const { 
        width = AI_CONFIG.generation.defaultWidth, 
        height = AI_CONFIG.generation.defaultHeight, 
        enhancePrompt: shouldEnhance = true 
    } = options;
    
    // Enhance and clean prompt using structured format for Flux
    const finalPrompt = shouldEnhance ? enhancePrompt(prompt) : prompt;
    const cleanedPrompt = cleanPrompt(finalPrompt);
    
    const model = AI_CONFIG.apis.pollinations.params.model || 'gptimage';
    const serverlessEndpoint = AI_CONFIG.apis.pollinations.serverlessEndpoint || '/.netlify/functions/generate-image';
    
    // Call Netlify serverless function
    // SECURITY: Include API key and signed request for authentication
    const frontendApiKey = import.meta.env.VITE_FRONTEND_API_KEY;
    
    // Create signed request payload (prevents replay attacks)
    const { createSignedRequest } = await import('./requestSigning');
    const signedPayload = await createSignedRequest({
        prompt: cleanedPrompt,
        width,
        height,
        model,
    });
    
    // ─── Fetch with automatic retry on 502 / 504 ─────────────────────────
    // 502 = Netlify function crashed (often a body-size or runtime issue).
    // 504 = Netlify killed the function due to timeout.
    // Both are transient — waiting a few seconds and retrying almost always works.
    const MAX_RETRIES = 2;
    const RETRY_DELAYS_MS = [4000, 8000]; // 4 s then 8 s between retries

    let response: Response | null = null;
    let lastStatus = 0;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
            const delay = RETRY_DELAYS_MS[attempt - 1] ?? 8000;
            console.log(`[ImageGen] ⏳ Retry ${attempt}/${MAX_RETRIES} after ${delay / 1000}s…`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        try {
            response = await fetch(serverlessEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(frontendApiKey && { 'X-API-Key': frontendApiKey }),
                },
                body: JSON.stringify(signedPayload),
            });
            lastStatus = response.status;

            // 404 = function not deployed (local dev)
            if (response.status === 404) {
                console.error('[ImageGen] ❌ Serverless function not available (404) — deploy to Netlify first.');
                throw new Error('SERVERLESS_UNAVAILABLE');
            }

            // Retry on transient gateway errors
            if ((response.status === 502 || response.status === 504) && attempt < MAX_RETRIES) {
                console.warn(`[ImageGen] ⚠️ Got ${response.status} from Netlify — will retry.`);
                continue; // try again
            }

            break; // success or non-retryable status
        } catch (fetchError) {
            if (fetchError instanceof Error && fetchError.message === 'SERVERLESS_UNAVAILABLE') throw fetchError;
            if (attempt < MAX_RETRIES) {
                console.warn('[ImageGen] ⚠️ Network error — will retry:', fetchError);
                continue;
            }
            console.error('[ImageGen] ❌ Network error calling serverless function');
            throw new Error('SERVERLESS_UNAVAILABLE');
        }
    }

    if (!response) {
        throw new Error('SERVERLESS_UNAVAILABLE');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const sanitizedError = errorData.error || 'Image generation failed';
        console.error('[ImageGen] ❌ Serverless function error:', lastStatus);

        if (lastStatus === 504 || lastStatus === 503 || lastStatus === 502 || (errorData.retryable === true)) {
            const retryableError = new Error(
                lastStatus === 504
                    ? 'The AI service took too long to respond. Please try again.'
                    : sanitizedError
            );
            (retryableError as any).retryable = true;
            (retryableError as any).statusCode = lastStatus;
            throw retryableError;
        }

        throw new Error(sanitizedError);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.imageUrl) {
        throw new Error(result.error || 'Failed to generate image');
    }
    
    // Convert base64 data URL → Blob directly using fetch().
    // This preserves the original image bytes exactly as returned by the API
    // (JPEG stays JPEG, WEBP stays WEBP, PNG stays PNG) with zero quality loss.
    // The old canvas-based approach re-encoded the image through a browser
    // canvas draw call which introduced subtle color/compression artifacts.
    const blob = await fetch(result.imageUrl).then(r => r.blob());
    
    // Validate: the serverless function already validated size server-side,
    // but keep a lightweight sanity-check here for corrupted responses.
    if (blob.size < 5000) {
        console.warn(`[ImageGen] ⚠️ Suspiciously small image: ${(blob.size / 1024).toFixed(1)}KB`);
        throw new Error(`Received invalid image (size: ${(blob.size / 1024).toFixed(1)}KB)`);
    }
    
    console.log(`[ImageGen] ✅ Image received: ${(blob.size / 1024).toFixed(1)}KB, type: ${blob.type}`);
    
    // Create a local object URL — revoked on component unmount
    const localUrl = URL.createObjectURL(blob);
    
    return { imageUrl: localUrl, source: 'pollinations' };
}

/**
 * Generate image using Pollinations API (Primary method)
 */
async function generateWithPollinations(
    prompt: string,
    options: GenerationOptions
): Promise<GenerationResult> {
    if (!isApiEnabled('pollinations')) {
        throw new Error('Pollinations API is disabled in config');
    }
    
    // Check if serverless mode is enabled
    if (AI_CONFIG.apis.pollinations.useServerless) {
        try {
            return await generateWithPollinationsServerless(prompt, options);
        } catch (error) {
            // SECURITY: Direct API fallback removed - never expose keys in frontend
            // If serverless function is unavailable, fail gracefully instead of exposing keys
            if (error instanceof Error && error.message === 'SERVERLESS_UNAVAILABLE') {
                console.error('[ImageGen] ❌ Serverless function unavailable');
                console.error('[ImageGen] ❌ Cannot generate image - serverless function required');
                throw new Error('Image generation service unavailable. Please try again later or contact support if the issue persists.');
            } else {
                // Re-throw other errors
                throw error;
            }
        }
    }
    
    const { 
        width = AI_CONFIG.generation.defaultWidth, 
        height = AI_CONFIG.generation.defaultHeight, 
        enhancePrompt: shouldEnhance = true 
    } = options;
    
    // Enhance and clean prompt using structured format for Flux
    const finalPrompt = shouldEnhance ? enhancePrompt(prompt) : prompt;
    const cleanedPrompt = cleanPrompt(finalPrompt);
    
    // Enhanced negative prompt for Flux model
    // Flux responds well to exclusion terms - helps avoid unwanted artifacts
    const negativePrompt = "blurry, low quality, distorted, deformed, ugly, bad anatomy, " +
        "bad proportions, extra limbs, duplicate, watermark, text, signature, logo, " +
        "dark shadows, overexposed, underexposed, noise, grain, artifacts, " +
        "compression artifacts, leaves, stems, green foliage, wilted, messy";
    
    // Build URL using config helper
    const pollinationsUrl = buildPollinationsUrl(cleanedPrompt, width, height, negativePrompt);
    
    // Check URL length (some browsers/servers have limits around 2000 characters)
    if (pollinationsUrl.length > 2000) {
        console.warn(`[ImageGen] ⚠️ URL is very long: ${pollinationsUrl.length} characters`);
        console.warn('[ImageGen] ⚠️ This may cause issues. Consider shortening the prompt.');
    }
    
    const model = AI_CONFIG.apis.pollinations.params.model || 'gptimage';
    
    // Pollinations doesn't use Authorization headers in browser (CORS blocked)
    // Their free tier works without API keys from browsers
    const headers: Record<string, string> = {
        'Accept': 'image/*',
    };
    
    // WORKAROUND: Use Image() instead of fetch() to bypass CORS
    // Pollinations blocks fetch() but allows <img> tags
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Try to enable CORS
    
    const imageLoadPromise = new Promise<Blob>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Image load timeout after 45 seconds'));
        }, AI_CONFIG.retry.requestTimeout);
        
        img.onload = async () => {
            clearTimeout(timeout);
            try {
                // Convert image to blob
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to convert canvas to blob'));
                    }
                }, 'image/png');
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = (event) => {
            clearTimeout(timeout);
            // Try to get more error details
            const errorMsg = `Failed to load image from Pollinations API. ` +
                `Status: 400 (Bad Request). ` +
                `Possible causes: Invalid model name, prompt too long, or invalid parameters. ` +
                `URL length: ${pollinationsUrl.length} characters. ` +
                `Please check console for full URL.`;
            console.error('[ImageGen] ❌ Image load error:', event);
            console.error('[ImageGen] ❌ Full URL:', pollinationsUrl);
            reject(new Error(errorMsg));
        };
        
        img.src = pollinationsUrl;
    });
    
    const blob = await imageLoadPromise;
    // Validate blob size
    const minSize = AI_CONFIG.validation.minImageSize;
    if (blob.size < minSize) {
        console.warn(`[ImageGen] ⚠️ Image too small: ${(blob.size / 1024).toFixed(1)}KB`);
        throw new Error(`Received error page or invalid image (size: ${(blob.size / 1024).toFixed(1)}KB)`);
    }
    
    // Validate dimensions (img is already loaded)
    const minWidth = AI_CONFIG.validation.minWidth;
    const minHeight = AI_CONFIG.validation.minHeight;
    
    if (img.width < minWidth || img.height < minHeight) {
        console.warn(`[ImageGen] ⚠️ Image dimensions too small: ${img.width}x${img.height}`);
        throw new Error(`Invalid image dimensions: ${img.width}x${img.height}`);
    }
    
    console.log(`[ImageGen] ✅ Valid image: ${img.width}x${img.height}, ${(blob.size / 1024).toFixed(1)}KB`);
    
    // Create blob URL
    const localUrl = URL.createObjectURL(blob);
    
    // Return the blob URL - component will handle cleanup on unmount
    return { imageUrl: localUrl, source: 'pollinations' };
}

/**
 * Generate image using HuggingFace Inference API (Backup method)
 */
async function generateWithHuggingFace(
    prompt: string,
    options: GenerationOptions
): Promise<GenerationResult> {
    if (!isApiEnabled('huggingface')) {
        throw new Error('HuggingFace API is disabled in config');
    }
    
    const cleanedPrompt = cleanPrompt(prompt);
    const apiConfig = AI_CONFIG.apis.huggingface;
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    
    // Add API key if provided in config
    if (apiConfig.apiKey) {
        headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
    }
    
    const response = await fetch(apiConfig.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            inputs: cleanedPrompt,
            options: {
                wait_for_model: true,
            }
        }),
        signal: AbortSignal.timeout(AI_CONFIG.retry.requestTimeout),
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`);
    }
    
    const blob = await response.blob();
    
    const minSize = AI_CONFIG.validation.minImageSize;
    if (blob.size < minSize) {
        console.warn(`[ImageGen] ⚠️ HuggingFace image too small: ${(blob.size / 1024).toFixed(1)}KB`);
        throw new Error(`HuggingFace returned invalid image (size: ${(blob.size / 1024).toFixed(1)}KB)`);
    }
    
    const localUrl = URL.createObjectURL(blob);
    
    // Verify image validity
    try {
        await new Promise<void>((resolve, reject) => {
            const img = new Image();
            const minWidth = AI_CONFIG.validation.minWidth;
            const minHeight = AI_CONFIG.validation.minHeight;
            
            img.onload = () => {
                if (img.width < minWidth || img.height < minHeight) {
                    console.warn(`[ImageGen] ⚠️ HuggingFace dimensions too small: ${img.width}x${img.height}`);
                    reject(new Error(`Invalid dimensions: ${img.width}x${img.height}`));
                } else {
                    console.log(`[ImageGen] ✅ Valid image: ${img.width}x${img.height}, ${(blob.size / 1024).toFixed(1)}KB`);
                    resolve();
                }
            };
            img.onerror = (e) => {
                console.error('[ImageGen] ❌ HuggingFace image failed to load:', e);
                reject(new Error('Failed to load HuggingFace image'));
            };
            img.src = localUrl;
        });
    } catch (error) {
        // Validation failed - revoke URL and throw
        URL.revokeObjectURL(localUrl);
        throw error;
    }
    
    return { imageUrl: localUrl, source: 'huggingface' };
}

/**
 * Main generation function with intelligent fallback
 * Enhanced with caching, negative prompts, and progress tracking
 */
export async function generateBouquetImage(
    prompt: string,
    options: GenerationOptions = {}
): Promise<GenerationResult> {
    const { 
        width = AI_CONFIG.generation.defaultWidth, 
        height = AI_CONFIG.generation.defaultHeight, 
        enhancePrompt: shouldEnhance = AI_CONFIG.generation.autoEnhancePrompts,
        negativePrompt,
        useCache = false, // DISABLED: Always generate fresh images, never cache
        cacheHash,
        onProgress,
        configuration
    } = options;
    
    // Progress callback helper
    const reportProgress = (stage: ProgressStage) => {
        if (onProgress) {
            onProgress(stage);
        }
    };
    
    // Step 1: Check cache if enabled
    if (useCache && cacheHash) {
        reportProgress('checking-cache');
        
        try {
            const cached = await getCachedImage(cacheHash);
            if (cached) {
                reportProgress('complete');
                return {
                    imageUrl: cached.imageUrl,
                    source: 'cache',
                    cached: true,
                    hash: cacheHash,
                    prompt: cached.prompt
                };
            }
        } catch (cacheError) {
            console.warn('[ImageGen] Cache check failed:', cacheError);
        }
    }
    
    reportProgress('building-prompt');
    
    // Build negative prompt if not provided
    const finalNegativePrompt = negativePrompt || buildNegativePrompt();
    
    reportProgress('connecting');
    
    // SINGLE HIGH-QUALITY GENERATION STRATEGY
    // With serverless function + secret key: UNLIMITED rate limits
    // Use optimal settings from the start - no fallbacks needed
    const strategies = [];
    
    if (isApiEnabled('pollinations')) {
        // Single high-quality generation with Flux model
        // Using optimal settings: flux-realism model, 1024x1024, enhanced prompt
        strategies.push({ 
            name: 'Pollinations (Flux High Quality)', 
            fn: () => generateWithPollinations(prompt, { width, height, enhancePrompt: true }) 
        });
    }
    
    if (isApiEnabled('huggingface')) {
        // Try 4: HuggingFace backup
        strategies.push({ 
            name: 'HuggingFace Backup', 
            fn: () => generateWithHuggingFace(prompt, { width, height }) 
        });
    }
    
    if (strategies.length === 0) {
        throw new Error('No AI services are enabled in configuration');
    }
    
    let lastError: Error | null = null;
    const delays = AI_CONFIG.retry.delays;
    
    reportProgress('generating');
    
    for (let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i];
        
        try {
            // Add delay between attempts (except first)
            if (i > 0 && delays[i - 1]) {
                const delay = delays[i - 1];
                console.log(`[ImageGen] Waiting ${delay}ms before next attempt...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            console.log(`[ImageGen] Attempt ${i + 1}/${strategies.length}: ${strategy.name}`);
            
            const result = await strategy.fn();
            
            console.log(`[ImageGen] ✅ Success with ${strategy.name}`);
            
            reportProgress('processing');
            
            // Step 2: Cache the result if caching is enabled
            if (useCache && cacheHash && result.imageUrl) {
                reportProgress('caching');
                try {
                    // Convert blob URL to base64 for storage
                    const base64Image = await blobUrlToBase64(result.imageUrl);
                    await cacheImage(cacheHash, base64Image, prompt, {
                        width,
                        height,
                        size: base64Image.length
                    });
                } catch (cacheError) {
                    console.warn('[ImageGen] Failed to cache image:', cacheError);
                }
            }
            
            // Step 3: Add to history if configuration provided
            if (configuration) {
                try {
                    addToHistory({
                        hash: cacheHash || '',
                        prompt,
                        preview: buildHistoryPreview(configuration),
                        imageUrl: result.imageUrl,
                        configuration
                    });
                } catch (historyError) {
                    console.warn('[ImageGen] Failed to add to history:', historyError);
                }
            }
            
            reportProgress('complete');
            
            return {
                ...result,
                hash: cacheHash,
                prompt,
                negativePrompt: finalNegativePrompt
            };
            
        } catch (error) {
            lastError = error as Error;
            const errorObj = error as Error & { retryable?: boolean; statusCode?: number };
            console.warn(`[ImageGen] ❌ ${strategy.name} failed:`, error);
            
            // If this is a retryable error (504, 503) and we have more strategies, continue
            // Otherwise, if it's the last strategy, we'll throw
            if (errorObj.retryable && i < strategies.length - 1) {
                console.log(`[ImageGen] ⏳ Retryable error (${errorObj.statusCode || 'unknown'}), will retry with next strategy...`);
            }
            
            // Continue to next strategy
            continue;
        }
    }
    
    // All strategies failed
    console.error('[ImageGen] ❌ All generation methods failed');
    throw lastError || new Error('All AI services are currently unavailable. Please try again later.');
}

/**
 * Build human-readable preview for history
 */
function buildHistoryPreview(config: PromptConfiguration): string {
    const parts: string[] = [];
    parts.push(`${config.packageType === 'box' ? '📦 Box' : '🎁 Wrap'} (${config.size}, ${config.color})`);
    parts.push(`🌸 ${config.flowers.map(f => `${f.quantity}x ${f.name}`).join(', ')}`);
    if (config.withGlitter) parts.push('✨ Glitter');
    if (config.accessories.length > 0) parts.push(`🎀 ${config.accessories.join(', ')}`);
    if (config.stylePreset) parts.push(`🎨 ${config.stylePreset}`);
    return parts.join(' | ');
}

/**
 * Generate image with variation (slightly different result)
 */
export async function generateWithVariation(
    basePrompt: string,
    variationIndex: number = 0,
    options: GenerationOptions = {}
): Promise<GenerationResult> {
    const variationModifiers = [
        'unique artistic interpretation, creative arrangement',
        'alternative composition, fresh perspective',
        'different camera angle, varied lighting',
        'creative framing, artistic touch',
        'subtle variation, unique style'
    ];
    
    const modifier = variationModifiers[variationIndex % variationModifiers.length];
    const variedPrompt = `${basePrompt}, ${modifier}`;
    
    // Don't use cache for variations - we want unique results
    return generateBouquetImage(variedPrompt, {
        ...options,
        useCache: false,
        cacheHash: undefined
    });
}
