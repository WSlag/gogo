# Customer Flow: Sign Up to Sign Out

This document describes the complete end-to-end flow for customers in the GOGO super-app.

## Overview

Customers are the default user type in GOGO. They can browse services, order food/groceries, book rides, and manage their accounts.

**Default Role:** `customer` (set in [app.ts:15](src/config/app.ts#L15))

---

## 1. Sign Up Flow

### Step 1: Phone Number Entry

**Page:** [Login.tsx](src/pages/auth/Login.tsx)

1. User opens the app and is directed to `/auth/login`
2. reCAPTCHA is initialized on page mount ([Login.tsx:42](src/pages/auth/Login.tsx#L42))
3. User enters their phone number (Philippine format: +63)
4. On submit, `sendVerificationCode()` is called ([Login.tsx:58](src/pages/auth/Login.tsx#L58))
5. OTP is sent via Firebase SMS
6. User is navigated to `/auth/otp` with phone number in state

**Alternative:** Social Login
- Google Sign-In button ([Login.tsx:65](src/pages/auth/Login.tsx#L65))
- Facebook Sign-In button ([Login.tsx:73](src/pages/auth/Login.tsx#L73))
- Both create user profile automatically if new user

### Step 2: OTP Verification

**Page:** [OTPVerification.tsx](src/pages/auth/OTPVerification.tsx)

1. User enters 6-digit code received via SMS
2. Auto-submit on completion ([OTPVerification.tsx:65](src/pages/auth/OTPVerification.tsx#L65))
3. Paste from clipboard supported ([OTPVerification.tsx:76-84](src/pages/auth/OTPVerification.tsx#L76-L84))
4. `verifyCode()` confirms code with Firebase ([OTPVerification.tsx:89](src/pages/auth/OTPVerification.tsx#L89))
5. System checks if user profile exists in Firestore:
   - **New user** → Redirect to `/auth/register`
   - **Existing user** → Redirect to `/` (Home)

### Step 3: Profile Registration (New Users Only)

**Page:** [Register.tsx](src/pages/auth/Register.tsx)

1. User completes profile form:
   - First Name (required)
   - Last Name (required)
   - Email (optional)
   - Profile Photo (optional, uploaded to Firebase Storage)
2. Phone is pre-filled from OTP step
3. On submit, `createUserProfile()` saves to Firestore ([useAuth.ts:345-414](src/hooks/useAuth.ts#L345-L414))

**Profile Data Created:**
```typescript
{
  id: string,                    // Firebase UID
  role: 'customer',              // Default role
  phone: string,                 // Verified phone
  email: string | null,          // Optional
  firstName: string,
  lastName: string,
  profileImage: string | null,   // Storage URL
  walletBalance: 0,              // Starting balance
  referralCode: 'GOGO' + 6 chars,// Auto-generated
  referredBy: string | null,     // Referral tracking
  status: 'active',
  settings: {
    notifications: true,
    language: 'en',
    currency: 'PHP'
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

4. User is redirected to Home page (`/`)

---

## 2. Login Flow (Existing Users)

### Phone Login

1. Enter phone number on `/auth/login`
2. Receive OTP via SMS
3. Enter OTP on `/auth/otp`
4. Profile found in Firestore → Direct redirect to `/`

### Social Login (Google/Facebook)

1. Click Google or Facebook button
2. Complete OAuth flow in popup
3. Profile fetched from Firestore
4. Direct redirect to `/`

**Auth State Management:** [authStore.ts](src/store/authStore.ts)
- Stores: `user`, `profile`, `role`, `isAuthenticated`
- Persisted to localStorage (key: `'auth-storage'`)

---

## 3. Customer Dashboard (Home)

**Page:** [Home.tsx](src/pages/home/Home.tsx)

### Features Available:

| Feature | Description | Route |
|---------|-------------|-------|
| **Rides** | Book motorcycle/car rides | `/rides` |
| **Food** | Order from restaurants | `/food` |
| **Grocery** | Shop from stores | `/grocery` |
| **Pharmacy** | Order medicines | `/pharmacy` |
| **Wallet** | View balance, top-up | `/wallet` |
| **Orders** | Track active orders | `/orders` |
| **Profile** | Manage account | `/account/profile` |

### Home Page Components:
- Time-based greeting
- Quick services grid ([QuickServicesGrid.tsx](src/components/home/QuickServicesGrid.tsx))
- Category pills ([CategoryPills.tsx](src/components/home/CategoryPills.tsx))
- Featured restaurants carousel
- Recent rides component

---

## 4. Protected Routes & Guest Browsing

**Best Practice Implemented:** Guest browsing with sign-up at action point

The app follows industry best practices (similar to DoorDash, TikTok) by allowing users to browse freely without authentication. Sign-up is only required when performing actions that need user identity.

### Protection Components

| Component | File | Purpose |
|-----------|------|---------|
| `ProtectedRoute` | [ProtectedRoute.tsx](src/components/auth/ProtectedRoute.tsx) | Basic authentication check |
| `RoleProtectedRoute` | [RoleProtectedRoute.tsx](src/components/auth/RoleProtectedRoute.tsx) | Role-based access control |
| `useRequireAuth` | [useRequireAuth.ts](src/hooks/useRequireAuth.ts) | Action-level auth checks |

### Customer Route Access

| Route | Protection | Description |
|-------|------------|-------------|
| `/` | Public | Home page - browse freely |
| `/food` | Public | Browse restaurants |
| `/food/restaurant/:id` | Public | View menu, add to cart |
| `/grocery` | Public | Browse stores |
| `/grocery/store/:id` | Public | View products |
| `/pharmacy` | Public | Browse pharmacies |
| `/rides` | Public | Browse ride options |
| `/rides/book` | Public (action requires auth) | Book ride page |
| `/cart` | Public | View cart contents |
| `/checkout` | Auth + Profile | Place order (requires sign-up) |
| `/orders` | Auth required | Order history |
| `/orders/:id` | Auth required | Order details |
| `/wallet/*` | Auth required | Wallet management |
| `/account/*` | Auth required | Account settings |
| `/rides/tracking/:id` | Auth + Profile | Active ride tracking |
| `/referral` | Auth required | Referral program |
| `/notifications` | Auth required | Notifications |

### Action-Level Authentication

**Hook:** [useRequireAuth.ts](src/hooks/useRequireAuth.ts)

Used in pages like `RideHome.tsx` and `BookRide.tsx` to check auth when user clicks "Confirm Booking":

```typescript
const { checkAuthAndRedirect } = useRequireAuth()

const handleBookRide = () => {
  if (!checkAuthAndRedirect()) return  // Redirects to login if not authenticated
  // Proceed with booking...
}
```

### Unauthorized Access Page

**Page:** [Unauthorized.tsx](src/pages/auth/Unauthorized.tsx)

When a customer tries to access role-restricted pages (like `/driver` or `/admin`), they are redirected to `/unauthorized` with options to go back or return home.

---

## 5. Profile Management

**Page:** [Profile.tsx](src/pages/account/Profile.tsx)

### View/Edit Options:
- First Name, Last Name
- Email address
- Phone number (read-only, verified)
- Profile photo

### Additional Information:
- Membership tier display
- Loyalty points balance
- Wallet balance
- Referral code (copy to share)

### Actions:
- Edit profile button
- Photo upload/change
- **Logout button** ([Profile.tsx:71-73](src/pages/account/Profile.tsx#L71-L73))

---

## 6. Account Settings

**Page:** [Settings.tsx](src/pages/account/Settings.tsx)

### Notification Preferences:
- Email notifications toggle
- SMS notifications toggle
- Promotional notifications toggle
- Push notifications management

### App Settings:
- Dark mode toggle
- Language selection (English, Filipino, etc.)
- Currency preference

### Account Actions:
- Help Center
- Privacy Policy
- Terms of Service
- **Logout**

---

## 7. Wallet Management

### Top Up

**Page:** [TopUp.tsx](src/pages/wallet/TopUp.tsx)

- Add funds via payment methods
- View current balance
- Quick amount buttons

### Transactions

**Page:** [Transactions.tsx](src/pages/wallet/Transactions.tsx)

- View transaction history
- Filter by type (credit/debit)
- Transaction details

---

## 8. Order Flow

### Placing an Order:

1. Browse services (Food/Grocery/Pharmacy)
2. Add items to cart ([cartStore.ts](src/store/cartStore.ts))
3. View cart ([Cart.tsx](src/pages/food/Cart.tsx))
4. Proceed to checkout (requires auth)
5. Confirm address and payment
6. Track order ([OrderDetail.tsx](src/pages/orders/OrderDetail.tsx))

### Booking a Ride:

1. Go to Rides ([RideHome.tsx](src/pages/rides/RideHome.tsx))
2. Select pickup location ([LocationPicker.tsx](src/pages/rides/LocationPicker.tsx))
3. Select destination
4. Choose vehicle type
5. Book ride ([BookRide.tsx](src/pages/rides/BookRide.tsx))
6. Track ride ([RideTracking.tsx](src/pages/rides/RideTracking.tsx))

---

## 9. Sign Out Flow

### Sign Out Process

**Implementation:** [useAuth.ts:331-339](src/hooks/useAuth.ts#L331-L339)

```typescript
const logout = async () => {
  await firebaseSignOut(auth);  // Firebase sign out
  authStore.clearAuth();         // Clear all state
  navigate('/auth/login');       // Redirect to login
}
```

### What Gets Cleared:
- Firebase session
- Auth store state (user, profile, role)
- localStorage auth data
- All role helpers reset to false

### Sign Out Locations:
1. **Profile Page** - Logout button
2. **Settings Page** - Logout option
3. **Navigation Menu** - Logout icon

### Post Sign-Out:
- User redirected to `/auth/login`
- Protected routes no longer accessible
- Public routes still browsable

---

## 10. Session Management

### Persistence

**Storage Key:** `'auth-storage'` ([authStore.ts:85](src/store/authStore.ts#L85))

**Persisted Data:**
- `profile` - User profile object
- `role` - User role string

**Not Persisted:**
- Firebase User object (re-fetched on app load)

### Session Initialization

**Component:** AuthListener in [App.tsx:108-121](src/App.tsx#L108-L121)

On app load:
1. Subscribe to `onAuthChange()`
2. Check Firebase auth state
3. Set user in store if authenticated
4. Set loading to false

### Token Management

**Function:** `getIdToken()` ([useAuth.ts:210-216](src/hooks/useAuth.ts#L210-L216))

- Retrieves fresh Firebase ID token
- Used for authenticated API calls
- Auto-refreshed by Firebase SDK

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER FLOW                            │
└─────────────────────────────────────────────────────────────┘

     ┌──────────┐
     │  Start   │
     └────┬─────┘
          │
          ▼
┌─────────────────┐     ┌─────────────────┐
│   Login Page    │────►│  Social Login   │
│  (Phone Entry)  │     │ (Google/FB)     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       │
┌─────────────────┐              │
│  OTP Verify     │              │
└────────┬────────┘              │
         │                       │
         ▼                       │
    ┌────────┐                   │
    │New User│                   │
    │   ?    │                   │
    └───┬────┘                   │
    Yes │ No                     │
        │  └───────────────┐     │
        ▼                  │     │
┌─────────────────┐        │     │
│   Register      │        │     │
│   (Profile)     │        │     │
└────────┬────────┘        │     │
         │                 │     │
         └────────┬────────┴─────┘
                  │
                  ▼
         ┌─────────────────┐
         │   Home Page     │
         │  (Dashboard)    │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌───────┐   ┌─────────┐   ┌─────────┐
│ Rides │   │  Food   │   │ Account │
│       │   │ Grocery │   │ Profile │
└───┬───┘   └────┬────┘   └────┬────┘
    │            │             │
    └────────────┴──────┬──────┘
                        │
                        ▼
               ┌─────────────────┐
               │    Logout       │
               └────────┬────────┘
                        │
                        ▼
               ┌─────────────────┐
               │   Login Page    │
               └─────────────────┘
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| [src/services/firebase/auth.ts](src/services/firebase/auth.ts) | Firebase authentication service |
| [src/store/authStore.ts](src/store/authStore.ts) | Global auth state management |
| [src/hooks/useAuth.ts](src/hooks/useAuth.ts) | Auth business logic hook |
| [src/hooks/useRequireAuth.ts](src/hooks/useRequireAuth.ts) | Action-level auth & role checks |
| [src/pages/auth/Login.tsx](src/pages/auth/Login.tsx) | Phone entry page |
| [src/pages/auth/OTPVerification.tsx](src/pages/auth/OTPVerification.tsx) | OTP verification page |
| [src/pages/auth/Register.tsx](src/pages/auth/Register.tsx) | Profile registration page |
| [src/pages/auth/Unauthorized.tsx](src/pages/auth/Unauthorized.tsx) | Access denied page |
| [src/pages/home/Home.tsx](src/pages/home/Home.tsx) | Customer dashboard |
| [src/pages/account/Profile.tsx](src/pages/account/Profile.tsx) | Profile management |
| [src/pages/account/Settings.tsx](src/pages/account/Settings.tsx) | Account settings |
| [src/components/auth/ProtectedRoute.tsx](src/components/auth/ProtectedRoute.tsx) | Basic route protection |
| [src/components/auth/RoleProtectedRoute.tsx](src/components/auth/RoleProtectedRoute.tsx) | Role-based route protection |
| [src/types/user.ts](src/types/user.ts) | User type definitions |
