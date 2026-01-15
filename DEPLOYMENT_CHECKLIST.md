# GOGO Super-App - Production Deployment Checklist

> **WARNING:** This app is currently in **TESTING MODE**. The following items MUST be addressed before deploying to production.

---

## CRITICAL SECURITY ISSUES

### 1. Authentication Bypass - MUST FIX
**File:** `src/config/app.ts`
```typescript
// CURRENT (DANGEROUS):
SKIP_AUTH: true

// CHANGE TO:
SKIP_AUTH: false
```
**Impact:** Anyone can access protected routes without logging in.

---

### 2. Firestore Security Rules - MUST FIX
**File:** `firestore.rules`
```rules
// CURRENT (DANGEROUS - Lines 8-11):
match /{document=**} {
  allow read, write: if true;
}

// ACTION: Comment out testing rules and uncomment production rules (Lines 14-130)
```
**Impact:** Anyone can read/write ALL data in your database.

---

### 3. Auto-Approval Settings - MUST FIX
**File:** `src/config/app.ts`
```typescript
// CURRENT (TESTING):
AUTO_APPROVE_DRIVERS: true
AUTO_APPROVE_MERCHANTS: true
SKIP_DOCUMENT_VERIFICATION: true

// CHANGE TO:
AUTO_APPROVE_DRIVERS: false
AUTO_APPROVE_MERCHANTS: false
SKIP_DOCUMENT_VERIFICATION: false
```
**Impact:** Drivers and merchants are approved without verification.

---

### 4. Cloud Functions Auto-Approval - MUST FIX
**File:** `functions/src/index.ts`

**Lines ~180-210 (onDriverCreated):**
```typescript
// CURRENT: Auto-approves all drivers
// ACTION: Remove auto-approval or implement proper verification workflow
```

**Lines ~215-245 (onMerchantCreated):**
```typescript
// CURRENT: Auto-approves all merchants
// ACTION: Remove auto-approval or implement proper verification workflow
```

---

## HIGH PRIORITY - Feature Completion

### 5. Payment Gateway Integration
**Files:**
- `functions/src/index.ts` (Lines 490-491)
- `src/services/payment/index.ts`

**Current State:** Payment is simulated, no real money processing.

**Action Required:**
- [ ] Integrate with GCash API
- [ ] Integrate with PayMaya/Maya API
- [ ] Integrate with credit/debit card processor
- [ ] Implement proper transaction verification
- [ ] Add payment webhook handlers
- [ ] Implement refund functionality

---

### 6. Driver Matching System
**File:** `functions/src/index.ts`

**Current State:** Drivers manually accept rides. No automatic matching.

**Action Required:**
- [ ] Implement geolocation-based driver matching
- [ ] Add driver availability tracking
- [ ] Implement surge pricing calculation
- [ ] Add driver queue management
- [ ] Implement ride timeout and reassignment

---

### 7. Push Notifications
**Files:**
- `src/hooks/usePushNotifications.ts`
- `functions/src/index.ts`

**Current State:** FCM setup exists but not fully tested.

**Action Required:**
- [ ] Test web push notifications across browsers
- [ ] Implement notification preferences
- [ ] Add notification sounds/vibration
- [ ] Test on iOS Safari (limited push support)
- [ ] Configure FCM server key in production

---

### 8. Email/SMS Notifications
**Current State:** Not implemented.

**Action Required:**
- [ ] Integrate SMS provider (Twilio, Semaphore, etc.)
- [ ] Integrate email provider (SendGrid, AWS SES, etc.)
- [ ] Implement notification templates
- [ ] Add OTP delivery via SMS
- [ ] Add order/ride confirmation emails

---

## MEDIUM PRIORITY - Code Quality

### 9. Remove Console Logs
**Files with console.log statements to remove:**
- `src/components/maps/MapView.tsx`
- `src/hooks/useRealtimeRide.ts`
- `src/hooks/useAuth.ts`
- `src/pages/driver/DriverDashboard.tsx`
- `src/pages/rides/RideTracking.tsx`
- `src/store/authStore.ts`
- And ~20+ other files

**Action:** Run `grep -r "console.log" src/` and remove or replace with proper logging.

---

### 10. Remove Hardcoded Test Data
**Files:**
- `src/pages/merchant/*.tsx` - Uses `TEST_MERCHANT_ID: 'merchant-001'`
- `src/pages/admin/*.tsx` - Uses mock data instead of real queries
- `src/utils/seedData.ts` - Test seeding utilities

**Action Required:**
- [ ] Remove or conditionally load test data
- [ ] Replace mock data with real Firestore queries
- [ ] Add environment-based data loading

---

### 11. Error Handling & Boundaries
**Current State:** No React error boundaries implemented.

**Action Required:**
- [ ] Add ErrorBoundary component wrapping main routes
- [ ] Implement fallback UI for component crashes
- [ ] Add global error tracking (Sentry, LogRocket, etc.)
- [ ] Implement proper error messages for users

---

### 12. Rate Limiting
**Current State:** No rate limiting on sensitive endpoints.

**Action Required:**
- [ ] Add rate limiting to OTP endpoints
- [ ] Add rate limiting to login attempts
- [ ] Implement CAPTCHA for repeated failures
- [ ] Add API throttling in Cloud Functions

---

## LOW PRIORITY - Enhancements

### 13. Testing
**Current State:** No test files found.

**Action Required:**
- [ ] Add unit tests for hooks and utilities
- [ ] Add integration tests for critical flows
- [ ] Add E2E tests (Cypress/Playwright)
- [ ] Set up CI/CD pipeline with test runs

---

### 14. Accessibility (A11y)
**Current State:** Basic accessibility, no ARIA labels found.

**Action Required:**
- [ ] Add ARIA labels to interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Test with screen readers
- [ ] Add proper focus management
- [ ] Ensure color contrast meets WCAG standards

---

### 15. Performance Optimization
**Current State:** Good baseline with code splitting and PWA.

**Action Required:**
- [ ] Audit and optimize bundle size
- [ ] Implement image lazy loading
- [ ] Add proper caching headers
- [ ] Optimize Firestore queries with pagination
- [ ] Add performance monitoring (Firebase Performance)

---

### 16. Documentation
**Current State:** Minimal README.

**Action Required:**
- [ ] Document API endpoints
- [ ] Document Firestore data structure
- [ ] Add deployment guide
- [ ] Document environment variables
- [ ] Add contributor guidelines

---

## Environment Variables Checklist

Ensure these are set in production:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=

# FCM (Push Notifications)
VITE_FIREBASE_VAPID_KEY=

# Payment Gateways (when implemented)
# VITE_GCASH_API_KEY=
# VITE_PAYMAYA_API_KEY=
```

---

## Firestore Indexes

Verify these indexes are deployed:
- [x] rides: customerId + status (Ascending)
- [x] rides: driverId + status (Ascending)
- [x] rides: status + createdAt (Descending)
- [x] orders: customerId + status (Ascending)
- [x] orders: merchantId + status (Ascending)
- [x] orders: driverId + status (Ascending)
- [x] merchants: type + isActive + rating (Descending)
- [x] transactions: userId + createdAt (Descending)
- [x] drivers: isAvailable + isOnline + rating (Descending)
- [x] notifications: userId + isRead + createdAt (Descending)
- [x] drivers: vehicleType + isAvailable + isOnline (Ascending)
- [x] products: merchantId + isAvailable + category (Ascending)

---

## Pre-Deployment Steps

### 1. Security Audit
- [ ] Disable all testing flags in `src/config/app.ts`
- [ ] Apply production Firestore rules
- [ ] Review and update Storage rules
- [ ] Audit all Cloud Functions for security
- [ ] Remove test user accounts

### 2. Backend Setup
- [ ] Deploy Cloud Functions to production
- [ ] Set up production Firebase project
- [ ] Configure production environment variables
- [ ] Set up database backups
- [ ] Configure Firebase App Check

### 3. Frontend Build
- [ ] Run production build: `npm run build`
- [ ] Test production build locally
- [ ] Verify all environment variables are set
- [ ] Check for build warnings/errors

### 4. Monitoring Setup
- [ ] Enable Firebase Analytics
- [ ] Set up Firebase Crashlytics
- [ ] Configure uptime monitoring
- [ ] Set up alerting for errors

### 5. Legal & Compliance
- [ ] Review Terms of Service (`src/pages/legal/Terms.tsx`)
- [ ] Review Privacy Policy (`src/pages/legal/Privacy.tsx`)
- [ ] Ensure GDPR/data privacy compliance
- [ ] Add cookie consent if needed

---

## Quick Reference Commands

```bash
# Check for console.logs
grep -r "console.log" src/

# Build for production
npm run build

# Deploy Firebase rules
firebase deploy --only firestore:rules

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy hosting
firebase deploy --only hosting

# Deploy everything
firebase deploy
```

---

## Status Legend

| Status | Meaning |
|--------|---------|
| CRITICAL | Must fix before ANY deployment |
| HIGH | Must fix before public launch |
| MEDIUM | Should fix for production quality |
| LOW | Nice to have, can be post-launch |

---

**Last Updated:** January 8, 2026

**Note:** This checklist should be reviewed and updated as the app evolves. Check off items as they are completed.
