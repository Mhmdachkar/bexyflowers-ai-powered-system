# Netlify Environment Variables Setup

## ⚠️ CRITICAL: Update Environment Variables in Netlify

Your Netlify build is failing because it has the old Vite environment variable names (`VITE_*`) but Next.js requires `NEXT_PUBLIC_*` prefixed variables for client-side access.

## Steps to Fix

### 1. Go to Netlify Dashboard
1. Log in to [Netlify](https://app.netlify.com)
2. Select your **bexyflowers** site
3. Go to **Site settings** → **Environment variables**

### 2. Add These Required Environment Variables

Copy and paste each of these into Netlify's environment variables section:

#### Public Variables (NEXT_PUBLIC_* - accessible in browser)

**Use the same values from your `.env` file.** Replace placeholders with your actual values:

```
NEXT_PUBLIC_SITE_URL=https://bexyflowers.shop

NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

NEXT_PUBLIC_FRONTEND_API_KEY=your-frontend-api-key

NEXT_PUBLIC_FRONTEND_API_SECRET=your-frontend-api-secret

NEXT_PUBLIC_ADMIN_USERNAME=admin

NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-password

NEXT_PUBLIC_ADMIN_DISPLAY_NAME=Administrator

NEXT_PUBLIC_ADMIN2_USERNAME=admin2

NEXT_PUBLIC_ADMIN2_PASSWORD=your-secure-password-2

NEXT_PUBLIC_ADMIN2_DISPLAY_NAME=Admin2

NEXT_PUBLIC_USE_NETLIFY_FUNCTIONS=true
```

#### Server-Only Variables (NOT accessible in browser)

```
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

FRONTEND_API_SECRET=your-frontend-api-secret

POLLINATIONS_SECRET_KEY=your-pollinations-secret-key

POLLINATIONS_SECRET_KEY2=your-pollinations-secret-key-2
```

### 3. Optional: Remove Old VITE_* Variables

These are no longer needed and can be removed:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_FRONTEND_API_KEY`
- `VITE_FRONTEND_API_SECRET`
- `VITE_SITE_URL`

### 4. Trigger a New Deploy

After adding the environment variables:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**

OR

Simply push a new commit (the one we just made fixing the error message will trigger a redeploy automatically).

## What Changed?

### Vite → Next.js Environment Variable Migration

| Old (Vite)                    | New (Next.js)                          |
|-------------------------------|----------------------------------------|
| `VITE_SUPABASE_URL`           | `NEXT_PUBLIC_SUPABASE_URL`             |
| `VITE_SUPABASE_ANON_KEY`      | `NEXT_PUBLIC_SUPABASE_ANON_KEY`        |
| `VITE_FRONTEND_API_KEY`       | `NEXT_PUBLIC_FRONTEND_API_KEY`         |
| `VITE_FRONTEND_API_SECRET`    | `NEXT_PUBLIC_FRONTEND_API_SECRET`      |
| `VITE_SITE_URL`               | `NEXT_PUBLIC_SITE_URL`                 |

**Why?** 
- Vite uses `import.meta.env.VITE_*` for client-side variables
- Next.js uses `process.env.NEXT_PUBLIC_*` for client-side variables
- Variables without `NEXT_PUBLIC_` prefix are server-only in Next.js

## Verification

After the deploy succeeds, you should see:
- ✅ Build completes successfully
- ✅ All pages render (home, about, collection, product details, etc.)
- ✅ Database API works (products load from Supabase)
- ✅ Image generation works (AI bouquet customization)

## Need Help?

If the build still fails after adding these variables:
1. Check the Netlify deploy logs for any new error messages
2. Verify all variable names are spelled correctly (case-sensitive!)
3. Ensure there are no extra spaces in the values
4. Try clearing cache and redeploying: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**
