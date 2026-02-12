# Step-by-Step: Google Search Console & SEO for bexyflowers.shop

Follow these steps in order.

---

## Step 1: Google Search Console – Add Your Property

You’re on the “Welcome to Google Search Console” screen. Do this:

### 1A. Choose **URL prefix** (recommended)

Use **URL prefix** because:
- You only need `https://bexyflowers.shop`
- Verification is simpler (no DNS setup)
- It’s enough for a single-site setup

### 1B. Enter your URL

In the **“Enter URL”** field:
```
https://bexyflowers.shop
```

- Include `https://`
- No trailing slash
- No `www` unless that’s your real URL

### 1C. Click **CONTINUE**

---

## Step 2: Verify Ownership

Google will offer several verification methods.

### Recommended: HTML tag

1. Select **“HTML tag”**
2. You’ll see a meta tag like:
   ```html
   <meta name="google-site-verification" content="XXXXX" />
   ```
3. Copy the `content="..."` value
4. Tell me the value and I’ll add it to your `index.html`
   - Or add it yourself in `index.html` inside `<head>`, before `</head>`

### Alternative: HTML file upload

1. Download the file (e.g. `google1234abcd.html`)
2. Put it in `public/`
3. Redeploy
4. Click **Verify**

---

## Step 3: Submit Your Sitemap

After verification:

1. In the left sidebar, go to **Sitemaps**
2. In **“Add a new sitemap”**, enter:
   ```
   sitemap.xml
   ```
3. Click **Submit**
4. After a few minutes, status should change to **“Success”**

Your sitemap URL is: `https://bexyflowers.shop/sitemap.xml`

---

## Step 4: Request Indexing for Main Pages

1. At the top, use the **URL Inspection** search bar
2. Enter: `https://bexyflowers.shop`
3. Click the search icon
4. Click **“Request indexing”** (if available)
5. Repeat for:
   - `https://bexyflowers.shop/collection`
   - `https://bexyflowers.shop/about`
   - `https://bexyflowers.shop/customize`
   - `https://bexyflowers.shop/wedding-and-events`

---

## Step 5: Validate JSON-LD

1. Open [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Enter: `https://bexyflowers.shop`
3. Click **Test URL**
4. Confirm **Organization** and **WebSite** are detected
5. Test a product page, e.g. `https://bexyflowers.shop/product/[any-product-id]`
6. Confirm **Product** schema is detected

---

## Step 6: Check Social Preview (OG / Twitter)

### Facebook / LinkedIn

1. Go to [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Enter: `https://bexyflowers.shop`
3. Click **Debug**
4. If needed, click **Scrape Again** to refresh the cache

### Twitter

1. Go to [Twitter Card Validator](https://cards-dev.twitter.com/validator)
2. Enter: `https://bexyflowers.shop`
3. Click **Preview card**

---

## Step 7: Bing Webmaster Tools (Optional)

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Sign in with Microsoft
3. Click **Add a site**
4. Enter: `https://bexyflowers.shop`
5. Verify (e.g. HTML tag or sitemap)
6. Submit sitemap: `https://bexyflowers.shop/sitemap.xml`

---

## Quick Checklist

- [ ] **Step 1:** Add property – URL prefix: `https://bexyflowers.shop`
- [ ] **Step 2:** Verify ownership (HTML tag or file)
- [ ] **Step 3:** Submit sitemap `sitemap.xml`
- [ ] **Step 4:** Request indexing for main pages
- [ ] **Step 5:** Validate JSON-LD
- [ ] **Step 6:** Check Facebook & Twitter previews
- [ ] **Step 7:** Add site to Bing (optional)
