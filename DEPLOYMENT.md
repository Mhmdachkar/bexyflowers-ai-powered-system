# Next.js Build & Deployment Configuration

## Vercel (Recommended)

Vercel is the platform built by the creators of Next.js and offers the best performance and DX.

### Setup

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login and link project:
   ```bash
   vercel login
   vercel link
   ```

3. Set environment variables:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   # ... add all other env vars
   ```

4. Deploy:
   ```bash
   vercel --prod
   ```

### Automatic Deployments

Push to `main` branch for automatic production deployments.

---

## Netlify (Alternative)

Netlify also supports Next.js with the `@netlify/plugin-nextjs` plugin.

### Setup

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Update `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

3. Set environment variables in Netlify UI:
   - Site Settings → Environment Variables
   - Add all `NEXT_PUBLIC_*` and server-only variables

4. Deploy:
   ```bash
   netlify deploy --prod
   ```

---

## Build Configuration

### Next.js Build Output

Next.js produces:
- `.next/` directory with optimized bundles
- Server-side and client-side code separated
- Automatic code splitting and lazy loading
- Image optimization via `next/image`

### Build Commands

```bash
# Development
npm run dev              # Start dev server on port 8080

# Production build
npm run build            # Build for production
npm start                # Start production server

# Old Vite commands (preserved for reference)
npm run dev:vite         # Start old Vite dev server
npm run build:vite       # Build with Vite
```

---

## Performance Optimizations

### Already Implemented

✅ Image optimization with `next/image`
✅ Automatic code splitting
✅ Server-side rendering for SEO
✅ Static generation for static pages
✅ API routes for serverless functions
✅ Font optimization with `next/font`
✅ Critical CSS extraction
✅ Lazy loading with dynamic imports

### Recommended Next Steps

- [ ] Enable ISR (Incremental Static Regeneration) for product pages
- [ ] Add Redis caching for API routes
- [ ] Implement CDN caching strategy
- [ ] Add service worker for offline support (PWA)
- [ ] Enable compression in production
- [ ] Add monitoring (Sentry, LogRocket, etc.)

---

## Environment Variables

Required for deployment:

**Public (NEXT_PUBLIC_*)**
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_FRONTEND_API_KEY`
- `NEXT_PUBLIC_ADMIN_USERNAME`
- `NEXT_PUBLIC_ADMIN_PASSWORD`
- `NEXT_PUBLIC_ADMIN_DISPLAY_NAME`

**Server-only**
- `SUPABASE_SERVICE_ROLE_KEY`
- `FRONTEND_API_SECRET`

See `ENV_MIGRATION.md` for full details.

---

## Monitoring Build Performance

### Build Analytics

```bash
# Analyze bundle size
npm run build

# Check build output in terminal for:
# - Page sizes
# - First Load JS
# - Shared chunks
```

### Runtime Performance

Next.js provides built-in analytics on Vercel:
- Web Vitals (LCP, FID, CLS)
- Real User Monitoring
- Edge Network performance

---

## Troubleshooting

### Build Errors

1. **Module not found**
   - Check `tsconfig.json` paths
   - Ensure all imports use `@/` alias correctly

2. **Environment variables undefined**
   - Verify `.env.local` exists
   - Check variable names have `NEXT_PUBLIC_` prefix if needed in browser

3. **Image optimization errors**
   - Ensure remote image domains are in `next.config.mjs`
   - Check image URLs are properly encoded

### Runtime Errors

1. **Hydration mismatch**
   - Check for differences between server and client rendering
   - Use `suppressHydrationWarning` for `<html>` tag if needed

2. **API route errors**
   - Check environment variables are set on server
   - Verify Supabase credentials are correct

---

## Rollback Plan

If Next.js migration has issues:

1. Keep Vite build commands:
   ```bash
   npm run dev:vite
   npm run build:vite
   ```

2. Vite files are preserved:
   - `vite.config.ts`
   - `index.html`
   - Original routing with React Router

3. To switch back, update `package.json` scripts to use Vite commands as default

---

## Support

- Next.js Docs: https://nextjs.org/docs
- Vercel Support: https://vercel.com/support
- Netlify Next.js: https://docs.netlify.com/frameworks/next-js/
