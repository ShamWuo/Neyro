# Authentication Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: NEXTAUTH_URL Mismatch

**Problem:** `NEXTAUTH_URL` is set to production URL (`https://neyro.vercel.app`) but you're running locally.

**Solution:** Update `.env` file:
```env
# For local development
NEXTAUTH_URL=http://localhost:3000

# For production (Vercel)
NEXTAUTH_URL=https://neyro.vercel.app
```

**Why it matters:** OAuth providers (Google) need to redirect back to the correct URL. If the URL doesn't match, authentication will fail.

### Issue 2: Database Connection Failed

**Problem:** Prisma can't connect to the database.

**Check:**
1. Verify `DATABASE_URL` in `.env` is correct
2. Check if database is running/accessible
3. Test connection: `npx prisma db pull`

**Solution:**
- For local PostgreSQL: Ensure PostgreSQL is running
- For Prisma Data Platform: Check connection string is valid
- For cloud databases: Verify network access and credentials

### Issue 3: Prisma Client Not Generated

**Problem:** `EPERM: operation not permitted` when generating Prisma client.

**Solution:**
1. Stop the dev server
2. Run: `npx prisma generate`
3. Restart dev server

**Why:** The dev server locks Prisma client files, preventing regeneration.

### Issue 4: Google OAuth Not Configured

**Problem:** Missing or invalid Google OAuth credentials.

**Check:**
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (for dev)
4. Add authorized redirect URI: `https://neyro.vercel.app/api/auth/callback/google` (for prod)

### Issue 5: Missing AUTH_SECRET

**Problem:** NextAuth requires a secret for session encryption.

**Solution:**
```bash
# Generate a secure secret
openssl rand -base64 32
```

Add to `.env`:
```env
AUTH_SECRET=your-generated-secret-here
# OR
NEXTAUTH_SECRET=your-generated-secret-here
```

## Testing Database Connection

Run this script to test:
```bash
npx tsx scripts/test-db-connection.ts
```

Or manually:
```typescript
import { prisma } from "@/lib/prisma";
await prisma.$connect();
const count = await prisma.user.count();
console.log("Connected! User count:", count);
```

## Testing Authentication

1. **Check environment variables:**
   ```bash
   # Windows PowerShell
   Get-Content .env | Select-String "AUTH|GOOGLE|DATABASE"
   ```

2. **Verify Prisma client:**
   ```bash
   npx prisma generate
   npx prisma db pull
   ```

3. **Check auth route:**
   - Visit: `http://localhost:3000/api/auth/providers`
   - Should show Google provider if configured correctly

4. **Test sign-in flow:**
   - Visit: `http://localhost:3000/auth/login`
   - Click "Continue with Google"
   - Should redirect to Google OAuth
   - After authorization, should redirect back to `/inbox`

## Debugging Steps

1. **Check server logs** for database connection errors
2. **Check browser console** for OAuth redirect errors
3. **Verify .env file** has all required variables
4. **Test database connection** separately
5. **Check Google OAuth console** for redirect URI configuration
6. **Verify NEXTAUTH_URL** matches current environment

## Quick Fix Checklist

- [ ] `.env` file exists and has `DATABASE_URL`
- [ ] `.env` file has `AUTH_SECRET` or `NEXTAUTH_SECRET`
- [ ] `.env` file has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] `NEXTAUTH_URL` matches current environment (localhost for dev, production URL for prod)
- [ ] Prisma client is generated: `npx prisma generate`
- [ ] Database is accessible
- [ ] Google OAuth redirect URIs are configured correctly
- [ ] Dev server is restarted after .env changes

