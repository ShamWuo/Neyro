# App Store Submission Checklist

## Before You Submit

### Required Assets

#### App Store Connect (iOS)
- [ ] **App Icon**: 1024x1024px (no transparency)
- [ ] **Screenshots**: 
  - iPhone 6.7" (1290x2796): 3-10 images
  - iPhone 6.5" (1242x2688): 3-10 images
  - iPad Pro 12.9" (2048x2732): 3-10 images (if supporting iPad)
- [ ] **App Preview Video** (optional): 15-30 seconds

#### Google Play Console (Android)
- [ ] **App Icon**: 512x512px
- [ ] **Feature Graphic**: 1024x500px
- [ ] **Screenshots**:
  - Phone: 1080x1920 minimum, 2-8 images
  - Tablet: 1920x1080 minimum (if supporting tablets)

### Required Information

- [ ] **App Name**: "Neyro - AI Task Manager" (or similar)
- [ ] **Subtitle/Short Description**: Max 30 chars (iOS) / 80 chars (Android)
- [ ] **Description**: Compelling copy highlighting V2 features
- [ ] **Keywords**: productivity, PARA, AI, task manager, GTD
- [ ] **Category**: Productivity
- [ ] **Age Rating**: 4+ (no objectionable content)
- [ ] **Privacy Policy URL**: Required for both stores
- [ ] **Support URL**: Email or website
- [ ] **Marketing URL** (optional): Landing page

### Legal Requirements

- [ ] **Privacy Policy**: Must cover:
  - Data collection (Supabase, AI usage)
  - Third-party services (Google Gemini)
  - User rights (GDPR if applicable)
  - Contact information

- [ ] **Terms of Service** (recommended)

- [ ] **Export Compliance**: Declare encryption usage (yes, for HTTPS)

---

## Submission Process

### iOS (App Store Connect)

1. **Create App Listing**
   ```
   https://appstoreconnect.apple.com
   → My Apps → + (New App)
   ```

2. **Fill Required Fields**
   - Bundle ID: `com.neyro.app`
   - SKU: `neyro-v2`
   - Primary Language: English

3. **Upload Build**
   ```bash
   eas submit --platform ios
   ```
   Or manually upload via Transporter app

4. **Submit for Review**
   - Answer questionnaire
   - Add reviewer notes if needed
   - Submit

**Timeline**: 1-3 days review

### Android (Google Play Console)

1. **Create App**
   ```
   https://play.google.com/console
   → All apps → Create app
   ```

2. **Complete Store Listing**
   - App name, description, graphics
   - Content rating questionnaire
   - Target audience

3. **Upload Build**
   ```bash
   eas submit --platform android
   ```
   Or manually upload AAB file

4. **Create Release**
   - Internal testing → Closed testing → Production
   - Recommend: Start with Internal Testing

**Timeline**: Few hours to 1 day review

---

## App Description Template

### Short Description (80 chars)
```
AI-powered task manager using PARA method. Psychic inbox, smart projects.
```

### Full Description

```
Neyro V2: The AI Task Manager That Explains Itself

🧠 PSYCHIC AI INBOX
• See why the AI classified each item
• Automatic action chunking: one input → multiple tasks
• Confidence scores for transparency

📊 PROJECT HEALTH SYSTEM
• Visual indicators prevent scope creep
• Automatic staleness detection
• Deadline warnings and alerts

💪 AREA HEALTH SCORING
• Dynamic scoring based on real activity
• Track tasks completed and focus time
• Get alerts for neglected life areas

Built on the PARA method (Projects, Areas, Resources, Archives) for maximum productivity.

FEATURES:
✓ Offline-first (works without internet)
✓ AI-powered classification
✓ Natural language dates
✓ Focus mode with timers
✓ Weekly review ritual
✓ Sync across devices

Perfect for:
• GTD practitioners
• PARA method users
• Knowledge workers
• Students and researchers
• Anyone drowning in tasks

Privacy-first. Your data stays yours.
```

### Keywords (iOS, comma-separated)
```
productivity,task manager,PARA,GTD,AI,projects,areas,focus,weekly review,getting things done,second brain,PKM
```

---

## Screenshot Ideas

### 1. Inbox with AI Reasoning
Show: Task with confidence score and reasoning

### 2. Action Chunking
Show: One input becoming 3 tasks

### 3. Project Health
Show: Projects with health badges (green, yellow, red)

### 4. Area Health
Show: Areas with 1-5 health scores

### 5. Focus Mode
Show: Active focus session

### 6. Weekly Review
Show: Review screen (if implemented)

**Tools for Screenshots**:
- Use iOS Simulator / Android Emulator
- `Cmd+S` to save screenshot
- Add device frames: https://screenshots.pro
- Add captions: Figma or Canva

---

## Common Rejection Reasons

### iOS
1. **Missing Privacy Policy**: Must have URL
2. **Crashes on Launch**: Test thoroughly
3. **Incomplete Metadata**: Fill all required fields
4. **Misleading Screenshots**: Must show actual app
5. **Broken Links**: Test all URLs

### Android
1. **Content Rating**: Complete questionnaire
2. **Target API Level**: Must target recent Android
3. **Permissions**: Justify all requested permissions
4. **Privacy Policy**: Required if collecting data

---

## After Approval

### Day 1
- [ ] Announce on social media
- [ ] Post to Product Hunt
- [ ] Share in communities
- [ ] Monitor crash reports

### Week 1
- [ ] Respond to all reviews
- [ ] Fix critical bugs
- [ ] Gather user feedback
- [ ] Plan V2.1 patch

---

## Quick Commands Reference

```bash
# Build for stores
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android

# Check build status
eas build:list

# View credentials
eas credentials
```

---

## Need Help?

- **iOS Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Android Policy**: https://play.google.com/about/developer-content-policy/
- **EAS Submit Docs**: https://docs.expo.dev/submit/introduction/

---

**You've got this!** 🚀
