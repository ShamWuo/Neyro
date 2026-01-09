# Environment Variables

## Required

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/neyro?schema=public
AUTH_SECRET=replace-with-32-char-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GEMINI_API_KEY=your-gemini-api-key
```

## Optional

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
S3_BUCKET=
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
NEXT_PUBLIC_GA_ID=
BUILD_FOR_NATIVE=false
OPENAI_API_KEY=
DEEPGRAM_API_KEY=
```

**Notes:**
- Generate `AUTH_SECRET`: `openssl rand -base64 32`
- Get `GEMINI_API_KEY`: https://aistudio.google.com/apikey
- For production: Set `NEXTAUTH_URL` to your domain
- Google OAuth: Add redirect URI `http://localhost:3000/api/auth/callback/google`
- Without S3 vars: Files save to `public/uploads/`
