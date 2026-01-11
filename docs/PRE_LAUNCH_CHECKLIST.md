# Pre-Launch Checklist

**Date**: 2025-01-09  
**Status**: Ready for First Free Users

---

## ✅ Pre-Launch Verification

### Database
- [x] All migrations applied (`npx prisma migrate deploy`)
- [x] Prisma Client generated (`npx prisma generate`)
- [x] Database schema matches codebase
- [x] Database backups configured (if applicable)

### Security & Hardening
- [x] Security headers configured
- [x] XSS protection implemented
- [x] CSRF protection enabled
- [x] Rate limiting active
- [x] Input validation on all routes
- [x] Authorization checks on all operations
- [x] Authentication flows hardened

### Build & Code Quality
- [x] Application compiles successfully (`npm run build`)
- [x] No critical linting errors
- [x] Error boundaries implemented
- [x] Error handling in place

### Core Functionality
- [x] User registration works
- [x] User login works (Google OAuth + credentials)
- [x] Onboarding flow functional
- [x] Inbox capture works
- [x] Project/Area/Resource CRUD works
- [x] Weekly review wizard works
- [x] Item classification works

---

## 📋 Environment Variables Checklist

### Required for Production

```env
# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# Authentication (REQUIRED)
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
# OR
AUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://yourdomain.com

# Google OAuth (REQUIRED for Google sign-in)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Optional but Recommended

```env
# AI Features (Optional - app works without)
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# Stripe (Optional - for paid subscriptions)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# File Storage (Optional - defaults to local)
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Environment Variable Generation

**Generate AUTH_SECRET:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Google OAuth Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
4. Copy Client ID and Client Secret

---

## 🚀 Deployment Steps

### 1. Pre-Deployment Verification

```bash
# Verify database migrations
npx prisma migrate status

# Generate Prisma Client
npx prisma generate

# Build application
npm run build

# Run linting
npm run lint
```

### 2. Environment Setup

1. **Set all required environment variables** (see checklist above)
2. **Verify DATABASE_URL** points to production database
3. **Ensure NEXTAUTH_URL** matches your domain (with https://)
4. **Generate AUTH_SECRET** if not already set
5. **Configure Google OAuth** redirect URIs

### 3. Database Migration (Production)

```bash
# Apply all migrations to production database
npx prisma migrate deploy

# Verify schema is up to date
npx prisma migrate status
```

### 4. Deployment (Vercel/Platform)

**For Vercel:**
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

**For other platforms:**
1. Build: `npm run build`
2. Start: `npm start`
3. Ensure Node.js 18+ runtime
4. Set PORT environment variable if needed

### 5. Post-Deployment Verification

- [ ] Visit homepage - loads correctly
- [ ] Test user registration
- [ ] Test user login (both methods)
- [ ] Test core flows (capture item, create project)
- [ ] Check error logs for issues
- [ ] Verify HTTPS is working
- [ ] Test mobile responsiveness

---

## 📊 Monitoring Setup (Recommended)

### Error Tracking
- [ ] Set up Sentry or similar error tracking
- [ ] Configure error alerts
- [ ] Test error reporting

### Analytics
- [ ] Set up Google Analytics (if using)
- [ ] Configure user event tracking
- [ ] Set up conversion tracking

### Logging
- [ ] Configure production logging
- [ ] Set up log aggregation (if applicable)
- [ ] Configure log retention policies

### Performance Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure performance alerts
- [ ] Monitor API response times

---

## 🔒 Security Checklist

- [x] Security headers configured
- [x] HTTPS enforced
- [x] Rate limiting active
- [x] Input validation on all endpoints
- [x] SQL injection protection (Prisma)
- [x] XSS protection implemented
- [x] CSRF protection enabled
- [x] Authentication secured
- [x] Authorization checks in place
- [ ] Security audit completed (optional)
- [ ] Penetration testing (optional, for later)

---

## 📝 Known Limitations (Non-Blocking)

These features are stubbed but don't block core functionality:

- [ ] **Milestones** - API routes secured, database model pending
- [ ] **Goals** - API routes secured, database model pending  
- [ ] **Notifications** - Stubbed for future implementation
- [ ] **AI Credit Persistence** - In-memory tracking (resets on restart)
- [ ] **Project/Resource Notes** - Fields not yet in schema

**Impact**: None of these block core PARA workflow functionality.

---

## 🎯 Launch Strategy

### Phase 1: Soft Launch (Recommended First Step)
- [ ] Invite 10-20 trusted beta users
- [ ] Monitor error logs closely
- [ ] Collect user feedback
- [ ] Document any issues
- [ ] Fix critical bugs quickly

### Phase 2: Public Beta
- [ ] Fix issues from Phase 1
- [ ] Implement persistent AI credit tracking
- [ ] Add email integration (if needed)
- [ ] Open to public with "Beta" label
- [ ] Create user feedback channel

### Phase 3: Full Launch
- [ ] Complete milestones/goals features
- [ ] Add notifications system
- [ ] Polish UI/UX based on feedback
- [ ] Launch marketing campaign
- [ ] Monitor user growth and engagement

---

## 🆘 Support Preparation

- [ ] Create FAQ page
- [ ] Set up support email/channel
- [ ] Document common issues and solutions
- [ ] Prepare user onboarding materials
- [ ] Create video tutorials (optional)

---

## ✅ Final Go/No-Go Decision

Before launching, verify:

- [ ] All critical functionality works
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Security measures in place
- [ ] Error tracking configured
- [ ] Monitoring set up
- [ ] Support channels ready
- [ ] Backup/recovery plan in place

**If all checked:** ✅ **READY TO LAUNCH**

---

## 📞 Quick Reference

**Database Commands:**
```bash
npx prisma migrate deploy    # Apply migrations
npx prisma generate          # Generate client
npx prisma studio            # Open database GUI
npx prisma migrate status    # Check migration status
```

**Build Commands:**
```bash
npm run build               # Build for production
npm start                   # Start production server
npm run dev                 # Start development server
```

**Testing:**
- Manual testing of core flows
- Monitor error logs
- Check database queries
- Verify API responses

---

**Last Updated**: 2025-01-09  
**Status**: Ready for Soft Launch
