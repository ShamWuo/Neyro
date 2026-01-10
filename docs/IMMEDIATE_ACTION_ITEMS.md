# Immediate Action Items: Path to $10K MRR

## 🔥 THIS WEEK (Priority 1 - Do First!)

### 1. Stripe Integration (3-5 days) - CRITICAL
```bash
# Install Stripe
npm install stripe @stripe/stripe-js

# Create files needed:
- src/app/api/stripe/webhook/route.ts
- src/app/api/stripe/create-checkout/route.ts
- src/app/api/stripe/manage-subscription/route.ts
- src/app/settings/billing/page.tsx
- src/components/subscription-status.tsx
```

**Tasks:**
- [ ] Set up Stripe account & get API keys
- [ ] Create subscription products in Stripe dashboard
- [ ] Add subscription fields to User model (tier, status, billingCycle, stripeCustomerId)
- [ ] Implement checkout flow
- [ ] Handle webhook events (subscription.created, updated, deleted)
- [ ] Build billing settings page
- [ ] Test full flow (signup → checkout → webhook → access)

### 2. Subscription Enforcement (2-3 days)
- [ ] Create middleware to check subscription status
- [ ] Add feature gates:
  - Free: 3 projects max (not 7)
  - Free: Limited AI credits (50/month)
  - Free: Basic exports only
  - Focus: All features unlocked
- [ ] Add upgrade prompts when hitting limits
- [ ] Test all feature gates

### 3. Referral System (2-3 days)
- [ ] Add referral code to User model
- [ ] Generate unique codes on signup
- [ ] Create `/settings/referrals` page
- [ ] Build referral tracking (who referred whom)
- [ ] Implement rewards (1 month free for both)
- [ ] Add referral URL (`/ref/[code]`)
- [ ] Email template for referral invites

---

## 📅 NEXT WEEK (Priority 2)

### 4. Shareable Weekly Reviews (2-3 days)
- [ ] Design shareable review summary template
- [ ] Generate PNG/JPEG from review data
- [ ] Add "Share" button to review page
- [ ] Create share URL with preview (`/share/review/[id]`)
- [ ] Social media optimization (Open Graph tags)
- [ ] Track shares in analytics

### 5. Email Automation (3-5 days)
- [ ] Set up email provider (Resend, Postmark, or SendGrid)
- [ ] Welcome email series (5 emails):
  - Email 1: Welcome + first capture guide
  - Email 2: Create your first project
  - Email 3: Set up your first area
  - Email 4: Schedule your first weekly review
  - Email 5: Upgrade prompts & tips
- [ ] Weekly review reminder emails
- [ ] Upgrade prompts (when hitting limits)
- [ ] Re-engagement campaigns

### 6. Basic Onboarding (2-3 days)
- [ ] Welcome tour component
- [ ] First capture modal/wizard
- [ ] "Create first project" prompt
- [ ] "Set up first area" prompt
- [ ] Progress indicator (0-100%)

---

## 🎯 MONTH 1 (Critical Path to Revenue)

### Week 3-4: Polish & Launch Prep
- [ ] File attachments (images/PDFs to items)
- [ ] Calendar sync (Google Calendar)
- [ ] Export improvements (PDF weekly reviews)
- [ ] Mobile PWA improvements
- [ ] Bug fixes & performance
- [ ] User testing with 10-20 early users
- [ ] Collect testimonials

### Revenue Targets:
- **End of Month 1**: $500 MRR (28 paying users at $18/mo)

---

## 🚀 MONTH 2 (Growth Engine)

### Content Marketing
- [ ] Launch blog at `/blog`
- [ ] Write 8 blog posts:
  1. "Complete Guide to PARA Method"
  2. "How to Do a Weekly Review (Template Included)"
  3. "Why 7 Projects Max Makes You More Productive"
  4. "Inbox Zero vs. Inbox Management"
  5. "Case Study: How I Organized My Life with PARA"
  6. "10 Productivity Systems Compared (PARA vs GTD vs...)"

- [ ] SEO optimization for all posts
- [ ] Internal linking strategy
- [ ] Social media sharing

### Social Media Presence
- [ ] Twitter/X account active (daily posts)
- [ ] LinkedIn company page
- [ ] YouTube channel started
- [ ] Product Hunt profile created

### Product Improvements
- [ ] AI-powered weekly review insights
- [ ] Project templates marketplace
- [ ] Visual timeline/Gantt view
- [ ] Team features (Brain Trust tier)

### Revenue Targets:
- **End of Month 2**: $1,500 MRR (83 paying users)

---

## 📈 MONTH 3 (Acceleration)

### Product Hunt Launch (Week 9-10)
- [ ] Prepare 2 months in advance
- [ ] Build email list (500+ subscribers)
- [ ] Create compelling demo video
- [ ] Line up 20+ early supporters
- [ ] Submit on optimal day (Tuesday-Thursday)
- [ ] Engage with every comment
- [ ] Aim for top 5 product of the day

### Content Expansion
- [ ] YouTube video series (4 videos)
- [ ] Podcast appearances (3+ shows)
- [ ] Guest posts on productivity blogs
- [ ] Reddit engagement strategy

### Partnerships
- [ ] Reach out to 20 productivity influencers
- [ ] Offer free Brain Trust for reviews
- [ ] Cross-promotion with complementary tools

### Revenue Targets:
- **End of Month 3**: $3,000 MRR (167 paying users)

---

## 🎨 MONTH 4-6 (Scale)

### Paid Acquisition (Once Product-Market Fit)
- [ ] Google Ads (if CAC < $50)
- [ ] Facebook/Instagram retargeting
- [ ] LinkedIn Ads (for Brain Trust)
- [ ] Content sponsorships

### Enterprise Sales
- [ ] Enterprise landing page
- [ ] Demo booking calendar
- [ ] Sales deck
- [ ] Case studies

### Revenue Targets:
- **Month 4**: $5,000 MRR
- **Month 5**: $7,500 MRR
- **Month 6**: **$10,000 MRR** 🎉

---

## 🔧 TECHNICAL DEBT (Address as You Scale)

- [ ] Database query optimization
- [ ] Caching strategy
- [ ] CDN for assets
- [ ] Monitoring & alerting
- [ ] Security audit
- [ ] Load testing
- [ ] Backup & disaster recovery

---

## 📊 WEEKLY CHECK-INS

### Metrics to Review Weekly:
1. **Sign-ups**: New users per day
2. **Conversion**: Free → Paid rate
3. **Retention**: Weekly active users
4. **Revenue**: MRR growth
5. **Viral**: Referral rate
6. **Content**: Blog traffic, social engagement

### Adjust Based On:
- If conversion < 2% → Improve product value
- If churn > 5% → Focus on retention
- If CAC > $100 → Optimize marketing channels
- If viral coefficient < 1 → Boost referral program

---

## 🎯 QUICK WINS (Do These Today!)

1. **Add upgrade prompts** when users hit 3 projects (free limit)
2. **Add "Share Review" button** to weekly review page (basic version)
3. **Create referral dashboard** page (even if backend not ready)
4. **Set up email provider** (Resend is easiest)
5. **Write first blog post** about PARA method
6. **Create Twitter/X account** and start posting

---

## 💡 KEY PRINCIPLES

1. **Ship fast, iterate based on feedback**
2. **Focus on retention before acquisition**
3. **Build in public** (share journey on Twitter, Indie Hackers)
4. **Talk to users daily** (early users are your best feedback)
5. **Measure everything** (set up analytics from day 1)
6. **Celebrate small wins** (every paying user matters)

---

## 🚨 RED FLAGS (Watch Out For!)

- Conversion rate < 1% → Product-market fit issue
- Churn rate > 10% → Retention problem
- CAC > LTV/3 → Unsustainable growth
- Viral coefficient < 0.5 → Referral program not working
- No organic growth → Content strategy failing

**If you hit these, pause and fix before scaling!**

---

## 📞 RESOURCES

### Tools Needed:
- Stripe (payments)
- Resend/Postmark (email)
- Mixpanel/PostHog (analytics)
- Sentry (error tracking)
- Vercel (hosting)
- Database (already have)

### Communities:
- Indie Hackers
- Product Hunt makers
- Twitter productivity community
- Reddit r/productivity
- LinkedIn productivity groups

---

**Remember: The goal isn't to build every feature—it's to make users successful with PARA method. Every feature should serve that goal.**
