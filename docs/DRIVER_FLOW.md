# Driver Flow: Sign Up to Sign Out

This document describes the complete end-to-end flow for drivers in the GOGO super-app.

## Overview

Drivers can deliver rides, food, and groceries through the GOGO platform. They must complete a multi-step registration process and be approved before going online.

**Role:** `driver`

---

## 1. Sign Up Flow

Drivers must first authenticate as a regular user, then complete the driver registration process.

### Step 1: Initial Authentication

Same as customer flow:
1. Phone verification → OTP → Basic profile creation
2. User is created with default role `'customer'`
3. Redirected to Home page

### Step 2: Driver Registration

**Page:** [DriverRegistration.tsx](src/pages/driver/DriverRegistration.tsx)

Access via: Home → "Become a Driver" or direct link to `/driver/register`

#### Registration Steps (4 Total):

---

### Step 1: Personal Information

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| First Name | Yes | Legal first name |
| Last Name | Yes | Legal last name |
| Phone | Yes | Contact number |
| Email | Yes | Email address |
| Profile Photo | No | Driver photo |

**Validation:** `firstName`, `lastName`, `phone` required ([DriverRegistration.tsx:231](src/pages/driver/DriverRegistration.tsx#L231))

---

### Step 2: Vehicle Information

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| Vehicle Type | Yes | motorcycle, car, premium, van |
| Make | Yes | Vehicle manufacturer |
| Model | Yes | Vehicle model |
| Year | No | Manufacturing year |
| Color | No | Vehicle color |
| Plate Number | Yes | License plate (auto-uppercase) |

**Vehicle Types:**
```typescript
type VehicleType = 'motorcycle' | 'car' | 'premium' | 'van';
```

**Validation:** `make`, `model`, `plateNumber` required ([DriverRegistration.tsx:232](src/pages/driver/DriverRegistration.tsx#L232))

---

### Step 3: Documents Upload

**Required Documents:**
| Document | Required | Description |
|----------|----------|-------------|
| License Number | Yes | Driver's license number |
| License Expiry | Yes | Expiration date |
| License Front | Yes | Photo of license front |
| License Back | Yes | Photo of license back |
| OR/CR | No | Official Receipt & Certificate of Registration |
| NBI Clearance | No | Background check document |

**Validation:** `licenseNumber`, `licenseExpiry` required ([DriverRegistration.tsx:233](src/pages/driver/DriverRegistration.tsx#L233))

---

### Step 4: Review & Submit

1. Display summary of all entered data
2. User reviews information
3. Submit button triggers application creation

**Application Submission:** ([DriverRegistration.tsx:162-253](src/pages/driver/DriverRegistration.tsx#L162-L253))

```typescript
// Data saved to Firestore users collection
{
  role: 'driver',
  driverInfo: {
    vehicle: {
      type: string,
      make: string,
      model: string,
      year: string,
      color: string,
      plateNumber: string
    },
    license: {
      number: string,
      expiry: string,
      frontPhoto: string,    // Storage URL
      backPhoto: string      // Storage URL
    },
    documents: {
      orCr: string | null,
      nbiClearance: string | null
    }
  },
  applicationStatus: 'pending',
  isApproved: false,
  verified: AUTO_APPROVE_DRIVERS  // From config
}

// Also creates document in drivers collection
{
  id: string,
  userId: string,
  status: 'pending' | 'approved' | 'rejected',
  // ... all driver info
}
```

---

## 2. Application Approval

### Auto-Approval Setting

**Config:** [app.ts:7](src/config/app.ts#L7)

```typescript
AUTO_APPROVE_DRIVERS: false  // Production
AUTO_APPROVE_DRIVERS: true   // Testing/Development
```

### Approval States:

| Status | Description | Can Go Online |
|--------|-------------|---------------|
| `pending` | Awaiting admin review | No |
| `approved` | Admin approved | Yes |
| `rejected` | Admin rejected | No |

### Admin Approval Process:

**Page:** [AdminDrivers.tsx](src/pages/admin/AdminDrivers.tsx)

1. Admin views pending driver applications
2. Reviews submitted documents
3. Approves or rejects application
4. Driver notified of decision

---

## 3. Driver Login (Existing Drivers)

1. Phone login → OTP verification
2. System detects `role: 'driver'` in profile
3. Redirect to Driver Dashboard (`/driver`)

**Role Detection:** [authStore.ts](src/store/authStore.ts)

```typescript
isDriver: () => get().role === 'driver'
```

---

## 3.1. Route Protection (Role-Based Access Control)

Driver portal routes are protected using `RoleProtectedRoute` to ensure only authenticated drivers can access them.

**Component:** [RoleProtectedRoute.tsx](src/components/auth/RoleProtectedRoute.tsx)

### Driver Route Access Matrix

| Route | Protection | Allowed Roles |
|-------|------------|---------------|
| `/driver/register` | `ProtectedRoute` | Any authenticated user |
| `/driver` | `RoleProtectedRoute` | `driver`, `admin` |
| `/driver/earnings` | `RoleProtectedRoute` | `driver`, `admin` |
| `/driver/active` | `RoleProtectedRoute` | `driver`, `admin` |
| `/driver/delivery` | `RoleProtectedRoute` | `driver`, `admin` |
| `/driver/history` | `RoleProtectedRoute` | `driver`, `admin` |
| `/driver/profile` | `RoleProtectedRoute` | `driver`, `admin` |
| `/driver/stats` | `RoleProtectedRoute` | `driver`, `admin` |

### Access Scenarios

| User Type | Accessing `/driver` | Result |
|-----------|---------------------|--------|
| Unauthenticated | `/driver` | Redirect to `/auth/login` |
| Customer | `/driver` | Redirect to `/unauthorized` |
| Customer | `/driver/register` | Allowed (can apply) |
| Driver | `/driver` | Allowed |
| Admin | `/driver` | Allowed (oversight access) |

### Implementation in App.tsx

```tsx
// Registration accessible to any authenticated user
<Route
  path="/driver/register"
  element={
    <ProtectedRoute>
      <DriverRegistration />
    </ProtectedRoute>
  }
/>

// Dashboard requires driver or admin role
<Route
  path="/driver"
  element={
    <RoleProtectedRoute allowedRoles={['driver', 'admin']}>
      <DriverDashboard />
    </RoleProtectedRoute>
  }
/>
```

### Unauthorized Access

When a user without the `driver` role tries to access driver routes:

1. User is redirected to `/unauthorized`
2. **Page:** [Unauthorized.tsx](src/pages/auth/Unauthorized.tsx)
3. User can go back or return to home

---

## 4. Driver Dashboard

**Page:** [DriverDashboard.tsx](src/pages/driver/DriverDashboard.tsx)

### Dashboard Features:

| Feature | Description |
|---------|-------------|
| Online Toggle | Go online/offline to receive rides |
| Pending Rides | Modal with ride requests |
| Current Earnings | Today's earnings display |
| Rating | Driver rating display |
| Ride History | Past completed rides |
| Deliveries | Food/grocery deliveries |

### Online/Offline Toggle

**Implementation:** [DriverDashboard.tsx:40-44](src/pages/driver/DriverDashboard.tsx#L40-L44)

```typescript
// Toggle driver availability
const toggleOnline = () => {
  setIsOnline(!isOnline);
  // Update status in Firestore
}
```

### Pending Ride Modal

**Implementation:** [DriverDashboard.tsx:96-100](src/pages/driver/DriverDashboard.tsx#L96-L100)

- Shows when new ride request comes in
- 30-second countdown timer
- Accept/Decline buttons
- Ride details: pickup, destination, fare estimate

---

## 5. Ride Acceptance Flow

### Step 1: Receive Request
- Push notification or in-app modal
- Ride details displayed
- 30-second acceptance window

### Step 2: Accept Ride
- Confirm acceptance
- Navigate to pickup location
- Mark arrived at pickup

### Step 3: Start Ride
- Confirm passenger picked up
- Navigate to destination
- Track location in real-time

### Step 4: Complete Ride
- Mark ride complete
- Fare calculated
- Earnings credited to wallet

---

## 6. Active Ride Tracking

**Page:** [DriverActiveRide.tsx](src/pages/driver/DriverActiveRide.tsx)

### Features:
- Real-time map with route
- Navigation integration
- Status updates (en route, arrived, in progress)
- Contact passenger button
- Cancel ride option
- Complete ride button

### Ride States:
```typescript
type RideStatus =
  | 'pending'      // Waiting for driver
  | 'accepted'     // Driver accepted
  | 'arriving'     // Driver en route to pickup
  | 'arrived'      // Driver at pickup
  | 'in_progress'  // Ride started
  | 'completed'    // Ride finished
  | 'cancelled';   // Ride cancelled
```

---

## 7. Deliveries (Food/Grocery)

**Page:** [DriverActiveDelivery.tsx](src/pages/driver/DriverActiveDelivery.tsx)

Drivers can also accept delivery orders:

### Delivery Flow:
1. Receive delivery request
2. Navigate to merchant/store
3. Pickup order
4. Navigate to customer
5. Complete delivery
6. Confirm delivery with customer

---

## 8. Earnings Management

**Page:** [DriverEarnings.tsx](src/pages/driver/DriverEarnings.tsx)

### Features:
- Daily/weekly/monthly earnings
- Earnings breakdown by service type
- Pending payouts
- Transaction history
- Cash out to bank

### Earnings Structure:
```typescript
interface DriverEarnings {
  totalEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  pendingPayout: number;
  completedRides: number;
  completedDeliveries: number;
}
```

---

## 9. Driver Statistics

**Page:** [DriverStats.tsx](src/pages/driver/DriverStats.tsx)

### Metrics Tracked:
- Total rides completed
- Average rating
- Acceptance rate
- Completion rate
- Online hours
- Peak hours performance

---

## 10. Ride History

**Page:** [DriverHistory.tsx](src/pages/driver/DriverHistory.tsx)

### Features:
- List of completed rides/deliveries
- Filter by date range
- Filter by service type
- View individual ride details
- Earnings per ride

---

## 11. Profile & Settings

### Driver Profile

Access via dashboard navigation

- View/edit personal info
- Update vehicle info
- Update documents
- View ratings and reviews
- Change profile photo

### Account Settings

- Notification preferences
- Language settings
- Payment settings
- Help & support
- **Logout**

---

## 12. Sign Out Flow

### Sign Out Process

Same as customer flow:

**Implementation:** [useAuth.ts:331-339](src/hooks/useAuth.ts#L331-L339)

```typescript
const logout = async () => {
  await firebaseSignOut(auth);
  authStore.clearAuth();
  navigate('/auth/login');
}
```

### Sign Out Locations:
1. Dashboard menu → Logout
2. Settings → Logout
3. Profile → Logout button

### Pre-Logout Check:
- If driver has active ride, warn before logout
- Complete or cancel active ride first
- Go offline before logging out

---

## 13. Role Switching

Drivers can switch back to customer mode:

**Implementation:** [useAuth.ts:448-478](src/hooks/useAuth.ts#L448-L478)

```typescript
const switchRole = async (newRole: UserRole) => {
  // Update role in Firestore
  // Update local state
  // Navigate to appropriate dashboard
}
```

### Switching to Customer:
1. Go offline first
2. Switch role to 'customer'
3. Redirect to Home page (`/`)

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     DRIVER FLOW                             │
└─────────────────────────────────────────────────────────────┘

     ┌──────────┐
     │  Start   │
     └────┬─────┘
          │
          ▼
┌─────────────────┐
│ Phone Login/OTP │
└────────┬────────┘
         │
         ▼
    ┌────────────┐
    │Existing    │
    │Driver?     │
    └─────┬──────┘
      Yes │ No
          │  └─────────────────┐
          │                    ▼
          │         ┌─────────────────┐
          │         │ Basic Profile   │
          │         │ (Customer)      │
          │         └────────┬────────┘
          │                  │
          │                  ▼
          │         ┌─────────────────┐
          │         │ Driver Register │
          │         │ (4 Steps)       │
          │         └────────┬────────┘
          │                  │
          │         ┌────────┴────────┐
          │         │                 │
          │         ▼                 ▼
          │    ┌─────────┐      ┌─────────┐
          │    │ Auto    │      │ Pending │
          │    │Approved │      │ Review  │
          │    └────┬────┘      └────┬────┘
          │         │                │
          │         │           ┌────┴────┐
          │         │           │         │
          │         │           ▼         ▼
          │         │      ┌────────┐ ┌────────┐
          │         │      │Approved│ │Rejected│
          │         │      └───┬────┘ └────────┘
          │         │          │
          └────┬────┴──────────┘
               │
               ▼
      ┌─────────────────┐
      │ Driver Dashboard│
      └────────┬────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌───────┐ ┌────────┐ ┌────────┐
│Go     │ │Pending │ │Earnings│
│Online │ │ Rides  │ │ Stats  │
└───┬───┘ └───┬────┘ └────────┘
    │         │
    │    ┌────┴────┐
    │    │         │
    │    ▼         ▼
    │ ┌──────┐ ┌──────┐
    │ │Accept│ │Decline│
    │ └──┬───┘ └──────┘
    │    │
    │    ▼
    │ ┌─────────────┐
    │ │Active Ride  │
    │ │  Tracking   │
    │ └──────┬──────┘
    │        │
    │        ▼
    │ ┌─────────────┐
    │ │Complete Ride│
    │ └──────┬──────┘
    │        │
    └────────┴────────┐
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
| [src/pages/driver/DriverRegistration.tsx](src/pages/driver/DriverRegistration.tsx) | 4-step registration |
| [src/pages/driver/DriverDashboard.tsx](src/pages/driver/DriverDashboard.tsx) | Main dashboard |
| [src/pages/driver/DriverActiveRide.tsx](src/pages/driver/DriverActiveRide.tsx) | Active ride tracking |
| [src/pages/driver/DriverActiveDelivery.tsx](src/pages/driver/DriverActiveDelivery.tsx) | Active delivery |
| [src/pages/driver/DriverEarnings.tsx](src/pages/driver/DriverEarnings.tsx) | Earnings management |
| [src/pages/driver/DriverHistory.tsx](src/pages/driver/DriverHistory.tsx) | Ride history |
| [src/pages/driver/DriverStats.tsx](src/pages/driver/DriverStats.tsx) | Statistics |
| [src/hooks/useDriver.ts](src/hooks/useDriver.ts) | Driver-specific hooks |
| [src/hooks/useRealtimeRide.ts](src/hooks/useRealtimeRide.ts) | Real-time ride updates |
| [src/hooks/useRealtimeLocation.ts](src/hooks/useRealtimeLocation.ts) | Location tracking |
| [src/hooks/useRequireAuth.ts](src/hooks/useRequireAuth.ts) | Auth & role checking |
| [src/store/rideStore.ts](src/store/rideStore.ts) | Ride state management |
| [src/store/authStore.ts](src/store/authStore.ts) | Auth state & role detection |
| [src/types/ride.ts](src/types/ride.ts) | Ride type definitions |
| [src/components/auth/RoleProtectedRoute.tsx](src/components/auth/RoleProtectedRoute.tsx) | Role-based route protection |
| [src/pages/auth/Unauthorized.tsx](src/pages/auth/Unauthorized.tsx) | Access denied page |
| [src/config/app.ts](src/config/app.ts) | Auto-approval settings |

---

## Configuration

### Auto-Approval Settings

**File:** [app.ts](src/config/app.ts)

```typescript
export const APP_CONFIG = {
  AUTO_APPROVE_DRIVERS: false,      // Set to true for testing
  SKIP_DOCUMENT_VERIFICATION: false // Set to true for testing
};
```

### Testing Mode

When `AUTO_APPROVE_DRIVERS: true`:
- Driver registration auto-approves
- No admin review required
- Immediate access to dashboard

### Production Mode

When `AUTO_APPROVE_DRIVERS: false`:
- Driver registration goes to pending
- Admin must review and approve
- Documents verified manually
