# Connection Pool Exhaustion Fix

## Error
```
Failed to connect to database [Error [PrismaClientInitializationError]: 
Timed out fetching a new connection from the connection pool. 
More info: http://pris.ly/d/connection-pool 
(Current connection pool timeout: 10, connection limit: 5)]
```

**Issue:** Connection pool is exhausted in serverless environment (Vercel).

---

## Root Cause

In serverless environments (Vercel):
- Multiple serverless functions can be created simultaneously
- Each function might create its own Prisma Client instance
- Default connection pool (5 connections) gets exhausted quickly
- Functions timeout waiting for available connections

---

## Solution: Use Connection Pooling

### Option 1: Prisma Data Platform (Recommended)

**Best for:** Production serverless deployments

1. **Sign up at:** https://prisma.io/data-platform
2. **Create a project** and connect your database
3. **Copy the connection string** (includes `?pgbouncer=true`)
4. **Set in Vercel:**
   - `DATABASE_URL` = Connection pooling URL from Prisma Data Platform
   - Format: `postgresql://user:password@host:5432/database?schema=public&pgbouncer=true`

**Benefits:**
- Automatic connection pooling
- Optimized for serverless
- Built-in monitoring
- Free tier available

### Option 2: Database Provider Connection Pooling

**For Supabase:**
- Use connection pooling URL (port 6543)
- Format: `postgresql://postgres:password@db.xxx.supabase.co:6543/postgres?schema=public`

**For Neon:**
- Use "Pooled connection" string from dashboard
- Already optimized for serverless

**For Railway:**
- Use connection pooling URL if available
- Or increase pool size in database settings

### Option 3: Increase Connection Pool Size

**Update Prisma Client configuration:**

Modify `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Increase connection pool size via connection string parameters
// Add to DATABASE_URL: ?connection_limit=20&pool_timeout=20
```

**Then update DATABASE_URL in Vercel:**
```
postgresql://user:password@host:5432/database?schema=public&connection_limit=20&pool_timeout=20&sslmode=require
```

**Note:** This only works if your database provider supports these parameters.

---

## Step-by-Step Fix

### Step 1: Choose Connection Pooling Solution

**Recommended:** Use Prisma Data Platform or your database provider's pooling URL.

### Step 2: Update DATABASE_URL

**If using Prisma Data Platform:**
1. Sign up and create project
2. Copy connection string (includes `?pgbouncer=true`)
3. Set as `DATABASE_URL` in Vercel

**If using Supabase:**
1. Go to Project Settings → Database
2. Copy "Connection pooling" URL (port 6543)
3. Set as `DATABASE_URL` in Vercel

**If using Neon:**
1. Go to Dashboard → Connection Details
2. Copy "Pooled connection" string
3. Set as `DATABASE_URL` in Vercel

### Step 3: Update Prisma Schema (Optional)

**For Prisma Data Platform, add direct URL:**

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations only
}
```

**Then set in Vercel:**
- `DATABASE_URL` = Pooling URL (for runtime)
- `DIRECT_URL` = Direct connection URL (for migrations)

### Step 4: Optimize Prisma Client Usage

**Ensure singleton pattern is working:**

The current `src/lib/prisma.ts` already uses a singleton pattern, which is good. Make sure:
- Only one Prisma Client instance is created
- Client is reused across function invocations
- No new instances created in each function

### Step 5: Redeploy

**After updating DATABASE_URL:**
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Update `DATABASE_URL` with pooling URL
4. Redeploy application

---

## Quick Fixes by Provider

### Prisma Data Platform
```
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public&pgbouncer=true
```

### Supabase
```
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:6543/postgres?schema=public
```

### Neon
```
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/database?sslmode=require
```
(Use pooled connection from dashboard)

### Railway
```
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public&sslmode=require&connection_limit=20
```

---

## Verify Fix

### Test Connection Pooling

**After updating DATABASE_URL:**
1. Redeploy application
2. Try logging in multiple times quickly
3. Check Vercel Function Logs
4. Should not see connection pool timeout errors

### Monitor Connection Usage

**If using Prisma Data Platform:**
- Check dashboard for connection metrics
- Monitor pool usage
- Adjust if needed

---

## Additional Optimizations

### 1. Reduce Connection Timeout

**In Prisma Client:**
```typescript
new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "&connect_timeout=5",
    },
  },
})
```

### 2. Use Query Timeout

**For long-running queries:**
```typescript
await prisma.$queryRaw`SELECT ...`.timeout(5000);
```

### 3. Close Connections Properly

**In API routes, ensure connections close:**
```typescript
try {
  // Your queries
} finally {
  await prisma.$disconnect();
}
```

**Note:** In serverless, Prisma handles this automatically, but explicit disconnect can help.

---

## Troubleshooting

### Still Getting Timeouts?

1. **Check if using pooling URL:**
   - Should include `pgbouncer=true` or use pooling port
   - Verify with database provider

2. **Check connection limit:**
   - Some providers limit concurrent connections
   - Upgrade plan if needed

3. **Monitor function concurrency:**
   - Vercel has function concurrency limits
   - Check if hitting limits

4. **Check database load:**
   - Database might be overloaded
   - Check database provider metrics

### Error: "Too many connections"

**Cause:** Database connection limit reached

**Fix:**
- Use connection pooling (reduces connection count)
- Upgrade database plan
- Reduce function concurrency

---

## Best Practices

1. **Always use connection pooling** in serverless
2. **Use Prisma Data Platform** for production (recommended)
3. **Monitor connection usage** regularly
4. **Set appropriate timeouts** for queries
5. **Use singleton Prisma Client** (already implemented)

---

## Quick Checklist

- [ ] Using connection pooling URL (not direct connection)
- [ ] `DATABASE_URL` includes pooling parameters (`pgbouncer=true` or pooling port)
- [ ] Prisma Client uses singleton pattern (already done)
- [ ] Environment variables updated in Vercel
- [ ] Application redeployed after changes
- [ ] Tested with multiple concurrent requests
- [ ] No connection pool timeout errors in logs

---

**Last Updated**: 2025-01-10
