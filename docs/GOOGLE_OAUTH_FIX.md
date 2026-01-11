# Google OAuth Callback Error Fix

## Error
```
/api/auth/callback/google
[auth][details]: {}
```

This error indicates that the Google OAuth callback is failing during authentication.

---

## Common Causes

### 1. NEXTAUTH_URL Mismatch (Most Common)

**Issue:** `NEXTAUTH_URL` in Vercel doesn't match your actual domain.

**Fix:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Set `NEXTAUTH_URL` to: `https://neyro.vercel.app`
3. **Must be HTTPS** (not HTTP)
4. **Must match your domain exactly**
5. Redeploy after changing

### 2. Google OAuth Redirect URI Mismatch

**Issue:** Redirect URI in Google Cloud Console doesn't match your callback URL.

**Fix:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials
3. Click your OAuth 2.0 Client ID
4. **Authorized redirect URIs** must include:
   - `https://neyro.vercel.app/api/auth/callback/google`
5. **Important:**
   - Use HTTPS (not HTTP)
   - Include the full path `/api/auth/callback/google`
   - Must match exactly (no trailing slashes)

### 3. Missing Environment Variables

**Required variables in Vercel:**
```env
NEXTAUTH_URL=https://neyro.vercel.app
AUTH_SECRET=<your-secret>
# OR
NEXTAUTH_SECRET=<your-secret>

GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Verify all are set:**
1. Vercel Dashboard → Settings → Environment Variables
2. Check each variable exists
3. Check values are correct (no typos)
4. Redeploy after adding/updating

### 4. AUTH_SECRET Not Set or Invalid

**Issue:** Authentication secret is missing or incorrect.

**Fix:**
1. Generate a new secret:
   ```bash
   # Linux/Mac
   openssl rand -base64 32
   
   # Windows PowerShell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```
2. Set in Vercel as `AUTH_SECRET` or `NEXTAUTH_SECRET`
3. Must be at least 32 characters
4. Redeploy

### 5. Google OAuth Client Not Configured

**Issue:** Google OAuth client ID/secret are wrong or not set.

**Fix:**
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel
2. Check they match Google Cloud Console
3. Ensure OAuth consent screen is configured
4. Ensure OAuth client is enabled

---

## Step-by-Step Fix

### Step 1: Verify NEXTAUTH_URL

**In Vercel:**
1. Settings → Environment Variables
2. Find `NEXTAUTH_URL`
3. Should be: `https://neyro.vercel.app`
4. **Not** `http://localhost:3001` or `http://neyro.vercel.app`
5. Update if wrong, then redeploy

### Step 2: Configure Google OAuth

**In Google Cloud Console:**

1. **Go to:** [Google Cloud Console](https://console.cloud.google.com)

2. **Select your project** (or create one)

3. **Enable Google+ API:**
   - APIs & Services → Library
   - Search "Google+ API" or "People API"
   - Click "Enable"

4. **Configure OAuth Consent Screen:**
   - APIs & Services → OAuth consent screen
   - Choose "External" (unless you have Google Workspace)
   - Fill in required fields:
     - App name: "Neyro"
     - User support email: your email
     - Developer contact: your email
   - Add scopes (if needed):
     - `email`
     - `profile`
   - Save

5. **Create OAuth 2.0 Client:**
   - APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Neyro Web Client"
   - **Authorized JavaScript origins:**
     - `https://neyro.vercel.app`
   - **Authorized redirect URIs:**
     - `https://neyro.vercel.app/api/auth/callback/google`
   - Click "Create"
   - Copy **Client ID** and **Client Secret**

6. **Set in Vercel:**
   - `GOOGLE_CLIENT_ID` = Your Client ID
   - `GOOGLE_CLIENT_SECRET` = Your Client Secret
   - Redeploy

### Step 3: Verify Environment Variables

**Checklist:**
- [ ] `NEXTAUTH_URL=https://neyro.vercel.app`
- [ ] `AUTH_SECRET` or `NEXTAUTH_SECRET` is set (32+ chars)
- [ ] `GOOGLE_CLIENT_ID` is set
- [ ] `GOOGLE_CLIENT_SECRET` is set
- [ ] All variables are set for "Production" environment
- [ ] No typos or extra spaces

### Step 4: Redeploy

**Important:** Environment variables only apply to new deployments.

1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Or push a new commit to trigger deployment
4. Wait for deployment to complete

### Step 5: Test Authentication

1. Go to `https://neyro.vercel.app/auth/login`
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. Should redirect back to `/inbox`
5. Check Vercel logs if it fails

---

## Debugging Steps

### 1. Check Vercel Function Logs

**In Vercel Dashboard:**
1. Go to Functions tab
2. Click on a function
3. View Real-time Logs
4. Try logging in
5. Watch for specific error messages

### 2. Check Browser Console

**In browser DevTools:**
1. Open Console tab
2. Try logging in
3. Look for JavaScript errors
4. Check Network tab for failed requests

### 3. Test OAuth Configuration

**Verify redirect URI matches exactly:**
- Google Console: `https://neyro.vercel.app/api/auth/callback/google`
- NextAuth expects: `/api/auth/callback/google` (relative to `NEXTAUTH_URL`)

**Test URL construction:**
- `NEXTAUTH_URL` + `/api/auth/callback/google` = Full callback URL
- Should match Google Console redirect URI exactly

### 4. Check Session Creation

**If callback succeeds but session fails:**
- Check database connection (previous issue)
- Verify Prisma adapter is working
- Check Session table exists in database
- Verify migrations are applied

---

## Common Error Patterns

### Error: "redirect_uri_mismatch"
- **Cause:** Redirect URI in Google Console doesn't match
- **Fix:** Update Google Console redirect URI to match exactly

### Error: "invalid_client"
- **Cause:** Wrong Client ID or Secret
- **Fix:** Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel

### Error: "access_denied"
- **Cause:** User denied permission or OAuth consent screen not configured
- **Fix:** Configure OAuth consent screen in Google Console

### Error: Empty details `{}`
- **Cause:** Generic authentication error, usually configuration issue
- **Fix:** Check all environment variables and OAuth configuration

---

## Quick Checklist

Before testing, verify:

- [ ] `NEXTAUTH_URL` is set to `https://neyro.vercel.app` in Vercel
- [ ] `AUTH_SECRET` or `NEXTAUTH_SECRET` is set (32+ characters)
- [ ] `GOOGLE_CLIENT_ID` is set in Vercel
- [ ] `GOOGLE_CLIENT_SECRET` is set in Vercel
- [ ] Google OAuth consent screen is configured
- [ ] Redirect URI in Google Console: `https://neyro.vercel.app/api/auth/callback/google`
- [ ] JavaScript origin in Google Console: `https://neyro.vercel.app`
- [ ] All environment variables are for "Production" environment
- [ ] Application has been redeployed after setting variables
- [ ] Database connection is working (from previous fix)

---

## Testing After Fix

1. **Clear browser cookies** (or use incognito)
2. Go to `https://neyro.vercel.app/auth/login`
3. Click "Continue with Google"
4. Complete OAuth flow
5. Should redirect to `/inbox` successfully

**If still failing:**
- Check Vercel Function Logs for specific error
- Verify all environment variables are correct
- Test with a fresh browser session
- Check Google Cloud Console for any errors

---

## Additional Notes

### For Development
- Use `http://localhost:3001` for `NEXTAUTH_URL` locally
- Add `http://localhost:3001/api/auth/callback/google` to Google Console (for testing)
- Use same `AUTH_SECRET` in both environments

### For Production
- Always use HTTPS
- Use production domain for `NEXTAUTH_URL`
- Don't include localhost URLs in production OAuth client

### Security
- Never commit secrets to git
- Use different OAuth clients for dev/prod (recommended)
- Rotate secrets periodically
- Use strong `AUTH_SECRET` (32+ random characters)

---

**Last Updated**: 2025-01-10
