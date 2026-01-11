# Production Troubleshooting Guide

## Issue: ERR_FAILED after login at /inbox

**Error**: `This site can't be reached` at `https://neyro.vercel.app/inbox` after logging in.

---

## Quick Fixes

### 1. Check NEXTAUTH_URL Environment Variable (Most Likely Issue)

**In Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Ensure `NEXTAUTH_URL` is set to: `https://neyro.vercel.app`
3. **NOT** `http://localhost:3001` or `http://neyro.vercel.app` (must be HTTPS)
4. Redeploy after changing environment variables

**Verify in Vercel:**
```bash
# Check environment variables
# Should see:
NEXTAUTH_URL=https://neyro.vercel.app
DATABASE_URL=postgresql://...
AUTH_SECRET=...
```

### 2. Check Google OAuth Redirect URI

**In Google Cloud Console:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. **Authorized redirect URIs** must include:
   - `https://neyro.vercel.app/api/auth/callback/google`
   - (Do NOT include localhost URLs in production)

### 3. Check Database Connection

**Verify DATABASE_URL in Vercel:**
- Ensure `DATABASE_URL` is set correctly
- Database must be accessible from Vercel's servers
- Check database connection pool limits
- Verify SSL is enabled if required by your database provider

**Test database connection:**
- Vercel logs should show Prisma connection status
- Check Vercel Function Logs for database errors

### 4. Check Build Logs

**In Vercel Dashboard:**
1. Go to Deployments
2. Click on latest deployment
3. Check Build Logs for errors
4. Check Function Logs for runtime errors

**Common build issues:**
- Missing environment variables
- TypeScript errors
- Missing dependencies
- Prisma Client not generated

### 5. Check Runtime Logs

**In Vercel Dashboard:**
1. Go to Functions → View Function Logs
2. Look for errors when accessing `/inbox`
3. Common errors:
   - Database connection timeout
   - Prisma query errors
   - Authentication errors
   - Missing session data

---

## Detailed Troubleshooting Steps

### Step 1: Verify Environment Variables

**Required variables in Vercel:**
```env
# Authentication
NEXTAUTH_URL=https://neyro.vercel.app
AUTH_SECRET=<your-secret>
# OR
NEXTAUTH_SECRET=<your-secret>

# Database
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**How to set in Vercel:**
1. Project → Settings → Environment Variables
2. Add each variable
3. Select environments (Production, Preview, Development)
4. Click "Save"
5. **Redeploy** (environment variables only apply to new deployments)

### Step 2: Check Google OAuth Configuration

**In Google Cloud Console:**
1. APIs & Services → Credentials
2. Click your OAuth 2.0 Client ID
3. **Authorized JavaScript origins:**
   - `https://neyro.vercel.app`
4. **Authorized redirect URIs:**
   - `https://neyro.vercel.app/api/auth/callback/google`

**Important:** 
- Use HTTPS (not HTTP)
- Include the full path `/api/auth/callback/google`
- Remove localhost URLs from production client

### Step 3: Verify Database Accessibility

**Check if database is accessible:**
- Vercel Functions can access your database
- Firewall rules allow Vercel IPs
- Database connection string is correct
- SSL/TLS is configured if required

**Test connection:**
- Use Vercel's built-in database connection testing
- Or test from a serverless function

### Step 4: Check Middleware Configuration

The middleware should allow `/api/auth` routes and handle authentication correctly.

**Verify middleware is not blocking:**
- Check `src/middleware.ts`
- Ensure `/api/auth` is in public routes
- Ensure session check works correctly

### Step 5: Check Inbox Page Code

**Verify `/inbox` page:**
- No runtime errors in the page component
- Database queries are correct
- Authentication check works
- No missing dependencies

**Common issues:**
- Prisma query fails
- Missing environment variable
- Type error in production
- Missing session data

---

## Debugging Steps

### 1. Enable Verbose Logging

**Add to Vercel environment variables:**
```env
NODE_ENV=production
LOG_LEVEL=debug
```

### 2. Check Vercel Function Logs

**In Vercel Dashboard:**
1. Go to Functions tab
2. Click on a function
3. View Real-time Logs
4. Trigger the login flow
5. Watch for errors

### 3. Test Authentication Flow

**Step by step:**
1. Go to `https://neyro.vercel.app/auth/login`
2. Click "Sign in with Google"
3. Complete Google OAuth
4. Watch logs for redirect to `/inbox`
5. Check if `/inbox` page loads

### 4. Check Browser Console

**In browser DevTools:**
1. Open Network tab
2. Try to access `/inbox` after login
3. Check if request fails
4. Look at error response
5. Check for CORS errors

### 5. Test Database Connection

**Create a test API route:**
```typescript
// src/app/api/test-db/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$connect();
    const count = await prisma.user.count();
    return NextResponse.json({ connected: true, userCount: count });
  } catch (error) {
    return NextResponse.json({ 
      connected: false, 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
```

**Test:** `https://neyro.vercel.app/api/test-db`

---

## Common Error Scenarios

### Scenario 1: "ERR_FAILED" - No Response

**Cause:** Page is crashing or timing out
**Solution:**
- Check Vercel Function Logs for errors
- Verify database connection
- Check for infinite loops
- Verify all environment variables are set

### Scenario 2: Redirect Loop

**Cause:** Middleware/auth configuration issue
**Solution:**
- Check `NEXTAUTH_URL` is correct
- Verify session cookie is being set
- Check middleware logic
- Verify auth callback is working

### Scenario 3: Database Connection Error

**Cause:** Database not accessible or connection string wrong
**Solution:**
- Verify `DATABASE_URL` is correct
- Check database firewall rules
- Verify SSL configuration
- Test connection from Vercel

### Scenario 4: OAuth Callback Fails

**Cause:** Google OAuth redirect URI mismatch
**Solution:**
- Verify redirect URI in Google Console matches exactly
- Check `NEXTAUTH_URL` matches your domain
- Ensure HTTPS is used (not HTTP)

---

## Quick Checklist

Before reporting issues, verify:

- [ ] `NEXTAUTH_URL` is set to `https://neyro.vercel.app` in Vercel
- [ ] `DATABASE_URL` is set correctly in Vercel
- [ ] `AUTH_SECRET` or `NEXTAUTH_SECRET` is set in Vercel
- [ ] Google OAuth redirect URI includes `https://neyro.vercel.app/api/auth/callback/google`
- [ ] Latest deployment completed successfully
- [ ] No errors in Vercel Build Logs
- [ ] No errors in Vercel Function Logs
- [ ] Database is accessible from Vercel

---

## Next Steps

1. **Check Vercel Environment Variables** - Most common issue
2. **Review Vercel Logs** - Look for specific error messages
3. **Test Database Connection** - Create test endpoint
4. **Verify OAuth Configuration** - Check Google Cloud Console
5. **Check Browser Console** - Look for client-side errors

---

## Getting More Help

If issue persists:

1. **Collect logs:**
   - Vercel Function Logs
   - Browser Console errors
   - Network tab requests

2. **Test locally:**
   - Does it work in development?
   - Any differences between dev and prod?

3. **Check recent changes:**
   - What was changed recently?
   - Any new dependencies?
   - Any configuration changes?

---

**Last Updated**: 2025-01-09
