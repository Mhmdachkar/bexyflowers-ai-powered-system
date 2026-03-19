# Bexy Flowers — Complete Tech Features & Architecture Scan

**Document:** Full technical inventory, powerful ideas, and main problems solved  
**Project:** AI-Powered Luxury Flower E-Commerce (Lebanon)  
**Last Updated:** February 2025

---

## Executive Summary

Bexy Flowers is a full-stack Next.js e-commerce platform for a luxury florist in Lebanon. It combines **AI image generation** (Pollinations GPT Image), **Supabase** backend, **3D/WebGL** bouquet previews, **serverless** deployment (Netlify), and advanced **performance optimizations** for mobile and low-end devices. The project solves core problems: secure AI integration without exposing keys, anonymous visitor persistence (cart/favorites), AI-powered bouquet customization, and a scalable architecture that hides database complexity from the frontend.

---

## 1. Core Technologies

### 1.1 Framework & Runtime

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.6 | App Router, SSR/SSG, API routes, image optimization |
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.8.3 | Type safety, strict typing |
| **Turbopack** | (built-in) | Fast dev/build |
| **Node.js** | ES2017+ | Runtime |

**Next.js Features Used:**
- App Router (`app/` directory)
- Server Components (layout, pages)
- Client Components (`'use client'`)
- API Routes (`/api/database`, `/api/generate-image`)
- Dynamic Routes (`/product/[id]`)
- Metadata API (title, description, Open Graph)
- Image Optimization (`next/image` with remote patterns)
- Font Optimization (EB Garamond, Montserrat)
- Redirects & Headers in `next.config.mjs`
- `optimizePackageImports` for tree-shaking Radix, Lucide, Framer Motion, React Query

### 1.2 UI & Styling

| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | Utility-first styling, responsive breakpoints (xs–2xl) |
| **tailwindcss-animate** | Accordion, fade-in, slide-up, float, glow, liquid-morph, pulse-gold |
| **@tailwindcss/typography** | Prose styling |
| **@tailwindcss/aspect-ratio** | Media aspect ratios |
| **shadcn/ui (Radix)** | 25+ headless components (Dialog, Dropdown, Select, etc.) |
| **Lucide React** | Icons |
| **class-variance-authority (CVA)** | Variant-based styling |
| **tailwind-merge** | Merge Tailwind classes |
| **clsx** | Conditional class names |

**Font Stack:**
- **EB Garamond** — serif, luxury brand
- **Montserrat** — sans-serif, body/UI

### 1.3 Animation & Motion

| Technology | Purpose |
|------------|---------|
| **Framer Motion** | Page transitions, AnimatePresence, layout animations |
| **GSAP** | Scroll-triggered animations, precise control |
| **ScrollTrigger** | Scroll-based reveals, parallax |
| **Lenis** | Apple-like smooth scroll (desktop only; disabled on mobile) |
| **@studio-freight/lenis** | Smooth scroll library |

### 1.4 3D / WebGL

| Technology | Purpose |
|------------|---------|
| **Three.js** | 3D scene, geometry, materials |
| **@react-three/fiber** | React renderer for Three.js |
| **@react-three/drei** | OrbitControls, Environment, PerspectiveCamera, Html |

**3D Usage:**
- `PremiumBouquetPreview` — 3D bouquet with spheres, cones, cylinders
- `UltraOurStory` — floating 3D background elements
- `useWebGL` — feature detection; disables 3D on unsupported devices
- `ThreeJSErrorBoundary` — graceful fallback if WebGL fails

### 1.5 State & Data

| Technology | Purpose |
|------------|---------|
| **TanStack React Query** | Server state, caching (10min stale, 15min gc) |
| **React Context** | Cart, Favorites, FlyingHeart, RouteState |
| **localStorage** | Cart cache, Favorites cache, Prompt history, Visitor ID |
| **IndexedDB** | Image cache (implemented but disabled) |

### 1.6 Forms & Validation

| Technology | Purpose |
|------------|---------|
| **React Hook Form** | Form state, validation |
| **@hookform/resolvers** | Schema validation integration |
| **Zod** | Schema validation |

### 1.7 Backend & Database

| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL DB, Storage, RLS |
| **@supabase/supabase-js** | Client SDK |

**Database Proxy Pattern:**
- Frontend never talks to Supabase directly for product/cart data
- All DB access goes through `/api/database` or `/.netlify/functions/database`
- Service role key stays server-side only

### 1.8 AI / Image Generation

| Technology | Purpose |
|------------|---------|
| **Pollinations AI** | GPT Image 1 Mini model for photorealistic bouquet previews |
| **image.pollinations.ai** | Official image generation endpoint |
| **Serverless proxy** | Next.js `/api/generate-image` or Netlify `generate-image` function |

### 1.9 Deployment & Hosting

| Technology | Purpose |
|------------|---------|
| **Netlify** | Hosting, serverless functions, redirects, headers |
| **Vite** | Legacy build (dual setup with Next.js) |

---

## 2. Architecture Patterns & Powerful Ideas

### 2.1 Database Abstraction Layer

**Problem:** Frontend must not access Supabase directly (security, key exposure).

**Solution:**
- `database-client.ts` exposes a simple `db` object: `db.select()`, `db.insert()`, `db.update()`, `db.delete()`, `db.rpc()`
- All calls go to `/api/database` (Next.js) or `/.netlify/functions/database` (Netlify)
- Backend validates `X-API-Key`, uses `SUPABASE_SERVICE_ROLE_KEY`
- **Result:** Database provider is completely hidden; can swap Supabase for another DB without frontend changes

### 2.2 Anonymous Visitor Persistence

**Problem:** Cart and favorites must persist for users without accounts.

**Solution:**
- `visitor_id` generated once and stored in `localStorage`
- `visitors` table tracks first/last visit
- `visitor_carts` and `visitor_favorites` tables store items by `visitor_id`
- **Deferred DB load:** New visitors (empty cart) skip DB entirely; returning visitors sync from DB
- **Debounced sync:** 500ms debounce before writing to DB
- **localStorage as cache:** Read from local first; merge with DB in background

### 2.3 HMAC Request Signing

**Problem:** Prevent replay attacks on image generation API.

**Solution:**
- `requestSigning.ts` — Web Crypto API (`crypto.subtle`) for HMAC-SHA256
- Payload includes: `prompt`, `width`, `height`, `model`, `timestamp`, `nonce`
- Server validates signature; rejects expired or tampered requests
- **OWASP-aligned** API security

### 2.4 AI Key Security

**Problem:** Pollinations API key must never be exposed to the browser.

**Solution:**
- All AI calls go through serverless proxy
- Frontend sends prompt + config; server fetches image from Pollinations with `key=SECRET`
- Base64 data URL returned to client
- **No direct Pollinations calls from browser**

### 2.5 Prompt Engineering for GPT Image

**Problem:** GPT Image works best with short, natural prompts; complex weighted keywords (Flux-style) don't apply.

**Solution:**
- `buildSimplifiedPrompt()` — concise, structured prompts (~600 chars)
- Flower visuals, arrangement, density, bloom stage
- Negative prompts for exclusions (blurry, 3D render, artificial flowers)
- Style presets (romantic, minimal, luxury) defined but not fully exposed in UI

### 2.6 Mobile Performance Optimization

**Problem:** Heavy animations and smooth scroll drain battery on mobile.

**Solution:**
- **Lenis disabled on mobile** — native scroll only
- **iOS/Android detection** — `useIOSPerformance`, `isAndroid()`, `getIOSVersion()`
- **Video:** Lazy load via Intersection Observer; playback rate 0.85 on old iOS
- **GSAP ScrollTrigger** — throttled updates (20ms on Android)
- **WebGL disabled on mobile** — `useWebGL` prevents 3D on unsupported devices

### 2.7 Package Import Optimization

**Problem:** Large bundles from Radix, Lucide, Framer Motion.

**Solution:**
- `optimizePackageImports` in `next.config.mjs`
- Only imported components are bundled
- Reduces JS size significantly

### 2.8 Navigation Compatibility Layer

**Problem:** Legacy `react-router-dom` imports in some files; Next.js uses file-based routing.

**Solution:**
- `navigation-compat.ts` — stubs for `BrowserRouter`, `Routes`, `Route`
- `Link` supports both `to` and `href`
- `useNavigate`, `useLocation`, `Navigate` implemented with Next.js `useRouter`, `usePathname`
- **No `useSearchParams` in `useLocation`** — avoids Suspense issues during SSR

---

## 3. Main Problems Solved

### 3.1 Secure AI Integration

- **Problem:** AI API keys must stay server-side.
- **Solved:** Serverless proxy; frontend never has Pollinations key.

### 3.2 Cart & Favorites Without Login

- **Problem:** Users must save cart/favorites without creating accounts.
- **Solved:** Visitor ID + Supabase `visitor_carts`, `visitor_favorites`; localStorage + debounced DB sync.

### 3.3 AI-Powered Bouquet Preview

- **Problem:** Show users what their custom bouquet will look like before ordering.
- **Solved:** Pollinations GPT Image generates photorealistic preview from structured prompt (flowers, package, color, arrangement).

### 3.4 Database Provider Abstraction

- **Problem:** Frontend should not depend on Supabase SDK directly.
- **Solved:** `database-client` → API route → Supabase; frontend uses generic `db.select()` etc.

### 3.5 Traffic Optimization for Passive Visitors

- **Problem:** Every new visitor was hitting DB (cart/favorites); high cost at scale.
- **Solved:** New visitors with empty cart/favorites skip DB; only returning visitors sync.

### 3.6 Mobile & Low-End Device Performance

- **Problem:** Smooth scroll, 3D, and heavy animations caused lag on phones.
- **Solved:** Lenis off on mobile; WebGL disabled on unsupported; video lazy-load; throttled ScrollTrigger.

### 3.7 SEO for E-Commerce

- **Problem:** Product pages and collection need good SEO.
- **Solved:** Next.js Metadata API, sitemap.xml, robots.txt, JSON-LD (Organization, LocalBusiness, Product, Breadcrumb), Open Graph, canonical URLs.

### 3.8 SSR / Static Generation Without Breaking Hooks

- **Problem:** `useSearchParams` requires Suspense; layout uses `useLocation`.
- **Solved:** `useLocation` uses `window.location.search` instead of `useSearchParams`; no Suspense needed.

---

## 4. File Structure & Responsibilities

### 4.1 App Router Pages

| Route | Purpose |
|-------|---------|
| `/` | Home |
| `/about` | About page |
| `/collection` | Product collection (eternal/real/mixed) |
| `/product/[id]` | Product detail (dynamic) |
| `/customize` | AI custom bouquet designer |
| `/checkout` | Checkout flow |
| `/favorites` | Saved favorites |
| `/wedding-and-events` | Wedding & events gallery |

### 4.2 API Routes

| Route | Purpose |
|-------|---------|
| `POST /api/database` | Database proxy (select, insert, update, delete, rpc) |
| `POST /api/generate-image` | Pollinations image generation proxy |

### 4.3 Netlify Functions

| Function | Purpose |
|----------|---------|
| `database` | Database proxy (alternative to Next.js route) |
| `generate-image` | Pollinations proxy (60s timeout) |
| `health` | Health check |
| `bulk-email` | Bulk email (SendGrid) |
| `bulk-sms` | Bulk SMS (Twilio) |
| `rateLimiter` | Rate limiting utility |
| `monitoring` | Monitoring utilities |

### 4.4 Key Lib Modules

| Module | Responsibility |
|--------|----------------|
| `database-client` | DB abstraction, API calls |
| `aiConfig` | AI model, resolution, retries |
| `imageGeneration` | Pollinations client, progress, fallbacks |
| `promptEngine` | Prompt building, negative prompts, style presets |
| `promptHistory` | localStorage history/favorites for AI prompts |
| `requestSigning` | HMAC signing for API security |
| `visitor-cart` | Cart CRUD, sync to Supabase |
| `visitor-favorites` | Favorites CRUD, sync to Supabase |
| `supabase` | Supabase client (direct use for flowers, storage) |
| `supabase-storage` | Upload, delete images (product-images, flower-images, etc.) |
| `seo` | JSON-LD schemas, site config |
| `imageUtils` | `toImageSrc`, `encodeImageUrl` (Supabase URLs) |
| `cacheUtils` | localStorage/sessionStorage cache manager |
| `serviceWorkerRegistration` | PWA service worker |

---

## 5. Supabase Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| `collection_products` | Main product catalog |
| `signature_collections` | Featured/custom overrides for products |
| `flower_types` | Flowers for customize page |
| `flower_type_categories` | Categories (Roses, Tulips, etc.) |
| `flower_colors` | Color variants per flower |
| `visitors` | Anonymous visitor tracking |
| `visitor_carts` | Cart items per visitor |
| `visitor_favorites` | Favorites per visitor |
| `checkout_orders` | Checkout submissions |
| `wedding_creations` | Wedding gallery items |
| `luxury_boxes` | Box/wrap product config |

---

## 6. Security Measures

- **API Key in header:** `X-API-Key` for database and image API
- **HMAC signing:** Timestamp, nonce, signature on image requests
- **Server-side secrets:** `POLLINATIONS_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_API_SECRET` never in client
- **Database proxy:** Frontend cannot call Supabase directly for products/cart
- **CORS:** Handled by Next.js/Netlify
- **Robots:** `/admin/`, `/api/`, `/cart`, `/checkout`, `/favorites` disallowed

---

## 7. Performance Optimizations

- **Lenis:** Disabled on mobile
- **ScrollTrigger:** Throttled (20ms on Android)
- **Video:** Lazy load, reduced rate on old iOS
- **React Query:** 10min stale, 15min gc, no refetch on focus/mount
- **Memoization:** Flower mapping, buildCurrentPrompt in Customize
- **Blob URL cleanup:** Revoke on unmount
- **Package imports:** Tree-shaking Radix, Lucide, Framer, React Query
- **Image optimization:** next/image, WebP/AVIF, remote patterns for Supabase & Pollinations

---

## 8. PWA & Offline

- **Service Worker:** `sw.js` for caching
- **manifest.json:** Standalone display, theme color, icons
- **Update flow:** `onupdatefound` → user confirm → reload
- **clearCache:** Message to SW to clear caches

---

## 9. Scripts & Tooling

| Script | Purpose |
|--------|---------|
| `generate:sitemap` | Generate sitemap |
| `optimize:images` | Image optimization |
| `convert:webp` | Convert images to WebP |
| `migrate` | Migrate to Supabase |
| `fix:wedding-webp` | Fix wedding creation images |
| `cleanup:duplicates` | Clean duplicate images |
| `prune-non-webp` | Remove non-WebP images |

---

## 10. Environment Variables (Complete)

### Public (NEXT_PUBLIC_*)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Base URL for sitemap, OG, canonicals |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_FRONTEND_API_KEY` | API auth header |
| `NEXT_PUBLIC_FRONTEND_API_SECRET` | HMAC signing (client) |
| `NEXT_PUBLIC_USE_NETLIFY_FUNCTIONS` | Use Netlify vs Next.js API routes |
| `NEXT_PUBLIC_ADMIN_*` | Admin login (legacy) |

### Server-Only

| Variable | Purpose |
|----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Full DB access |
| `FRONTEND_API_SECRET` | HMAC validation |
| `POLLINATIONS_SECRET_KEY` | Pollinations API auth |
| `POLLINATIONS_SECRET_KEY2` | Backup key |

---

## 11. Notable Technical Decisions

1. **Next.js over Vite for production** — SSR, API routes, image optimization, SEO
2. **Database proxy** — Hides Supabase; enables future migration
3. **Visitor-based cart** — No login required; sync to DB for persistence
4. **Serverless for AI** — Keys stay server-side; scales with Netlify
5. **Lenis off on mobile** — Native scroll for battery and performance
6. **Simplified prompts for GPT Image** — Natural language over weighted Flux keywords
7. **Suspense for UltraNavigation** — Wraps component using `useSearchParams`-related logic
8. **Exclude src/main.tsx from TS** — Legacy Vite entry; Next.js uses App Router

---

## 12. Dependencies Summary (Count)

- **Production:** ~50 (Radix, TanStack, Framer, GSAP, Three, Supabase, etc.)
- **Dev:** ~20 (ESLint, TypeScript, Tailwind, Vite, Netlify CLI, etc.)
- **Overrides:** react-reconciler, scheduler (for React 18 compatibility)

---

## 13. Future Enhancement Areas (From Scan)

- Re-enable image cache (IndexedDB)
- Persist prompt history images (base64 or Supabase Storage)
- Fallback flowers when Supabase fails
- Model selector (flux/turbo/gptimage)
- Style presets in Customize UI
- Configurable WhatsApp number
- Product sitemap (dynamic product URLs in sitemap)

---

*End of Tech Features Full Scan*
