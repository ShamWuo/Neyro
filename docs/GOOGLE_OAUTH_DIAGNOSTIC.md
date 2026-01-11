# Google OAuth Diagnostic Checklist

## Current Error
```
GET /api/auth/callback/google
[auth][details]: {}
```

This indicates a silent failure during OAuth callback.

---

## Immediate Diagnostic Steps

### 1. Check Environment Variables in Vercel

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

**Verify these are set for Production:**
- [ ] `NEXTAUTH_URL=https://neyro.vercel.app` (exact match, HTTPS)
- [ ] `AUTH_SECRET` or `NEXTAUTH_SECRET` (32+ characters)
- [ ] `GOOGLE_CLIENT_ID` (ends with `.apps.googleusercontent.com`)
- [ ] `GOOGLE_CLIENT_SECRET` (not empty)

**Check for:**
- No extra spaces or quotes
- Correct environment selected (Production)
- Values match Google Cloud Console exactly

### 2. Verify Google Cloud Console Configuration

**Go to:** [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials

**Check OAuth 2.0 Client:**
- [ ] **Authorized JavaScript origins:**
  - `https://neyro.vercel.app` (exact match)
- [ ] **Authorized redirect URIs:**
  - `https://neyro.vercel.app/api/auth/callback/google` (exact match, no trailing slash)
- [ ] OAuth consent screen is configured
- [ ] Client ID and Secret match Vercel environment variables

### 3. Check Database Connection

**Since we just set up Prisma Data Platform:**
- [ ] Verify `DATABASE_URL` includes `?pgbouncer=true`
- [ ] Check Prisma Data Platform dashboard for connection status
- [ ] Verify database is accessible (not blocked by firewall)

**Test connection:**
```bash
# In Vercel, check function logs for database errors
# Look for: "Failed to connect to database" or "Connection pool timeout"
```

### 4. Check Vercel Function Logs

**Go to:** Vercel Dashboard → Your Project → Functions → Real-time Logs

**Look for:**
- Database connection errors
- Missing environment variable errors
- OAuth callback errors
- Any error messages with stack traces

**After enhanced logging (just added):**
- `[INFO] SignIn Callback` - Should appear during OAuth flow
- `[ERROR] SignIn Callback Error` - Will show if callback fails
- `[ERROR] SignIn Error Event` - Will show NextAuth errors

### 5. Test OAuth Flow Manually

**Steps:**
1. Clear browser cookies (or use incognito)
2. Go to `https://neyro.vercel.app/auth/login`
3. Click "Continue with Google"
4. Complete Google OAuth consent
5. Watch Vercel logs in real-time
6. Note exact error message

---

## Common Issues and Fixes

### Issue 1: Database Connection During OAuth

**Symptom:** OAuth callback fails silently, database errors in logs

**Fix:**
- Ensure `DATABASE_URL` uses Prisma Data Platform pooling URL
- Verify database is accessible from Vercel
- Check Prisma Data Platform dashboard for connection issues

### Issue 2: Missing Environment Variables

**Symptom:** `[auth][details]: {}` with no other errors

**Fix:**
- Verify all required variables are set in Vercel
- Check variable names match exactly (case-sensitive)
- Ensure variables are set for Production environment
- Redeploy after adding variables

### Issue 3: Redirect URI Mismatch

**Symptom:** OAuth redirects but callback fails

**Fix:**
- Google Console redirect URI must match exactly:
  - `https://neyro.vercel.app/api/auth/callback/google`
- `NEXTAUTH_URL` must be: `https://neyro.vercel.app`
- No trailing slashes, exact case match

### Issue 4: AUTH_SECRET Missing or Invalid

**Symptom:** Session creation fails

**Fix:**
- Generate new secret:
  ```bash
  openssl rand -base64 32
  ```
- Set in Vercel as `AUTH_SECRET`
- Must be 32+ characters
- Redeploy

### Issue 5: OAuth Consent Screen Not Configured

**Symptom:** Google shows error or blocks OAuth

**Fix:**
- Go to Google Cloud Console → OAuth consent screen
- Configure required fields:
  - App name
  - User support email
  - Developer contact email
- Add scopes: `email`, `profile`
- Save and publish

---

## Enhanced Logging (Just Added)

The auth configuration now includes:
- Enhanced error logging in all callbacks
- `signInError` event handler to catch NextAuth errors
- More detailed logging with user IDs and provider info
- Error stack traces in production

**What to look for in logs:**
- `[INFO] SignIn Callback` - OAuth callback started
- `[ERROR] SignIn Callback Error` - Callback failed
- `[ERROR] SignIn Error Event` - NextAuth error caught
- `[ERROR] CreateUser Event Error` - User creation failed
- `[ERROR] LinkAccount Event Error` - Account linking failed

---

## Quick Fix Checklist

Run through this checklist in order:

1. **Environment Variables:**
   - [ ] `NEXTAUTH_URL=https://neyro.vercel.app` (Production)
   - [ ] `AUTH_SECRET` set (32+ chars)
   - [ ] `GOOGLE_CLIENT_ID` set
   - [ ] `GOOGLE_CLIENT_SECRET` set

2. **Google Cloud Console:**
   - [ ] Redirect URI: `https://neyro.vercel.app/api/auth/callback/google`
   - [ ] JavaScript origin: `https://neyro.vercel.app`
   - [ ] OAuth consent screen configured

3. **Database:**
   - [ ] `DATABASE_URL` uses pooling URL (`?pgbouncer=true`)
   - [ ] Database accessible from Vercel
   - [ ] No connection pool errors in logs

4. **Deployment:**
   - [ ] Redeployed after environment variable changes
   - [ ] Latest code deployed (with enhanced logging)
   - [ ] Checked function logs for errors

5. **Test:**
   - [ ] Clear cookies / use incognito
   - [ ] Try OAuth login
   - [ ] Watch logs in real-time
   - [ ] Note any error messages

---

## Next Steps After Fix

Once OAuth is working:

1. **Monitor logs** for any remaining issues
2. **Test with multiple users** to ensure stability
3. **Check Prisma Data Platform** dashboard for connection metrics
4. **Verify session creation** works correctly
5. **Test logout** functionality

---

## Still Not Working?

If OAuth still fails after all checks:

1. **Check Vercel Function Logs** for specific error messages
2. **Verify Prisma schema** has all required Auth.js tables:
   - `User`
   - `Account`
   - `Session`
   - `VerificationToken`
3. **Test database connection** directly:
   ```bash
   npx prisma db pull
   ```
4. **Check NextAuth version** compatibility
5. **Review Google Cloud Console** for any error messages

---

**Last Updated**: 2025-01-10
