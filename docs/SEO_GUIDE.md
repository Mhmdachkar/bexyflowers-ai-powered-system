# Bexy Flowers – Complete SEO Guide

This guide walks you through everything needed to run perfect SEO for your Bexy Flowers website.

---

## Step 1: Set Your Production URL

**What:** Your website’s public URL (e.g. `https://bexyflowers.com`).

**Where:** `.env` file in the project root.

**Action:** Add or update:

```env
VITE_SITE_URL=https://bexyflowers.shop
```

**Why:** Used for canonical URLs, Open Graph, and JSON-LD.

---

## Step 2: Update Domain References in Static Files

**Files to update:**

### 1. `index.html`
Search for `https://bexyflowers.shop` and confirm it matches your live domain:
- ` canonical` link
- `og:url`
- `og:image`
- `twitter:image`

### 2. `public/sitemap.xml`
Already set to `https://bexyflowers.shop` in all `<loc>` tags.

### 3. `public/robots.txt`
Sitemap is set to `https://bexyflowers.shop/sitemap.xml`.

---

## Step 3: Create a Dedicated OG Image (Social Sharing)

**Current:** `/assets/bexy-flowers-logo.webp` (logo)

**Recommended:** Use a dedicated image for Facebook/LinkedIn/Twitter:
- Size: **1200×630 px**
- Format: JPG or PNG
- Content: Branded hero image with logo and tagline

**How to add:**
1. Create `public/og-image.jpg` (1200×630).
2. In `index.html`, set:
   ```html
   <meta property="og:image" content="https://YOUR-DOMAIN.com/og-image.jpg" />
   ```
3. In `src/lib/seo.ts`, update `DEFAULT_OG_IMAGE`:
   ```ts
   export const DEFAULT_OG_IMAGE = "/og-image.jpg";
   ```

---

## Step 4: Submit to Search Engines

### Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console).
2. Add property: `https://YOUR-DOMAIN.com`
3. Verify ownership (HTML tag or DNS).
4. Submit sitemap: `https://YOUR-DOMAIN.com/sitemap.xml`

### Bing Webmaster Tools
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Add your site.
3. Verify and submit sitemap.

---

## Step 5: Verify Meta Tags and Structured Data

### Meta tags (per page)
- Home, Collection, About, Customize, Wedding & Events: custom title, description, canonical
- Product pages: product-specific title, description, image, canonical
- Cart, Checkout, Favorites, 404: `noindex, nofollow`

### JSON-LD structured data
- **Home:** Organization + WebSite
- **Product pages:** Product schema (name, price, image, availability)
- Validate at: [Google Rich Results Test](https://search.google.com/test/rich-results)

---

## Step 6: Technical SEO Checklist

| Item | Status |
|------|--------|
| Mobile-friendly | ✅ Responsive design |
| HTTPS | ✅ Use HTTPS in production |
| Fast loading | ✅ Code splitting, lazy loading, caching |
| Semantic HTML | ✅ Use proper headings (h1, h2, etc.) |
| Alt text on images | ⚠️ Check product/collection images have descriptive `alt` |
| Internal linking | ✅ Navigation + footer links |
| Clean URLs | ✅ `/collection`, `/product/:id`, etc. |

---

## Step 7: Optional – Dynamic Sitemap for Products

**Current:** Static sitemap with main pages only. Product pages are discovered via links.

**Optional:** Add product URLs to sitemap at build time.

1. Create `scripts/generate-sitemap.mjs`:
   - Fetch all product IDs from Supabase.
   - Add `<url><loc>https://YOUR-DOMAIN.com/product/ID</loc></url>` for each.
   - Write to `public/sitemap.xml` (or sitemap-products.xml).

2. In `package.json`:
   ```json
   "scripts": {
     "prebuild": "node scripts/generate-sitemap.mjs",
     "build": "vite build"
   }
   ```

3. If using two sitemaps, add a sitemap index:
   - `sitemap-index.xml` → references `sitemap-pages.xml` and `sitemap-products.xml`.
   - In `robots.txt`, set `Sitemap: https://YOUR-DOMAIN.com/sitemap-index.xml`.

---

## Step 8: Content SEO (Ongoing)

1. **Keywords**
   - Focus: flowers Lebanon, wedding flowers, custom bouquets, luxury florist, Beirut flowers, eternal flowers.

2. **Content**
   - Unique descriptions for each product.
   - Short, useful text on Collection, Customize, Wedding & Events.

3. **Blog**
   - Optional: add `/blog` with care guides, occasions, and tips.
   - Each article = indexable page with title, description, canonical.

---

## Step 9: Social & Local SEO

1. **Google Business Profile**
   - Create or claim listing for Bexy Flowers.
   - Add address, phone, hours, photos.

2. **Schema**
   - `LocalBusiness` schema can be added in `src/lib/seo.ts` if you have a physical location.

3. **Social**
   - Set `TWITTER_HANDLE` and `FACEBOOK_APP_ID` in `src/lib/seo.ts` if you use them.

---

## Summary – What’s Implemented

| Feature | Location |
|---------|----------|
| Dynamic meta tags | `src/components/SEO.tsx` |
| Per-page SEO | Each page (Index, Collection, About, etc.) |
| JSON-LD (Org, WebSite, Product) | `src/lib/seo.ts` |
| Canonical URLs | Via SEO component |
| Open Graph & Twitter Cards | Via SEO component |
| Sitemap | `public/sitemap.xml` |
| Robots.txt | `public/robots.txt` |
| noindex for private pages | Cart, Checkout, Favorites, 404 |

---

## Quick Checklist Before Launch

- [ ] Set `VITE_SITE_URL` in `.env` (already set to `https://bexyflowers.shop`)
- [ ] Confirm domain in `index.html`, `sitemap.xml`, `robots.txt` (already set)
- [ ] Create and add OG image (1200×630)
- [ ] Submit sitemap to Google Search Console and Bing
- [ ] Validate JSON-LD with Rich Results Test
- [ ] Check meta tags with Facebook Sharing Debugger and Twitter Card Validator
