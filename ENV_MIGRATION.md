# Environment Variable Migration Guide
# From Vite (VITE_*) to Next.js (NEXT_PUBLIC_*)

## Quick Reference

| Old Vite Variable | New Next.js Variable | Notes |
|-------------------|----------------------|-------|
| `VITE_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | Public, safe to expose |
| `VITE_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public, safe to expose |
| `VITE_SITE_URL` | `NEXT_PUBLIC_SITE_URL` | Public |
| `VITE_ADMIN_USERNAME` | `NEXT_PUBLIC_ADMIN_USERNAME` | Public (will migrate to server auth) |
| `VITE_ADMIN_PASSWORD` | `NEXT_PUBLIC_ADMIN_PASSWORD` | Public (will migrate to server auth) |
| `VITE_ADMIN_DISPLAY_NAME` | `NEXT_PUBLIC_ADMIN_DISPLAY_NAME` | Public |
| `VITE_ADMIN2_*` | `NEXT_PUBLIC_ADMIN2_*` | Public (will migrate to server auth) |
| `VITE_FRONTEND_API_KEY` | `NEXT_PUBLIC_FRONTEND_API_KEY` | Public |
| `VITE_FRONTEND_API_SECRET` | `FRONTEND_API_SECRET` | **Server-only** (no prefix) |
| `VITE_USE_NETLIFY_FUNCTIONS` | `NEXT_PUBLIC_USE_NETLIFY_FUNCTIONS` | Public |

## Important Differences

### Vite (old):
- All environment variables prefixed with `VITE_` are exposed to the browser
- Accessed via `import.meta.env.VITE_*`

### Next.js (new):
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Variables without prefix are server-only
- Accessed via `process.env.NEXT_PUBLIC_*` or `process.env.*`

## Migration Steps

1. **Copy `.env.example` to `.env.local`**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your values** from your existing `.env` file

3. **Update deployment environment variables**
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - Add all `NEXT_PUBLIC_*` and server-only variables

## Code Changes Required

### Before (Vite):
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const siteUrl = import.meta.env.VITE_SITE_URL;
```

### After (Next.js):
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
```

## Files to Update

Search and replace `import.meta.env.VITE_` with `process.env.NEXT_PUBLIC_` in:
- `src/lib/supabase.ts`
- `src/lib/seo.ts`
- `src/contexts/*.tsx`
- `src/hooks/*.ts`
- `src/components/**/*.tsx`
- All files that use environment variables

## Automated Migration

Run this command to automatically replace most occurrences:

```bash
# macOS/Linux
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/import\.meta\.env\.VITE_/process.env.NEXT_PUBLIC_/g' {} +

# Windows (PowerShell)
Get-ChildItem -Path src -Include *.ts,*.tsx -Recurse | ForEach-Object {
  (Get-Content $_.FullName) -replace 'import\.meta\.env\.VITE_', 'process.env.NEXT_PUBLIC_' | Set-Content $_.FullName
}
```

## Server-Only Variables

These should NOT have `NEXT_PUBLIC_` prefix:
- `SUPABASE_SERVICE_ROLE_KEY` - Full database access
- `FRONTEND_API_SECRET` - Request signing
- Any API secrets or private keys

## Validation

After migration, check that:
1. All `import.meta.env` references are removed
2. Public variables have `NEXT_PUBLIC_` prefix
3. Secret variables have no prefix
4. `.env.local` is in `.gitignore`
5. Deployment env vars are updated

## Security Note

⚠️ **Admin authentication** currently uses public environment variables. This will be migrated to:
- Server-side session management (NextAuth.js or similar)
- Secure HTTP-only cookies
- No credentials in client-side code
