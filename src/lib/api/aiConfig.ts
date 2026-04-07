/**
 * AI Image Generation Configuration
 * 
 * Centralized config for all AI services.
 * Edit these values to customize behavior.
 */

export const AI_CONFIG = {
  /**
   * Generation Settings
   */
  generation: {
    // Default image dimensions (512x512 - optimized for FAST generation)
    // 512x512 is ~4x faster than 1024x1024, ~2x faster than 768x768
    // Quality is still good for preview/customization purposes
    defaultWidth: 512,
    defaultHeight: 512,
    
    // Automatically enhance prompts with professional keywords
    autoEnhancePrompts: true,
    
    // Maximum prompt length (characters)
    // Increased to accommodate highly detailed prompts with:
    // - Flower-specific visual descriptions (petal shapes, bloom styles)
    // - Size-aware composition rules
    // - Accessory placement details
    // - Style presets and templates
    // Note: Serverless function enforces 1000 char limit for security
    maxPromptLength: 1000,
  },

  /**
   * Retry Strategy
   */
  retry: {
    // Number of different strategies to try
    maxStrategies: 4,
    
    // Delays between retries (milliseconds)
    // Note: Pollinations can be overloaded during peak hours
    // Longer delays give the service time to recover
    delays: [3000, 5000, 8000], // 3s, 5s, 8s (increased for reliability)
    
    // Timeout for each request (milliseconds)
    requestTimeout: 45000, // 45 seconds (increased from 30s)
  },

  /**
   * API Endpoints
   */
  apis: {
    pollinations: {
      enabled: true,
      // CORRECT API ENDPOINT (as of 2025)
      // Documentation: https://github.com/pollinations/pollinations/blob/main/APIDOCS.md
      // Format: https://image.pollinations.ai/prompt/{prompt}?model=...&width=...&height=...
      baseUrl: 'https://image.pollinations.ai/prompt', // Official image generation endpoint
      // SECURITY: API key removed from frontend - only used server-side in Netlify function
      // Never expose keys in frontend code - they are visible in browser DevTools and bundled JS
      // Use serverless function for unlimited rate limits (secret key)
      // Set to true to use Netlify function instead of direct API calls
      // SECURITY: Secret key is only used server-side, never exposed to frontend
      useServerless: true, // Enabled: Uses serverless function with secret key (unlimited rate limits)
      // In local Vite dev, use the /api route; in production (Netlify), always use Netlify Functions path
      serverlessEndpoint:
        typeof window !== 'undefined'
          ? (import.meta.env.DEV ? '/api/generate-image' : '/.netlify/functions/generate-image')
          : '/.netlify/functions/generate-image',
      params: {
        // NOTE: Only basic parameters are supported in new API
        // enhance, nologo, seed may cause 400 errors - not including them
        // 
        // Available Pollinations models (April 2026):
        // - 'gptimage': GPT Image 1 Mini - PRIMARY MODEL - Best for photorealism, text generation
        // - 'gptimage-large': GPT Image 1.5 - Higher quality, slower
        // - 'flux': Flux Schnell - Fast fallback (5-15 seconds)
        // - 'klein': FLUX.2 Klein 4B - Good quality alternative
        // - 'kontext': FLUX.1 Kontext - Better context understanding
        // - 'nanobanana': NanoBanana - Affordable option
        // 
        // SPEED vs QUALITY tradeoff:
        // 'gptimage' - Best photorealism, text/logo support (20-40 seconds at 512x512) ⭐ PRIMARY
        // 'flux' - FAST (5-15 seconds), reliable fallback
        // 
        // Using 'gptimage' (GPT Image 1 Mini) for best quality flower images
        model: 'gptimage', // GPT Image 1 Mini - Best photorealism for flower arrangements
        width: 512, // Smaller resolution = faster generation (20-40s vs 60s at 768x768)
        height: 512, // Smaller resolution = faster generation
      }
    },
    
    huggingface: {
      // DISABLED: HuggingFace blocks direct browser requests (CORS policy)
      // To use HuggingFace, you need a backend proxy server
      // For now, we rely on Pollinations which allows browser requests
      enabled: false, // Changed from true to false
      baseUrl: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
      // Optional: Add API key for faster/more reliable generation
      // Get free key at: https://huggingface.co/settings/tokens
      apiKey: '', // Leave empty for public inference
    },
  },

  /**
   * Prompt Enhancement Keywords
   */
  promptEnhancements: {
    // Photography-specific keywords for Flux model
    // Flux understands professional photography terminology
    quality: [
      'ultra-detailed',
      'photorealistic',
      'professional product photography',
      'studio lighting',
      'soft natural lighting',
      'sharp focus',
      'depth of field',
      'macro photography',
    ],
    
    style: [
      'white background',
      'seamless background',
      'isolated on white',
      'detailed',
      'vibrant colors',
      'luxury floral arrangement',
      'premium quality',
      'commercial photography',
    ],
    
    // Brand-specific keywords (customize for your brand)
    // Multiple mentions help Pollinations/Flux understand branding importance
    brand: [
      'Bexy Flowers luxury brand',
      'Bexy Flowers signature style',
      'elegant presentation',
      'premium quality',
      'signature arrangement',
      'Bexy Flowers premium floral gift',
    ],
  },

  /**
   * Validation Rules
   */
  validation: {
    // Minimum valid image size (bytes)
    // Note: Error pages from APIs are usually <30KB, real images are >50KB
    minImageSize: 50000, // 50KB minimum
    
    // Minimum valid dimensions (pixels)
    minWidth: 300,
    minHeight: 300,
    
    // Valid content types
    validContentTypes: [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ],
  },

  /**
   * UX Settings
   */
  ux: {
    // Show which AI service was used
    showSourceInfo: true,
    
    // Loading messages
    loadingMessages: [
      'Creating your bouquet...',
      'Arranging flowers...',
      'Adding final touches...',
      'Almost ready...',
    ],
    
    // Toast duration (milliseconds)
    toastDuration: 5000,
  },
};

/**
 * Helper to get loading message based on elapsed time
 */
export function getLoadingMessage(elapsedSeconds: number): string {
  const messages = AI_CONFIG.ux.loadingMessages;
  const index = Math.min(
    Math.floor(elapsedSeconds / 5), 
    messages.length - 1
  );
  return messages[index];
}

/**
 * Helper to build API URL with parameters
 */
export function buildPollinationsUrl(prompt: string, width: number, height: number, negative?: string): string {
  const config = AI_CONFIG.apis.pollinations;
  
  // NEW API FORMAT: https://gen.pollinations.ai/image/{prompt}?key=API_KEY&model=flux&width=1024&height=1024
  // Documentation: https://gen.pollinations.ai
  // Authentication: Use ?key=YOUR_API_KEY (publishable keys work in query param)
  // 
  // IMPORTANT: New API may only support basic parameters:
  // - model (required): 'flux', 'turbo', 'sdxl', etc.
  // - width, height (optional): Image dimensions
  // - key (required): API key for authentication
  // 
  // Parameters that may NOT be supported:
  // - enhance, nologo, seed, negative (may cause 400 errors)
  
  // Build query parameters - ONLY use confirmed supported parameters
  const params = new URLSearchParams();
  
  // Model (required) - use 'flux' as default (confirmed to work)
  params.append('model', config.params.model || 'gptimage');
  
  // Dimensions (optional but recommended)
  if (width) {
    params.append('width', width.toString());
  }
  if (height) {
    params.append('height', height.toString());
  }
  
  // SECURITY: API key removed - never expose keys in frontend
  // Keys are only used server-side in Netlify function
  // This function is only used for direct API fallback (disabled in production)
  
  // NOTE: Not including enhance, nologo, seed - these may cause 400 errors
  // The API documentation suggests these may not be supported in the new endpoint
  
  const encodedPrompt = encodeURIComponent(prompt);
  
  // Simplified API format: /image/{prompt}?key=API_KEY&model=flux&width=1024&height=1024
  return `${config.baseUrl}/${encodedPrompt}?${params.toString()}`;
}

/**
 * Helper to check if API is enabled
 */
export function isApiEnabled(apiName: 'pollinations' | 'huggingface'): boolean {
  return AI_CONFIG.apis[apiName]?.enabled ?? false;
}

export default AI_CONFIG;

