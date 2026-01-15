# Admin Flow: Sign Up to Sign Out

This document describes the complete end-to-end flow for administrators in the GOGO super-app.

## Overview

Admins have full platform management capabilities including user management, driver/merchant approvals, analytics, and system configuration. Admin access is granted manually and cannot be self-registered.

**Role:** `admin`

---

## 1. Admin Access (No Self-Registration)

Unlike other user types, admin accounts cannot be created through the app. Admin access requires manual assignment in Firebase.

### Creating an Admin Account

**Method 1: Firebase Console**

1. Go to Firebase Console → Firestore Database
2. Navigate to `users` collection
3. Find the user document (or create one)
4. Set the `role` field to `'admin'`

```javascript
// Firestore document structure
users/{userId}: {
  role: 'admin',
  // ... other user fields
}
```

**Method 2: Firebase Admin SDK**

```typescript
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();
await db.collection('users').doc(userId).update({
  role: 'admin'
});
```

### Admin Role Check

**Store:** [authStore.ts](src/store/authStore.ts)

```typescript
isAdmin: () => get().role === 'admin'
```

---

## 2. Admin Login

### Login Process

1. Admin uses standard phone/OTP login
2. System detects `role: 'admin'` in Firestore profile
3. Auth store sets `isAdmin: true`
4. Admin can access `/admin` routes

### Route Protection (Role-Based Access Control)

Admin routes are protected using `RoleProtectedRoute` with `admin` role requirement.

**Component:** [RoleProtectedRoute.tsx](src/components/auth/RoleProtectedRoute.tsx)

### Admin Route Access Matrix

| Route | Protection | Allowed Roles |
|-------|------------|---------------|
| `/admin` | `RoleProtectedRoute` | `admin` only |
| `/admin/users` | `RoleProtectedRoute` | `admin` only |
| `/admin/analytics` | `RoleProtectedRoute` | `admin` only |
| `/admin/drivers` | `RoleProtectedRoute` | `admin` only |
| `/admin/merchants` | `RoleProtectedRoute` | `admin` only |
| `/admin/approvals` | `RoleProtectedRoute` | `admin` only |
| `/admin/orders` | `RoleProtectedRoute` | `admin` only |
| `/admin/seed` | `RoleProtectedRoute` | `admin` only |

### Access Scenarios

| User Type | Accessing `/admin` | Result |
|-----------|-------------------|--------|
| Unauthenticated | `/admin` | Redirect to `/auth/login` |
| Customer | `/admin` | Redirect to `/unauthorized` |
| Driver | `/admin` | Redirect to `/unauthorized` |
| Merchant | `/admin` | Redirect to `/unauthorized` |
| Admin | `/admin` | Allowed |

### Implementation in App.tsx

```tsx
<Route
  path="/admin"
  element={
    <RoleProtectedRoute allowedRoles={['admin']}>
      <AdminDashboard />
    </RoleProtectedRoute>
  }
/>

<Route
  path="/admin/users"
  element={
    <RoleProtectedRoute allowedRoles={['admin']}>
      <AdminUsers />
    </RoleProtectedRoute>
  }
/>
// ... all admin routes follow same pattern
```

### Admin Cross-Portal Access

Admins have special access to other portals for oversight:

| Portal | Admin Access | Purpose |
|--------|-------------|---------|
| `/driver/*` | Allowed | Oversee driver operations |
| `/merchant/*` | Allowed | Oversee merchant operations |
| `/admin/*` | Allowed | Full admin access |

### Unauthorized Access

When a non-admin user tries to access admin routes:

1. User is redirected to `/unauthorized`
2. **Page:** [Unauthorized.tsx](src/pages/auth/Unauthorized.tsx)
3. User can go back or return to home

---

## 3. Admin Dashboard

**Page:** [AdminDashboard.tsx](src/pages/admin/AdminDashboard.tsx)

### Dashboard URL: `/admin`

### Quick Stats Section

**Implementation:** [AdminDashboard.tsx:354-390](src/pages/admin/AdminDashboard.tsx#L354-L390)

| Stat | Description |
|------|-------------|
| Total Users | All registered users |
| Active Drivers | Online drivers |
| Merchants | Registered merchants |
| Today's Revenue | Platform revenue |

### Today's Orders Breakdown

**Implementation:** [AdminDashboard.tsx:484-501](src/pages/admin/AdminDashboard.tsx#L484-L501)

- Total orders today
- Completed orders
- Pending orders
- Cancelled orders

### Quick Actions

**Implementation:** [AdminDashboard.tsx:508-566](src/pages/admin/AdminDashboard.tsx#L508-L566)

| Action | Route | Description |
|--------|-------|-------------|
| Manage Users | `/admin/users` | User management |
| Manage Drivers | `/admin/drivers` | Driver management |
| Manage Merchants | `/admin/merchants` | Merchant management |
| Analytics | `/admin/analytics` | Platform analytics |
| Seed Drivers | - | Test data generation |

### Recent Activity Feed

**Implementation:** [AdminDashboard.tsx:569-601](src/pages/admin/AdminDashboard.tsx#L569-L601)

- Recent user registrations
- New orders
- Driver activities
- System events

### Pending Approvals Section

**Implementation:** [AdminDashboard.tsx:605-651](src/pages/admin/AdminDashboard.tsx#L605-L651)

- Pending driver applications
- Pending merchant applications
- Quick approve/reject actions

---

## 4. User Management

**Page:** [AdminUsers.tsx](src/pages/admin/AdminUsers.tsx)

**Route:** `/admin/users`

### Features:

| Feature | Description |
|---------|-------------|
| User List | Paginated list of all users |
| Search | Search by name, email, phone |
| Filter | Filter by role, status |
| View Details | View user profile details |
| Edit User | Modify user information |
| Change Role | Assign/change user role |
| Suspend | Suspend user account |
| Delete | Soft delete user account |

### User Actions:

**View User Details:**
```typescript
// Modal or dedicated page showing:
- Personal information
- Account status
- Role and permissions
- Order history
- Wallet balance
- Activity log
```

**Change User Role:**
```typescript
const changeUserRole = async (userId: string, newRole: UserRole) => {
  await updateDoc(doc(db, 'users', userId), {
    role: newRole,
    updatedAt: serverTimestamp()
  });
}
```

**Suspend User:**
```typescript
const suspendUser = async (userId: string) => {
  await updateDoc(doc(db, 'users', userId), {
    status: 'suspended',
    suspendedAt: serverTimestamp()
  });
}
```

---

## 5. Driver Management

**Page:** [AdminDrivers.tsx](src/pages/admin/AdminDrivers.tsx)

**Route:** `/admin/drivers`

### Features:

| Feature | Description |
|---------|-------------|
| Driver List | All registered drivers |
| Pending Applications | Awaiting approval |
| Search | Search drivers |
| Filter | By status, vehicle type |
| View Documents | Review uploaded documents |
| Approve/Reject | Application decisions |
| Suspend | Suspend driver |

### Driver Approval Flow:

1. View pending application
2. Review driver information:
   - Personal details
   - Vehicle information
   - License validity
   - Document uploads
3. Verify documents
4. Approve or reject with reason

**Approve Driver:**
```typescript
const approveDriver = async (driverId: string) => {
  const batch = writeBatch(db);

  // Update drivers collection
  batch.update(doc(db, 'drivers', driverId), {
    applicationStatus: 'approved',
    isApproved: true,
    approvedAt: serverTimestamp()
  });

  // Update user document
  batch.update(doc(db, 'users', userId), {
    verified: true,
    applicationStatus: 'approved'
  });

  await batch.commit();
  // Send notification to driver
}
```

**Reject Driver:**
```typescript
const rejectDriver = async (driverId: string, reason: string) => {
  await updateDoc(doc(db, 'drivers', driverId), {
    applicationStatus: 'rejected',
    rejectionReason: reason,
    rejectedAt: serverTimestamp()
  });
  // Send notification to driver
}
```

---

## 6. Merchant Management

**Page:** [AdminMerchants.tsx](src/pages/admin/AdminMerchants.tsx)

**Route:** `/admin/merchants`

### Features:

| Feature | Description |
|---------|-------------|
| Merchant List | All registered merchants |
| Pending Applications | Awaiting approval |
| Search | Search by name, owner |
| Filter | By type, status |
| View Business Info | Full business details |
| View Documents | Review permits |
| Approve/Reject | Application decisions |
| Suspend | Suspend merchant |

### Merchant Approval Flow:

1. View pending application
2. Review merchant information:
   - Owner details
   - Business information
   - Business type
   - Address verification
   - Document uploads
3. Verify business permit
4. Approve or reject with reason

**Approve Merchant:**
```typescript
const approveMerchant = async (merchantId: string) => {
  const batch = writeBatch(db);

  // Update merchants collection
  batch.update(doc(db, 'merchants', merchantId), {
    applicationStatus: 'approved',
    isApproved: true,
    approvedAt: serverTimestamp()
  });

  // Update owner's user document
  batch.update(doc(db, 'users', ownerId), {
    verified: true,
    applicationStatus: 'approved'
  });

  await batch.commit();
  // Send notification to merchant
}
```

**Reject Merchant:**
```typescript
const rejectMerchant = async (merchantId: string, reason: string) => {
  await updateDoc(doc(db, 'merchants', merchantId), {
    applicationStatus: 'rejected',
    rejectionReason: reason,
    rejectedAt: serverTimestamp()
  });
  // Send notification to merchant
}
```

---

## 7. Order Management

**Page:** [AdminOrders.tsx](src/pages/admin/AdminOrders.tsx)

**Route:** `/admin/orders`

### Features:

| Feature | Description |
|---------|-------------|
| Order List | All platform orders |
| Search | By order ID, customer |
| Filter | By status, type, date |
| View Details | Full order information |
| Cancel Order | Admin cancel with refund |
| Assign Driver | Manual driver assignment |
| Issue Refund | Process refunds |

### Order View:
- Order details and items
- Customer information
- Merchant information
- Driver information
- Order timeline
- Payment details
- Actions history

---

## 8. Analytics Dashboard

**Page:** [AdminAnalytics.tsx](src/pages/admin/AdminAnalytics.tsx)

**Route:** `/admin/analytics`

### Metrics Available:

**Revenue Analytics:**
- Daily/weekly/monthly revenue
- Revenue by service type
- Revenue trends
- Platform fees collected

**User Analytics:**
- New user registrations
- Active users
- User retention
- User demographics

**Driver Analytics:**
- Active drivers
- Driver performance
- Average completion rate
- Driver earnings distribution

**Merchant Analytics:**
- Active merchants
- Merchant performance
- Order completion rates
- Top performing merchants

**Order Analytics:**
- Order volume trends
- Average order value
- Completion rates
- Peak hours analysis

---

## 9. Test Data Seeding

**Implementation:** [AdminDashboard.tsx:166-314](src/pages/admin/AdminDashboard.tsx#L166-L314)

### Seed Test Drivers

Feature to quickly populate test data for development/testing:

```typescript
const seedTestDrivers = async () => {
  const testDrivers = [
    {
      firstName: 'Test',
      lastName: 'Driver 1',
      phone: '+639000000001',
      vehicle: { type: 'motorcycle', ... },
      // ... driver details
    },
    // ... more test drivers
  ];

  for (const driver of testDrivers) {
    await addDoc(collection(db, 'drivers'), driver);
  }
}
```

**Also see:** [SeedData.tsx](src/pages/admin/SeedData.tsx)

---

## 10. System Configuration

Admin can configure various platform settings:

### Platform Settings:

| Setting | Description |
|---------|-------------|
| Auto-approve drivers | Bypass manual approval |
| Auto-approve merchants | Bypass manual approval |
| Platform fees | Set commission rates |
| Minimum wallet balance | For drivers |
| Service availability | Enable/disable services |

### Configuration Files:

**App Config:** [app.ts](src/config/app.ts)

```typescript
export const APP_CONFIG = {
  AUTO_APPROVE_DRIVERS: false,
  AUTO_APPROVE_MERCHANTS: false,
  SKIP_DOCUMENT_VERIFICATION: false,
  DEFAULT_ROLE: 'customer',
  IS_TESTING: false,
  SKIP_AUTH: false
};
```

---

## 11. Admin Navigation

### Admin Layout Routes:

| Route | Page | Description |
|-------|------|-------------|
| `/admin` | Dashboard | Main admin view |
| `/admin/users` | Users | User management |
| `/admin/drivers` | Drivers | Driver management |
| `/admin/merchants` | Merchants | Merchant management |
| `/admin/orders` | Orders | Order management |
| `/admin/analytics` | Analytics | Platform analytics |
| `/admin/approvals` | Approvals | Pending approvals |

---

## 12. Sign Out Flow

### Sign Out Process

**Implementation:** [AdminDashboard.tsx:418-422](src/pages/admin/AdminDashboard.tsx#L418-L422)

```typescript
const handleLogout = async () => {
  await firebaseSignOut(auth);
  authStore.clearAuth();
  navigate('/auth/login');
}
```

### Sign Out Location:
- Dashboard header → Logout icon button

### Post Sign-Out:
- Redirected to `/auth/login`
- Admin routes no longer accessible
- Must re-authenticate to access admin

---

## 13. Session Management

### Admin Session

Same as other users:
- Firebase Auth session
- Auth store with role detection
- localStorage persistence for profile/role

### Security Considerations:

1. **Role Verification:** Always verify role server-side for sensitive operations
2. **Session Timeout:** Consider implementing session timeout for admin
3. **Audit Logging:** Log all admin actions for accountability
4. **Two-Factor Auth:** Recommend 2FA for admin accounts

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      ADMIN FLOW                             │
└─────────────────────────────────────────────────────────────┘

     ┌──────────────────┐
     │  Manual Role     │
     │  Assignment      │
     │  (Firebase)      │
     └────────┬─────────┘
              │
              ▼
     ┌─────────────────┐
     │ Phone Login/OTP │
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐
     │ Role: 'admin'   │
     │ Detected        │
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐
     │ Admin Dashboard │
     │    /admin       │
     └────────┬────────┘
              │
    ┌─────────┼─────────┬─────────┬─────────┐
    │         │         │         │         │
    ▼         ▼         ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│ Users │ │Drivers│ │Merchan│ │Orders │ │Analyti│
│Manage │ │Manage │ │ Manage│ │Manage │ │  cs   │
└───┬───┘ └───┬───┘ └───┬───┘ └───────┘ └───────┘
    │         │         │
    │    ┌────┴─────────┴────┐
    │    │                   │
    │    ▼                   ▼
    │ ┌───────────┐   ┌───────────┐
    │ │  Approve  │   │  Reject   │
    │ │Application│   │Application│
    │ └───────────┘   └───────────┘
    │
    ▼
┌───────────────┐
│ Change Role   │
│ Suspend User  │
│ Delete User   │
└───────────────┘
        │
        └────────────────────┐
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
| [src/pages/admin/AdminDashboard.tsx](src/pages/admin/AdminDashboard.tsx) | Main dashboard |
| [src/pages/admin/AdminUsers.tsx](src/pages/admin/AdminUsers.tsx) | User management |
| [src/pages/admin/AdminDrivers.tsx](src/pages/admin/AdminDrivers.tsx) | Driver management |
| [src/pages/admin/AdminMerchants.tsx](src/pages/admin/AdminMerchants.tsx) | Merchant management |
| [src/pages/admin/AdminOrders.tsx](src/pages/admin/AdminOrders.tsx) | Order management |
| [src/pages/admin/AdminAnalytics.tsx](src/pages/admin/AdminAnalytics.tsx) | Analytics |
| [src/pages/admin/SeedData.tsx](src/pages/admin/SeedData.tsx) | Test data seeding |
| [src/store/authStore.ts](src/store/authStore.ts) | Role detection |
| [src/hooks/useRequireAuth.ts](src/hooks/useRequireAuth.ts) | Auth & role checking |
| [src/components/auth/RoleProtectedRoute.tsx](src/components/auth/RoleProtectedRoute.tsx) | Role-based route protection |
| [src/pages/auth/Unauthorized.tsx](src/pages/auth/Unauthorized.tsx) | Access denied page |
| [src/config/app.ts](src/config/app.ts) | Platform configuration |

---

## Security Notes

### Admin Access Control

1. **No Self-Registration:** Admins cannot register through the app
2. **Manual Assignment:** Role must be assigned in Firebase
3. **Role Verification:** Always verify role before sensitive actions
4. **Audit Trail:** Log all administrative actions

### Recommended Security Measures

1. **Two-Factor Authentication**
   - Implement 2FA for admin accounts
   - Use Firebase Auth MFA

2. **IP Whitelisting**
   - Restrict admin access to specific IPs
   - Implement via Firebase Security Rules

3. **Activity Logging**
   ```typescript
   const logAdminAction = async (action: string, details: object) => {
     await addDoc(collection(db, 'admin_logs'), {
       adminId: currentUser.uid,
       action,
       details,
       timestamp: serverTimestamp(),
       ip: clientIP
     });
   }
   ```

4. **Session Management**
   - Implement session timeout
   - Force re-authentication for sensitive actions

5. **Role Hierarchy**
   - Consider implementing role levels (super-admin, admin, moderator)
   - Limit capabilities per role level
