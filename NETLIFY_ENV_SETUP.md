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

```
NEXT_PUBLIC_SITE_URL=https://bexyflowers.shop

NEXT_PUBLIC_SUPABASE_URL=https://rkjvoeppgkgmcxzyujwk.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJranZvZXBwZ2tnbWN4enl1andrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTE0MDMsImV4cCI6MjA4MTI4NzQwM30.i55WE8DkrRuNlUY2waXSI4oUmC-Pq4qTgJSXKEb6ink

NEXT_PUBLIC_FRONTEND_API_KEY=3917ebb25926c80e01308e15eda771ed0d707c38ca4019c771b25c2391ba4a9e

NEXT_PUBLIC_FRONTEND_API_SECRET=3917ebb25926c80e01308e15eda771ed0d707c38ca4019c771b25c2391ba4a9e

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
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJranZvZXBwZ2tnbWN4enl1andrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTcxMTQwMywiZXhwIjoyMDgxMjg3NDAzfQ.CPkxCEvWFkPzQptf5eOVXaE8gBYoPMLtbwpdpNv3Bdc

FRONTEND_API_SECRET=3917ebb25926c80e01308e15eda771ed0d707c38ca4019c771b25c2391ba4a9e

POLLINATIONS_SECRET_KEY=sk_VmbyD8Bc3zB0qMWo70KrJZSWAtdEB8vC

POLLINATIONS_SECRET_KEY2=sk_D1cf03qRHIMMNoF270JlIi3oXyEJQ7eY
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
