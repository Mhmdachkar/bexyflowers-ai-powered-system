# Database API Security Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Frontend)                          │
│                                                                     │
│  ┌──────────────────┐                                              │
│  │  User Interface  │                                              │
│  │  (React Pages)   │                                              │
│  └────────┬─────────┘                                              │
│           │                                                         │
│           ▼                                                         │
│  ┌──────────────────┐        ┌─────────────────────┐             │
│  │ useFlowers Hook  │◄──────►│ React Query Cache   │             │
│  │ (React Query)    │        │ (2 min stale time)  │             │
│  └────────┬─────────┘        └─────────────────────┘             │
│           │                                                         │
│           ▼                                                         │
│  ┌──────────────────┐                                              │
│  │  flowers.ts API  │  Business Logic Layer                       │
│  │  15+ Functions   │  - getFlowerTypes()                         │
│  └────────┬─────────┘  - createFlowerType()                       │
│           │            - getFlowersForCustomize()                  │
│           ▼            - etc.                                      │
│  ┌──────────────────────────────────────────┐                     │
│  │  database-client.ts                      │                     │
│  │  ┌────────────────────────────────────┐  │                     │
│  │  │ db.select()   db.insert()         │  │                     │
│  │  │ db.update()   db.delete()         │  │                     │
│  │  │ db.rpc()      db.selectOne()      │  │                     │
│  │  └────────────────────────────────────┘  │                     │
│  │  HTTP Client with:                       │                     │
│  │  • Timeout protection (3s dev, 10s prod) │                     │
│  │  • API key header (X-API-Key)            │                     │
│  │  • Error handling                        │                     │
│  └─────────────────┬────────────────────────┘                     │
│                    │                                               │
└────────────────────┼───────────────────────────────────────────────┘
                     │
                     │ HTTPS POST Request
                     │ Headers:
                     │   Content-Type: application/json
                     │   X-API-Key: <frontend-api-key>
                     │ Body:
                     │   { operation, table, filters, data, ... }
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│               NETLIFY SERVERLESS FUNCTION (Backend)                 │
│               netlify/functions/database.ts                         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ SECURITY LAYER 1: Request Validation                         │  │
│  │ ✅ Check HTTP method (POST only)                              │  │
│  │ ✅ Check request size (<1MB)                                  │  │
│  │ ✅ Parse JSON body                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                               ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ SECURITY LAYER 2: Origin & CORS                              │  │
│  │ ✅ Validate origin against whitelist:                         │  │
│  │    • https://bexyflowers.shop                                │  │
│  │    • https://www.bexyflowers.shop                            │  │
│  │    • http://localhost:* (dev only)                           │  │
│  │ ✅ Set security headers:                                      │  │
│  │    • X-Content-Type-Options: nosniff                         │  │
│  │    • X-Frame-Options: DENY                                   │  │
│  │    • Cache-Control: no-cache                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                               ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ SECURITY LAYER 3: API Key Authentication                     │  │
│  │ ✅ PRODUCTION: API key REQUIRED                               │  │
│  │ ✅ DEVELOPMENT: API key optional                              │  │
│  │ ✅ Validate X-API-Key header                                  │  │
│  │ ✅ Return 401 if invalid                                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                               ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ SECURITY LAYER 4: Rate Limiting                              │  │
│  │ ✅ Per minute: 30 requests                                    │  │
│  │ ✅ Per hour: 500 requests                                     │  │
│  │ ✅ Per day: 2,000 requests (per IP)                           │  │
│  │ ✅ Global: 50,000 requests/day                                │  │
│  │ ✅ Min delay: 100ms between requests                          │  │
│  │ ✅ IP blocking: 1 hour on abuse                               │  │
│  │ ✅ Return 429 with Retry-After header                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                               ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ SECURITY LAYER 5: Input Validation                           │  │
│  │ ✅ Validate operation type:                                   │  │
│  │    select, insert, update, delete, rpc                       │  │
│  │                                                               │  │
│  │ ✅ Validate table name (if not RPC):                          │  │
│  │    • Regex: ^[a-zA-Z0-9_-]+$                                 │  │
│  │    • Length: < 100 chars                                     │  │
│  │    • WHITELIST CHECK (17 allowed tables)                     │  │
│  │                                                               │  │
│  │ ✅ Validate RPC function name (if RPC):                       │  │
│  │    • Regex: ^[a-zA-Z0-9_]+$                                  │  │
│  │    • Length: < 100 chars                                     │  │
│  │    • WHITELIST CHECK (3 allowed functions)                   │  │
│  │                                                               │  │
│  │ ✅ Return 400 on validation failure                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                               ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ SECURITY LAYER 6: Column & Filter Validation                 │  │
│  │ ✅ Validate column names in filters:                          │  │
│  │    • Regex: ^[a-zA-Z0-9_.-]+(\->>?[a-zA-Z0-9_'"]+)?$        │  │
│  │    • Length: < 200 chars                                     │  │
│  │                                                               │  │
│  │ ✅ Validate filter values:                                    │  │
│  │    • Type check (string/number/boolean/null/array)           │  │
│  │    • String length: < 10,000 chars                           │  │
│  │    • Array length: < 1,000 items                             │  │
│  │                                                               │  │
│  │ ✅ Validate filter operators:                                 │  │
│  │    eq, neq, gt, gte, lt, lte, like, ilike                   │  │
│  │                                                               │  │
│  │ ✅ Sanitize LIKE/ILIKE patterns                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                               ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ SECURITY LAYER 7: Data Payload Validation                    │  │
│  │ ✅ Check data size: < 1MB                                     │  │
│  │ ✅ Check nesting depth: < 10 levels                           │  │
│  │ ✅ Validate data structure                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                               ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ SECURITY LAYER 8: Safe Query Execution                       │  │
│  │ ✅ Use Supabase query builder (parameterized queries)         │  │
│  │ ✅ NO raw SQL construction                                    │  │
│  │ ✅ Apply filters safely with validated params                │  │
│  │ ✅ Require filters for UPDATE/DELETE operations              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                               ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Supabase Client (Server-side)                                │  │
│  │ • Uses SUPABASE_SERVICE_ROLE_KEY (server-only)               │  │
│  │ • Never exposed to frontend                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                               ▼                                     │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                              │ Authenticated Database Connection
                              │ Service Role Key (backend-only)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                              │
│                                                                     │
│  ✅ No direct frontend access                                       │
│  ✅ URL and keys completely hidden                                  │
│  ✅ Row-Level Security (RLS) as additional layer                    │
│  ✅ Backup authentication/authorization                             │
│                                                                     │
│  Tables (17 whitelisted):                                          │
│  • flower_types          • flower_colors                           │
│  • flower_type_categories                                          │
│  • accessories           • luxury_boxes                            │
│  • wedding_creations     • eternal_flowers                         │
│  • collection_products   • signature_collections                   │
│  • box_colors            • box_sizes                               │
│  • owner_availability    • consultation_bookings                   │
│  • visitor_cart          • visitor_favorites                       │
│  • zodiac_generated_images                                         │
│  • checkout_orders                                                 │
│                                                                     │
│  RPC Functions (3 whitelisted):                                    │
│  • get_active_products                                             │
│  • get_featured_products                                           │
│  • search_products                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Security Benefits

### 🔒 Protection Against SQL Injection
- ✅ Table name whitelist (only 17 allowed)
- ✅ RPC function whitelist (only 3 allowed)
- ✅ Column name validation with regex
- ✅ Filter value type checking
- ✅ Parameterized queries only (no raw SQL)
- ✅ LIKE pattern sanitization

### 🔒 Protection Against XSS
- ✅ JSON-only responses (no HTML)
- ✅ Content-Type headers set correctly
- ✅ X-Content-Type-Options: nosniff

### 🔒 Protection Against CSRF
- ✅ Origin validation (CORS)
- ✅ POST-only endpoint
- ✅ API key required in production

### 🔒 Protection Against DoS
- ✅ Rate limiting per IP (30/min, 500/hr, 2000/day)
- ✅ Global rate limit (50,000/day)
- ✅ Request size limits (1MB)
- ✅ Timeout protection (3s dev, 10s prod)
- ✅ IP blocking on abuse (1 hour)

### 🔒 Protection Against Data Leakage
- ✅ Database URL hidden from frontend
- ✅ Database keys hidden from frontend
- ✅ Error messages sanitized (no DB details)
- ✅ Validation errors return 400 (not 500)

### 🔒 Protection Against Injection Attacks
- ✅ Input validation on all parameters
- ✅ Column name validation
- ✅ Filter operator whitelist
- ✅ Data payload depth limits (10 levels)
- ✅ String length limits (10,000 chars)
- ✅ Array length limits (1,000 items)

## Attack Scenarios & Defenses

### Scenario 1: Attacker tries SQL Injection

**Attack:**
```javascript
// Attacker tries to inject SQL
db.select("users; DROP TABLE users;--")
```

**Defense:**
1. ✅ Table name validation regex fails (semicolon not allowed)
2. ✅ Table not in whitelist
3. ✅ Backend returns 400 "Invalid table name"
4. ✅ No SQL executed

**Result:** ❌ Attack blocked at validation layer

---

### Scenario 2: Attacker tries to access unauthorized table

**Attack:**
```javascript
// Attacker tries to access users table
db.select("users")
```

**Defense:**
1. ✅ Table name passes regex (valid format)
2. ✅ Table NOT in whitelist (17 allowed tables)
3. ✅ Backend returns 400 "Invalid table name"
4. ✅ No database query executed

**Result:** ❌ Attack blocked by whitelist

---

### Scenario 3: Attacker tries RPC injection

**Attack:**
```javascript
// Attacker tries to call malicious function
db.rpc("delete_all_users; DROP TABLE users;")
```

**Defense:**
1. ✅ Function name validation regex fails (semicolon not allowed)
2. ✅ Function not in whitelist (only 3 allowed)
3. ✅ Backend returns 400 "RPC function not allowed"
4. ✅ No RPC call executed

**Result:** ❌ Attack blocked at validation layer

---

### Scenario 4: Attacker tries DoS attack

**Attack:**
```javascript
// Attacker sends 100 requests per second
for (let i = 0; i < 100; i++) {
  db.select("flower_types");
}
```

**Defense:**
1. ✅ First 30 requests succeed (per minute limit)
2. ✅ Request 31-100 blocked with 429 status
3. ✅ IP automatically blocked for 1 hour
4. ✅ Backend continues serving other users

**Result:** ❌ Attack blocked by rate limiting

---

### Scenario 5: Attacker tries to bypass origin check

**Attack:**
```javascript
// Attacker sends request from malicious site
// Origin: https://evil.com
fetch("/.netlify/functions/database", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ operation: "select", table: "flower_types" })
})
```

**Defense:**
1. ✅ Origin "https://evil.com" not in whitelist
2. ✅ Backend returns 403 "Forbidden: Origin not allowed"
3. ✅ Request logged for monitoring
4. ✅ No database access

**Result:** ❌ Attack blocked by CORS validation

---

### Scenario 6: Attacker tries to exploit missing API key

**Attack:**
```javascript
// Attacker sends request without API key (production)
fetch("/.netlify/functions/database", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ operation: "select", table: "flower_types" })
})
```

**Defense:**
1. ✅ Production environment detected
2. ✅ No X-API-Key header found
3. ✅ Backend returns 401 "Unauthorized: Invalid API key"
4. ✅ Request logged for security monitoring

**Result:** ❌ Attack blocked by authentication

---

## Monitoring & Logging

### Security Events Logged
- ✅ Unauthorized origin attempts
- ✅ Invalid API key attempts
- ✅ Rate limit violations
- ✅ Validation errors
- ✅ Table/function not in whitelist
- ✅ Successful requests (with timing)

### Log Format
```javascript
{
  event: 'validation_error' | 'auth_failure' | 'rate_limit' | 'success' | 'error',
  severity: 'info' | 'warning' | 'error',
  path: '/.netlify/functions/database',
  ip: '192.168.1.1',
  details: {
    operation: 'select',
    table: 'flower_types',
    responseTime: 123,
    error: 'Invalid table name'
  }
}
```

### Performance Metrics
- ✅ Response times tracked
- ✅ Status codes logged
- ✅ Operation types tracked
- ✅ Table access patterns monitored

---

## Environment Configuration

### Required Environment Variables

**Backend (Netlify):**
```bash
# Database credentials (required)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# API key for frontend auth (required in production)
FRONTEND_API_KEY=your-secret-api-key

# Environment detection
CONTEXT=production  # or 'development'
NODE_ENV=production # or 'development'
```

**Frontend (Browser):**
```bash
# API endpoint (auto-detected)
# Production: /.netlify/functions/database
# Dev: /api/database (with Netlify fallback)

# API key (must match backend)
VITE_FRONTEND_API_KEY=your-secret-api-key
```

---

## Testing Commands

### Test Backend Locally
```bash
# Start Netlify dev server
netlify dev

# Test valid request
curl -X POST http://localhost:8888/.netlify/functions/database \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"operation":"select","table":"flower_types","limit":1}'

# Test invalid table (should return 400)
curl -X POST http://localhost:8888/.netlify/functions/database \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"operation":"select","table":"users","limit":1}'

# Test invalid RPC (should return 400)
curl -X POST http://localhost:8888/.netlify/functions/database \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"operation":"rpc","table":"","functionName":"malicious_func"}'

# Test without API key (should return 401 in production)
curl -X POST http://localhost:8888/.netlify/functions/database \
  -H "Content-Type: application/json" \
  -d '{"operation":"select","table":"flower_types","limit":1}'

# Test rate limiting (send 35 requests rapidly)
for i in {1..35}; do
  curl -X POST http://localhost:8888/.netlify/functions/database \
    -H "Content-Type: application/json" \
    -H "X-API-Key: your-api-key" \
    -d '{"operation":"select","table":"flower_types","limit":1}'
done
```

### Run Automated Security Tests
```bash
npx tsx test-database-security.ts
```

---

## Maintenance Checklist

### Daily
- ✅ Monitor security event logs
- ✅ Check rate limit violations
- ✅ Review failed authentication attempts

### Weekly
- ✅ Review performance metrics
- ✅ Check for unusual access patterns
- ✅ Verify rate limits are appropriate

### Monthly
- ✅ Review and update whitelist if needed
- ✅ Rotate API keys
- ✅ Update security documentation
- ✅ Review and test security controls

### After Major Changes
- ✅ Run full security test suite
- ✅ Review TypeScript compilation
- ✅ Test all API endpoints
- ✅ Verify rate limiting still works
- ✅ Check monitoring and logging

---

**Document Version:** 1.0  
**Last Updated:** March 19, 2026  
**Status:** Production Ready ✅
