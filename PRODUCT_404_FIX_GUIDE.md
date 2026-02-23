# Product Detail 404 Diagnostic Guide

## Issue Summary
Product detail pages showing 404 on hosted site.

## Root Cause
Product cards were linking using `signature_collection.id` instead of `collection_products.id`, causing `/product/:id` lookups to fail.

## Fixes Applied (Local)

### 1. UltraFeaturedBouquets ID Fix
**File:** `src/components/UltraFeaturedBouquets.tsx`
**Change:** Line 58
```typescript
// OLD:
id: item.product?.id || item.id,

// NEW:
id: item.product_id || item.product?.id || item.id,
```

`product_id` is the foreign key from `signature_collections` to `collection_products`, ensuring links always use valid collection product IDs.

### 2. Database API Response Format
**File:** `app/api/database/route.ts`
**Change:** Returns `{ success: true, data: result }` instead of raw `result`

### 3. Database Client Endpoint
**File:** `src/lib/api/database-client.ts`
**Change:** Uses `/api/database` by default (Next.js) instead of `/.netlify/functions/database`

### 4. Image Generation API
**Files:** `app/api/generate-image/route.ts`, `src/lib/api/aiConfig.ts`
**Change:** Uses `/api/generate-image` by default, fetches images server-side

### 5. Request Signing Secret
**Files:** `.env`, `src/lib/api/requestSigning.ts`
**Change:** Added `NEXT_PUBLIC_FRONTEND_API_SECRET` so client-side HMAC signing works

## To Deploy the Fix

1. **Commit and push all changes:**
   ```bash
   git add .
   git commit -m "Fix product detail 404: use product_id for product links"
   git push
   ```

2. **Redeploy your site** (Vercel/Netlify/your hosting platform)

3. **Verify the fix works:**
   - Visit your homepage
   - Click any product card
   - Should navigate to product detail page (not 404)

## Testing Locally

To test if the fix works locally:

1. **Clear .next cache:**
   ```bash
   Remove-Item -Path ".next" -Recurse -Force
   ```

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Test product navigation:**
   - Go to http://localhost:8080
   - Click a product card on homepage
   - Should navigate to product detail page

## Verification Checklist

- [ ] All 5 fixes deployed to hosted site
- [ ] Can click homepage product cards → detail page loads
- [ ] Can click collection page cards → detail page loads
- [ ] Product detail page shows correct product info
- [ ] Add to cart/favorites works on detail page

## If Still Getting 404

If you're still seeing 404 after deploying, check:

1. **Database API working?**
   - Open browser DevTools → Network tab
   - Click product card
   - Look for `/api/database` request
   - Should return `{ success: true, data: [...] }`

2. **Product IDs correct?**
   - Inspect product card link: right-click → Inspect
   - `<a href="/product/SOME-UUID-HERE">`
   - Copy that UUID
   - Check if it exists in `collection_products` table (Supabase dashboard)

3. **Environment variables set?**
   - Hosting platform dashboard → Environment Variables
   - Ensure all `NEXT_PUBLIC_*` variables are set
   - Especially `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Common Deployment Issues

- **Cached build:** Clear build cache on hosting platform
- **Missing env vars:** Check all environment variables are set
- **Database relationship missing:** Supabase needs FK from `signature_collections.product_id` → `collection_products.id`
