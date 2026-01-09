# Sign-In Issue Fix

## Problem
Sign-in not working, possibly due to database connection or OAuth configuration issues.

## Issues Found & Fixed

### ✅ 1. NEXTAUTH_URL Configuration
**Issue:** `NEXTAUTH_URL` was set to production URL while running locally.

**Fix Applied:**
- Updated `src/auth.ts` to use `trustHost: true` which auto-detects the correct URL
- Added error handling and logging
- Added error page configuration

**Action Required:**
Update your `.env` file:
```env
# Change this line:
NEXTAUTH_URL="https://neyro.vercel.app"

# To this for local development:
NEXTAUTH_URL="http://localhost:3000"
```

**Note:** The code now auto-detects the URL, but explicit setting is recommended for clarity.

### ✅ 2. Database Connection Error Handling
**Fix Applied:**
- Added connection testing in `src/lib/prisma.ts`
- Added error logging for database connection failures
- Better error messages

### ✅ 3. Auth Error Logging
**Fix Applied:**
- Added event handlers for sign-in success/failure
- Logs errors to console for debugging
- Added error page redirect

## Quick Fix Steps

1. **Update .env file:**
   ```env
   NEXTAUTH_URL=http://localhost:3000
   ```

2. **Restart dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

3. **Test database connection:**
   ```bash
   npx prisma db pull
   ```

4. **Test sign-in:**
   - Visit: `http://localhost:3000/auth/login`
   - Click "Continue with Google"
   - Should redirect to Google OAuth
   - After authorization, should redirect back to `/inbox`

## Verify Google OAuth Setup

Make sure your Google OAuth credentials have the correct redirect URI:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Find your OAuth 2.0 Client ID
4. Add authorized redirect URI:
   - `http://localhost:3000/api/auth/callback/google` (for local dev)
   - `https://neyro.vercel.app/api/auth/callback/google` (for production)

## Check Database Connection

Run the check script:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/check-auth-setup.ps1
```

Or manually test:
```bash
npx prisma db pull
```

## Common Errors

### Error: "redirect_uri_mismatch"
**Cause:** Google OAuth redirect URI doesn't match `NEXTAUTH_URL`
**Fix:** Update Google OAuth console with correct redirect URI

### Error: "Database connection failed"
**Cause:** Database is not accessible or `DATABASE_URL` is incorrect
**Fix:** Check `DATABASE_URL` in `.env` and verify database is running

### Error: "Prisma client not generated"
**Cause:** Prisma client files are locked or missing
**Fix:** Stop dev server, run `npx prisma generate`, restart server

## Files Modified

1. `src/auth.ts` - Added auto-detection and error handling
2. `src/lib/prisma.ts` - Added connection testing and error logging
3. `scripts/check-auth-setup.ps1` - New diagnostic script
4. `docs/AUTH_TROUBLESHOOTING.md` - Comprehensive troubleshooting guide

## Next Steps

1. ✅ Code fixes applied
2. ⏳ Update `.env` file with `NEXTAUTH_URL=http://localhost:3000`
3. ⏳ Restart dev server
4. ⏳ Test sign-in flow
5. ⏳ Verify database connection works

