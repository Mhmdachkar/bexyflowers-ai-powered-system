# 🤖 AI Integration Documentation

## Overview

BexyFlowers uses **[pollinations.ai](https://pollinations.ai)** for AI-powered image generation, enabling users to visualize custom bouquet designs before ordering.

---

## 🎯 Use Cases

### 1. Custom Bouquet Designer (`/customize`)

**Purpose:** Generate photorealistic preview images of custom bouquet configurations.

**User Flow:**
1. User selects package type (box, vase, wrapped)
2. User chooses size, color theme, and flowers
3. User clicks "Generate Preview"
4. AI generates a photorealistic image in 20-40 seconds
5. User can create variations or edit the prompt for different styles

**Technical Details:**
- **Model:** GPT Image 1 Mini (gptimage)
- **Resolution:** 768x768px
- **Generation Time:** ~20-40 seconds
- **Prompt Engineering:** Structured prompts with flower names, colors, package details, lighting, and style keywords

### 2. Zodiac Bouquet Quiz

**Purpose:** Generate personalized zodiac-themed bouquet visualizations.

**User Flow:**
1. User answers personality/zodiac questions
2. System recommends a bouquet based on zodiac sign
3. AI generates a themed image combining zodiac aesthetics with floral design
4. Results are cached to avoid regeneration for same configurations

**Technical Details:**
- **Model:** GPT Image 1 Mini
- **Caching:** Results stored in `zodiac_generated_images` table
- **Cache Key:** `gender + zodiac_sign + bouquet_id`

---

## 🔐 Security Architecture

### Why Server-Side Proxy?

**Problem:** API keys cannot be safely exposed in browser JavaScript.

**Solution:** Serverless function proxy architecture:

```
Frontend (Browser)
    ↓
    POST /api/generate-image (or /.netlify/functions/generate-image)
    - Sends: prompt, model, width, height, seed
    - Does NOT send: API key
    ↓
Serverless Function (Netlify/Vercel)
    - Validates request (HMAC signature, rate limiting)
    - Adds POLLINATIONS_SECRET_KEY
    - Fetches image from pollinations.ai
    ↓
pollinations.ai API
    - Generates image
    - Returns image data
    ↓
Serverless Function
    - Converts to base64 data URL
    - Returns to browser
    ↓
Frontend
    - Displays image
```

### Security Features

✅ **API Key Protection** - Keys stored in environment variables, never exposed to browser  
✅ **HMAC Request Signing** - Prevents unauthorized API access  
✅ **Rate Limiting** - Prevents abuse (handled by Netlify/Vercel)  
✅ **Input Validation** - Model whitelist, parameter sanitization  
✅ **CORS Protection** - Serverless functions only accept requests from known origins  

---

## 📝 Prompt Engineering

### Prompt Structure

We use a multi-part prompt template optimized for the pollinations.ai GPT Image model:

```typescript
const promptTemplate = `
  {packageDescription} featuring {flowerList},
  {colorTheme}, {arrangementStyle}, {lighting},
  {cameraAngle}, {additionalDetails}, {styleKeywords}
`;
```

### Example Prompts

**Romantic Bouquet:**
```
Elegant luxury rose bouquet in a premium black velvet box,
featuring 12 pink roses and 6 white orchids,
soft pastel colors, romantic arrangement style,
soft warm lighting, professional product photography,
45-degree angle, shallow depth of field,
high detail, bokeh background, luxury aesthetic
```

**Modern Minimalist:**
```
Modern minimalist flower arrangement in a clear glass vase,
featuring 8 white calla lilies,
monochromatic color scheme, clean geometric arrangement,
natural daylight, top-down view,
simple composition, negative space, contemporary design
```

### Prompt Engineering Best Practices

1. **Be Specific** - Include exact flower names, quantities, and colors
2. **Add Context** - Mention package type, lighting, and camera angle
3. **Use Style Keywords** - "luxury", "romantic", "modern", "elegant"
4. **Avoid Negations** - Use positive descriptions instead of negative prompts
5. **Consistent Formatting** - Follow the same structure for predictable results

---

## 🚀 API Reference

### Serverless Function Endpoint

**Netlify:** `/.netlify/functions/generate-image`  
**Vercel/Next.js:** `/api/generate-image`

#### Request Format

```typescript
POST /.netlify/functions/generate-image
Content-Type: application/json

{
  "prompt": "Luxury rose bouquet with red roses...",
  "model": "gptimage",
  "width": 768,
  "height": 768,
  "seed": 12345,
  "enhance": true,
  "nologo": true
}
```

#### Response Format

**Success (200):**
```typescript
{
  "success": true,
  "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "source": "pollinations",
  "cached": false
}
```

**Error (400/500):**
```typescript
{
  "success": false,
  "error": "Failed to generate image",
  "details": "Model 'invalid-model' is not allowed"
}
```

---

## 📊 Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **Generation Time** | 20-40s | Varies by complexity and server load |
| **Success Rate** | 98%+ | With retry logic and fallback keys |
| **Cache Hit Rate** | ~60% | For zodiac quiz (cached by config) |
| **Image Size** | ~200-500KB | Base64 data URLs |
| **Resolution** | 768x768px | Optimized for web display |

---

## 🔧 Configuration

### AI Configuration (`src/lib/api/aiConfig.ts`)

```typescript
export default {
  apis: {
    pollinations: {
      enabled: true,
      baseUrl: 'https://image.pollinations.ai/prompt',
      useServerless: true,
      serverlessEndpoint: '/.netlify/functions/generate-image',
      params: {
        model: 'gptimage',
        width: 768,
        height: 768,
        enhance: true,
        nologo: true
      }
    }
  },
  validation: {
    maxPromptLength: 1000,
    minImageSize: 50000, // 50KB minimum
    allowedModels: ['gptimage', 'flux', 'flux-realism']
  }
}
```

### Environment Variables

```bash
# Required (Server-Side Only)
POLLINATIONS_SECRET_KEY=your-api-key-from-pollinations.ai
POLLINATIONS_SECRET_KEY2=backup-api-key-optional

# Optional
NEXT_PUBLIC_USE_NETLIFY_FUNCTIONS=true  # Use Netlify vs Next.js functions
```

**Get your API key:** [enter.pollinations.ai](https://enter.pollinations.ai) (sign up with GitHub)

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Image generation failed"

**Symptoms:** Error message after clicking "Generate Preview"

**Possible Causes:**
- Missing `POLLINATIONS_SECRET_KEY` environment variable
- API key not valid or expired
- Network timeout (generation takes >60 seconds)
- pollinations.ai service temporarily unavailable

**Solutions:**
1. Check environment variables are set correctly
2. Verify API key at [enter.pollinations.ai](https://enter.pollinations.ai)
3. Try again in a few minutes (service may be under high load)
4. Use `POLLINATIONS_SECRET_KEY2` as fallback

#### 2. Slow Generation Times

**Symptoms:** Takes >60 seconds to generate an image

**Possible Causes:**
- High server load on pollinations.ai
- Complex prompt with many details
- Network latency

**Solutions:**
1. Simplify the prompt (fewer flowers, less detail)
2. Use lower resolution (512x512 instead of 768x768)
3. Try during off-peak hours

#### 3. "Failed to load image"

**Symptoms:** Generation succeeds but image doesn't display

**Possible Causes:**
- CORS issues (if calling pollinations.ai directly from browser)
- Base64 data URL too large for browser
- Invalid image data

**Solutions:**
1. Ensure you're using the serverless proxy (not direct API calls)
2. Check browser console for detailed error messages
3. Verify the returned data URL is valid base64

---

## 📚 Code Examples

### Basic Image Generation

```typescript
import { generateBouquetImage } from '@/lib/api/imageGeneration';

const result = await generateBouquetImage(
  "Luxury rose bouquet with 12 red roses in a black velvet box",
  {
    width: 768,
    height: 768,
    useCache: false,
    onProgress: (stage) => console.log(`Progress: ${stage}`)
  }
);

console.log(`Generated: ${result.imageUrl}`);
// result.imageUrl is a base64 data URL: "data:image/png;base64,..."
```

### With Variation

```typescript
import { generateWithVariation } from '@/lib/api/imageGeneration';

const original = "Modern white orchid arrangement in glass vase";
const variation = await generateWithVariation(original);

// variation.imageUrl will be similar but with different seed/styling
```

### Custom Prompt Editing

```typescript
import { generateBouquetImage } from '@/lib/api/imageGeneration';

const customPrompt = `
  Ultra-luxurious bouquet of 24 long-stem red roses
  in a crystal vase, dramatic backlighting,
  cinematic composition, 8K quality, award-winning
  floral photography
`;

const result = await generateBouquetImage(customPrompt, {
  width: 1024,
  height: 1024
});
```

---

## 🤝 Contributing

If you'd like to improve the AI integration:

1. **Optimize Prompts** - Test different prompt structures and share results
2. **Add Features** - Implement new AI-powered features (style transfer, color matching, etc.)
3. **Performance** - Improve generation speed or caching strategies
4. **Documentation** - Add examples, tips, or troubleshooting guides

See [CONTRIBUTING.md](CONTRIBUTING.md) for general contribution guidelines.

---

## 📞 Support

- **pollinations.ai Issues:** [GitHub Issues](https://github.com/pollinations/pollinations/issues)
- **API Documentation:** [pollinations.ai API Docs](https://github.com/pollinations/pollinations/blob/main/APIDOCS.md)
- **Project Issues:** [Create an issue](../../issues)
- **Email:** mohammadashkar11@gmail.com

---

## 📄 License

This integration is part of the BexyFlowers project and is licensed under the MIT License.  
See [LICENSE](LICENSE) for full details.

**pollinations.ai Attribution:**  
This project uses [pollinations.ai](https://pollinations.ai) for AI image generation.  
Please ensure proper attribution when using this code.

---

<div align="center">

**Powered by [pollinations.ai](https://pollinations.ai)**

[![pollinations.ai](https://img.shields.io/badge/Built%20with-pollinations.ai-7C3AED?style=for-the-badge)](https://pollinations.ai)

</div>
