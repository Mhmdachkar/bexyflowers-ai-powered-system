# Bexy Flowers Codebase Context (Read Before Any Update)

Purpose: This file is a token-saving handoff for AI coding agents (especially Claude).  
Scope: Current architecture, critical logic, key constraints, and recent high-impact fixes in this repository.

---

## 1) Tech Stack and Runtime

- Frontend: React 18 + TypeScript + Vite
- Styling: Tailwind CSS + custom CSS (`src/index.css`)
- Animations: Framer Motion, GSAP, ScrollTrigger, Lenis
- State/Data: React Query (`@tanstack/react-query`), React Context
- Backend/API: Netlify Functions (`/.netlify/functions/*`)
- DB/Auth/Storage: Supabase
- Build: `npm run build` (Vite production build)

---

## 2) App Structure (High Level)

- `src/App.tsx`:
  - Routes are lazy-loaded using `React.lazy` + `Suspense`.
  - Includes mobile/desktop prefetch behavior.
- Main pages:
  - `src/views/Index.tsx`
  - `src/views/Collection.tsx`
  - `src/views/ProductDetailPage.tsx`
  - `src/views/Customize.tsx`
  - `src/views/Checkout.tsx`
  - `src/views/WeddingAndEvents.tsx`
  - `src/views/Favorites.tsx`
- Admin pages:
  - `src/views/admin/*`
- Reusable feature components:
  - `src/components/*`
  - `src/components/cart/*`
  - `src/components/collection/*`
  - `src/components/culture/*`

---

## 3) Critical Business Flows

### A) Cart UX

- `src/hooks/useCartWithToast.ts`
  - `addToCartWithToast` auto-opens cart dashboard via `cartContext.setIsCartOpen(true)`.
- `src/components/cart/CartDashboard.tsx`
  - Scroll is intentionally confined to the products list container (not whole page).
  - Header/footer are fixed while product list is scrollable.

### B) AI Bouquet Generation

- Netlify function path: `/.netlify/functions/generate-image`.
- Production model behavior has been sensitive to provider-side restrictions for `gptimage`.
- `flux/klein` model path was validated as working when `gptimage` was restricted.
- Prompt quality and selected accessories integration were enhanced so selected accessories are reflected in output images.

### C) Zodiac Bouquet Experience

- Main UI component: `src/components/culture/ZodiacBouquetQuiz.tsx`
- Requirement preserved:
  - Dark/black zodiac section style is intentional.
  - Regenerate should keep zodiac-accurate traits/colors but vary output.

---

## 4) Recent Performance + Stability Fixes (Do Not Regress)

### A) Unresponsive-page crash fixes

- `Testimonials.tsx`:
  - Removed interval recreation churn pattern.
  - Replaced layout-heavy animation usage causing repeated expensive recalculations.
  - Added visibility awareness for background tab behavior.
- `useSmoothScroll.tsx`:
  - RAF loop now stops when tab is hidden and resumes when visible.
  - Prevents hidden-tab state buildup and browser hangs.

### B) Admin query efficiency refactors

Files improved:
- `src/views/admin/AdminSignatureCollection.tsx`
- `src/views/admin/AdminWeddingCreations.tsx`
- `src/views/admin/AdminLuxuryBoxes.tsx`
- `src/views/admin/AdminFlowers.tsx`
- `src/views/admin/AdminAccessories.tsx`
- `src/views/admin/AdminEternalFlowers.tsx`
- `src/views/admin/AdminProducts.tsx`
- `src/views/admin/AdminDashboard.tsx`

Patterns fixed:
- Removed redundant triple invalidation (`invalidate + remove + refetch`) and simplified to targeted invalidation.
- Replaced raw `useEffect` fetch flows with React Query where needed.
- Reduced unnecessary animation/render overhead in admin dashboard calendar.

### C) New-device/mobile loading optimizations (latest)

- Global overflow safety:
  - `src/index.css` now enforces `overflow-x: hidden` + `max-width: 100vw` on `html`, `body`, and `#root`.
- Hero video visibility control:
  - `src/components/collection/CollectionHero.tsx` now pauses video when out of viewport and resumes when visible.
- Timeout cleanup in customization flow:
  - `src/views/Customize.tsx` now clears scroll-related `setTimeout` effects.
- Image decode/loading improvements:
  - Added `decoding="async"` and lazy-loading improvements in:
    - `src/views/ProductDetailPage.tsx`
    - `src/views/Checkout.tsx`
    - `src/views/Customize.tsx`
- Root container overflow hardening:
  - Added `overflow-x-hidden` on key page roots:
    - `Collection.tsx`, `ProductDetailPage.tsx`, `Checkout.tsx`, `Customize.tsx`, `Favorites.tsx`
- Favorites stability:
  - `src/views/Favorites.tsx` no longer kills ScrollTrigger instances on every favorites state update; cleanup happens on unmount.

---

## 5) Design/Style Constraints Currently Expected

- Zodiac section on homepage is intentionally dark/black themed.
- Collection header should visually align with home page style direction (light theme tokens).
- Cart dashboard should not be dark-themed (was reverted to prior light style).
- Cart dashboard scrolling behavior must remain internal to cart content section.

---

## 6) SEO + Discovery State

- SEO metadata stack is integrated (meta tags, canonical, OG/Twitter, JSON-LD).
- `robots.txt` strategy exists and blocks non-indexable private flows (`/admin`, cart/checkout/favorites).
- Multiple sitemap references are expected:
  - `/sitemap.xml`
  - `/sitemap-products.xml`
  - `/sitemap-static.xml`

---

## 7) Security Expectations

- Keep API keys server-side only (Netlify functions / env vars).
- Frontend should never expose protected credentials.
- DB writes/privileged operations go through backend API layer (not direct unsafe client calls).
- Preserve SQL injection protection patterns in all query/mutation paths.
- Keep origin checks and rate-limiting patterns in serverless functions.

---

## 8) Known External Dependency Reality

- Pollinations `gptimage` may fail with provider-side `403`/`402` even when code is correct.
- Model accessibility/capacity can change externally.  
- If generation fails and logs confirm valid request formatting + key presence, validate model availability and account balance before code-level rewrites.

---

## 9) Safe Change Protocol for Future AI Agents

Before editing:
1. Read this file.
2. Read target feature files.
3. Preserve existing behavior listed in sections 3-7 unless explicitly asked to change.

After editing:
1. Run lint checks for touched files.
2. Run `npm run build`.
3. Confirm no regressions in:
   - cart auto-open + cart internal scrolling
   - zodiac styling
   - collection header style
   - AI generation request flow
   - mobile video behavior

---

## 10) Quick "Where to Look" Map

- Routing + lazy loading: `src/App.tsx`
- Global CSS and overflow protections: `src/index.css`
- Cart open behavior: `src/hooks/useCartWithToast.ts`
- Cart panel UI/scroll: `src/components/cart/CartDashboard.tsx`
- Collection hero media behavior: `src/components/collection/CollectionHero.tsx`
- Zodiac experience: `src/components/culture/ZodiacBouquetQuiz.tsx`
- Product page UX + recently viewed: `src/views/ProductDetailPage.tsx`
- Custom AI builder: `src/views/Customize.tsx`
- Wedding hero media: `src/views/WeddingAndEvents.tsx`
- Favorites animation lifecycle: `src/views/Favorites.tsx`
- Image generation backend: `netlify/functions/generate-image.*` (if present in this repo layout)

---

## 11) Notes for Token Efficiency

- Prefer targeted edits over broad rewrites.
- Reuse existing hooks/components before adding new abstractions.
- Do not re-audit already-stable systems unless requested.
- Treat this file as baseline context; only deep-scan when a bug report points to a new area.

