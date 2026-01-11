# Prisma Data Platform Setup Guide

## Quick Setup for Connection Pooling

### Step 1: Sign Up for Prisma Data Platform

1. Go to: https://prisma.io/data-platform
2. Sign up with your GitHub account (recommended) or email
3. Create a new account if you don't have one

### Step 2: Create a Project

1. Click "Create Project" or "New Project"
2. Name your project (e.g., "Neyro Production")
3. Select your database provider (PostgreSQL)
4. Choose your region (closest to your Vercel deployment)

### Step 3: Connect Your Database

**Option A: Connect Existing Database**
1. Click "Connect Database"
2. Choose "Connect existing database"
3. Enter your database connection string:
   ```
   postgresql://user:password@host:5432/database?schema=public
   ```
4. Prisma will test the connection
5. Click "Continue"

**Option B: Create New Database**
1. Click "Create Database"
2. Choose provider (AWS, Google Cloud, etc.)
3. Follow provider-specific setup
4. Copy connection string when ready

### Step 4: Get Connection Pooling URL

1. After connecting, go to your project dashboard
2. Find "Connection String" or "Connection URL"
3. **Copy the connection string** - it should include `?pgbouncer=true`
4. Format will look like:
   ```
   postgresql://user:password@host:5432/database?schema=public&pgbouncer=true
   ```

### Step 5: Set in Vercel

1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Find `DATABASE_URL` (or create it)
4. **Replace** the value with the Prisma Data Platform connection string
5. Ensure it includes `?pgbouncer=true`
6. Select environments: Production, Preview, Development
7. Click "Save"

### Step 6: Optional - Set Direct URL for Migrations

**For running migrations (optional but recommended):**

1. In Prisma Data Platform dashboard, find "Direct Connection" URL
2. This is for migrations only (not runtime)
3. Set in Vercel as `DIRECT_URL`:
   ```
   DIRECT_URL=postgresql://user:password@host:5432/database?schema=public
   ```
   (Note: No `pgbouncer=true` for direct connection)

4. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```

### Step 7: Redeploy

**Important:** Environment variables only apply to new deployments.

1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Or push a new commit to trigger deployment
4. Wait for deployment to complete

### Step 8: Verify Connection

1. Check Vercel Function Logs
2. Try logging in or accessing `/inbox`
3. Should not see connection pool timeout errors
4. Check Prisma Data Platform dashboard for connection metrics

---

## Benefits of Prisma Data Platform

✅ **Automatic Connection Pooling** - Optimized for serverless  
✅ **Built-in Monitoring** - See connection usage and performance  
✅ **Query Insights** - Monitor slow queries  
✅ **Free Tier Available** - Good for getting started  
✅ **Easy Setup** - Just connect your existing database  

---

## Troubleshooting

### Connection Still Failing?

1. **Verify connection string format:**
   - Must include `?pgbouncer=true`
   - Must include `?schema=public`
   - Check for typos

2. **Check database accessibility:**
   - Database must be accessible from internet
   - Firewall must allow Prisma Data Platform IPs
   - Credentials must be correct

3. **Verify in Prisma Dashboard:**
   - Check connection status
   - View connection metrics
   - Check for any errors

### Migration Issues?

If migrations fail with pooling URL:
- Use `DIRECT_URL` for migrations
- Run migrations with: `DATABASE_URL=$DIRECT_URL npx prisma migrate deploy`
- Or use Prisma Data Platform's migration feature

---

## Free Tier Limits

**Prisma Data Platform Free Tier:**
- 1 project
- Connection pooling included
- Basic monitoring
- Sufficient for small to medium apps

**Upgrade if needed:**
- More projects
- Advanced monitoring
- Query insights
- Higher connection limits

---

## Quick Checklist

- [ ] Signed up for Prisma Data Platform
- [ ] Created project
- [ ] Connected database (existing or new)
- [ ] Copied connection string with `?pgbouncer=true`
- [ ] Set `DATABASE_URL` in Vercel with pooling URL
- [ ] (Optional) Set `DIRECT_URL` for migrations
- [ ] Updated `prisma/schema.prisma` if using `DIRECT_URL`
- [ ] Redeployed application
- [ ] Verified no connection pool errors in logs

---

## Next Steps

After setup:
1. Monitor connection usage in Prisma dashboard
2. Check query performance
3. Set up alerts if needed
4. Optimize slow queries if any

---

**Last Updated**: 2025-01-10
