/**
 * GOGO Firestore Database Seed Script
 *
 * This script populates your Firestore database with sample data
 * for development and testing purposes.
 *
 * Usage:
 *   npx tsx scripts/seed-firestore.ts
 *
 * Prerequisites:
 *   1. Set up Firebase project
 *   2. Create .env file with Firebase config
 *   3. Install dependencies: npm install
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

// Load service account key from project root
const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`
╔══════════════════════════════════════════════════════════════════╗
║  ERROR: serviceAccountKey.json not found!                        ║
╠══════════════════════════════════════════════════════════════════╣
║  To get your service account key:                                ║
║                                                                  ║
║  1. Go to Firebase Console                                       ║
║  2. Project Settings > Service Accounts                          ║
║  3. Click "Generate new private key"                             ║
║  4. Save the file as "serviceAccountKey.json" in project root    ║
║                                                                  ║
║  ⚠️  NEVER commit this file to version control!                   ║
╚══════════════════════════════════════════════════════════════════╝
`);
  process.exit(1);
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, 'utf-8')
) as ServiceAccount;

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// ============================================
// Sample Data
// ============================================

const merchants = [
  {
    id: 'merchant-001',
    name: 'Jollibee - SM Mall of Asia',
    description: 'The most famous Filipino fast food chain',
    type: 'restaurant',
    category: 'Fast Food',
    cuisine: ['Filipino', 'Fast Food', 'Chicken'],
    address: 'SM Mall of Asia, Pasay City',
    location: { lat: 14.5351, lng: 120.9821 },
    phone: '+639171234567',
    email: 'jollibee.moa@example.com',
    rating: 4.5,
    reviewCount: 2500,
    priceRange: '₱',
    deliveryFee: 39,
    deliveryTime: '20-30 min',
    minOrder: 99,
    isOpen: true,
    openingHours: {
      monday: { open: '06:00', close: '22:00' },
      tuesday: { open: '06:00', close: '22:00' },
      wednesday: { open: '06:00', close: '22:00' },
      thursday: { open: '06:00', close: '22:00' },
      friday: { open: '06:00', close: '23:00' },
      saturday: { open: '06:00', close: '23:00' },
      sunday: { open: '06:00', close: '22:00' },
    },
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    coverImage: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1200',
    featured: true,
    verified: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'merchant-002',
    name: 'Mang Inasal - Makati',
    description: 'Unlimited rice with grilled chicken',
    type: 'restaurant',
    category: 'Filipino',
    cuisine: ['Filipino', 'BBQ', 'Chicken'],
    address: 'Glorietta 4, Makati City',
    location: { lat: 14.5514, lng: 121.0245 },
    phone: '+639181234567',
    email: 'manginasal.makati@example.com',
    rating: 4.3,
    reviewCount: 1800,
    priceRange: '₱',
    deliveryFee: 49,
    deliveryTime: '25-35 min',
    minOrder: 150,
    isOpen: true,
    openingHours: {
      monday: { open: '10:00', close: '21:00' },
      tuesday: { open: '10:00', close: '21:00' },
      wednesday: { open: '10:00', close: '21:00' },
      thursday: { open: '10:00', close: '21:00' },
      friday: { open: '10:00', close: '22:00' },
      saturday: { open: '10:00', close: '22:00' },
      sunday: { open: '10:00', close: '21:00' },
    },
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800',
    coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200',
    featured: true,
    verified: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'merchant-003',
    name: 'SM Supermarket - BGC',
    description: 'Fresh groceries and daily essentials',
    type: 'grocery',
    category: 'Supermarket',
    cuisine: [],
    address: 'SM Aura Premier, BGC, Taguig',
    location: { lat: 14.5494, lng: 121.0569 },
    phone: '+639191234567',
    email: 'sm.bgc@example.com',
    rating: 4.2,
    reviewCount: 950,
    priceRange: '₱₱',
    deliveryFee: 59,
    deliveryTime: '45-60 min',
    minOrder: 500,
    isOpen: true,
    openingHours: {
      monday: { open: '10:00', close: '22:00' },
      tuesday: { open: '10:00', close: '22:00' },
      wednesday: { open: '10:00', close: '22:00' },
      thursday: { open: '10:00', close: '22:00' },
      friday: { open: '10:00', close: '22:00' },
      saturday: { open: '10:00', close: '22:00' },
      sunday: { open: '10:00', close: '22:00' },
    },
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
    coverImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200',
    featured: true,
    verified: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'merchant-004',
    name: 'Starbucks - Ayala Triangle',
    description: 'Premium coffee and beverages',
    type: 'restaurant',
    category: 'Coffee & Tea',
    cuisine: ['Coffee', 'Beverages', 'Pastries'],
    address: 'Ayala Triangle Gardens, Makati',
    location: { lat: 14.5567, lng: 121.0234 },
    phone: '+639201234567',
    email: 'starbucks.ayala@example.com',
    rating: 4.6,
    reviewCount: 3200,
    priceRange: '₱₱₱',
    deliveryFee: 49,
    deliveryTime: '15-25 min',
    minOrder: 200,
    isOpen: true,
    openingHours: {
      monday: { open: '07:00', close: '21:00' },
      tuesday: { open: '07:00', close: '21:00' },
      wednesday: { open: '07:00', close: '21:00' },
      thursday: { open: '07:00', close: '21:00' },
      friday: { open: '07:00', close: '22:00' },
      saturday: { open: '08:00', close: '22:00' },
      sunday: { open: '08:00', close: '21:00' },
    },
    image: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800',
    coverImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200',
    featured: false,
    verified: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'merchant-005',
    name: 'Mercury Drug - Quezon City',
    description: 'Trusted pharmacy and health store',
    type: 'grocery',
    category: 'Pharmacy',
    cuisine: [],
    address: 'Timog Avenue, Quezon City',
    location: { lat: 14.6340, lng: 121.0365 },
    phone: '+639211234567',
    email: 'mercury.qc@example.com',
    rating: 4.4,
    reviewCount: 1200,
    priceRange: '₱₱',
    deliveryFee: 39,
    deliveryTime: '30-45 min',
    minOrder: 300,
    isOpen: true,
    openingHours: {
      monday: { open: '08:00', close: '22:00' },
      tuesday: { open: '08:00', close: '22:00' },
      wednesday: { open: '08:00', close: '22:00' },
      thursday: { open: '08:00', close: '22:00' },
      friday: { open: '08:00', close: '22:00' },
      saturday: { open: '08:00', close: '22:00' },
      sunday: { open: '08:00', close: '21:00' },
    },
    image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800',
    coverImage: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=1200',
    featured: false,
    verified: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

const products = [
  // Jollibee Products
  {
    id: 'product-001',
    merchantId: 'merchant-001',
    name: 'Chickenjoy 1pc w/ Rice',
    description: 'Crispylicious, juicylicious Chickenjoy with steamed rice and gravy',
    price: 99,
    originalPrice: 99,
    category: 'Chicken',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400',
    isAvailable: true,
    isPopular: true,
    preparationTime: 10,
    calories: 450,
    tags: ['bestseller', 'chicken'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'product-002',
    merchantId: 'merchant-001',
    name: 'Jolly Spaghetti',
    description: 'Sweet-style spaghetti with hotdog, ground meat, and cheese',
    price: 65,
    originalPrice: 65,
    category: 'Pasta',
    image: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400',
    isAvailable: true,
    isPopular: true,
    preparationTime: 8,
    calories: 380,
    tags: ['pasta', 'kids-favorite'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'product-003',
    merchantId: 'merchant-001',
    name: 'Burger Steak 2pc',
    description: 'Beefy burger patties with mushroom gravy and rice',
    price: 115,
    originalPrice: 115,
    category: 'Rice Meals',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    isAvailable: true,
    isPopular: false,
    preparationTime: 12,
    calories: 520,
    tags: ['beef', 'rice-meal'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'product-004',
    merchantId: 'merchant-001',
    name: 'Yumburger',
    description: 'Classic beefy burger with special Jollibee dressing',
    price: 45,
    originalPrice: 45,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
    isAvailable: true,
    isPopular: true,
    preparationTime: 5,
    calories: 280,
    tags: ['burger', 'value-meal'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  // Mang Inasal Products
  {
    id: 'product-005',
    merchantId: 'merchant-002',
    name: 'Chicken Inasal Paa (Large)',
    description: 'Grilled chicken leg marinated in signature inasal sauce with unlimited rice',
    price: 175,
    originalPrice: 175,
    category: 'Chicken',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
    isAvailable: true,
    isPopular: true,
    preparationTime: 15,
    calories: 550,
    tags: ['bestseller', 'grilled', 'unlimited-rice'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'product-006',
    merchantId: 'merchant-002',
    name: 'Pork BBQ',
    description: 'Tender grilled pork skewers with rice',
    price: 125,
    originalPrice: 125,
    category: 'Pork',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    isAvailable: true,
    isPopular: true,
    preparationTime: 12,
    calories: 480,
    tags: ['pork', 'bbq', 'grilled'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'product-007',
    merchantId: 'merchant-002',
    name: 'Halo-Halo',
    description: 'Filipino shaved ice dessert with sweet beans, jellies, and leche flan',
    price: 79,
    originalPrice: 79,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    isAvailable: true,
    isPopular: false,
    preparationTime: 5,
    calories: 320,
    tags: ['dessert', 'refreshing'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  // Starbucks Products
  {
    id: 'product-008',
    merchantId: 'merchant-004',
    name: 'Caramel Macchiato (Grande)',
    description: 'Espresso with vanilla syrup, steamed milk, and caramel drizzle',
    price: 195,
    originalPrice: 195,
    category: 'Espresso',
    image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400',
    isAvailable: true,
    isPopular: true,
    preparationTime: 5,
    calories: 250,
    tags: ['coffee', 'bestseller'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'product-009',
    merchantId: 'merchant-004',
    name: 'Java Chip Frappuccino (Grande)',
    description: 'Coffee blended with chocolate chips and ice, topped with whipped cream',
    price: 215,
    originalPrice: 215,
    category: 'Frappuccino',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    isAvailable: true,
    isPopular: true,
    preparationTime: 7,
    calories: 440,
    tags: ['blended', 'chocolate'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'product-010',
    merchantId: 'merchant-004',
    name: 'Butter Croissant',
    description: 'Flaky, buttery French pastry',
    price: 95,
    originalPrice: 95,
    category: 'Bakery',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
    isAvailable: true,
    isPopular: false,
    preparationTime: 2,
    calories: 280,
    tags: ['pastry', 'breakfast'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  // SM Supermarket Products
  {
    id: 'product-011',
    merchantId: 'merchant-003',
    name: 'Fresh Eggs (1 Dozen)',
    description: 'Farm fresh large eggs',
    price: 98,
    originalPrice: 110,
    category: 'Dairy & Eggs',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
    isAvailable: true,
    isPopular: true,
    preparationTime: 0,
    tags: ['essentials', 'fresh'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'product-012',
    merchantId: 'merchant-003',
    name: 'Premium Rice (5kg)',
    description: 'Thai jasmine rice, premium quality',
    price: 350,
    originalPrice: 380,
    category: 'Rice & Grains',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    isAvailable: true,
    isPopular: true,
    preparationTime: 0,
    tags: ['essentials', 'staple'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'product-013',
    merchantId: 'merchant-003',
    name: 'Fresh Chicken (Whole)',
    description: 'Locally sourced whole dressed chicken, approx 1.2kg',
    price: 250,
    originalPrice: 280,
    category: 'Meat & Poultry',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400',
    isAvailable: true,
    isPopular: true,
    preparationTime: 0,
    tags: ['fresh', 'poultry'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  // Mercury Drug Products
  {
    id: 'product-014',
    merchantId: 'merchant-005',
    name: 'Biogesic Paracetamol (20 tablets)',
    description: 'For fever and mild to moderate pain',
    price: 65,
    originalPrice: 65,
    category: 'Medicine',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    isAvailable: true,
    isPopular: true,
    preparationTime: 0,
    tags: ['medicine', 'fever'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'product-015',
    merchantId: 'merchant-005',
    name: 'Vitamin C 500mg (30 capsules)',
    description: 'Immune system booster, daily supplement',
    price: 195,
    originalPrice: 220,
    category: 'Vitamins',
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400',
    isAvailable: true,
    isPopular: true,
    preparationTime: 0,
    tags: ['vitamins', 'immunity'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

const drivers = [
  {
    id: 'driver-001',
    userId: 'sample-driver-user-001',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    phone: '+639123456789',
    email: 'juan.driver@example.com',
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    vehicleType: 'motorcycle',
    vehicleInfo: {
      make: 'Honda',
      model: 'Click 125i',
      year: 2022,
      color: 'Black',
      plateNumber: 'ABC 1234',
    },
    licenseNumber: 'N01-12-345678',
    status: 'available',
    location: { lat: 14.5547, lng: 121.0244 },
    rating: 4.8,
    totalRides: 523,
    totalEarnings: 125000,
    isVerified: true,
    isOnline: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'driver-002',
    userId: 'sample-driver-user-002',
    firstName: 'Maria',
    lastName: 'Santos',
    phone: '+639234567890',
    email: 'maria.driver@example.com',
    profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
    vehicleType: 'car',
    vehicleInfo: {
      make: 'Toyota',
      model: 'Vios',
      year: 2021,
      color: 'White',
      plateNumber: 'XYZ 5678',
    },
    licenseNumber: 'N01-23-456789',
    status: 'available',
    location: { lat: 14.5600, lng: 121.0300 },
    rating: 4.9,
    totalRides: 892,
    totalEarnings: 285000,
    isVerified: true,
    isOnline: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'driver-003',
    userId: 'sample-driver-user-003',
    firstName: 'Pedro',
    lastName: 'Reyes',
    phone: '+639345678901',
    email: 'pedro.driver@example.com',
    profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
    vehicleType: 'van',
    vehicleInfo: {
      make: 'Toyota',
      model: 'Hiace',
      year: 2020,
      color: 'Silver',
      plateNumber: 'DEF 9012',
    },
    licenseNumber: 'N01-34-567890',
    status: 'available',
    location: { lat: 14.5400, lng: 121.0100 },
    rating: 4.7,
    totalRides: 234,
    totalEarnings: 95000,
    isVerified: true,
    isOnline: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

const promos = [
  {
    id: 'promo-001',
    code: 'WELCOME50',
    description: '50% off your first ride!',
    type: 'percentage',
    value: 50,
    maxDiscount: 100,
    minOrderAmount: 0,
    usageLimit: 1,
    usageCount: 0,
    validFrom: Timestamp.now(),
    validUntil: Timestamp.fromDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)), // 90 days
    applicableTo: ['rides'],
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'promo-002',
    code: 'FREESHIP',
    description: 'Free delivery on food orders over ₱500',
    type: 'fixed',
    value: 59,
    maxDiscount: 59,
    minOrderAmount: 500,
    usageLimit: 3,
    usageCount: 0,
    validFrom: Timestamp.now(),
    validUntil: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days
    applicableTo: ['food', 'grocery'],
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'promo-003',
    code: 'PAYDAY20',
    description: '20% off on all orders (max ₱150)',
    type: 'percentage',
    value: 20,
    maxDiscount: 150,
    minOrderAmount: 300,
    usageLimit: 2,
    usageCount: 0,
    validFrom: Timestamp.now(),
    validUntil: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days
    applicableTo: ['food', 'grocery', 'rides'],
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'promo-004',
    code: 'GOGO100',
    description: '₱100 off on orders over ₱1000',
    type: 'fixed',
    value: 100,
    maxDiscount: 100,
    minOrderAmount: 1000,
    usageLimit: 5,
    usageCount: 0,
    validFrom: Timestamp.now(),
    validUntil: Timestamp.fromDate(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)), // 60 days
    applicableTo: ['food', 'grocery'],
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

// ============================================
// Seed Functions
// ============================================

async function clearCollection(collectionName: string) {
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`  ✓ Cleared ${collectionName} (${snapshot.size} documents)`);
}

async function seedCollection<T extends { id: string }>(
  collectionName: string,
  data: T[]
) {
  const batch = db.batch();

  data.forEach((item) => {
    const docRef = db.collection(collectionName).doc(item.id);
    const { id, ...docData } = item;
    batch.set(docRef, docData);
  });

  await batch.commit();
  console.log(`  ✓ Seeded ${collectionName} (${data.length} documents)`);
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║              GOGO Firestore Database Seeder                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await clearCollection('merchants');
    await clearCollection('products');
    await clearCollection('drivers');
    await clearCollection('promos');

    // Seed new data
    console.log('\n📦 Seeding new data...');
    await seedCollection('merchants', merchants);
    await seedCollection('products', products);
    await seedCollection('drivers', drivers);
    await seedCollection('promos', promos);

    console.log('\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ Database seeded successfully!                                ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log('║  Collections seeded:                                             ║');
    console.log(`║    • merchants: ${merchants.length} documents                                    ║`);
    console.log(`║    • products:  ${products.length} documents                                    ║`);
    console.log(`║    • drivers:   ${drivers.length} documents                                     ║`);
    console.log(`║    • promos:    ${promos.length} documents                                     ║`);
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

main();
