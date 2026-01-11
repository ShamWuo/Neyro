# Database Connection Fix for Vercel

## Error
```
[ERROR] Failed to connect to database [Error [PrismaClientInitializationError]
```

This error occurs when Prisma cannot connect to your PostgreSQL database from Vercel.

---

## Quick Fixes

### 1. Verify DATABASE_URL in Vercel

**In Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Check if `DATABASE_URL` is set
3. Format should be: `postgresql://user:password@host:port/database?schema=public`

**Common issues:**
- Missing `DATABASE_URL` environment variable
- Wrong format (should start with `postgresql://`)
- Missing `?schema=public` at the end
- Incorrect credentials

### 2. Add SSL/TLS to Connection String

**If your database requires SSL (most cloud databases do):**

Add SSL parameters to your `DATABASE_URL`:
```
postgresql://user:password@host:port/database?schema=public&sslmode=require
```

**Or for more secure connections:**
```
postgresql://user:password@host:port/database?schema=public&sslmode=require&sslcert=&sslkey=&sslrootcert=
```

### 3. Check Database Provider Settings

**For different providers:**

#### Prisma Data Platform (Prisma.io)
- Connection string should include `?pgbouncer=true` for connection pooling
- Format: `postgresql://user:password@host:port/database?schema=public&pgbouncer=true`

#### Supabase
- Use connection pooling URL (port 6543) for serverless
- Format: `postgresql://postgres:password@db.xxx.supabase.co:6543/postgres?schema=public`
- Or use direct connection (port 5432) with SSL

#### Neon
- Use connection pooling URL
- Format: `postgresql://user:password@ep-xxx.region.aws.neon.tech/database?sslmode=require`

#### Railway
- Use provided connection string
- May need to add `?sslmode=require`

#### PlanetScale (MySQL)
- Not compatible with Prisma PostgreSQL
- Use PostgreSQL database instead

### 4. Check Database Firewall/Network Access

**Ensure your database allows connections from Vercel:**

1. **Check database firewall rules**
   - Allow connections from anywhere (`0.0.0.0/0`) for Vercel
   - Or add Vercel's IP ranges (if your provider supports it)

2. **For Vercel-specific databases:**
   - Some providers have "Vercel integration" - use that
   - It automatically configures firewall rules

### 5. Update Prisma Schema for Connection Pooling

**If using connection pooling (recommended for serverless):**

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection pooling for serverless
  directUrl = env("DIRECT_URL") // Optional: direct connection for migrations
}
```

**Then set two environment variables in Vercel:**
- `DATABASE_URL` - Connection pooling URL
- `DIRECT_URL` - Direct connection URL (for migrations)

---

## Step-by-Step Fix

### Step 1: Get Your Database Connection String

**From your database provider:**
1. Copy the connection string
2. It should look like: `postgresql://user:password@host:5432/database`

### Step 2: Add SSL Mode (if required)

**Append to connection string:**
```
?schema=public&sslmode=require
```

**Full example:**
```
postgresql://user:password@host:5432/database?schema=public&sslmode=require
```

### Step 3: Set in Vercel

**In Vercel Dashboard:**
1. Project → Settings → Environment Variables
2. Add or edit `DATABASE_URL`
3. Paste your connection string
4. Select environments (Production, Preview, Development)
5. Click "Save"

### Step 4: Redeploy

**Important:** Environment variables only apply to new deployments
1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Or push a new commit to trigger deployment

### Step 5: Verify Connection

**Check Vercel Function Logs:**
1. Go to Functions tab
2. Trigger a request (try logging in)
3. Check logs for database connection errors
4. Should see successful connection or different error

---

## Testing Database Connection

### Create Test Endpoint

Create `src/app/api/test-db/route.ts`:
```typescript
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$connect();
    const count = await prisma.user.count();
    return NextResponse.json({ 
      connected: true, 
      userCount: count,
      message: "Database connection successful"
    });
  } catch (error) {
    return NextResponse.json({ 
      connected: false, 
      error: error instanceof Error ? error.message : String(error),
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
```

**Test:** Visit `https://neyro.vercel.app/api/test-db`

---

## Common Connection String Formats

### Standard PostgreSQL
```
postgresql://user:password@host:5432/database?schema=public
```

### With SSL Required
```
postgresql://user:password@host:5432/database?schema=public&sslmode=require
```

### With Connection Pooling (Prisma Data Platform)
```
postgresql://user:password@host:5432/database?schema=public&pgbouncer=true
```

### With Direct URL (for migrations)
```
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public&pgbouncer=true
DIRECT_URL=postgresql://user:password@host:5432/database?schema=public
```

---

## Provider-Specific Instructions

### Prisma Data Platform
1. Create project at https://prisma.io
2. Copy connection string
3. Already includes pooling: `?pgbouncer=true`
4. Set as `DATABASE_URL` in Vercel

### Supabase
1. Go to Project Settings → Database
2. Use "Connection pooling" URL (port 6543)
3. Or direct connection (port 5432) with SSL
4. Format: `postgresql://postgres:password@db.xxx.supabase.co:6543/postgres?schema=public`

### Neon
1. Go to Dashboard → Connection Details
2. Use "Pooled connection" string
3. Already includes SSL
4. Copy and set in Vercel

### Railway
1. Go to Database → Connect
2. Copy connection string
3. May need to add `?sslmode=require`
4. Set in Vercel

---

## Troubleshooting

### Error: "Connection refused"
- **Cause:** Database firewall blocking Vercel
- **Fix:** Allow connections from `0.0.0.0/0` or add Vercel IPs

### Error: "SSL required"
- **Cause:** Database requires SSL but connection string doesn't specify it
- **Fix:** Add `&sslmode=require` to connection string

### Error: "Authentication failed"
- **Cause:** Wrong username/password
- **Fix:** Verify credentials in connection string

### Error: "Database does not exist"
- **Cause:** Wrong database name in connection string
- **Fix:** Check database name matches

### Error: "Too many connections"
- **Cause:** Connection pool exhausted
- **Fix:** Use connection pooling URL or increase pool size

---

## Best Practices

1. **Use Connection Pooling** - Essential for serverless (Vercel)
2. **Use SSL** - Always use SSL in production
3. **Separate Direct URL** - Use direct connection for migrations
4. **Environment Variables** - Never commit connection strings
5. **Test Locally** - Test connection string locally first

---

## Quick Checklist

- [ ] `DATABASE_URL` is set in Vercel
- [ ] Connection string format is correct
- [ ] SSL mode is specified (if required)
- [ ] Database firewall allows Vercel connections
- [ ] Credentials are correct
- [ ] Database exists and is accessible
- [ ] Redeployed after setting environment variables
- [ ] Tested connection with `/api/test-db` endpoint

---

**Last Updated**: 2025-01-10
