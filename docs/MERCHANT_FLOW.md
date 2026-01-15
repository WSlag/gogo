# Merchant Flow: Sign Up to Sign Out

This document describes the complete end-to-end flow for merchants in the GOGO super-app.

## Overview

Merchants are business owners who can sell food, groceries, or pharmacy items through the GOGO platform. They must complete a multi-step registration process and be approved before accepting orders.

**Role:** `merchant`

---

## 1. Sign Up Flow

Merchants must first authenticate as a regular user, then complete the merchant registration process.

### Step 1: Initial Authentication

Same as customer flow:
1. Phone verification → OTP → Basic profile creation
2. User is created with default role `'customer'`
3. Redirected to Home page

### Step 2: Merchant Registration

**Page:** [MerchantRegistration.tsx](src/pages/merchant/MerchantRegistration.tsx)

Access via: Home → "Become a Partner" or direct link to merchant registration

#### Registration Steps (4 Total):

---

### Step 1: Owner Information

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| First Name | Yes | Owner's legal first name |
| Last Name | Yes | Owner's legal last name |
| Phone | Yes | Owner's contact number |
| Email | Yes | Owner's email address |

**Validation:** All fields required ([MerchantRegistration.tsx:231](src/pages/merchant/MerchantRegistration.tsx#L231))

---

### Step 2: Business Information

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| Business Type | Yes | restaurant, grocery, convenience, pharmacy |
| Business Name | Yes | Store/restaurant name |
| Business Description | No | Brief description |
| Business Address | Yes | Complete address |
| Business Phone | Yes | Store contact number |
| Logo | No | Business logo image |

**Business Types:**
```typescript
type BusinessType = 'restaurant' | 'grocery' | 'convenience' | 'pharmacy';
```

**Validation:** `name`, `address`, `phone` required ([MerchantRegistration.tsx:232](src/pages/merchant/MerchantRegistration.tsx#L232))

---

### Step 3: Documents Upload

**Documents:**
| Document | Required | Description |
|----------|----------|-------------|
| Business Permit | Yes | Valid business permit |
| Sanitary Permit | No | Food handling permit |
| BIR Registration | No | Tax registration |

**Validation:** Business Permit required ([MerchantRegistration.tsx:233](src/pages/merchant/MerchantRegistration.tsx#L233))

---

### Step 4: Review & Submit

1. Display summary of all entered data
2. User reviews business information
3. Submit button triggers application creation

**Application Submission:** ([MerchantRegistration.tsx:138-229](src/pages/merchant/MerchantRegistration.tsx#L138-L229))

```typescript
// Data saved to Firestore merchants collection
{
  id: string,
  ownerId: string,            // Firebase UID
  ownerInfo: {
    firstName: string,
    lastName: string,
    phone: string,
    email: string
  },
  businessInfo: {
    type: BusinessType,
    name: string,
    description: string,
    address: string,
    phone: string,
    logo: string | null       // Storage URL
  },
  documents: {
    businessPermit: string,   // Storage URL (required)
    sanitaryPermit: string | null,
    birRegistration: string | null
  },
  operatingHours: {
    monday: { open: '08:00', close: '22:00' },
    tuesday: { open: '08:00', close: '22:00' },
    // ... all days default to 8am-10pm
  },
  settings: {
    autoAcceptOrders: false,
    preparationTime: 30,      // minutes
    deliveryEnabled: true,
    pickupEnabled: true
  },
  applicationStatus: 'pending',
  isApproved: false,
  status: 'closed',           // Initially closed
  rating: 0,
  totalOrders: 0,
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// Also updates user document
{
  role: 'merchant',
  merchantId: string          // Reference to merchant doc
}
```

---

## 2. Application Approval

### Auto-Approval Setting

**Config:** [app.ts](src/config/app.ts)

```typescript
AUTO_APPROVE_MERCHANTS: false  // Production
AUTO_APPROVE_MERCHANTS: true   // Testing/Development
```

### Approval States:

| Status | Description | Can Accept Orders |
|--------|-------------|-------------------|
| `pending` | Awaiting admin review | No |
| `approved` | Admin approved | Yes |
| `rejected` | Admin rejected | No |

### Admin Approval Process:

**Page:** [AdminMerchants.tsx](src/pages/admin/AdminMerchants.tsx)

1. Admin views pending merchant applications
2. Reviews business info and documents
3. Verifies business permit validity
4. Approves or rejects application
5. Merchant notified of decision

---

## 3. Merchant Login (Existing Merchants)

1. Phone login → OTP verification
2. System detects `role: 'merchant'` in profile
3. Redirect to Merchant Dashboard (`/merchant`)

**Role Detection:** [authStore.ts](src/store/authStore.ts)

```typescript
isMerchant: () => get().role === 'merchant'
```

---

## 3.1. Route Protection (Role-Based Access Control)

Merchant portal routes are protected using `RoleProtectedRoute` to ensure only authenticated merchants can access them.

**Component:** [RoleProtectedRoute.tsx](src/components/auth/RoleProtectedRoute.tsx)

### Merchant Route Access Matrix

| Route | Protection | Allowed Roles |
|-------|------------|---------------|
| `/merchant/register` | `ProtectedRoute` | Any authenticated user |
| `/merchant` | `RoleProtectedRoute` | `merchant`, `admin` |
| `/merchant/orders` | `RoleProtectedRoute` | `merchant`, `admin` |
| `/merchant/menu` | `RoleProtectedRoute` | `merchant`, `admin` |
| `/merchant/settings` | `RoleProtectedRoute` | `merchant`, `admin` |
| `/merchant/earnings` | `RoleProtectedRoute` | `merchant`, `admin` |
| `/merchant/analytics` | `RoleProtectedRoute` | `merchant`, `admin` |

### Access Scenarios

| User Type | Accessing `/merchant` | Result |
|-----------|----------------------|--------|
| Unauthenticated | `/merchant` | Redirect to `/auth/login` |
| Customer | `/merchant` | Redirect to `/unauthorized` |
| Customer | `/merchant/register` | Allowed (can apply) |
| Driver | `/merchant` | Redirect to `/unauthorized` |
| Merchant | `/merchant` | Allowed |
| Admin | `/merchant` | Allowed (oversight access) |

### Implementation in App.tsx

```tsx
// Registration accessible to any authenticated user
<Route
  path="/merchant/register"
  element={
    <ProtectedRoute>
      <MerchantRegistration />
    </ProtectedRoute>
  }
/>

// Dashboard requires merchant or admin role
<Route
  path="/merchant"
  element={
    <RoleProtectedRoute allowedRoles={['merchant', 'admin']}>
      <MerchantDashboard />
    </RoleProtectedRoute>
  }
/>
```

### Unauthorized Access

When a user without the `merchant` role tries to access merchant routes:

1. User is redirected to `/unauthorized`
2. **Page:** [Unauthorized.tsx](src/pages/auth/Unauthorized.tsx)
3. User can go back or return to home

---

## 4. Merchant Dashboard

**Page:** [MerchantDashboard.tsx](src/pages/merchant/MerchantDashboard.tsx)

### Dashboard Features:

| Feature | Description |
|---------|-------------|
| Store Status | Open/Closed toggle |
| Pending Orders | Count of awaiting orders |
| Today's Sales | Revenue for today |
| Recent Orders | List of recent orders |
| Quick Actions | Accept, prepare, ready |

### Store Status Toggle

**Implementation:** [MerchantDashboard.tsx:70-82](src/pages/merchant/MerchantDashboard.tsx#L70-L82)

```typescript
// Toggle store availability
const toggleStoreStatus = async () => {
  const newStatus = storeStatus === 'open' ? 'closed' : 'open';
  await updateDoc(merchantRef, { status: newStatus });
  setStoreStatus(newStatus);
}
```

### Store Status States:
```typescript
type StoreStatus = 'open' | 'closed' | 'busy';
```

---

## 5. Order Management

**Page:** [MerchantOrders.tsx](src/pages/merchant/MerchantOrders.tsx)

### Order Flow:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Pending  │───►│ Accepted │───►│Preparing │───►│  Ready   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                     │
                                                     ▼
                                               ┌──────────┐
                                               │ Picked   │
                                               │   Up     │
                                               └──────────┘
```

### Order States:

| Status | Description | Merchant Action |
|--------|-------------|-----------------|
| `pending` | New order received | Accept or Reject |
| `accepted` | Order confirmed | Start Preparing |
| `preparing` | Being prepared | Mark Ready |
| `ready` | Ready for pickup | Wait for driver |
| `picked_up` | Driver collected | - |
| `completed` | Delivered to customer | - |
| `cancelled` | Order cancelled | - |

### Order Actions:

**Accept Order:**
```typescript
const acceptOrder = async (orderId: string) => {
  await updateDoc(orderRef, {
    status: 'accepted',
    acceptedAt: serverTimestamp()
  });
}
```

**Start Preparing:**
```typescript
const startPreparing = async (orderId: string) => {
  await updateDoc(orderRef, {
    status: 'preparing',
    preparingAt: serverTimestamp()
  });
}
```

**Mark Ready:**
```typescript
const markReady = async (orderId: string) => {
  await updateDoc(orderRef, {
    status: 'ready',
    readyAt: serverTimestamp()
  });
  // Notify driver for pickup
}
```

---

## 6. Menu Management

**Page:** [MerchantMenu.tsx](src/pages/merchant/MerchantMenu.tsx)

### Features:

| Feature | Description |
|---------|-------------|
| Add Items | Create new menu items |
| Edit Items | Modify existing items |
| Categories | Organize items by category |
| Availability | Toggle item availability |
| Pricing | Set/update prices |
| Photos | Upload item images |

### Menu Item Structure:

```typescript
interface MenuItem {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
  isAvailable: boolean;
  preparationTime: number;     // minutes
  options: MenuItemOption[];   // Add-ons, sizes, etc.
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface MenuItemOption {
  name: string;                // e.g., "Size"
  required: boolean;
  choices: {
    name: string;              // e.g., "Large"
    priceAdjustment: number;   // e.g., +20
  }[];
}
```

### Menu Actions:

**Add Item:**
1. Fill in item details
2. Set category and price
3. Upload image (optional)
4. Set availability
5. Save to Firestore

**Edit Item:**
1. Select item from list
2. Modify details
3. Update availability
4. Save changes

**Toggle Availability:**
```typescript
const toggleAvailability = async (itemId: string, available: boolean) => {
  await updateDoc(itemRef, { isAvailable: available });
}
```

---

## 7. Earnings & Analytics

### Earnings Page

**Page:** [MerchantEarnings.tsx](src/pages/merchant/MerchantEarnings.tsx)

**Features:**
- Daily/weekly/monthly revenue
- Order count statistics
- Average order value
- Platform fees breakdown
- Payout history
- Cash out to bank

### Earnings Structure:

```typescript
interface MerchantEarnings {
  totalRevenue: number;
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  pendingPayout: number;
  platformFees: number;
  netEarnings: number;
  totalOrders: number;
  averageOrderValue: number;
}
```

### Analytics Page

**Page:** [MerchantAnalytics.tsx](src/pages/merchant/MerchantAnalytics.tsx)

**Metrics Tracked:**
- Order trends over time
- Popular items
- Peak hours
- Customer ratings
- Order completion rate
- Average preparation time
- Revenue by category

---

## 8. Settings & Configuration

### Operating Hours

Set daily operating hours:

```typescript
interface OperatingHours {
  [day: string]: {
    open: string;    // "08:00"
    close: string;   // "22:00"
    isClosed: boolean;
  };
}
```

### Store Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Auto Accept | Auto-accept orders | false |
| Preparation Time | Default prep time | 30 min |
| Delivery Enabled | Allow delivery | true |
| Pickup Enabled | Allow pickup | true |
| Minimum Order | Minimum order amount | 0 |

### Notification Settings

- New order notifications
- Order update alerts
- Daily summary emails
- Promotional notifications

---

## 9. Profile Management

### Business Profile

- Edit business name and description
- Update address
- Change logo
- Update contact information

### Owner Profile

- Personal information
- Contact details
- Account settings

---

## 10. Sign Out Flow

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

### Pre-Logout Considerations:
- Close store before logging out (recommended)
- Complete pending order actions
- Ensure no orders in preparing state

---

## 11. Role Switching

Merchants can switch back to customer mode:

**Implementation:** [useAuth.ts:491-498](src/hooks/useAuth.ts#L491-L498)

```typescript
const becomeMerchant = () => {
  setRole('merchant');
  navigate('/merchant');
}
```

### Switching to Customer:
1. Close store (if open)
2. Switch role to 'customer'
3. Redirect to Home page (`/`)

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    MERCHANT FLOW                            │
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
    │Merchant?   │
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
          │         │Merchant Register│
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
      │Merchant Dashboard│
      └────────┬────────┘
               │
    ┌──────────┼──────────┬──────────┐
    │          │          │          │
    ▼          ▼          ▼          ▼
┌───────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Open  │ │ Orders │ │  Menu  │ │Earnings│
│ Store │ │Manage  │ │Manage  │ │  Stats │
└───┬───┘ └───┬────┘ └────────┘ └────────┘
    │         │
    │    ┌────┴────────────────┐
    │    │                     │
    │    ▼                     ▼
    │ ┌──────────┐      ┌──────────┐
    │ │  Accept  │      │  Reject  │
    │ │  Order   │      │  Order   │
    │ └────┬─────┘      └──────────┘
    │      │
    │      ▼
    │ ┌──────────┐
    │ │ Prepare  │
    │ └────┬─────┘
    │      │
    │      ▼
    │ ┌──────────┐
    │ │Mark Ready│
    │ └────┬─────┘
    │      │
    └──────┴──────────────┐
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
| [src/pages/merchant/MerchantRegistration.tsx](src/pages/merchant/MerchantRegistration.tsx) | 4-step registration |
| [src/pages/merchant/MerchantDashboard.tsx](src/pages/merchant/MerchantDashboard.tsx) | Main dashboard |
| [src/pages/merchant/MerchantOrders.tsx](src/pages/merchant/MerchantOrders.tsx) | Order management |
| [src/pages/merchant/MerchantMenu.tsx](src/pages/merchant/MerchantMenu.tsx) | Menu management |
| [src/pages/merchant/MerchantEarnings.tsx](src/pages/merchant/MerchantEarnings.tsx) | Earnings overview |
| [src/pages/merchant/MerchantAnalytics.tsx](src/pages/merchant/MerchantAnalytics.tsx) | Business analytics |
| [src/hooks/useMerchantOrders.ts](src/hooks/useMerchantOrders.ts) | Order hooks |
| [src/hooks/useRequireAuth.ts](src/hooks/useRequireAuth.ts) | Auth & role checking |
| [src/store/authStore.ts](src/store/authStore.ts) | Auth state & role detection |
| [src/types/merchant.ts](src/types/merchant.ts) | Merchant types |
| [src/types/order.ts](src/types/order.ts) | Order types |
| [src/types/product.ts](src/types/product.ts) | Product/menu types |
| [src/components/auth/RoleProtectedRoute.tsx](src/components/auth/RoleProtectedRoute.tsx) | Role-based route protection |
| [src/pages/auth/Unauthorized.tsx](src/pages/auth/Unauthorized.tsx) | Access denied page |
| [src/config/app.ts](src/config/app.ts) | Auto-approval settings |

---

## Configuration

### Auto-Approval Settings

**File:** [app.ts](src/config/app.ts)

```typescript
export const APP_CONFIG = {
  AUTO_APPROVE_MERCHANTS: false,    // Set to true for testing
  SKIP_DOCUMENT_VERIFICATION: false // Set to true for testing
};
```

### Testing Mode

When `AUTO_APPROVE_MERCHANTS: true`:
- Merchant registration auto-approves
- No admin review required
- Immediate access to dashboard

### Production Mode

When `AUTO_APPROVE_MERCHANTS: false`:
- Merchant registration goes to pending
- Admin must review and approve
- Documents verified manually
- Business permit validation required
