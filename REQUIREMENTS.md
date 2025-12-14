# GOGO Super App - Requirements Document

<p align="center">
  <img src="assets/logo.png" alt="GOGO Logo" width="200"/>
</p>

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Implementation Phases](#implementation-phases)
5. [Feature Specifications](#feature-specifications)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [UI/UX Guidelines](#uiux-guidelines)
9. [Security Requirements](#security-requirements)
10. [Performance Requirements](#performance-requirements)

---

## Project Overview

### Vision
GOGO is a Philippine-focused super app combining ride-hailing, food delivery, and grocery delivery services into a single, seamless Progressive Web Application (PWA). The app aims to provide Filipinos with a convenient, reliable, and affordable platform for their daily transportation and delivery needs.

### Target Market
- **Launch City: Cotabato City** (Initial rollout)
- Primary: Cotabato City, BARMM Region
- Secondary: Koronadal City, General Santos City, Kidapawan City
- Future Expansion: Metro Manila, Cebu, Davao
- Demographics: 18-45 years old, smartphone users

### Key Differentiators
- All-in-one platform (rides + food + grocery)
- PWA for both mobile and desktop
- Local payment integration (GCash, Maya, Credit/Debit)
- Filipino-first UX design
- Competitive pricing with transparent fees

---

## Technology Stack

### Frontend
| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| React | 19.x | UI Framework | ✅ Installed |
| TypeScript | 5.x | Type Safety | ✅ Installed |
| Vite | 6.x | Build Tool | ✅ Installed |
| Tailwind CSS | 4.x | Styling | ✅ Installed |
| Custom Components | - | Component Library | ✅ Implemented |
| Zustand | 5.x | State Management | ✅ Installed |
| React Query | 5.x | Server State | ✅ Installed |
| React Router | 7.x | Routing | ✅ Installed |
| Vite PWA | 1.x | PWA Service Worker | ✅ Installed |

### Backend (Firebase)
| Service | Purpose | Status |
|---------|---------|--------|
| Firebase Auth | Authentication | ✅ Configured |
| Cloud Firestore | Database | ✅ Configured |
| Cloud Storage | File Storage | ✅ Configured |
| Cloud Functions | Serverless Backend | ⏳ Not Started |
| Firebase Hosting | Web Hosting | ⏳ Not Started |
| Cloud Messaging | Push Notifications | ⏳ Not Started |

### External Services
| Service | Purpose | Status |
|---------|---------|--------|
| Google Maps Platform | Maps, Geocoding, Directions | 🟡 Partially Integrated |
| Firebase Phone Auth | OTP Verification | ✅ Configured |
| GCash API | Payment Processing | ⏳ Not Started |
| Maya API | Payment Processing | ⏳ Not Started |
| Stripe | International Cards | ⏳ Not Started |

---

## Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         GOGO PWA                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Customer  │  │   Driver    │  │  Merchant   │              │
│  │     App     │  │     App     │  │    App      │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │         Firebase Backend        │
          │  ┌──────────────────────────┐   │
          │  │     Cloud Functions      │   │
          │  │  - Order Processing      │   │
          │  │  - Driver Matching       │   │
          │  │  - Payment Processing    │   │
          │  │  - Notifications         │   │
          │  └──────────────────────────┘   │
          │  ┌──────────────────────────┐   │
          │  │     Cloud Firestore      │   │
          │  │  - Users                 │   │
          │  │  - Orders                │   │
          │  │  - Rides                 │   │
          │  │  - Merchants             │   │
          │  └──────────────────────────┘   │
          └─────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │       External Services          │
          │  ┌────────┐ ┌────────┐ ┌──────┐ │
          │  │ Google │ │ GCash  │ │ Maya │ │
          │  │  Maps  │ │  API   │ │ API  │ │
          │  └────────┘ └────────┘ └──────┘ │
          └─────────────────────────────────┘
```

### Folder Structure (Current Implementation)
```
gogo/
├── public/
│   ├── manifest.json           ✅ Implemented
│   └── icons/                  ✅ App icons (72-512px)
├── src/
│   ├── components/
│   │   ├── ui/                 ✅ Base UI components
│   │   │   ├── Avatar.tsx      ✅
│   │   │   ├── Badge.tsx       ✅
│   │   │   ├── BottomSheet.tsx ✅
│   │   │   ├── Button.tsx      ✅
│   │   │   ├── Card.tsx        ✅
│   │   │   ├── Input.tsx       ✅
│   │   │   ├── Modal.tsx       ✅
│   │   │   ├── Spinner.tsx     ✅
│   │   │   └── VehicleIcon.tsx ✅
│   │   ├── layout/             ✅ Layout components
│   │   │   ├── AppLayout.tsx   ✅ Main layout (sidebar + bottom nav)
│   │   │   ├── BottomNav.tsx   ✅
│   │   │   ├── Header.tsx      ✅ Desktop header
│   │   │   ├── MobileHeader.tsx ✅
│   │   │   ├── PageContainer.tsx ✅
│   │   │   ├── StickySearchBar.tsx ✅
│   │   │   └── Toast.tsx       ✅
│   │   ├── home/               ✅ Home page components
│   │   │   ├── CategoryPills.tsx ✅
│   │   │   ├── PromoCarousel.tsx ✅
│   │   │   ├── QuickServicesGrid.tsx ✅
│   │   │   ├── TimeBasedGreeting.tsx ✅
│   │   │   └── TrendingSection.tsx ✅
│   │   ├── rides/              ✅ Ride components
│   │   │   ├── LocationPin.tsx ✅
│   │   │   ├── MapView.tsx     ✅
│   │   │   ├── RecentRides.tsx ✅
│   │   │   ├── RideBookingCard.tsx ✅
│   │   │   └── VehicleTypeSelector.tsx ✅
│   │   ├── food/               ⏳ Not implemented
│   │   ├── grocery/            ⏳ Not implemented
│   │   └── shared/             ⏳ Not implemented
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx       ✅
│   │   │   ├── OTPVerification.tsx ✅
│   │   │   └── Register.tsx    ✅
│   │   ├── home/
│   │   │   └── Home.tsx        ✅
│   │   ├── rides/
│   │   │   ├── RideHome.tsx    ✅
│   │   │   ├── LocationPicker.tsx ✅
│   │   │   ├── BookRide.tsx    ⏳ Not implemented
│   │   │   ├── RideTracking.tsx ⏳ Not implemented
│   │   │   └── RideHistory.tsx ⏳ Not implemented
│   │   ├── food/
│   │   │   ├── FoodHome.tsx    ✅
│   │   │   ├── RestaurantList.tsx ⏳ Not implemented
│   │   │   ├── RestaurantDetail.tsx ⏳ Not implemented
│   │   │   ├── Cart.tsx        ⏳ Not implemented
│   │   │   └── Checkout.tsx    ⏳ Not implemented
│   │   ├── grocery/            ⏳ Not implemented (entire folder)
│   │   ├── wallet/
│   │   │   ├── Wallet.tsx      ✅ Basic UI
│   │   │   ├── TopUp.tsx       ⏳ Not implemented
│   │   │   └── Transactions.tsx ⏳ Not implemented
│   │   ├── orders/
│   │   │   ├── OrderList.tsx   ✅ Basic UI
│   │   │   └── OrderDetail.tsx ⏳ Not implemented
│   │   └── account/
│   │       ├── Profile.tsx     ✅
│   │       ├── Settings.tsx    ⏳ Not implemented
│   │       └── Support.tsx     ⏳ Not implemented
│   ├── hooks/                  ⏳ Not implemented (folder empty)
│   ├── services/
│   │   ├── firebase/
│   │   │   ├── config.ts       ✅
│   │   │   ├── auth.ts         ✅
│   │   │   ├── firestore.ts    ✅
│   │   │   ├── storage.ts      ✅
│   │   │   └── index.ts        ✅
│   │   └── api/                ⏳ Not implemented
│   ├── store/
│   │   ├── authStore.ts        ✅
│   │   ├── cartStore.ts        ✅
│   │   ├── rideStore.ts        ✅
│   │   ├── uiStore.ts          ✅
│   │   └── index.ts            ✅
│   ├── types/
│   │   ├── user.ts             ✅
│   │   ├── ride.ts             ✅
│   │   ├── order.ts            ✅
│   │   ├── merchant.ts         ✅
│   │   ├── product.ts          ✅
│   │   └── index.ts            ✅
│   ├── utils/
│   │   └── cn.ts               ✅ Tailwind class merger
│   ├── styles/                 (empty - styles in index.css)
│   ├── App.tsx                 ✅
│   ├── main.tsx                ✅
│   ├── index.css               ✅ Global styles + design system
│   └── vite-env.d.ts           ✅
├── functions/                   ⏳ NOT IMPLEMENTED
├── .env.example                ✅
├── index.html                  ✅
├── package.json                ✅
├── tsconfig.json               ✅
├── tsconfig.app.json           ✅
├── vite.config.ts              ✅ With PWA config
├── eslint.config.js            ✅
└── REQUIREMENTS.md             ✅
```

### Missing Files (To Be Created)
```
⏳ firebase.json                # Firebase deployment config
⏳ firestore.rules              # Firestore security rules
⏳ storage.rules                # Storage security rules
⏳ functions/                   # Cloud Functions folder
⏳ src/hooks/                   # Custom React hooks
⏳ src/services/api/            # API service layer
⏳ src/services/maps/           # Google Maps service
```

---

## Implementation Phases

### Progress Summary

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Foundation & Setup | ✅ COMPLETE | 100% |
| Phase 2: Authentication System | 🟡 IN PROGRESS | 70% |
| Phase 3: Home & Navigation | 🟡 IN PROGRESS | 75% |
| Phase 4: Ride-Hailing Module | 🟡 IN PROGRESS | 40% |
| Phase 5: Food Delivery Module | 🟡 IN PROGRESS | 25% |
| Phase 6: Grocery Delivery Module | ⏳ NOT STARTED | 0% |
| Phase 7: Wallet & Payments | 🟡 IN PROGRESS | 15% |
| Phase 8: Orders & History | 🟡 IN PROGRESS | 15% |
| Phase 9: Account & Settings | 🟡 IN PROGRESS | 20% |
| Phase 10: Advanced Features | ⏳ NOT STARTED | 25% |
| Phase 11: Driver/Merchant Portal | ⏳ NOT STARTED | 0% |
| Phase 12: Admin Dashboard | ⏳ NOT STARTED | 0% |

**Overall Project Progress: ~30%**

**Legend:**
- ✅ Complete
- 🟡 In Progress (UI/partial implementation)
- ⏳ Not Started

---

### Phase 1: Foundation & Setup ✅ COMPLETE
**Goal**: Establish project foundation and core infrastructure

#### Tasks:
- [x] Initialize Vite + React + TypeScript project
- [x] Configure Tailwind CSS (v4 with custom design system)
- [x] Setup Firebase project and configuration
- [x] Implement PWA manifest and service worker
- [x] Create base UI components (Button, Card, Input, Modal, Avatar, Badge, BottomSheet, Spinner)
- [x] Setup routing with React Router v7
- [x] Implement responsive layout (mobile-first with desktop sidebar)
- [x] Create bottom navigation component
- [x] Setup Zustand stores (authStore, cartStore, rideStore, uiStore)
- [x] Configure environment variables

#### Deliverables:
- ✅ Working PWA shell
- ✅ Base component library (Button, Card, Input, Modal, Avatar, Badge, BottomSheet, Spinner, VehicleIcon)
- ✅ Firebase connection established (Auth, Firestore, Storage)
- ✅ Responsive layout implemented (AppLayout with desktop sidebar + mobile bottom nav)

---

### Phase 2: Authentication System 🟡 IN PROGRESS
**Goal**: Complete user authentication and profile management

#### Tasks:
- [x] Phone number authentication with OTP (Firebase Phone Auth configured)
- [x] Google Sign-In integration (Firebase config ready)
- [x] Facebook Sign-In integration (Firebase config ready)
- [x] User registration flow (UI implemented)
- [x] Profile creation and editing (UI implemented)
- [ ] Session management (needs implementation)
- [ ] Protected routes (needs implementation)
- [ ] Password reset flow (not applicable - phone auth)
- [ ] Terms & Privacy acceptance (needs implementation)

#### Deliverables:
- 🟡 Auth system (UI complete, backend integration pending)
- 🟡 User profile management (UI complete, needs Firestore connection)
- ⏳ Secure session handling

#### Screens:
1. **Welcome Screen** - ⏳ Not implemented (redirects to Login)
2. **Phone Login** - ✅ Implemented ([Login.tsx](src/pages/auth/Login.tsx))
3. **OTP Verification** - ✅ Implemented ([OTPVerification.tsx](src/pages/auth/OTPVerification.tsx))
4. **Registration Form** - ✅ Implemented ([Register.tsx](src/pages/auth/Register.tsx))
5. **Profile Page** - ✅ Implemented ([Profile.tsx](src/pages/account/Profile.tsx))

---

### Phase 3: Home & Navigation 🟡 IN PROGRESS
**Goal**: Build main dashboard and navigation system

#### Tasks:
- [x] Home screen with service grid (Rides, Food, Grocery, etc.) - QuickServicesGrid component
- [x] Promotional banner carousel - PromoCarousel component
- [x] Search bar with suggestions - StickySearchBar component
- [x] Location services integration - uiStore with GeoPoint
- [ ] Current location detection (needs implementation)
- [ ] Address search with Google Places (needs implementation)
- [ ] Saved locations (Home, Work, Favorites) - types defined, UI pending
- [x] Bottom navigation (Home, Orders, Wallet, Account) - BottomNav component
- [ ] Notification center (not implemented)
- [x] Quick action buttons - QuickServicesGrid component

#### Deliverables:
- ✅ Functional home screen (ride-first design with food/grocery secondary)
- 🟡 Location services (store ready, implementation pending)
- ✅ Navigation system complete (BottomNav + AppLayout)

#### Screens:
1. **Home Dashboard** - ✅ Implemented ([Home.tsx](src/pages/home/Home.tsx)) with TimeBasedGreeting, RideBookingCard, CategoryPills, PromoCarousel, TrendingSection
2. **Location Picker** - ✅ Implemented ([LocationPicker.tsx](src/pages/rides/LocationPicker.tsx))
3. **Search Screen** - ⏳ Not implemented (search bar exists but no dedicated page)
4. **Notifications** - ⏳ Not implemented

---

### Phase 4: Ride-Hailing Module 🟡 IN PROGRESS
**Goal**: Complete ride booking and tracking system

#### Tasks:
- [x] Vehicle type selection (6 types: motorcycle, car, van, delivery, happy_move, airport) - VehicleTypeSelector component
- [x] Pickup location selection with map - LocationPicker page with MapView
- [x] Drop-off location selection - LocationPicker page
- [x] Route preview on map - MapView component (basic)
- [ ] Fare estimation algorithm (UI ready, calculation logic pending)
- [ ] Ride booking submission (needs Cloud Functions)
- [ ] Driver matching system (needs Cloud Functions)
- [ ] Real-time driver tracking (needs implementation)
- [ ] In-ride communication (call/message) (not implemented)
- [ ] Ride cancellation flow (not implemented)
- [x] Payment selection - rideStore with payment methods
- [ ] Rating and review system (not implemented)
- [ ] Ride history (not implemented)

#### Vehicle Types:
| Type | Icon | Description | Base Fare | Per KM |
|------|------|-------------|-----------|--------|
| MC Taxi | 🏍️ | Motorcycle taxi | ₱40 | ₱10 |
| Car | 🚗 | Standard 4-seater | ₱60 | ₱15 |
| Taxi Cab | 🚕 | Metered taxi | ₱50 | ₱13.50 |
| Premium | 🚙 | Premium vehicles | ₱100 | ₱25 |
| Airport | ✈️ | Airport transfer | ₱500 | Flat |

#### Deliverables:
- 🟡 Ride booking flow (UI complete, backend pending)
- ⏳ Real-time tracking
- ⏳ Driver matching (needs Cloud Functions)
- 🟡 Payment integration (UI ready)

#### Screens:
1. **Ride Home** - ✅ Implemented ([RideHome.tsx](src/pages/rides/RideHome.tsx)) with VehicleTypeSelector, RecentRides
2. **Set Location** - ✅ Implemented ([LocationPicker.tsx](src/pages/rides/LocationPicker.tsx)) with MapView
3. **Confirm Booking** - ⏳ Not implemented
4. **Finding Driver** - ⏳ Not implemented
5. **Driver Found** - ⏳ Not implemented
6. **Ride In Progress** - ⏳ Not implemented
7. **Ride Complete** - ⏳ Not implemented
8. **Ride History** - ⏳ Not implemented

---

### Phase 5: Food Delivery Module 🟡 IN PROGRESS
**Goal**: Complete food ordering system

#### Tasks:
- [x] Restaurant listing with filters - FoodHome page with sorting
- [x] Restaurant categories (Fast Food, Filipino, Chinese, etc.) - CategoryPills component
- [ ] Restaurant detail page (not implemented)
- [ ] Menu display with categories (not implemented)
- [ ] Item customization (size, add-ons) - types defined, UI pending
- [x] Cart management - cartStore with persistent storage
- [ ] Delivery address selection (not implemented)
- [ ] Delivery fee calculation - cartStore has deliveryFee field
- [ ] Order placement (needs Cloud Functions)
- [ ] Order tracking (Preparing → Picked Up → On the way → Delivered) (not implemented)
- [ ] Delivery rider tracking (not implemented)
- [ ] Order rating and review (not implemented)
- [ ] Reorder functionality (not implemented)
- [x] Restaurant search - StickySearchBar component
- [ ] Favorites/saved restaurants (not implemented)

#### Restaurant Categories:
- Fast Food
- Filipino Cuisine
- Chinese
- Japanese
- Korean
- Pizza
- Burgers
- Coffee & Tea
- Desserts
- Healthy
- Convenience

#### Deliverables:
- 🟡 Restaurant browsing (basic listing done)
- ⏳ Menu ordering
- 🟡 Cart (store ready, UI pending)
- ⏳ Order tracking

#### Screens:
1. **Food Home** - ✅ Implemented ([FoodHome.tsx](src/pages/food/FoodHome.tsx)) with categories, sorting, search
2. **Restaurant List** - 🟡 Partially in FoodHome (needs dedicated page)
3. **Restaurant Detail** - ⏳ Not implemented
4. **Item Detail** - ⏳ Not implemented
5. **Cart** - ⏳ Not implemented (cartStore ready)
6. **Checkout** - ⏳ Not implemented
7. **Order Tracking** - ⏳ Not implemented
8. **Order Complete** - ⏳ Not implemented

---

### Phase 6: Grocery Delivery Module ⏳ NOT STARTED
**Goal**: Complete grocery shopping system

#### Tasks:
- [ ] Store/supermarket listing
- [ ] Store categories
- [ ] Product catalog with categories
- [ ] Product search
- [ ] Product detail page
- [ ] Add to cart functionality (cartStore ready, can be reused)
- [ ] Cart management (cartStore ready, can be reused)
- [ ] Delivery scheduling
- [ ] Order placement
- [ ] Order tracking
- [ ] Substitution preferences
- [ ] Shopping lists
- [ ] Reorder from history

#### Store Categories:
- Supermarkets
- Convenience Stores
- Pharmacies
- Pet Supplies
- Office Supplies
- Home & Living

#### Product Categories:
- Fruits & Vegetables
- Meat & Seafood
- Dairy & Eggs
- Bread & Bakery
- Beverages
- Snacks
- Frozen Foods
- Household
- Personal Care
- Baby Products

#### Deliverables:
- ⏳ Store browsing
- ⏳ Product catalog
- 🟡 Shopping cart (cartStore ready)
- ⏳ Order tracking

#### Screens:
1. **Grocery Home** - ⏳ Not implemented
2. **Store List** - ⏳ Not implemented
3. **Store Detail** - ⏳ Not implemented
4. **Product List** - ⏳ Not implemented
5. **Product Detail** - ⏳ Not implemented
6. **Cart** - ⏳ Not implemented (cartStore ready)
7. **Checkout** - ⏳ Not implemented
8. **Order Tracking** - ⏳ Not implemented

---

### Phase 7: Wallet & Payments 🟡 IN PROGRESS
**Goal**: Complete payment system

#### Tasks:
- [x] Wallet balance display - Wallet page (basic UI)
- [ ] Top-up via GCash (needs API integration)
- [ ] Top-up via Maya (needs API integration)
- [ ] Top-up via Credit/Debit card (needs Stripe integration)
- [ ] Transaction history (types defined, UI pending)
- [ ] Payment method management (not implemented)
- [ ] Promo code application (types defined, UI pending)
- [ ] Referral program (user type has referralCode field)
- [x] Cash payment option - rideStore supports cash
- [ ] Auto-debit settings (not implemented)
- [ ] Withdrawal (for drivers/merchants) (not implemented)

#### Payment Methods:
| Method | Icon | Type |
|--------|------|------|
| GOGO Wallet | 💰 | E-wallet |
| GCash | 📱 | E-wallet |
| Maya | 💳 | E-wallet |
| Credit Card | 💳 | Card |
| Debit Card | 💳 | Card |
| Cash | 💵 | Cash on delivery |

#### Deliverables:
- 🟡 Wallet system (basic UI)
- ⏳ Payment integrations
- ⏳ Transaction history

#### Screens:
1. **Wallet Home** - ✅ Implemented ([Wallet.tsx](src/pages/wallet/Wallet.tsx)) - basic balance display
2. **Top Up** - ⏳ Not implemented
3. **Payment Methods** - ⏳ Not implemented
4. **Transactions** - ⏳ Not implemented
5. **Promos** - ⏳ Not implemented

---

### Phase 8: Orders & History 🟡 IN PROGRESS
**Goal**: Order management system

#### Tasks:
- [x] Unified order list (all services) - OrderList page (basic UI with mock data)
- [ ] Order filtering (type, status, date) (not implemented)
- [ ] Order detail view (not implemented)
- [ ] Order cancellation (not implemented)
- [ ] Refund requests (not implemented)
- [ ] Receipt download (not implemented)
- [ ] Reorder functionality (not implemented)
- [ ] Order support chat (not implemented)
- [ ] Dispute resolution (not implemented)

#### Deliverables:
- 🟡 Order history (basic UI)
- ⏳ Order management
- ⏳ Support integration

#### Screens:
1. **Orders Home** - ✅ Implemented ([OrderList.tsx](src/pages/orders/OrderList.tsx)) - basic list with mock data
2. **Order Detail** - ⏳ Not implemented
3. **Receipt** - ⏳ Not implemented
4. **Support Chat** - ⏳ Not implemented

---

### Phase 9: Account & Settings 🟡 IN PROGRESS
**Goal**: User account management

#### Tasks:
- [x] Profile editing - Profile page (basic UI)
- [ ] Address book management (types defined, UI pending)
- [ ] Payment method management (not implemented)
- [ ] Notification preferences (types defined, UI pending)
- [ ] Language settings (types defined, UI pending)
- [ ] App preferences (not implemented)
- [ ] Privacy settings (not implemented)
- [ ] Help center (not implemented)
- [ ] FAQs (not implemented)
- [ ] Contact support (not implemented)
- [ ] Rate the app (not implemented)
- [ ] Share app (not implemented)
- [ ] Logout (not implemented)

#### Deliverables:
- 🟡 Account section (basic profile UI)
- ⏳ Settings management
- ⏳ Help center

#### Screens:
1. **Account Home** - ✅ Implemented ([Profile.tsx](src/pages/account/Profile.tsx)) - profile overview
2. **Edit Profile** - 🟡 Partial (in Profile.tsx)
3. **Addresses** - ⏳ Not implemented
4. **Settings** - ⏳ Not implemented
5. **Help Center** - ⏳ Not implemented
6. **About** - ⏳ Not implemented

---

### Phase 10: Advanced Features ⏳ NOT STARTED
**Goal**: Enhanced functionality

#### Tasks:
- [ ] Push notifications (FCM) - Firebase Messaging configured but not implemented
- [ ] In-app messaging (not implemented)
- [ ] Real-time order updates - Firestore real-time listeners ready
- [ ] Scheduled orders/rides (not implemented)
- [ ] Group orders (not implemented)
- [ ] Corporate accounts (not implemented)
- [ ] Loyalty program (not implemented)
- [ ] Analytics integration (not implemented)
- [x] Performance optimization - Vite PWA with caching strategies configured
- [x] Offline support - Service worker with Workbox caching
- [x] Desktop optimizations - Responsive layout with desktop sidebar

#### Deliverables:
- ⏳ Push notifications
- ⏳ Advanced features
- 🟡 Optimized performance (basic PWA optimizations done)

---

### Phase 11: Driver/Merchant Portal ⏳ NOT STARTED
**Goal**: Partner applications

#### Tasks:
- [ ] Driver registration (types defined)
- [ ] Driver verification (not implemented)
- [ ] Driver dashboard (not implemented)
- [ ] Order/ride acceptance (not implemented)
- [ ] Navigation integration (not implemented)
- [ ] Earnings tracking (not implemented)
- [ ] Merchant registration (types defined)
- [ ] Menu management (not implemented)
- [ ] Order management (not implemented)
- [ ] Analytics dashboard (not implemented)

#### Deliverables:
- ⏳ Driver app
- ⏳ Merchant portal

---

### Phase 12: Admin Dashboard ⏳ NOT STARTED
**Goal**: Administrative tools

#### Tasks:
- [ ] User management (not implemented)
- [ ] Driver management (not implemented)
- [ ] Merchant management (not implemented)
- [ ] Order monitoring (not implemented)
- [ ] Analytics dashboard (not implemented)
- [ ] Promo management (not implemented)
- [ ] Content management (not implemented)
- [ ] Support tickets (not implemented)
- [ ] Financial reports (not implemented)

#### Deliverables:
- ⏳ Admin dashboard
- ⏳ Management tools

---

## Feature Specifications

### Authentication Features
```typescript
interface AuthFeatures {
  phoneAuth: {
    countryCode: '+63';
    otpLength: 6;
    otpExpiry: 300; // seconds
    maxAttempts: 3;
  };
  socialAuth: ['google', 'facebook'];
  session: {
    duration: 30; // days
    refreshable: true;
  };
}
```

### Location Features
```typescript
interface LocationFeatures {
  currentLocation: boolean;
  searchPlaces: boolean;
  savedLocations: {
    home: boolean;
    work: boolean;
    custom: boolean;
    maxCustom: 10;
  };
  recentLocations: {
    enabled: true;
    maxCount: 20;
  };
}
```

### Ride Features
```typescript
interface RideFeatures {
  vehicleTypes: ['motorcycle', 'car', 'taxi', 'premium', 'airport'];
  scheduling: {
    enabled: true;
    maxAdvance: 7; // days
  };
  tracking: {
    realtime: true;
    updateInterval: 5000; // ms
  };
  cancellation: {
    freeWindow: 5; // minutes
    fee: 50; // PHP
  };
}
```

### Order Features
```typescript
interface OrderFeatures {
  foodDelivery: {
    minOrder: 99; // PHP
    deliveryFee: {
      base: 49;
      perKm: 10;
    };
    estimatedTime: '30-45min';
  };
  groceryDelivery: {
    minOrder: 500; // PHP
    deliveryFee: {
      base: 69;
      perKm: 15;
    };
    scheduling: true;
  };
}
```

---

## Database Schema

### Users Collection
```typescript
interface User {
  id: string;
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  dateOfBirth?: Timestamp;
  gender?: 'male' | 'female' | 'other';
  savedLocations: SavedLocation[];
  defaultPaymentMethod?: string;
  walletBalance: number;
  referralCode: string;
  referredBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'active' | 'suspended' | 'deleted';
  settings: UserSettings;
}

interface SavedLocation {
  id: string;
  label: string;
  type: 'home' | 'work' | 'other';
  address: string;
  coordinates: GeoPoint;
  details?: string;
}

interface UserSettings {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    promotions: boolean;
  };
  language: 'en' | 'fil';
  currency: 'PHP';
}
```

### Drivers Collection
```typescript
interface Driver {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  profileImage: string;
  vehicleType: 'motorcycle' | 'car' | 'taxi' | 'premium';
  vehicle: Vehicle;
  license: DriverLicense;
  rating: number;
  totalRides: number;
  status: 'online' | 'offline' | 'busy';
  currentLocation?: GeoPoint;
  earnings: DriverEarnings;
  documents: DriverDocuments;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  verified: boolean;
}

interface Vehicle {
  type: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  registrationExpiry: Timestamp;
}

interface DriverLicense {
  number: string;
  expiry: Timestamp;
  type: string;
}
```

### Merchants Collection
```typescript
interface Merchant {
  id: string;
  name: string;
  type: 'restaurant' | 'grocery' | 'convenience' | 'pharmacy';
  description: string;
  logo: string;
  coverImage: string;
  categories: string[];
  address: string;
  coordinates: GeoPoint;
  phone: string;
  email: string;
  operatingHours: OperatingHours[];
  rating: number;
  totalOrders: number;
  deliveryFee: number;
  minOrder: number;
  estimatedDelivery: string;
  isOpen: boolean;
  isFeatured: boolean;
  status: 'active' | 'suspended' | 'closed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface OperatingHours {
  day: number; // 0-6 (Sunday-Saturday)
  open: string; // "09:00"
  close: string; // "22:00"
  isClosed: boolean;
}
```

### Products Collection
```typescript
interface Product {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  image: string;
  category: string;
  subcategory?: string;
  options?: ProductOption[];
  addons?: ProductAddon[];
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime?: number; // minutes
  nutritionInfo?: NutritionInfo;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ProductOption {
  name: string;
  required: boolean;
  maxSelect: number;
  choices: {
    name: string;
    price: number;
  }[];
}

interface ProductAddon {
  name: string;
  price: number;
  isAvailable: boolean;
}
```

### Rides Collection
```typescript
interface Ride {
  id: string;
  passengerId: string;
  driverId?: string;
  vehicleType: string;
  pickup: {
    address: string;
    coordinates: GeoPoint;
    details?: string;
  };
  dropoff: {
    address: string;
    coordinates: GeoPoint;
    details?: string;
  };
  route?: {
    distance: number; // meters
    duration: number; // seconds
    polyline: string;
  };
  fare: {
    base: number;
    distance: number;
    time: number;
    surge?: number;
    discount?: number;
    total: number;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: RideStatus;
  scheduledAt?: Timestamp;
  acceptedAt?: Timestamp;
  arrivedAt?: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  cancelledAt?: Timestamp;
  cancellationReason?: string;
  rating?: number;
  review?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type RideStatus =
  | 'pending'      // Looking for driver
  | 'accepted'     // Driver accepted
  | 'arriving'     // Driver on the way to pickup
  | 'arrived'      // Driver at pickup location
  | 'in_progress'  // Ride in progress
  | 'completed'    // Ride completed
  | 'cancelled';   // Ride cancelled
```

### Orders Collection
```typescript
interface Order {
  id: string;
  customerId: string;
  merchantId: string;
  driverId?: string;
  type: 'food' | 'grocery';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount?: number;
  total: number;
  deliveryAddress: {
    address: string;
    coordinates: GeoPoint;
    details?: string;
    contactName: string;
    contactPhone: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: OrderStatus;
  notes?: string;
  promoCode?: string;
  scheduledAt?: Timestamp;
  confirmedAt?: Timestamp;
  preparingAt?: Timestamp;
  readyAt?: Timestamp;
  pickedUpAt?: Timestamp;
  deliveredAt?: Timestamp;
  cancelledAt?: Timestamp;
  cancellationReason?: string;
  rating?: number;
  review?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  options?: {
    name: string;
    choice: string;
    price: number;
  }[];
  addons?: {
    name: string;
    price: number;
  }[];
  specialInstructions?: string;
  total: number;
}

type OrderStatus =
  | 'pending'       // Order placed, awaiting confirmation
  | 'confirmed'     // Merchant confirmed
  | 'preparing'     // Being prepared
  | 'ready'         // Ready for pickup
  | 'picked_up'     // Driver picked up
  | 'on_the_way'    // Out for delivery
  | 'delivered'     // Delivered
  | 'cancelled';    // Cancelled
```

### Transactions Collection
```typescript
interface Transaction {
  id: string;
  userId: string;
  type: 'topup' | 'payment' | 'refund' | 'withdrawal' | 'transfer';
  amount: number;
  balance: number; // Balance after transaction
  reference?: string; // Order ID, Ride ID, etc.
  paymentMethod?: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Promos Collection
```typescript
interface Promo {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'freeDelivery';
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  validFrom: Timestamp;
  validTo: Timestamp;
  usageLimit?: number;
  usedCount: number;
  userLimit: number;
  applicableServices: ('rides' | 'food' | 'grocery')[];
  applicableMerchants?: string[];
  terms: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## API Endpoints (Cloud Functions)

### Authentication
```
POST /auth/sendOTP          - Send OTP to phone
POST /auth/verifyOTP        - Verify OTP code
POST /auth/register         - Complete registration
POST /auth/socialLogin      - Social login callback
```

### Users
```
GET  /users/profile         - Get user profile
PUT  /users/profile         - Update profile
GET  /users/locations       - Get saved locations
POST /users/locations       - Add saved location
PUT  /users/locations/:id   - Update location
DELETE /users/locations/:id - Delete location
```

### Rides
```
POST /rides/estimate        - Get fare estimate
POST /rides/book            - Book a ride
GET  /rides/:id             - Get ride details
PUT  /rides/:id/cancel      - Cancel ride
POST /rides/:id/rate        - Rate ride
GET  /rides/history         - Get ride history
```

### Food/Grocery Orders
```
GET  /merchants             - List merchants
GET  /merchants/:id         - Get merchant details
GET  /merchants/:id/menu    - Get merchant menu
POST /orders                - Place order
GET  /orders/:id            - Get order details
PUT  /orders/:id/cancel     - Cancel order
POST /orders/:id/rate       - Rate order
GET  /orders/history        - Get order history
```

### Wallet
```
GET  /wallet/balance        - Get wallet balance
POST /wallet/topup          - Top up wallet
GET  /wallet/transactions   - Get transactions
POST /wallet/withdraw       - Withdraw funds (drivers)
```

### Promos
```
GET  /promos                - List available promos
POST /promos/validate       - Validate promo code
```

---

## UI/UX Guidelines

### Design System

#### Colors
```css
:root {
  /* Primary */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;  /* Main Primary */
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;

  /* Secondary */
  --secondary-500: #f59e0b;  /* Amber */

  /* Semantic */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;

  /* Neutral */
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
}
```

#### Typography
```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

#### Spacing
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
```

#### Border Radius
```css
--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.5rem;   /* 8px */
--radius-lg: 0.75rem;  /* 12px */
--radius-xl: 1rem;     /* 16px */
--radius-full: 9999px;
```

### Component Patterns

#### Bottom Navigation
- Fixed at bottom on mobile
- 4 main items: Home, Orders, Wallet, Account
- Active state with filled icon and primary color
- Badge for notifications/pending orders

#### Service Cards (Home)
- Grid layout (2x4 on mobile)
- Icon + label
- Optional badge (New, Top, Sale)
- Tap feedback with ripple effect

#### Location Picker
- Full-screen modal
- Search input at top
- Current location button
- Recent locations list
- Map view for precise selection

#### Order/Ride Cards
- Status indicator with color
- Essential info (merchant/driver, items, price)
- Action buttons (Track, Cancel, Reorder)
- Tap to view details

### Responsive Breakpoints
```css
/* Mobile first */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Mobile-Specific
- Safe area insets for notch devices
- Pull-to-refresh on lists
- Swipe gestures for actions
- Bottom sheet modals
- Haptic feedback

### Desktop Adaptations
- Sidebar navigation instead of bottom nav
- Multi-column layouts
- Hover states
- Keyboard shortcuts
- Wider content containers

---

## Security Requirements

### Authentication
- Firebase Authentication for identity
- Phone OTP verification required
- JWT tokens for API authentication
- Session expiry and refresh
- Rate limiting on OTP requests

### Data Protection
- All data encrypted in transit (HTTPS)
- Firestore security rules
- Sensitive data encryption at rest
- PII handling compliance
- Data retention policies

### Payment Security
- PCI DSS compliance for card handling
- Tokenized payment methods
- No storage of full card numbers
- Transaction signing
- Fraud detection

### API Security
- Rate limiting
- Input validation
- SQL injection prevention (N/A with Firestore)
- XSS prevention
- CORS configuration

---

## Performance Requirements

### Load Times
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Largest Contentful Paint: < 2.5s

### PWA Metrics
- Lighthouse PWA score: > 90
- Lighthouse Performance: > 80
- Service Worker caching
- Offline functionality for key features

### Real-time Updates
- Ride tracking: < 5s update interval
- Order status: < 10s update interval
- Chat messages: < 1s delivery

### Optimization
- Code splitting by route
- Image lazy loading
- Virtual scrolling for long lists
- Memoization of expensive computations
- Debounced search inputs

---

## Testing Requirements

### Unit Testing
- Jest for unit tests
- React Testing Library
- Minimum 70% coverage

### Integration Testing
- Firebase emulators for local testing
- API endpoint testing
- Payment flow testing

### E2E Testing
- Playwright for E2E tests
- Critical user flows covered
- Cross-browser testing

### Performance Testing
- Lighthouse CI
- Load testing for backend
- Real device testing

---

## Deployment

### Environments
- Development: dev.gogo.ph
- Staging: staging.gogo.ph
- Production: app.gogo.ph

### CI/CD
- GitHub Actions for automation
- Automated testing on PR
- Preview deployments
- Production deployment approval

### Monitoring
- Firebase Analytics
- Firebase Crashlytics
- Performance monitoring
- Error tracking (Sentry)

---

## Success Metrics

### User Engagement
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Session duration
- Orders per user per month

### Business Metrics
- Gross Merchandise Value (GMV)
- Revenue
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (CLV)

### Technical Metrics
- App crash rate < 0.1%
- API success rate > 99.9%
- Average response time < 200ms
- PWA installation rate

---

## Appendix

### Philippine-Specific Considerations
- GCash and Maya integration (most used e-wallets)
- Philippine address format support
- Local time zone handling (PHT)
- Holiday schedule handling
- Barangay-level location support
- Filipino language support
- Local currency (PHP) formatting

### Competitor Analysis
| Feature | GOGO | JoyRide | Grab | Foodpanda |
|---------|------|---------|------|-----------|
| Rides | ✅ | ✅ | ✅ | ❌ |
| Food | ✅ | ✅ | ✅ | ✅ |
| Grocery | ✅ | ❌ | ✅ | ✅ |
| PWA | ✅ | ❌ | ❌ | ❌ |
| Desktop | ✅ | ❌ | ❌ | ✅ |

### References
- JoyRide Philippines (UI reference)
- DoorDash (UX patterns)
- Firebase Documentation
- Google Maps Platform
- GCash Developer Portal
- Maya Developer Portal
