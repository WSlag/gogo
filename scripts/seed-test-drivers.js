/**
 * Seed Test Drivers Script
 *
 * This script adds test driver data to Firestore for testing the ride booking flow.
 *
 * Usage:
 *   node scripts/seed-test-drivers.js
 *
 * Prerequisites:
 *   - Firebase Admin SDK credentials (service account key)
 *   - Or run from Firebase console
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, GeoPoint, Timestamp } = require('firebase-admin/firestore');

// Initialize Firebase Admin
// Option 1: Using service account (recommended for local development)
// const serviceAccount = require('../serviceAccountKey.json');
// initializeApp({ credential: cert(serviceAccount) });

// Option 2: Using default credentials (works in Cloud Functions, Cloud Run, etc.)
initializeApp();

const db = getFirestore();

// Test drivers data - covering all vehicle types
const testDrivers = [
  {
    id: 'test_driver_motorcycle_001',
    userId: 'test_user_driver_001',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    phone: '+639171234567',
    email: 'juan.driver@test.com',
    profileImage: 'https://ui-avatars.com/api/?name=Juan+Dela+Cruz&background=10B981&color=fff',
    vehicleType: 'motorcycle',
    vehicle: {
      type: 'motorcycle',
      make: 'Honda',
      model: 'Click 125i',
      year: 2023,
      color: 'Red',
      plateNumber: 'ABC 1234',
      registrationExpiry: Timestamp.fromDate(new Date('2025-12-31')),
    },
    license: {
      number: 'N01-12-345678',
      expiry: Timestamp.fromDate(new Date('2026-06-15')),
      type: 'Professional',
    },
    documents: {},
    rating: 4.8,
    totalRides: 256,
    totalDeliveries: 89,
    status: 'online',
    currentLocation: new GeoPoint(14.5995, 120.9842), // Manila - Rizal Park area
    earnings: {
      today: 850,
      thisWeek: 4250,
      thisMonth: 18500,
      total: 156000,
      pendingPayout: 2500,
    },
    acceptanceRate: 92,
    cancellationRate: 3,
    verified: true,
    verifiedAt: Timestamp.fromDate(new Date('2024-01-15')),
    createdAt: Timestamp.fromDate(new Date('2024-01-10')),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'test_driver_car_001',
    userId: 'test_user_driver_002',
    firstName: 'Maria',
    lastName: 'Santos',
    phone: '+639182345678',
    email: 'maria.driver@test.com',
    profileImage: 'https://ui-avatars.com/api/?name=Maria+Santos&background=3B82F6&color=fff',
    vehicleType: 'car',
    vehicle: {
      type: 'car',
      make: 'Toyota',
      model: 'Vios',
      year: 2022,
      color: 'White',
      plateNumber: 'XYZ 5678',
      registrationExpiry: Timestamp.fromDate(new Date('2025-10-31')),
    },
    license: {
      number: 'N02-34-567890',
      expiry: Timestamp.fromDate(new Date('2026-08-20')),
      type: 'Professional',
    },
    documents: {},
    rating: 4.9,
    totalRides: 512,
    totalDeliveries: 0,
    status: 'online',
    currentLocation: new GeoPoint(14.5547, 121.0244), // Makati area
    earnings: {
      today: 1200,
      thisWeek: 6800,
      thisMonth: 28500,
      total: 285000,
      pendingPayout: 4200,
    },
    acceptanceRate: 95,
    cancellationRate: 2,
    verified: true,
    verifiedAt: Timestamp.fromDate(new Date('2023-08-20')),
    createdAt: Timestamp.fromDate(new Date('2023-08-15')),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'test_driver_taxi_001',
    userId: 'test_user_driver_003',
    firstName: 'Pedro',
    lastName: 'Reyes',
    phone: '+639193456789',
    email: 'pedro.driver@test.com',
    profileImage: 'https://ui-avatars.com/api/?name=Pedro+Reyes&background=F59E0B&color=fff',
    vehicleType: 'taxi',
    vehicle: {
      type: 'taxi',
      make: 'Toyota',
      model: 'Innova',
      year: 2021,
      color: 'Yellow',
      plateNumber: 'TAX 9012',
      registrationExpiry: Timestamp.fromDate(new Date('2025-09-30')),
    },
    license: {
      number: 'N03-45-678901',
      expiry: Timestamp.fromDate(new Date('2026-03-10')),
      type: 'Professional',
    },
    documents: {},
    rating: 4.7,
    totalRides: 1024,
    totalDeliveries: 0,
    status: 'online',
    currentLocation: new GeoPoint(14.6507, 121.0495), // Quezon City area
    earnings: {
      today: 1500,
      thisWeek: 8500,
      thisMonth: 35000,
      total: 420000,
      pendingPayout: 5500,
    },
    acceptanceRate: 88,
    cancellationRate: 5,
    verified: true,
    verifiedAt: Timestamp.fromDate(new Date('2023-05-10')),
    createdAt: Timestamp.fromDate(new Date('2023-05-01')),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'test_driver_premium_001',
    userId: 'test_user_driver_004',
    firstName: 'Carlo',
    lastName: 'Mendoza',
    phone: '+639204567890',
    email: 'carlo.driver@test.com',
    profileImage: 'https://ui-avatars.com/api/?name=Carlo+Mendoza&background=8B5CF6&color=fff',
    vehicleType: 'premium',
    vehicle: {
      type: 'premium',
      make: 'Honda',
      model: 'Accord',
      year: 2023,
      color: 'Black',
      plateNumber: 'PRE 3456',
      registrationExpiry: Timestamp.fromDate(new Date('2026-03-31')),
    },
    license: {
      number: 'N04-56-789012',
      expiry: Timestamp.fromDate(new Date('2027-01-15')),
      type: 'Professional',
    },
    documents: {},
    rating: 4.95,
    totalRides: 328,
    totalDeliveries: 0,
    status: 'online',
    currentLocation: new GeoPoint(14.5176, 121.0509), // BGC area
    earnings: {
      today: 2500,
      thisWeek: 12500,
      thisMonth: 52000,
      total: 380000,
      pendingPayout: 8500,
    },
    acceptanceRate: 98,
    cancellationRate: 1,
    verified: true,
    verifiedAt: Timestamp.fromDate(new Date('2024-02-01')),
    createdAt: Timestamp.fromDate(new Date('2024-01-25')),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'test_driver_van_001',
    userId: 'test_user_driver_005',
    firstName: 'Roberto',
    lastName: 'Garcia',
    phone: '+639215678901',
    email: 'roberto.driver@test.com',
    profileImage: 'https://ui-avatars.com/api/?name=Roberto+Garcia&background=EF4444&color=fff',
    vehicleType: 'van',
    vehicle: {
      type: 'van',
      make: 'Toyota',
      model: 'HiAce',
      year: 2022,
      color: 'Silver',
      plateNumber: 'VAN 7890',
      registrationExpiry: Timestamp.fromDate(new Date('2025-11-30')),
    },
    license: {
      number: 'N05-67-890123',
      expiry: Timestamp.fromDate(new Date('2026-09-25')),
      type: 'Professional',
    },
    documents: {},
    rating: 4.85,
    totalRides: 189,
    totalDeliveries: 156,
    status: 'online',
    currentLocation: new GeoPoint(14.5794, 120.9772), // Manila Bay area
    earnings: {
      today: 1800,
      thisWeek: 9200,
      thisMonth: 38000,
      total: 295000,
      pendingPayout: 6200,
    },
    acceptanceRate: 90,
    cancellationRate: 4,
    verified: true,
    verifiedAt: Timestamp.fromDate(new Date('2023-11-15')),
    createdAt: Timestamp.fromDate(new Date('2023-11-01')),
    updatedAt: Timestamp.now(),
  },
];

async function seedTestDrivers() {
  console.log('🚗 Starting to seed test drivers...\n');

  const batch = db.batch();

  for (const driver of testDrivers) {
    const docRef = db.collection('drivers').doc(driver.id);
    batch.set(docRef, driver, { merge: true });
    console.log(`  ✓ Prepared: ${driver.firstName} ${driver.lastName} (${driver.vehicleType})`);
  }

  try {
    await batch.commit();
    console.log('\n✅ Successfully seeded all test drivers!\n');
    console.log('📋 Summary:');
    console.log('─'.repeat(50));
    testDrivers.forEach(d => {
      console.log(`  ${d.vehicleType.padEnd(12)} | ${d.firstName} ${d.lastName} | ${d.status}`);
    });
    console.log('─'.repeat(50));
    console.log('\n💡 All drivers are set to "online" status and ready to accept rides.');
    console.log('💡 Locations are set around Metro Manila for testing.\n');
  } catch (error) {
    console.error('❌ Error seeding test drivers:', error);
    throw error;
  }
}

// Also create a function to update driver status
async function setDriverOnline(driverId) {
  try {
    await db.collection('drivers').doc(driverId).update({
      status: 'online',
      updatedAt: Timestamp.now(),
    });
    console.log(`✅ Driver ${driverId} is now online`);
  } catch (error) {
    console.error(`❌ Error setting driver online:`, error);
  }
}

async function setAllDriversOnline() {
  console.log('🟢 Setting all test drivers to online...\n');

  for (const driver of testDrivers) {
    await setDriverOnline(driver.id);
  }

  console.log('\n✅ All test drivers are now online!');
}

// Run the seeding
seedTestDrivers()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

// Export for use in other scripts
module.exports = { testDrivers, seedTestDrivers, setDriverOnline, setAllDriversOnline };
