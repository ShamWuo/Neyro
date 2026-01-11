# Deployment Guide

Complete guide for deploying Neyro to production and app stores.

## Production Deployment

### Prerequisites
- PostgreSQL database
- Environment variables configured
- Domain name configured
- SSL certificate

### Environment Variables
```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://yourdomain.com
GEMINI_API_KEY=... (optional)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Build & Deploy
```bash
npm run build
npm start
```

## App Store Deployment

### Prerequisites

**iOS (macOS required)**
- macOS with Xcode 14+
- Apple Developer Account ($99/year)
- CocoaPods: `sudo gem install cocoapods`

**Android**
- Android Studio
- JDK 17+
- Android SDK configured
- Google Play Developer Account ($25 one-time)

### Installation

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npm install @capacitor/camera @capacitor/filesystem @capacitor/share
npm install @capacitor/status-bar @capacitor/keyboard @capacitor/app
npm install @capacitor/push-notifications
```

### Building for Native

```bash
# Build Next.js app
npm run build:native

# Sync to native projects
npm run cap:sync
```

### iOS Deployment

1. Open in Xcode: `npm run cap:ios`
2. Configure app ID, signing, and capabilities
3. Build archive: Product → Archive
4. Submit to App Store Connect

### Android Deployment

1. Open in Android Studio: `npm run cap:android`
2. Build release APK/AAB
3. Upload to Google Play Console

## Native Features

**Camera**: Native camera/gallery access via Capacitor Camera plugin  
**Sharing**: Native share sheets on iOS/Android  
**Push Notifications**: Configured for reminders and reviews  
**Status Bar**: Theme-aware styling  
**Keyboard**: Optimized mobile keyboard handling

Native features automatically detect platform and fall back to web when needed.

## Production Checklist

See [PRE_LAUNCH_CHECKLIST.md](./PRE_LAUNCH_CHECKLIST.md) for comprehensive pre-launch verification.

Quick Checklist:
- [ ] All environment variables set (see ENV_VARIABLES.md)
- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] Prisma Client generated (`npx prisma generate`)
- [ ] Application builds successfully (`npm run build`)
- [ ] SSL certificate configured (HTTPS required)
- [ ] Error tracking configured (Sentry recommended)
- [ ] Analytics configured (optional)
- [ ] Monitoring set up
- [ ] Database backups configured
- [ ] Security headers verified
- [ ] Rate limiting active

## Environment Variables

See [ENV_VARIABLES.md](./ENV_VARIABLES.md) for complete list.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` or `AUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Your production domain (https://yourdomain.com)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

**Optional:**
- `GEMINI_API_KEY` - For AI features
- `STRIPE_SECRET_KEY` - For payments
- `S3_*` - For file storage

## Status

✅ **Production Ready**  
✅ **App Store Ready**  
✅ **Security Hardened**  
✅ **Database Migrations Applied**  
📋 **See PRE_LAUNCH_CHECKLIST.md for deployment steps**

