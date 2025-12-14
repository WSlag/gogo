# GOGO Super App - Setup Guide

Complete guide to set up Firebase, Google Maps, and other services for the GOGO app.

---

## 1. Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `gogo-app` (or your preferred name)
4. Enable/Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Register Web App

1. In Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `GOGO Web`
3. Check **"Also set up Firebase Hosting"** (optional)
4. Click **"Register app"**
5. **Copy the firebaseConfig object** - you'll need these values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXXX"
};
```

### Step 3: Enable Authentication Methods

1. Go to **Authentication** > **Sign-in method**
2. Enable the following providers:

#### Phone Authentication
- Click **Phone** > Enable
- Add test phone numbers for development (optional):
  - `+639123456789` with code `123456`

#### Google Sign-In
- Click **Google** > Enable
- Set project support email
- Save

#### Facebook Sign-In (Optional)
- Click **Facebook** > Enable
- Enter Facebook App ID and App Secret
- Copy the OAuth redirect URI to Facebook app settings
- Save

### Step 4: Create Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Choose **Start in production mode** (rules are already configured)
3. Select a Cloud Firestore location closest to your users:
   - For Philippines: `asia-southeast1` (Singapore)
4. Click **Enable**

### Step 5: Deploy Firestore Rules

From your project directory, run:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (select existing project)
firebase init

# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

### Step 6: Enable Cloud Storage

1. Go to **Storage** > **Get started**
2. Start in production mode
3. Select the same location as Firestore
4. Click **Done**

Deploy storage rules:

```bash
firebase deploy --only storage
```

### Step 7: Enable Cloud Functions

1. Upgrade to **Blaze plan** (pay-as-you-go) - required for Cloud Functions
2. Go to **Functions** > Enable

Deploy functions:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

---

## 2. Google Maps API Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing (use same as Firebase)

### Step 2: Enable Required APIs

Go to **APIs & Services** > **Library** and enable:

1. **Maps JavaScript API** - For displaying maps
2. **Places API** - For location search/autocomplete
3. **Directions API** - For route calculations
4. **Geocoding API** - For address lookup
5. **Distance Matrix API** - For distance calculations

### Step 3: Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Click on the created key to configure restrictions:

#### Application Restrictions
- Select **HTTP referrers (websites)**
- Add allowed referrers:
  ```
  localhost:*
  127.0.0.1:*
  your-domain.com/*
  your-project.web.app/*
  your-project.firebaseapp.com/*
  ```

#### API Restrictions
- Select **Restrict key**
- Select these APIs:
  - Maps JavaScript API
  - Places API
  - Directions API
  - Geocoding API
  - Distance Matrix API

4. Click **Save**
5. Copy your API key

### Step 4: Enable Billing

Google Maps requires billing enabled (free tier available):
1. Go to **Billing** in Google Cloud Console
2. Link a billing account
3. You get $200/month free credit

---

## 3. Environment Configuration

### Create .env File

Create a `.env` file in the project root:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=AIzaSyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY

# App Configuration
VITE_APP_NAME=GOGO
VITE_APP_ENV=development
```

### Set Up Firebase Functions Environment

```bash
cd functions
cp .env.example .env
```

Edit `functions/.env`:

```bash
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## 4. Initial Database Setup

### Create Sample Collections

After setting up Firebase, you need to seed initial data. Run the following in Firebase Console > Firestore or use the provided seed script.

#### Option A: Use Firebase Console

1. Go to Firestore Database
2. Create collections manually

#### Option B: Run Seed Script

```bash
npm run seed
```

### Required Collections Structure

```
firestore/
├── users/           # User profiles
├── drivers/         # Driver profiles & status
├── merchants/       # Restaurant/store info
├── products/        # Menu items/products
├── rides/           # Ride bookings
├── orders/          # Food/grocery orders
├── transactions/    # Wallet transactions
├── notifications/   # User notifications
└── promos/          # Promo codes
```

---

## 5. Running the Application

### Development Mode

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### With Firebase Emulators (Recommended for Development)

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, start the app
npm run dev
```

Emulator UI will be available at: http://localhost:4000

### Production Build

```bash
# Build the app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

---

## 6. Verification Checklist

After setup, verify each service:

### Firebase Auth
- [ ] Sign up with phone number works
- [ ] OTP verification works
- [ ] Google Sign-In works
- [ ] User profile is created in Firestore

### Firestore
- [ ] Can read merchants list
- [ ] Can create/read user profile
- [ ] Can create rides/orders

### Storage
- [ ] Can upload profile image
- [ ] Images are accessible

### Google Maps
- [ ] Map displays correctly
- [ ] Location search works
- [ ] Route calculation works

### Cloud Functions
- [ ] User profile auto-created on signup
- [ ] Ride status updates trigger correctly

---

## 7. Common Issues & Solutions

### Issue: "Firebase: Error (auth/invalid-api-key)"
**Solution**: Check that `VITE_FIREBASE_API_KEY` is correct in `.env`

### Issue: Maps not loading
**Solution**:
1. Check API key is correct
2. Verify APIs are enabled in Google Cloud Console
3. Check browser console for errors
4. Verify HTTP referrer restrictions

### Issue: "Permission denied" in Firestore
**Solution**:
1. Check you're authenticated
2. Verify Firestore rules are deployed
3. Check user document exists

### Issue: Phone auth not working
**Solution**:
1. Add your domain to authorized domains in Firebase Console
2. For localhost, add `localhost` to authorized domains
3. Enable Phone provider in Authentication settings

### Issue: Cloud Functions not deploying
**Solution**:
1. Ensure Blaze plan is active
2. Check `functions/package.json` for correct Node version
3. Run `npm install` in functions directory

---

## 8. Security Notes

1. **Never commit `.env` files** to version control
2. **Restrict API keys** to specific domains/IPs
3. **Use environment variables** for all sensitive data
4. **Enable App Check** for production (Firebase Console > App Check)
5. **Monitor usage** in Firebase and Google Cloud Console

---

## 9. Cost Estimation

### Firebase (Blaze Plan - Pay as you go)

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| Authentication | 10K verifications/month | $0.01-0.06/verification |
| Firestore | 50K reads, 20K writes/day | $0.06/100K reads |
| Storage | 5GB storage, 1GB/day download | $0.026/GB |
| Functions | 2M invocations/month | $0.40/million |
| Hosting | 10GB storage, 360MB/day | $0.026/GB |

### Google Maps Platform

| API | Free Tier | Cost After |
|-----|-----------|------------|
| Maps JavaScript | $200/month credit | $7/1000 loads |
| Places | Included in credit | $17-40/1000 requests |
| Directions | Included in credit | $5-10/1000 requests |
| Geocoding | Included in credit | $5/1000 requests |

**Estimated monthly cost for small app**: $0 - $50 (within free tiers)

---

## Next Steps

After completing setup:

1. **Test all authentication flows**
2. **Add sample merchants and products**
3. **Test ride booking flow**
4. **Test food/grocery ordering**
5. **Configure push notifications (FCM)**
6. **Set up payment gateway (Stripe/GCash)**
