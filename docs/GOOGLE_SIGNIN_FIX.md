# Google Sign-In Fix

## Issue
User cannot sign in with Google OAuth.

## Root Causes

1. **NEXTAUTH_URL Mismatch**: The `.env` file has `NEXTAUTH_URL` set to `https://neyro.vercel.app` (production URL), but when running locally on `http://localhost:3000`, this causes a redirect mismatch.

2. **Missing Error Handling**: The `handleSignIn` server action doesn't properly handle errors or redirects from NextAuth v5.

3. **OAuth Redirect URI Configuration**: Google OAuth console needs to have `http://localhost:3000/api/auth/callback/google` configured as an authorized redirect URI for local development.

## Fixes Applied

### 1. Added Error Handling to Login Page
- Updated `src/app/auth/login/page.tsx` to:
  - Properly handle `NEXT_REDIRECT` errors from NextAuth v5
  - Display error messages to users
  - Accept `error` query parameter for error display

### 2. Updated Auth Configuration
- Modified `src/auth.ts` to better handle URL detection in development vs production

### 3. Environment Variables Check
- Verified that Google OAuth credentials are present in `.env`

## Required Steps to Fix

### Step 1: Update `.env` File

For local development, set:
```env
NEXTAUTH_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
```

For production (Vercel), set:
```env
NEXTAUTH_URL=https://neyro.vercel.app
AUTH_URL=https://neyro.vercel.app
```

### Step 2: Configure Google OAuth Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/google` (for local development)
   - `https://neyro.vercel.app/api/auth/callback/google` (for production)

### Step 3: Verify Environment Variables

Ensure your `.env` file has:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
AUTH_SECRET=your-auth-secret
NEXTAUTH_URL=http://localhost:3000  # for local dev
```

### Step 4: Restart Development Server

After updating `.env`, restart your development server:
```bash
npm run dev
```

## Testing

1. Navigate to `http://localhost:3000/auth/login`
2. Click "Continue with Google"
3. You should be redirected to Google's OAuth consent screen
4. After authorization, you should be redirected back to `/inbox`

## Troubleshooting

### Still seeing errors?

1. **Check browser console** for any JavaScript errors
2. **Check server logs** for authentication errors
3. **Verify OAuth credentials** are correct in `.env`
4. **Check redirect URI** matches exactly in Google Console
5. **Clear browser cookies** and try again
6. **Check network tab** to see if OAuth callback is being called

### Common Issues

1. **"redirect_uri_mismatch"**: 
   - Ensure the redirect URI in Google Console exactly matches `http://localhost:3000/api/auth/callback/google`
   - Check for trailing slashes or protocol mismatches

2. **"invalid_client"**:
   - Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
   - Ensure OAuth consent screen is configured

3. **"access_denied"**:
   - User might have denied permissions
   - OAuth consent screen might need to be published

---

**Last Updated**: 2025-01-09

