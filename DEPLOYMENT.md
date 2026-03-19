# 🚀 Deployment Guide

This guide will help you deploy BexyFlowers to production.

---

## Prerequisites

Before deploying, ensure you have:

- ✅ [Netlify account](https://netlify.com) (recommended) or [Vercel account](https://vercel.com)
- ✅ [Supabase project](https://supabase.com) with database set up
- ✅ [pollinations.ai API key](https://enter.pollinations.ai) (sign up with GitHub)
- ✅ GitHub repository with your code

---

## Option 1: Deploy to Netlify (Recommended)

### Step 1: Connect GitHub Repository

1. Go to [netlify.com](https://netlify.com) and log in
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and select your repository
4. Configure build settings:

```
Build command: npm run build
Publish directory: dist
```

### Step 2: Set Environment Variables

In Netlify dashboard, go to **Site settings** → **Environment variables** and add:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# pollinations.ai (Server-side only)
POLLINATIONS_SECRET_KEY=your-pollinations-api-key
POLLINATIONS_SECRET_KEY2=your-backup-key-optional

# Security
FRONTEND_API_SECRET=your-random-secret-string

# Admin (optional - will be moved to DB in future)
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-password
NEXT_PUBLIC_ADMIN_DISPLAY_NAME=Administrator

# Site
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
```

### Step 3: Configure Functions Timeout

1. Go to **Site settings** → **Functions**
2. Set **Function timeout** to `60 seconds` (for AI image generation)

### Step 4: Deploy

1. Click **Deploy site**
2. Wait for build to complete (~3-5 minutes)
3. Test your site at `https://your-site.netlify.app`

### Step 5: Custom Domain (Optional)

1. Go to **Domain settings**
2. Click **Add custom domain**
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` environment variable

---

## Option 2: Deploy to Vercel

### Step 1: Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com) and log in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 2: Set Environment Variables

Add the same variables as Netlify (see above)

### Step 3: Deploy

Click **Deploy** and wait for build to complete

**Note:** You'll need to update serverless function paths:
- Change `/.netlify/functions/generate-image` to `/api/generate-image` in `aiConfig.ts`

---

## Post-Deployment Checklist

After deployment, verify:

- [ ] Homepage loads correctly
- [ ] Images display properly
- [ ] Navigation works
- [ ] Custom bouquet designer (`/customize`) works
- [ ] AI image generation works (click "Generate Preview")
- [ ] Admin login works (`/admin/login`)
- [ ] Cart functionality works
- [ ] Mobile responsiveness

---

## Database Setup

### Initial Migration

Run these SQL scripts in Supabase SQL Editor:

1. **`docs/migrations/SUPABASE_SECURE_RLS_POLICIES.sql`**
   - Sets up Row Level Security policies
   - Creates tables and security rules

2. **`docs/migrations/ZODIAC_IMAGE_CACHE_SETUP.sql`** (optional)
   - Enables zodiac quiz image caching

### Storage Buckets

Create these storage buckets in Supabase:

- `product-images` (public)
- `flower-images` (public)
- `zodiac-images` (public)

Set permissions to allow public read, authenticated write.

---

## Monitoring & Maintenance

### Performance Monitoring

- Check Netlify Analytics for Core Web Vitals
- Monitor function execution times
- Watch for failed deployments

### API Usage

- Monitor pollinations.ai usage at [enter.pollinations.ai](https://enter.pollinations.ai)
- Check Supabase database size and API calls
- Review Netlify function invocations

### Logs

**Netlify:**
- Go to **Deploys** → Click a deploy → **Function logs**

**Vercel:**
- Go to **Deployments** → Click deployment → **Logs**

---

## Troubleshooting

### Build Fails

**Error:** `Module not found`
- Run `npm install` locally
- Check `package.json` for missing dependencies
- Clear Netlify cache: **Deploys** → **Trigger deploy** → **Clear cache and deploy**

### Functions Timeout

**Error:** `Function invocation timed out`
- Increase timeout to 60 seconds in Netlify settings
- Check if pollinations.ai is responding slowly
- Try using `POLLINATIONS_SECRET_KEY2` as fallback

### Environment Variables Not Working

**Symptoms:** Features don't work in production
- Verify variables are set in Netlify/Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding new variables

### Images Not Loading

**Issue:** Supabase images return 404
- Check storage bucket permissions (should be public)
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check CORS settings in Supabase

---

## Updating the Deployment

### For Code Changes

1. Commit changes to GitHub
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. Netlify/Vercel will auto-deploy from `main` branch

### For Environment Variables

1. Update in Netlify/Vercel dashboard
2. Trigger a redeploy (changes don't apply automatically)

### For Database Changes

1. Run SQL migrations in Supabase SQL Editor
2. Update corresponding frontend code
3. Deploy frontend changes

---

## Rollback

If something goes wrong:

**Netlify:**
1. Go to **Deploys**
2. Find a working deploy
3. Click **⋯** → **Publish deploy**

**Vercel:**
1. Go to **Deployments**
2. Find a working deployment
3. Click **⋯** → **Promote to Production**

---

## Security Checklist

Before going live:

- [ ] All API keys are in environment variables (not in code)
- [ ] `.env` is in `.gitignore` (never commit it)
- [ ] Admin password is strong and unique
- [ ] Supabase RLS policies are enabled
- [ ] CORS is configured correctly
- [ ] HTTPS is enabled (automatic on Netlify/Vercel)

---

## Support

Need help with deployment?

- **Netlify Docs:** [docs.netlify.com](https://docs.netlify.com)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Project Issues:** [GitHub Issues](../../issues)
- **Email:** mohammadashkar11@gmail.com

---

## Cost Estimates

### Free Tier (Hobby Projects)

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| **Netlify** | 100GB bandwidth/month | $19/month |
| **Vercel** | 100GB bandwidth/month | $20/month |
| **Supabase** | 500MB database, 1GB storage | $25/month |
| **pollinations.ai** | Varies by usage | Check pricing |

### Scaling Considerations

- **High traffic?** → Use CDN (Cloudflare, Netlify Edge)
- **Many AI generations?** → Monitor pollinations.ai usage
- **Large database?** → Upgrade Supabase plan
- **Complex queries?** → Add database indexes

---

<div align="center">

**Good luck with your deployment! 🚀**

If you encounter issues, check the [Troubleshooting section](#troubleshooting) or [create an issue](../../issues).

</div>
