# Bexy Flowers – Scalability & Launch Readiness Audit

> **Report Type**: Codebase scan and readiness assessment  
> **Date**: January 2026  
> **Scope**: Full codebase – no code changes, documentation only  
> **Platform**: React (Vite) + Netlify + Supabase

---

## Executive Summary

| Category | Status | Risk | Notes |
|----------|--------|------|-------|
| **Launch Readiness** | ✅ Ready | Low | Critical optimizations applied; monitor post-launch |
| **Database & Queries** | ✅ Optimized | Low | Pagination fixed, N+1 eliminated |
| **Data Fetching** | ✅ Optimized | Low | Deferred DB, React Query tuned |
| **Client Performance** | ✅ Strong | Low | Memoization, lazy loading, code splitting |
| **Mobile Performance** | ✅ Addressed | Low | Scroll fix, animations disabled, layout fixes |
| **Rate Limiting** | ⚠️ Partial | Medium | In-memory; Redis recommended for scale |
| **Monitoring** | ⚠️ Gaps | Medium | No Sentry/APM; rely on Netlify/Supabase |
| **Hosting Limits** | ⚠️ Review | Medium | Netlify free tier; upgrade for spike traffic |

**Bottom line:** The site is ready for launch. Main strengths are query optimization, deferred DB for new visitors, and client-side performance. Plan to add Redis for rate limiting and monitoring before or shortly after a high-traffic event.

---

## 1. Architecture Overview

### Stack
- **Frontend**: React 18, Vite, React Query, Tailwind, Framer Motion, GSAP, Swiper
- **Backend**: Netlify Functions (database proxy, image generation, email/SMS)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Netlify (SPA, CDN, serverless)

### Data Flow
1. **Products / collection / signature** → Supabase from client (no Netlify)
2. **Cart / favorites / visitors** → Netlify `/database` → Supabase
3. **Image generation** → Netlify `/generate-image` → Pollinations API

---

## 2. Scalability – Implemented Optimizations

### 2.1 Database & Queries
- ✅ **Pagination**: Offset implemented in `database.ts` and `collection-products-paginated.ts`
- ✅ **N+1 reduction**: `getLuxuryBoxWithDetails` uses a single join instead of 3 serial calls
- ✅ **Circuit breaker**: 60s cooldown after DB errors in cart/favorites
- ⚠️ **SELECT ***: Many APIs still use `select('*')` (flowers, accessories, eternal-flowers, luxury-boxes, collection-products) – extra bytes, no functional issue

### 2.2 Data Fetching & API Calls
- ✅ **Deferred DB for new visitors**: Cart/Favorites skip DB when `localStorage` is empty
- ✅ **Signature collection**: `staleTime: 2min`, `refetchOnWindowFocus: false`
- ✅ **No redundant refetch**: Manual `refetch()` removed from UltraFeaturedBouquets
- ✅ **Prefetch disabled on mobile**: Navigation predictor, component prefetch, performance monitor disabled on mobile

### 2.3 Client Performance
- ✅ **Context memoization**: Cart and Favorites contexts use `useMemo`
- ✅ **Lazy loading**: Product images use `loading="lazy"`
- ✅ **Code splitting**: Manual chunks for react, query, ui, swiper, three, gsap, recharts
- ✅ **Production minification**: Terser with `drop_console: true`
- ✅ **`useIsMobile`**: Initialized from viewport to avoid layout shift

### 2.4 Mobile Performance
- ✅ **Infinite GSAP animations disabled on mobile** (UltraCategories)
- ✅ **Hero scroll lock fixed**: `pointer-events: none` on video, Swiper `touchStartPreventDefault: false`
- ✅ **Font loading**: Lato moved to `index.html`, non-blocking

### 2.5 Memory & Backend
- ✅ **Nonce store**: Periodic cleanup instead of O(n) on every request
- ✅ **Image generation**: 60s timeout for generate-image; secondary API key fallback

---

## 3. Remaining Considerations

### 3.1 Rate Limiting (Medium)
- **Database function**: Uses `checkDistributedRateLimit`; falls back to in-memory when Redis is not configured
- **Generate-image**: In-memory store per instance
- **Impact**: Under horizontal scaling, limits are per instance, not global
- **Recommendation**: Configure Upstash Redis (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)

### 3.2 Duplicate ensureVisitor (Low)
- Cart and Favorites each call `ensureVisitor()` on load
- Same visitor can trigger 2 RPC/DB calls
- **Recommendation**: Share visitor creation between cart and favorites (e.g. single session-wide call)

### 3.3 Netlify Function Limits
- **Free tier**: ~125K invocations/month; 10s timeout
- **Pro/Enterprise**: Higher limits; 26–60s timeout for generate-image
- **Recommendation**: Match plan to expected traffic; generate-image needs Pro+ for 60s timeout

### 3.4 Supabase Direct Usage
- Collection and signature use client Supabase
- Supabase enforces its own limits (e.g. 500 req/s PostgREST on free tier)
- **Recommendation**: Monitor connections and 429s; upgrade plan if needed

### 3.5 Monitoring & Observability
- No Sentry or APM
- Netlify dashboard and Supabase logs only
- **Recommendation**: Add Sentry (or similar) and uptime monitoring (e.g. Pingdom, UptimeRobot)

### 3.6 Database Indexes
- No schema file in repo; indexes inferred from queries
- **Recommendation**: Add indexes for `collection_products` (category, featured, is_active, created_at), `visitor_carts` (product_id), `box_colors` / `box_sizes` (box_id) – per `docs/SCALABILITY_ENHANCEMENTS.md`

---

## 4. Traffic Capacity (Estimated)

| Visitors/hour | DB function calls (est.) | Risk | Notes |
|---------------|--------------------------|------|-------|
| 100 | ~50–100 | ✅ Low | Mostly passive browsing |
| 500 | ~150–250 | ✅ Low | Deferred DB, fewer calls |
| 2,000 | ~500–1,000 | ⚠️ Medium | Watch Netlify limits |
| 10,000 | ~2,500–5,000 | ⚠️ Medium | Upgrade Netlify; Redis recommended |

Assumptions: ~80–90% passive visitors (no cart/favorites); 20% active users triggering DB calls.

---

## 5. Pre-Launch Checklist

### Completed
- [x] Pagination fixed
- [x] N+1 queries reduced
- [x] Context memoization
- [x] Lazy image loading
- [x] Nonce store optimization
- [x] Deferred DB for new visitors
- [x] Mobile scroll fix
- [x] GSAP animations disabled on mobile
- [x] `useIsMobile` layout fix
- [x] SEO (meta tags, sitemap, robots, schema)

### Recommended Before Launch
- [ ] Configure Upstash Redis for rate limiting
- [ ] Verify Netlify plan vs expected traffic
- [ ] Review Supabase plan and limits
- [ ] Add error tracking (e.g. Sentry)
- [ ] Set up uptime monitoring
- [ ] Run load test (e.g. 500+ concurrent users)

### Post-Launch
- [ ] Monitor function execution and error rates
- [ ] Watch Supabase connections and API usage
- [ ] Track Core Web Vitals
- [ ] Add DB indexes if slow queries appear

---

## 6. Key Files Reference

| Area | Files |
|------|-------|
| **Database proxy** | `netlify/functions/database.ts` |
| **Database client** | `src/lib/api/database-client.ts` |
| **Cart/Favorites** | `src/contexts/CartContext.tsx`, `FavoritesContext.tsx` |
| **Visitor API** | `src/lib/api/visitor-cart.ts`, `visitor-favorites.ts` |
| **Rate limiting** | `netlify/functions/utils/rateLimiter.ts` |
| **Image generation** | `netlify/functions/generate-image.ts` |
| **React Query** | `src/App.tsx` (global config), `useSignatureCollection.ts`, `useCollectionProducts.ts` |
| **Mobile/scroll** | `src/components/CarouselHero.tsx`, `CarouselHero.css` |
| **Build** | `vite.config.ts`, `netlify.toml` |

---

## 7. Related Documentation

- **`docs/LAUNCH_TRAFFIC_AUDIT.md`** – Traffic scenarios and emergency steps
- **`docs/SCALABILITY_ENHANCEMENTS.md`** – Technical changes and performance notes
- **`PRODUCTION_READY_SUMMARY.md`** – Summary of fixes and deployment notes
- **`MOBILE_PERFORMANCE_FIXES.md`** – Mobile optimization details
- **`docs/SEO_GUIDE.md`** – SEO implementation

---

## 8. Emergency Procedures

**If the site degrades under high traffic:**

1. **Immediate**
   - Check Netlify Functions usage and errors
   - Check Supabase status and limits
   - Consider disabling cart/favorites DB sync (localStorage-only fallback)
   - Communicate to users that cart may not persist across devices

2. **Short-term**
   - Enable Upstash Redis for distributed rate limiting
   - Temporarily disable AI image generation if overloaded
   - Scale up Netlify and Supabase plans

3. **Long-term**
   - Add server-side caching for heavy reads
   - Add CDN for Supabase images
   - Optimize or add indexes based on slow-query logs

---

## 9. Conclusion

The Bexy Flowers platform is **ready for launch** from a scalability and performance standpoint. Critical improvements are in place for database usage, data fetching, client performance, and mobile behavior. The main follow-ups are Redis for rate limiting, monitoring, and plan upgrades if traffic exceeds current estimates.

---

*This audit is based on a codebase scan and existing documentation. No code changes were made.*
