# Senior Tester Codebase Audit Report

**Project:** Bexy Flowers - Next.js Migration  
**Date:** February 2025  
**Scope:** Full codebase scan for critical issues, security, compatibility, and production readiness

---

## Executive Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 3 | Requires immediate fix |
| 🟠 High | 2 | Should fix before production |
| 🟡 Medium | 4 | Address in next sprint |
| 🟢 Low | 3 | Minor / documentation |

---

## 🔴 CRITICAL ISSUES

### 1. Database API Response Format Mismatch

**Location:** `app/api/database/route.ts` (line 185) vs `src/lib/api/database-client.ts` (lines 81-87)

**Issue:**  
- **database-client** expects: `{ success: true, data: result }`  
- **Next.js API route** returns: `result` (raw data only)

**Impact:** When using Next.js API routes, the database client will:
1. Parse `result` as the response
2. Access `result.success` → `undefined`
3. Throw `"Database operation failed"` even on successful queries
4. **All database operations (collection products, cart sync, favorites sync) will fail**

**Fix Required:**
```javascript
// app/api/database/route.ts - Change line 185 from:
return NextResponse.json(result);
// To:
return NextResponse.json({ success: true, data: result });
```

---

### 2. Database Client Uses Wrong Endpoint for Next.js

**Location:** `src/lib/api/database-client.ts` (line 11)

**Issue:**  
- Hardcoded: `const API_ENDPOINT = '/.netlify/functions/database'`
- When running Next.js standalone (Vercel, Node, etc.), Netlify functions return 404
- Database operations fail → Cart/Favorites fall back to localStorage only
- Collection products fail to load from database

**Impact:** Database connectivity broken when deployed to non-Netlify platforms.

**Fix Required:** Use Next.js API route when Netlify functions are disabled:
```javascript
const useNetlify = process.env.NEXT_PUBLIC_USE_NETLIFY_FUNCTIONS === 'true';
const API_ENDPOINT = useNetlify ? '/.netlify/functions/database' : '/api/database';
```

---

### 3. Image Generation Endpoint Hardcoded to Netlify

**Location:** `src/lib/api/aiConfig.ts` (line 64)

**Issue:**  
- `serverlessEndpoint: '/.netlify/functions/generate-image'`
- Next.js has `/api/generate-image` route but it's never used
- AI image generation fails when not deployed on Netlify

**Impact:** Custom bouquet designer (AI feature) will not work on Vercel/other platforms.

**Fix Required:** Support both endpoints:
```javascript
serverlessEndpoint: process.env.NEXT_PUBLIC_USE_NETLIFY_FUNCTIONS === 'true' 
  ? '/.netlify/functions/generate-image' 
  : '/api/generate-image',
```

**Note:** Verify Next.js `/api/generate-image` returns the same response format (base64/data URL or image URL) expected by `imageGeneration.ts`.

---

## 🟠 HIGH PRIORITY ISSUES

### 4. createPortal + document.body Without SSR Guard (WeddingAndEvents)

**Location:** `src/views/WeddingAndEvents.tsx` (lines 852, 1526)

**Issue:**  
- `createPortal(modalContent, document.body)` called directly
- During SSR or initial hydration, `document` may be undefined
- Can cause: `ReferenceError: document is not defined`

**Impact:** Wedding page may crash on server-side render or hydration.

**Fix Required:** Add guard before portal:
```javascript
if (typeof document === 'undefined') return null;
return createPortal(modalContent, document.body);
```

---

### 5. Request Signing Secret Mismatch

**Location:** `src/lib/api/requestSigning.ts` (line 72) vs `.env.example`

**Issue:**  
- Code uses: `process.env.NEXT_PUBLIC_FRONTEND_API_SECRET`
- `.env.example` documents: `FRONTEND_API_SECRET` (server-only)
- Server-only vars are NOT available in client-side code
- Result: `secret` is always `undefined`, signing disabled, warning logged

**Impact:** Request signing (HMAC) does not work. Replay attacks possible if server doesn't enforce signing. Depends on server implementation.

**Recommendation:**  
- If signing is required: Add `NEXT_PUBLIC_FRONTEND_API_SECRET` for client-side signing (less secure - secret exposed to browser)
- Preferred: Move signing to server-side API route; client sends unsigned payload
- Update error message: change "VITE_FRONTEND_API_SECRET" to "NEXT_PUBLIC_FRONTEND_API_SECRET" in console.warn (line 76)

---

## 🟡 MEDIUM PRIORITY ISSUES

### 6. Outdated Error Messages (VITE_* References)

**Locations:**  
- `src/lib/supabase.ts` (line 7): "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
- `src/lib/api/requestSigning.ts` (line 76): "VITE_FRONTEND_API_SECRET not set"
- `src/lib/seo.ts` (line 3): Comment "Set VITE_SITE_URL"

**Impact:** Confusing for developers; no functional impact.

**Fix:** Update to NEXT_PUBLIC_* variable names in messages and comments.

---

### 7. Admin Credentials Exposed to Client

**Location:** `src/views/admin/AdminLogin.tsx`, `.env.example`

**Issue:**  
- `NEXT_PUBLIC_ADMIN_USERNAME`, `NEXT_PUBLIC_ADMIN_PASSWORD` are in client bundle
- Visible in browser DevTools and source
- Documentation notes: "will be migrated to server-side auth"

**Impact:** Anyone can extract admin credentials from bundled JS. High risk if production uses real passwords.

**Recommendation:** Migrate to server-side auth (e.g. NextAuth, session-based login) before production.

---

### 8. innerHTML Usage (Low XSS Risk)

**Locations:**  
- `src/components/bouquet/FlowerSelector.tsx` (line 160)
- `src/components/bouquet/PremiumFlowerSelector.tsx` (line 193)
- `src/components/bouquet/PreDesignedBouquets.tsx` (line 88)
- `src/components/bouquet/SummaryPanel.tsx` (line 77)
- `src/components/bouquet/Premium2DBouquetCanvas.tsx` (line 187)

**Issue:** `fallback.innerHTML = '<div class="...">🌸</div>'` — static strings, no user input.

**Impact:** Very low XSS risk with current implementation. Risk increases if user-controlled data is ever inserted.

**Recommendation:** Prefer `ReactDOM.createRoot` or `createElement` for dynamic content. If keeping innerHTML, add eslint-disable with comment documenting the safety.

---

### 9. Asset Path with Space in Filename

**Location:** `src/components/UltraOurStory.tsx` (line 20)

**Issue:**  
- `import whoWeAreImage from '@/assets/who we-are-bexy-flowers.jpeg'`
- Space in filename can cause issues on some build systems and CDNs

**Recommendation:** Rename file to `who-we-are-bexy-flowers.jpeg` and update import.

---

## 🟢 LOW PRIORITY / INFORMATIONAL

### 10. Netlify Function Endpoints in Admin

**Location:** `src/views/admin/AdminClients.tsx` (lines 413, 461)

**Issue:** Hardcoded `/.netlify/functions/bulk-email` and `/.netlify/functions/bulk-sms`

**Impact:** Bulk email/SMS features will 404 when not on Netlify. Consider Next.js API routes for these if needed on other platforms.

---

### 11. Service Worker Path

**Location:** `src/lib/serviceWorkerRegistration.ts` (line 7)

**Issue:** `const swUrl = \`${'/sw.js'}\`;` — was `import.meta.env.BASE_URL + 'sw.js'`

**Status:** Fixed for Next.js (base URL is '/'). Verify `public/sw.js` exists and is served correctly.

---

### 12. dangerouslySetInnerHTML for JSON-LD

**Locations:** `app/page.tsx`, `app/collection/page.tsx`, `app/product/[id]/page.tsx`, `src/components/SEO.tsx`

**Issue:** Used for JSON-LD structured data: `dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}`

**Status:** ✅ Safe — `JSON.stringify` escapes output. Standard pattern for schema.org markup. No fix needed.

---

## Security Architecture Verification

| Layer | Status | Notes |
|-------|--------|------|
| API Key (X-API-Key) | ✅ | Used in database-client, imageGeneration |
| Request Signing (HMAC) | ⚠️ | Code present; secret likely undefined |
| Backend Proxy | ✅ | Database never exposed directly |
| CORS | ✅ | OPTIONS handlers in API routes |
| Input Validation | ✅ | API routes validate required fields |
| Error Sanitization | ✅ | No internal details exposed to client |

---

## Compatibility Verification

| Feature | Status | Notes |
|---------|--------|------|
| react-router-dom | ✅ | All migrated to navigation-compat |
| import.meta.env | ✅ | All migrated to process.env |
| Vite asset imports (?url) | ✅ | Videos moved to public/ |
| document/window in SSR | ⚠️ | WeddingAndEvents needs guard |
| fetchpriority | ✅ | Fixed to fetchPriority |

---

## Recommended Fix Order

1. **Immediate:** Fix database API response format (#1)
2. **Immediate:** Add endpoint switching for database-client (#2)
3. **Immediate:** Add endpoint switching for image generation (#3)
4. **Before production:** Add document guard in WeddingAndEvents (#4)
5. **Before production:** Resolve request signing / secret strategy (#5)
6. **Next sprint:** Update error messages, asset filename, admin auth (#6, #7, #9)

---

## Test Coverage Recommendations

- [ ] E2E: Database operations with Next.js API route
- [ ] E2E: AI image generation with Next.js API route  
- [ ] Unit: database-client with mocked fetch (both response formats)
- [ ] E2E: Wedding page load and modal open (SSR/hydration)
- [ ] Security: Verify API key validation in production mode
- [ ] Cross-platform: Deploy to Vercel and verify full flow

---

## Conclusion

The codebase is well-structured with solid security layers. **Three critical issues** prevent database and AI features from working correctly when using Next.js API routes instead of Netlify Functions. Fixing items #1, #2, and #3 will restore full functionality for Next.js deployment on any platform. Items #4 and #5 should be addressed before production deployment.
