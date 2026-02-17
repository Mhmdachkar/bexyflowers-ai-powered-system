# SEO Verification & Google Integration Guide
## Bexy Flowers - Complete SEO Implementation Checklist

---

## 🎯 Overview

This guide provides step-by-step instructions for verifying and monitoring the SEO implementation for Bexy Flowers. Follow these steps to ensure maximum visibility in Google search results.

---

## 📋 Pre-Launch Checklist

### 1. Build & Deploy
```bash
# Generate sitemaps before build
npm run generate:sitemap

# Build the site
npm run build

# Deploy to Netlify
# Sitemaps will be automatically included in the dist folder
```

### 2. Verify Critical Files Are Live

After deployment, verify these URLs return 200 OK:

- ✅ **Robots.txt**: https://bexyflowers.shop/robots.txt
- ✅ **Sitemap Index**: https://bexyflowers.shop/sitemap.xml
- ✅ **Static Sitemap**: https://bexyflowers.shop/sitemap-static.xml
- ✅ **Products Sitemap**: https://bexyflowers.shop/sitemap-products.xml

**Test Command:**
```bash
curl -I https://bexyflowers.shop/robots.txt
curl -I https://bexyflowers.shop/sitemap.xml
```

---

## 🔍 Google Search Console Setup

### Step 1: Verify Ownership

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property"
3. Enter: `https://bexyflowers.shop`
4. Choose verification method:
   - **HTML Tag** (Recommended): Already added to `index.html`
   - Verification meta tag: `<meta name="google-site-verification" content="dUopYja0wno44K9eQg8tyVRCN94ObCaWaeb5O1J7A7c" />`
5. Click "Verify"

### Step 2: Submit Sitemaps

1. In Search Console, go to **Sitemaps** (left sidebar)
2. Add these sitemaps:
   ```
   https://bexyflowers.shop/sitemap.xml
   https://bexyflowers.shop/sitemap-static.xml
   https://bexyflowers.shop/sitemap-products.xml
   ```
3. Click "Submit"
4. Wait 24-48 hours for Google to crawl

### Step 3: Request Indexing for Key Pages

1. Go to **URL Inspection** tool
2. Enter these URLs one by one:
   - `https://bexyflowers.shop/`
   - `https://bexyflowers.shop/collection`
   - `https://bexyflowers.shop/wedding-and-events`
   - `https://bexyflowers.shop/customize`
3. Click "Request Indexing" for each
4. Repeat for 3-5 top product pages

---

## 🧪 Schema Validation

### Test Structured Data

Use Google's Rich Results Test:

1. Go to [Rich Results Test](https://search.google.com/test/rich-results)
2. Test these pages:
   - **Homepage**: https://bexyflowers.shop/
     - Should show: Organization, WebSite, LocalBusiness schemas
   - **Product Page**: https://bexyflowers.shop/product/[product-id]
     - Should show: Product, Breadcrumb schemas
   - **Collection**: https://bexyflowers.shop/collection
     - Should show: CollectionPage, Breadcrumb schemas
   - **Guides**: https://bexyflowers.shop/guides
     - Should show: FAQPage, Breadcrumb schemas

3. Fix any errors shown in red
4. Warnings (yellow) are optional but recommended to fix

### Alternative: Schema Markup Validator

Use [Schema.org Validator](https://validator.schema.org/):
- Paste full page URL
- Check for validation errors
- Ensure all required properties are present

---

## 📊 Core Web Vitals Monitoring

### PageSpeed Insights

1. Go to [PageSpeed Insights](https://pagespeed.web.dev/)
2. Test these pages:
   - Homepage: https://bexyflowers.shop/
   - Collection: https://bexyflowers.shop/collection
   - Product page: https://bexyflowers.shop/product/[any-product]

**Target Metrics:**
- ✅ **LCP (Largest Contentful Paint)**: < 2.5s
- ✅ **CLS (Cumulative Layout Shift)**: < 0.1
- ✅ **INP (Interaction to Next Paint)**: < 200ms
- ✅ **FCP (First Contentful Paint)**: < 1.8s

### Lighthouse (Chrome DevTools)

1. Open Chrome DevTools (F12)
2. Go to **Lighthouse** tab
3. Select:
   - ✅ Performance
   - ✅ SEO
   - ✅ Best Practices
   - ✅ Accessibility
4. Click "Analyze page load"
5. Aim for 90+ scores on all metrics

**Key Checks:**
- Meta description present
- Document has a title
- Links are crawlable
- Images have alt attributes
- Proper heading hierarchy
- Valid robots.txt

---

## 🔗 Canonical URL Verification

### Check Canonical Tags

Use this bookmarklet or browser extension:
```javascript
javascript:(function(){alert('Canonical: '+document.querySelector('link[rel=canonical]')?.href)})()
```

**Verify:**
- Every page has exactly ONE canonical tag
- Canonical points to the correct URL (no trailing slash inconsistencies)
- HTTPS is used (not HTTP)
- No www if site is non-www (or vice versa)

### Test Redirects

```bash
# Test www → non-www redirect
curl -I https://www.bexyflowers.shop/

# Should return 301 redirect to https://bexyflowers.shop/

# Test HTTP → HTTPS redirect
curl -I http://bexyflowers.shop/

# Should return 301 redirect to https://bexyflowers.shop/
```

---

## 📈 Google Analytics Setup (Optional but Recommended)

### Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create new GA4 property
3. Get Measurement ID (format: G-XXXXXXXXXX)

### Step 2: Add to Site

**Option A: Google Tag Manager (Recommended)**
1. Create GTM account
2. Add GTM container to `index.html`:
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->
```

**Option B: Direct GA4 Script**
Add to `index.html` (after `<head>`):
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

⚠️ **Performance Note**: Use GTM with async loading to avoid blocking page load.

---

## 🛠️ Ongoing Monitoring

### Weekly Tasks

1. **Check Search Console**
   - Coverage issues
   - Mobile usability errors
   - Core Web Vitals report
   - Manual actions

2. **Monitor Rankings**
   - Use tools like:
     - Google Search Console (Performance tab)
     - Ahrefs / SEMrush (paid)
     - Ubersuggest (free tier)

3. **Check Indexing Status**
   - Search: `site:bexyflowers.shop`
   - Should show all main pages
   - Check for unexpected pages

### Monthly Tasks

1. **Update Sitemaps**
   - Re-run: `npm run generate:sitemap`
   - Deploy updated sitemaps
   - Resubmit in Search Console

2. **Content Audit**
   - Add new products → regenerate sitemap
   - Update meta descriptions for seasonal campaigns
   - Add FAQ content for new queries

3. **Backlink Check**
   - Monitor referring domains
   - Disavow spammy links if needed

---

## 🚨 Common Issues & Fixes

### Issue: Pages Not Indexing

**Diagnosis:**
```bash
# Check if Googlebot can access
curl -A "Googlebot" https://bexyflowers.shop/collection
```

**Fixes:**
1. Check robots.txt isn't blocking
2. Verify no `noindex` meta tag
3. Check for JavaScript rendering issues
4. Request indexing in Search Console

### Issue: Duplicate Content

**Diagnosis:**
- Search: `site:bexyflowers.shop "exact page title"`
- Check for multiple URLs with same content

**Fixes:**
1. Add canonical tags
2. Use 301 redirects for duplicates
3. Add `noindex` to non-canonical versions

### Issue: Low Core Web Vitals Score

**Diagnosis:**
- Run PageSpeed Insights
- Check specific failing metric

**Fixes:**
- **LCP**: Optimize images, preload hero image, use CDN
- **CLS**: Add width/height to images, reserve space for ads
- **INP**: Reduce JavaScript, defer non-critical scripts

### Issue: Schema Errors

**Diagnosis:**
- Use Rich Results Test
- Check browser console for JSON-LD errors

**Fixes:**
1. Validate JSON-LD syntax
2. Ensure required properties are present
3. Use correct schema types
4. Test with Schema.org validator

---

## 📱 Mobile SEO Verification

### Mobile-Friendly Test

1. Go to [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
2. Enter: https://bexyflowers.shop/
3. Verify "Page is mobile-friendly"

### Mobile Usability in Search Console

1. Go to Search Console → Mobile Usability
2. Check for errors:
   - Text too small
   - Clickable elements too close
   - Content wider than screen
   - Viewport not set

---

## 🎯 Target Keywords & Tracking

### Primary Keywords (Lebanon Market)

1. **flowers lebanon** - Homepage
2. **luxury florist lebanon** - Homepage
3. **wedding flowers beirut** - Wedding page
4. **custom bouquet lebanon** - Customize page
5. **eternal flowers lebanon** - Collection page
6. **premium flower delivery lebanon** - Collection page
7. **sidon florist** - About page

### Track Rankings

Use Google Search Console → Performance:
- Filter by query
- Monitor impressions, clicks, CTR, position
- Identify opportunities (high impressions, low CTR)

---

## ✅ Final Verification Checklist

Before considering SEO complete, verify:

- [ ] All pages have unique title tags (50-60 chars)
- [ ] All pages have unique meta descriptions (140-160 chars)
- [ ] All pages have canonical tags
- [ ] Robots.txt is accessible and correct
- [ ] Sitemap.xml is accessible and submitted
- [ ] Schema markup validates without errors
- [ ] Core Web Vitals pass (green in PageSpeed)
- [ ] Mobile-friendly test passes
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] www redirects to non-www (or vice versa)
- [ ] 404 page exists and is helpful
- [ ] Images have alt text
- [ ] Internal links work (no 404s)
- [ ] Google Search Console verified
- [ ] At least 5 key pages requested for indexing

---

## 📞 Support & Resources

### Google Resources
- [Search Console Help](https://support.google.com/webmasters)
- [SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Schema.org Documentation](https://schema.org/)

### Testing Tools
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Monitoring Tools
- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics](https://analytics.google.com/)
- [Ahrefs](https://ahrefs.com/) (paid)
- [SEMrush](https://www.semrush.com/) (paid)

---

**Last Updated**: February 2026  
**Site**: Bexy Flowers (https://bexyflowers.shop)  
**Implementation**: Google-grade SEO with structured data, Core Web Vitals optimization, and comprehensive monitoring
