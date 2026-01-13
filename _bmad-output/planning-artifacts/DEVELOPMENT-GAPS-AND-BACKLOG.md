# Pulau Development Gaps & Backlog Analysis

**Date:** 2026-01-12  
**Status:** Post-Production Launch

---

## 🎯 Current State Summary

### ✅ Completed (Production Live)

- **Phases 1-2b:** MVP complete (all 32 epics, 200+ stories)
- **Production:** Deployed to https://pulau.vercel.app
- **Infrastructure:** Supabase, Stripe, Sentry, Vercel all configured
- **Core Features:** Auth, booking, payments, trip canvas, vendor portal

### 🔄 In Progress

- **Epic 30.1:** Email system (4/5 stories done, 1 blocked)
- **Production Setup:** 8/8 tasks complete

### ⏳ Ready for Development

- **Epic 33:** UX 2.0 (5 stories ready, not started)
- **Phase 3:** UX Refinement & Optimization

---

## 📋 Backlog: Epic 33 - UX 2.0 (Phase 3)

### Priority: HIGH

**Status:** All story files created, ready for immediate development  
**Impact:** Significantly improves user experience and conversion rates  
**Epic File:** `_bmad-output/planning-artifacts/epics.md` (Epic 33)

### Story 33-1: Sticky Trip Bar Implementation

**Status:** ready-for-dev  
**File:** [33-1-sticky-trip-bar-implementation.md](_bmad-output/stories/33-1-sticky-trip-bar-implementation.md)  
**Estimated:** 4-6 hours

**User Story:**
As a Traveler, I want to see a persistent summary of my trip items and total cost at the bottom of the screen, so that I can track my budget in real-time and access checkout instantly.

**Key Features:**

- Conditional visibility (hidden when 0 items)
- Slide-up/fade-in animation on first item add
- Real-time item count and price updates
- Fixed positioning with safe-area insets
- Tap to expand Trip Canvas
- Direct "Checkout" button

**Technical Tasks:**

- [ ] Create `StickyTripBar.tsx` component
- [ ] Implement fixed positioning with safe-area padding
- [ ] Add AnimatePresence for entry/exit animations
- [ ] Connect to TripContext for real-time data
- [ ] Add tap handlers for expand/checkout
- [ ] Create E2E tests (sticky-trip-bar.spec.ts)
- [ ] Test on mobile viewports (iPhone, Android)

**Files to Create:**

- `src/components/StickyTripBar.tsx` (new component)
- `src/components/StickyTripBar.test.tsx` (unit tests)
- `tests/e2e/sticky-trip-bar.spec.ts` (E2E tests)

**Dependencies:** TripContext (exists), AnimatePresence (installed)

---

### Story 33-2: Single-Screen Onboarding Redesign

**Status:** ready-for-dev  
**File:** [33-2-single-screen-onboarding-redesign.md](_bmad-output/stories/33-2-single-screen-onboarding-redesign.md)  
**Estimated:** 6-8 hours

**User Story:**
As a new user, I want to complete onboarding in a single screen with progressive disclosure, so that I can start browsing experiences faster without multi-step friction.

**Current Problem:**

- 3-screen onboarding flow (welcome → preferences → dates)
- High abandonment rate
- Takes ~60 seconds to complete

**Target:**

- Single-screen onboarding
- < 20 seconds to complete
- Optional preference selection (not required)

**Technical Tasks:**

- [ ] Consolidate 3 screens into `OnboardingScreen.tsx`
- [ ] Implement collapsible sections (preferences, dates)
- [ ] Add "Skip" functionality with defaults
- [ ] Update routing to bypass multi-step flow
- [ ] Migrate existing user progress data
- [ ] A/B test performance tracking

**Impact:** Reduce onboarding abandonment by ~40%

---

### Story 33-3: Quick-Add Interaction Loop

**Status:** ready-for-dev  
**File:** [33-3-quick-add-interaction-loop.md](_bmad-output/stories/33-3-quick-add-interaction-loop.md)  
**Estimated:** 8-10 hours

**User Story:**
As a Traveler, I want to add experiences to my trip with one tap and immediate visual feedback, so that I can build my itinerary quickly without interrupting my browsing flow.

**Key Features:**

- One-tap "+" button on experience cards
- Instant visual confirmation (checkmark, pulse animation)
- Auto-expand sticky trip bar with new item highlight
- Haptic feedback on mobile
- Undo/remove with swipe gesture

**Technical Tasks:**

- [ ] Add QuickAddButton to ExperienceCard
- [ ] Implement optimistic UI updates
- [ ] Add toast/snackbar confirmation
- [ ] Integrate haptic feedback (mobile web)
- [ ] Add undo mechanism (5-second timeout)
- [ ] Track analytics (add rate, undo rate)

**UX Impact:**

- Reduce "add to trip" from 3 taps → 1 tap
- Increase items added per session by ~60%

---

### Story 33-4: Checkout Form Optimization

**Status:** ready-for-dev  
**File:** [33-4-checkout-form-optimization.md](_bmad-output/stories/33-4-checkout-form-optimization.md)  
**Estimated:** 10-12 hours

**User Story:**
As a Traveler, I want a streamlined checkout process with smart defaults and inline validation, so that I can complete my booking faster with fewer errors.

**Current Issues:**

- 4-step checkout flow
- Manual entry for all fields
- Validation only on submit
- Average completion time: 4 minutes

**Optimizations:**

- Inline validation (real-time)
- Smart defaults from profile
- Auto-fill for returning users
- Guest count carried from trip
- Payment method saved (Stripe)
- Progress indicator redesign

**Technical Tasks:**

- [ ] Implement field-level validation (Zod schemas)
- [ ] Add auto-fill from user profile
- [ ] Pre-populate guest counts from trip items
- [ ] Integrate Stripe saved payment methods
- [ ] Add progress stepper with skip capability
- [ ] Track field interaction metrics

**Target:** Reduce checkout time from 4 min → 2 min, reduce form errors by 50%

---

### Story 33-5: Budget Helper Implementation

**Status:** ready-for-dev  
**File:** [33-5-budget-helper-implementation.md](_bmad-output/stories/33-5-budget-helper-implementation.md)  
**Estimated:** 6-8 hours

**User Story:**
As a Traveler, I want to see if my trip fits within my budget and get suggestions for staying under budget, so that I can plan my trip affordably without manual calculations.

**Key Features:**

- Budget input field (optional)
- Real-time budget vs. actual comparison
- Visual progress bar (green → yellow → red)
- "Over budget" warnings
- Smart suggestions to reduce cost
- Currency conversion support

**Technical Tasks:**

- [ ] Add BudgetHelper component
- [ ] Create budget state in TripContext
- [ ] Implement comparison logic
- [ ] Add visual indicators (progress bar, color coding)
- [ ] Generate cost-saving suggestions algorithm
- [ ] Add currency conversion (USD, EUR, SGD)
- [ ] Persist budget preference

**Impact:** Increase booking confidence, reduce cart abandonment

---

## 🚧 Blocked Stories

### Story 30-1-3: Resend Email Integration

**Status:** blocked-manual-setup  
**Blocker:** Requires DNS access for domain verification  
**File:** [30-1-3-integrate-resend-api.md](_bmad-output/stories/30-1-3-integrate-resend-api.md)

**Required Steps:**

1. Create Resend account at https://resend.com/
2. Add pulau.app domain
3. Configure DNS records:
   ```
   TXT @ v=spf1 include:_spf.resend.com ~all
   TXT resend._domainkey [value from Resend]
   TXT _dmarc v=DMARC1; p=none; rua=mailto:dmarc@pulau.app
   ```
4. Generate Resend API key
5. Add to `.env.production`: `RESEND_API_KEY=re_...`
6. Deploy: `vercel env add RESEND_API_KEY production`

**Timeline:** 2-3 days (DNS propagation)  
**Workaround:** Supabase Auth handles signup/login emails

---

## 🔧 Technical Debt & Optimization Opportunities

### 1. Performance Optimizations

**Priority:** MEDIUM  
**Impact:** Improve Lighthouse scores, reduce load time

**Issues:**

- Large bundle size: 1.8MB JS (minified)
- No code splitting by route
- Phosphor icons loaded all at once
- No image optimization (WebP format)

**Recommended Actions:**

```typescript
// Implement route-based code splitting
const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const ExperienceDetail = lazy(() => import('./screens/ExperienceDetail'));
const TripCanvas = lazy(() => import('./screens/TripCanvas'));

// Lazy load icon library
const icons = {
  Heart: lazy(() => import('@phosphor-icons/react').then(m => ({ default: m.Heart }))),
  // Load icons on-demand instead of all upfront
};

// Add image optimization
<img
  src={image.url}
  srcSet={`${image.url}?w=400&fm=webp 400w, ${image.url}?w=800&fm=webp 800w`}
  loading="lazy"
/>
```

**Estimated Impact:**

- Reduce initial bundle: 1.8MB → ~600KB
- Improve First Contentful Paint: 2.5s → 1.2s
- Lighthouse Performance: 75 → 90+

**Timeline:** 2-3 days

---

### 2. CSS Optimization Warnings

**Priority:** LOW  
**Impact:** Build warnings cleanup

**Warnings:**

```
[file:line] is not a known CSS property
Container query syntax issues
```

**Fix:**

```css
/* Remove invalid [file:line] classes */
.\[file\:line\] {
  file: line;
} /* DELETE */

/* Fix container query syntax */
@container (width >= 768px) {
  /* CORRECT */
  max-width: 1200px;
}
/* vs */
@media (width >= (display-mode: standalone)) {
  /* WRONG */
  max-width: (display-mode: standalone);
}
```

**Timeline:** 2 hours

---

### 3. Dynamic Import Warning

**Priority:** LOW  
**Impact:** Clean bundler warnings

**Warning:**

```
mockData.ts is dynamically imported by vendorService.ts
but also statically imported by multiple components
```

**Fix Options:**

1. Remove dynamic import in vendorService.ts
2. Move mockData to lazy-loaded admin section only
3. Create separate mock data files per feature

**Timeline:** 1 hour

---

### 4. Icon Manifest Missing (PWA)

**Priority:** LOW  
**Impact:** PWA install prompt, app icons

**Issue:**

```
Error: Download error or resource isn't a valid image
https://pulau.vercel.app/icons/icon-192x192.png
```

**Fix:**

1. Generate PWA icons (192x192, 512x512)
2. Update `public/manifest.json`
3. Add apple-touch-icon

**Timeline:** 30 minutes

---

## 🎯 Deferred Stories (Intentional)

### Story 5-1: Experiences Database Schema

**Status:** deferred  
**Reason:** Per ADR-001 - MVP uses mock data in TypeScript  
**File:** [5-1-design-and-create-experiences-database-schema.md](_bmad-output/stories/epic-05/5-1-design-and-create-experiences-database-schema.md)

**Decision:** Use mock data initially to validate UX before committing to schema design

**When to Revisit:**

- After 100+ real vendor signups
- After UX validation from user testing
- When vendor portal adoption reaches 20+ active vendors

**Migration Path:**

1. Design final schema based on real vendor data
2. Create migration to populate `experiences` table
3. Update `dataService.ts` to read from DB instead of mockData
4. Keep mock data for E2E tests

---

### Story 30-5: SMS Notification Support

**Status:** backlog  
**Priority:** LOW (post-launch enhancement)  
**File:** Epic 30 backlog

**User Story:**
As a Traveler, I want to receive booking confirmations and reminders via SMS, so that I don't miss my scheduled experiences.

**Why Deferred:**

- Email notifications cover primary use case
- SMS costs ~$0.01 per message
- Requires Twilio integration
- Low user demand in beta testing

**When to Implement:**

- After email system proven reliable
- If user requests exceed 50+
- For premium/VIP booking tier

---

## 📊 Development Priority Matrix

### P0 - Critical (Immediate)

- ✅ Production deployment - COMPLETE
- ✅ Stripe payments - COMPLETE
- ✅ Error tracking - COMPLETE

### P1 - High (Next 2 Weeks)

1. **Epic 33-1:** Sticky Trip Bar (4-6 hours)
2. **Epic 33-3:** Quick-Add Interaction (8-10 hours)
3. **Epic 33-4:** Checkout Optimization (10-12 hours)
4. **Performance Optimizations:** Code splitting, image optimization (2-3 days)

### P2 - Medium (Next Month)

1. **Epic 33-2:** Single-Screen Onboarding (6-8 hours)
2. **Epic 33-5:** Budget Helper (6-8 hours)
3. **Story 30-1-3:** Resend Email Integration (when DNS access available)
4. **Technical Debt:** CSS warnings, dynamic import cleanup (3 hours)

### P3 - Low (Future)

1. PWA icon manifest
2. Story 5-1: Experiences database schema (when ready to migrate from mock data)
3. Story 30-5: SMS notifications
4. Analytics integration (Google Analytics, Mixpanel)
5. Multi-language support (i18n)

---

## 🚀 Recommended Development Sequence

### Sprint 1: Quick Wins (Week 1)

**Goal:** Immediate UX improvements with high ROI

**Stories:**

1. 33-1: Sticky Trip Bar (6 hours)
2. 33-3: Quick-Add Interaction (10 hours)
3. CSS warnings cleanup (2 hours)

**Total:** ~20 hours (1 week at 4 hours/day)

**Impact:**

- Reduce "add to trip" friction from 3 taps → 1 tap
- Real-time budget tracking
- Increase items added per session by ~60%

---

### Sprint 2: Conversion Optimization (Week 2)

**Goal:** Reduce checkout abandonment, increase bookings

**Stories:**

1. 33-4: Checkout Form Optimization (12 hours)
2. 33-5: Budget Helper (8 hours)

**Total:** ~20 hours (1 week)

**Impact:**

- Reduce checkout time: 4 min → 2 min
- Reduce form errors by 50%
- Increase booking confidence

---

### Sprint 3: Performance & Polish (Week 3)

**Goal:** Improve load times, Lighthouse scores

**Tasks:**

1. Code splitting by route (8 hours)
2. Icon lazy loading (4 hours)
3. Image optimization (WebP, srcset) (6 hours)
4. PWA icon manifest (2 hours)

**Total:** ~20 hours

**Impact:**

- Bundle size: 1.8MB → 600KB
- Lighthouse Performance: 75 → 90+
- First Contentful Paint: 2.5s → 1.2s

---

### Sprint 4: Email & Onboarding (Week 4)

**Goal:** Complete email system, streamline onboarding

**Stories:**

1. 30-1-3: Resend Integration (if DNS ready) (4 hours)
2. 33-2: Single-Screen Onboarding (8 hours)
3. Email E2E tests with Mailosaur (4 hours)

**Total:** ~16 hours

**Impact:**

- Booking confirmation emails active
- Reduce onboarding time: 60s → 20s
- Reduce onboarding abandonment by 40%

---

## 📈 Success Metrics

### UX 2.0 (Epic 33) Goals

- **Sticky Trip Bar:** 80%+ of users interact with bar
- **Quick-Add:** 60%+ increase in items added per session
- **Checkout:** 50%+ reduction in form errors, 50%+ faster completion
- **Onboarding:** 40%+ reduction in abandonment
- **Budget Helper:** 30%+ of users set budget, 20%+ increase in bookings

### Performance Goals

- **Lighthouse Performance:** > 90
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Bundle Size:** < 700KB initial load

### Email System Goals

- **Delivery Rate:** > 95%
- **Bounce Rate:** < 2%
- **Average Delivery Time:** < 30 seconds
- **Open Rate:** > 40%

---

## 🎯 Summary

### Total Backlog Stories: 6

1. ✅ Epic 33-1: Sticky Trip Bar - ready-for-dev
2. ✅ Epic 33-2: Single-Screen Onboarding - ready-for-dev
3. ✅ Epic 33-3: Quick-Add Interaction - ready-for-dev
4. ✅ Epic 33-4: Checkout Optimization - ready-for-dev
5. ✅ Epic 33-5: Budget Helper - ready-for-dev
6. ⚠️ Story 30-1-3: Resend Email - blocked (DNS access)

### Technical Debt: 4 Items

1. Performance optimizations (code splitting, lazy loading)
2. CSS optimization warnings
3. Dynamic import warning
4. PWA icon manifest

### Deferred: 2 Items

1. Story 5-1: Experiences database schema (intentional)
2. Story 30-5: SMS notifications (post-launch)

### Estimated Development Time

- **Epic 33 (all 5 stories):** 40-48 hours (~2 weeks)
- **Performance optimizations:** 20 hours (~1 week)
- **Technical debt cleanup:** 5 hours (~1 day)
- **Total:** ~65-73 hours (~3-4 weeks at 4 hours/day)

---

**Recommendation:** Start with Sprint 1 (Sticky Trip Bar + Quick-Add) for immediate user experience improvements and high conversion impact.
