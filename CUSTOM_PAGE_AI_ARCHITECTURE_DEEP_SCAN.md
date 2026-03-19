# Custom Page & AI Model — Deep Architecture Scan

**Document:** Full technical analysis of the Custom Bouquet page and AI image generation system  
**Date:** February 2025  
**Status:** Read-only documentation — no code changes

---

## Executive Summary

The Customize page (`/customize`) is a multi-step bouquet designer that lets users configure packages, sizes, colors, flowers, arrangement preferences, and accessories. It uses **Pollinations AI** (GPT Image 1 Mini model) via a serverless proxy to generate photorealistic preview images of the configured bouquet. The architecture is modular, with clear separation between UI, prompt engineering, image generation, and persistence layers.

---

## 1. Architecture Overview

### 1.1 High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CUSTOMIZE PAGE (Customize.tsx)                         │
│  Route: /customize | ~2,544 lines | Client Component                             │
└─────────────────────────────────────────────────────────────────────────────────┘
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        │                                 │                                 │
        ▼                                 ▼                                 ▼
┌───────────────┐               ┌───────────────────┐               ┌──────────────┐
│ Flower Data   │               │ Prompt Engine     │               │ Image Gen    │
│ (Supabase)    │               │ (promptEngine.ts) │               │ (Pollinations)│
│               │               │                   │               │              │
│ useFlowers    │               │ buildAdvanced     │               │ generate     │
│ ForCustomize  │               │ Prompt()          │               │ BouquetImage │
└───────────────┘               └───────────────────┘               └──────────────┘
        │                                 │                                 │
        │                                 │                                 │
        └─────────────────────────────────┼─────────────────────────────────┘
                                          │
                                          ▼
                               ┌─────────────────────┐
                               │ Post-Generation     │
                               │ - Prompt History    │
                               │ - Favorites         │
                               │ - Add to Cart       │
                               │ - WhatsApp Share    │
                               └─────────────────────┘
```

### 1.2 File Map

| Layer | File(s) | Purpose |
|-------|---------|---------|
| **View** | `src/views/Customize.tsx` | Main UI, state, step flow, orchestration |
| **Page** | `app/customize/page.tsx` | Next.js route wrapper, re-exports Customize |
| **Prompt** | `src/lib/api/promptEngine.ts` | Build natural-language prompts, negative prompts, style presets |
| **AI Config** | `src/lib/api/aiConfig.ts` | Model, resolution, retries, validation, UX settings |
| **Image Gen** | `src/lib/api/imageGeneration.ts` | Pollinations client, serverless calls, progress, fallbacks |
| **History** | `src/lib/api/promptHistory.ts` | localStorage: history (20), favorites (10) |
| **Cache** | `src/lib/api/imageCache.ts` | IndexedDB cache (currently **disabled**) |
| **Flowers** | `src/lib/api/flowers.ts`, `src/data/flowers.ts` | Supabase flower types + static fallback mapping |
| **API Route** | `app/api/generate-image/route.ts` | Next.js server-side proxy to Pollinations |
| **Netlify** | `netlify/functions/generate-image.ts` | Netlify serverless proxy (alternative) |
| **Request Signing** | `src/lib/api/requestSigning.ts` | HMAC signing for serverless auth |

---

## 2. Custom Page — Detailed Flow

### 2.1 Step Structure (7 Steps)

| Step | Title | Main Inputs | Data Source |
|------|-------|-------------|-------------|
| 1 | Package | Box vs Wrap | Static `packages[]` |
| 2 | Shape | Round, Square, Heart | Static `boxShapes[]` |
| 3 | Size | Small, Medium, Large | Static `sizes[]` (maxFlowers: 10, 22, 37) |
| 4 | Color | Black, White, Gold, Pink, Blue, Red | Static `colors[]` |
| 5 | Flowers | Flower selection + quantities | Supabase `flower_types` via `getFlowersForCustomize()` |
| 6 | Extras | Glitter, Ribbon, Accessories | Static `accessories[]` |
| 7 | Arrange | Style, Density, Bloom, Positions | Static `arrangementStyles[]`, `densityOptions[]`, `bloomStages[]` |

### 2.2 State (Customize.tsx)

**Core selection state:**
- `selectedPackage`, `selectedBoxShape`, `selectedSize`, `selectedColor`
- `selectedFlowers` (Record<flowerId, { flower, quantity }>)
- `withGlitter`, `withRibbon`, `selectedAccessories`
- `arrangementStyle`, `densityPreference`, `bloomStage`, `flowerPositions`

**AI generation state:**
- `generatedImage`, `isGenerating`, `generationProgress`
- `currentPrompt`, `lastGeneratedPrompt`
- `promptHistory`, `favorites`
- `variationIndex`, `customPrompt`, `isEditingPrompt`

**UI state:**
- `flowerMode` (specific | mix), `selectedFamily`, `flowerFilter`, `seasonFilter`

### 2.3 Flower Data Source

- **Primary:** Supabase `flower_types` via `getFlowersForCustomize()`
- **Mapping:** DB rows are mapped to `CustomizeFlower` using `FLOWER_NAME_TO_ID` for family/color
- **Fallback:** If schema columns are missing, fallback query returns basic fields
- **No static fallback:** If DB fails, the page receives empty array; no fallback to `src/data/flowers.ts`

### 2.4 Price Calculation

- Base: `selectedPackage.basePrice * selectedSize.priceMultiplier`
- Flowers: sum of `flower.price * quantity` for each selected flower
- Accessories: sum of accessory prices
- Total: `totalPrice` drives cart and display

---

## 3. AI Model Integration

### 3.1 Model & Endpoint

| Setting | Value | Notes |
|---------|-------|-------|
| **Model** | `gptimage` (GPT Image 1 Mini) | Chosen for photorealism and text/logo support |
| **Resolution** | 768×768 (UI) / 512×512 (config default) | Customize overrides to 768 for better quality |
| **Endpoint** | `https://image.pollinations.ai/prompt/{prompt}` | Pollinations official image API |
| **Auth** | Server-side only | `POLLINATIONS_SECRET_KEY` used in Next.js/Netlify route |

### 3.2 Request Flow

1. **User clicks "Generate"** → `generateBouquetImage()` in Customize
2. **Prompt built** → `buildAdvancedPrompt()` returns `{ positive, negative, preview, hash }`
3. **Signed request** → `createSignedRequest({ prompt, width, height, model })` (HMAC)
4. **Client POST** → `/api/generate-image` (or `/.netlify/functions/generate-image` if `NEXT_PUBLIC_USE_NETLIFY_FUNCTIONS=true`)
5. **Server fetches** → `https://image.pollinations.ai/prompt/{encoded}?model=gptimage&width=768&height=768&nologo=true&key=SECRET`
6. **Response** → Base64 data URL → converted to Blob → `URL.createObjectURL(blob)` for display

### 3.3 Prompt Engine

**`buildAdvancedPrompt()`** delegates to **`buildSimplifiedPrompt()`**:

- **Simplified:** Natural, concise prompts (~600 chars) for GPT Image
- **Structure:** `Professional product photo of a luxury {color} {shape} flower arrangement. Contains {totalFlowers} {bloomStage} real fresh flowers: {flowerList}. ...`

**Key elements:**
- Flower list: `quantity color type` (e.g. `5 red roses in center`)
- Arrangement: dome-shaped, flat-top, cascading
- Density: tightly packed, well-spaced, loosely arranged
- Bloom: fully bloomed, semi-open, mixed
- Box/Wrap: shape, material, BEXY FLOWERS logo
- Extras: glitter, ribbon, accessories

**Negative prompts:** Exclude blur, 3D render, artificial flowers, watermark, etc.

### 3.4 Progress Stages

| Stage | Label |
|-------|-------|
| `checking-cache` | Checking cache... |
| `building-prompt` | Building prompt... |
| `connecting` | Connecting to AI... |
| `generating` | Generating image... |
| `processing` | Processing result... |
| `caching` | Saving to cache... |
| `complete` | Complete! |

*(Cache is disabled, so checking-cache/caching rarely apply.)*

### 3.5 Retry & Fallback

- **Retry delays:** 3s, 5s, 8s between strategies
- **Timeout:** 45 seconds per request
- **Strategies:** 1) Pollinations (primary), 2) HuggingFace (backup, **disabled**)
- **No direct API:** Keys never exposed to browser; serverless only

---

## 4. Post-Generation Features

### 4.1 Prompt History

- **Storage:** localStorage `bexy-prompt-history`
- **Max entries:** 20
- **Fields:** id, hash, prompt, preview, imageUrl (blob URL — **ephemeral**), createdAt, configuration
- **Note:** Blob URLs become invalid on refresh; history stores config, not persistent image

### 4.2 Favorites

- **Storage:** localStorage `bexy-prompt-favorites`
- **Max entries:** 10
- Same structure as history

### 4.3 Variations

- `generateWithVariation(basePrompt, variationIndex)` appends modifiers:
  - "unique artistic interpretation, creative arrangement"
  - "alternative composition, fresh perspective"
  - etc.
- No cache for variations

### 4.4 Add to Cart

- `addToCart({ id, title, price, image, description, personalNote })`
- Image: `generatedImage` or first selected flower or hero fallback

### 4.5 WhatsApp Share

- Hardcoded number: `96176104882`
- Message: "I would like to order this flower. Thank you."
- Triggers download + opens `wa.me` link

---

## 5. Strengths

1. **Modular architecture** — Clear separation: prompt engine, image gen, config, UI
2. **Server-side keys** — Pollinations key never exposed; HMAC signing for auth
3. **Simplified prompts** — GPT Image–optimized, avoids Flux-style weighted keywords
4. **Rich customization** — Package, shape, size, color, flowers, arrangement, accessories
5. **Variation support** — Multiple images per design via `generateWithVariation`
6. **Progress feedback** — Progress stages and toasts
7. **Supabase integration** — Flowers from DB with fallback for schema changes
8. **Mobile/iOS tuning** — Lazy video, intersection observer, playback optimizations

---

## 6. Limitations & Edge Cases

1. **Image cache disabled** — `useCache: false`; every generation hits API
2. **History image URLs** — Blob URLs in history/favorites expire on reload
3. **No DB fallback for flowers** — If Supabase fails, flower list is empty
4. **Fixed WhatsApp number** — Hardcoded, not configurable
5. **Single model** — Only `gptimage`; no model switching
6. **Dead code in promptEngine** — Large `buildAdvancedPrompt` block (lines 386–649) is unreachable; `buildSimplifiedPrompt` returns first
7. **IndexedDB cache unused** — `imageCache.ts` exists but caching is off

---

## 7. Enhancement Opportunities

### 7.1 High Impact

| Enhancement | Effort | Impact | Notes |
|-------------|--------|--------|-------|
| **Re-enable image cache** | Low | High | Turn on `useCache` and pass `cacheHash`; reduce API calls for repeated configs |
| **Persist history images** | Medium | High | Store base64 or upload to Supabase Storage; restore on reload |
| **Fallback flowers** | Low | Medium | If `getFlowersForCustomize` fails, use `src/data/flowers.ts` |
| **Configurable WhatsApp** | Low | Low | Move number/message to env or admin settings |

### 7.2 Medium Impact

| Enhancement | Effort | Impact | Notes |
|-------------|--------|--------|-------|
| **Model selector** | Medium | Medium | Allow flux/turbo/gptimage; trade speed vs quality |
| **Higher resolution option** | Low | Medium | 1024×1024 for “high quality” mode |
| **Remove dead code** | Low | Low | Delete unreachable `buildAdvancedPrompt` block |
| **Style presets in UI** | Low | Medium | Expose `STYLE_PRESETS` (romantic, minimal, luxury) in step 7 |

### 7.3 Lower Priority

| Enhancement | Effort | Impact | Notes |
|-------------|--------|--------|-------|
| **Template quick-start** | Medium | Low | Use `PROMPT_TEMPLATES` (Valentine, Wedding, etc.) for pre-filled configs |
| **Prompt preview edit** | Low | Low | Custom prompt editor already present; refine UX |
| **Flower position visualization** | High | Low | Visual placement map for center/edges/scattered |

---

## 8. Technical Debt

1. **Prompt engine** — Large dead block in `buildAdvancedPrompt` (Flux-weighted prompts)
2. **Duplicate logic** — Hash generation duplicated in simplified vs full path
3. **Type safety** — `flowerPositions` as `Record<string, string>`; could use stricter union
4. **Magic numbers** — 768, 512, 45s, 50KB, etc. could live in `aiConfig.ts`

---

## 9. Security Notes

- Pollinations key: server-only ✅
- HMAC request signing: implemented ✅
- API key validation: `NEXT_PUBLIC_FRONTEND_API_KEY` in header ✅
- No prompt injection hardening: user-editable prompt is sent as-is; consider length/sanitization limits

---

## 10. Performance Notes

- **Flower mapping** memoized with `useMemo`
- **Blob URL cleanup** on unmount
- **Video** lazy-loaded via Intersection Observer on mobile
- **React Query** for flowers: 2min stale, 5min gc
- **Generation time:** ~20–40s for gptimage at 768×768

---

## Appendix A: Prompt Structure (Simplified)

```
Professional product photo of a luxury {color} {shape} flower arrangement.
Contains {totalFlowers} {bloomStage} real fresh flowers: {flowerList}.
Flowers arranged in {styleText} formation, {densityText}, filling the entire box.
Box has "BEXY FLOWERS" logo printed in gold on the front.
[Optional: Elegant satin ribbon...] [Optional: Fine glitter...]
White studio background, soft natural lighting, high-end florist photography.
Real photograph, not 3D render, photorealistic.
```

---

## Appendix B: Environment Variables Used

| Variable | Usage |
|----------|-------|
| `NEXT_PUBLIC_FRONTEND_API_KEY` | Client → API auth header |
| `NEXT_PUBLIC_FRONTEND_API_SECRET` | HMAC signing (client-side) |
| `NEXT_PUBLIC_USE_NETLIFY_FUNCTIONS` | Route: Next.js vs Netlify |
| `POLLINATIONS_SECRET_KEY` | Server-side Pollinations auth |
| `NEXT_PUBLIC_SUPABASE_*` | Flower data (via supabase client) |

---

*End of report*
