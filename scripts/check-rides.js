/**
 * Check Rides Script
 *
 * Run this in the browser console while on your app to check for existing rides.
 * Or use it with Firebase Admin SDK.
 *
 * Browser Usage:
 *   1. Open your app in browser
 *   2. Open Developer Tools (F12)
 *   3. Go to Console tab
 *   4. Copy and paste the checkRides() function from the BROWSER CONSOLE section below
 */

// ============================================
// BROWSER CONSOLE VERSION
// ============================================
// Copy everything between the START and END comments to your browser console

// --- START COPY HERE ---
/*
async function checkRides() {
  const { collection, getDocs, query, orderBy, limit } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

  // Get Firestore instance from window (your app should have initialized it)
  const db = window.__FIREBASE_FIRESTORE__ || (await import('/src/services/firebase/config')).db;

  console.log('🔍 Checking for rides in Firestore...\n');

  const ridesRef = collection(db, 'rides');
  const q = query(ridesRef, orderBy('createdAt', 'desc'), limit(20));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log('✅ No rides found in database.');
    return;
  }

  console.log(`Found ${snapshot.size} rides:\n`);
  console.log('─'.repeat(80));

  const activeStatuses = ['pending', 'accepted', 'arriving', 'arrived', 'in_progress'];
  let activeCount = 0;

  snapshot.forEach((doc) => {
    const ride = doc.data();
    const isActive = activeStatuses.includes(ride.status);
    if (isActive) activeCount++;

    const statusEmoji = {
      pending: '⏳',
      accepted: '✅',
      arriving: '🚗',
      arrived: '📍',
      in_progress: '🚀',
      completed: '✔️',
      cancelled: '❌',
    }[ride.status] || '❓';

    console.log(`${statusEmoji} ${ride.status.toUpperCase().padEnd(12)} | ID: ${doc.id.substring(0, 20)}...`);
    console.log(`   Driver: ${ride.driverId || 'Not assigned'}`);
    console.log(`   Pickup: ${ride.pickup?.address?.substring(0, 40) || 'N/A'}...`);
    console.log(`   Created: ${ride.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}`);
    console.log('');
  });

  console.log('─'.repeat(80));
  console.log(`\n📊 Summary: ${activeCount} active rides, ${snapshot.size - activeCount} completed/cancelled\n`);

  if (activeCount > 0) {
    console.log('⚠️  Active rides may cause auto-navigation to the active ride page.');
    console.log('💡 To clear them, run: cancelAllActiveRides()');
  }

  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function cancelAllActiveRides() {
  const { collection, getDocs, query, where, doc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

  const db = window.__FIREBASE_FIRESTORE__ || (await import('/src/services/firebase/config')).db;

  console.log('🗑️  Cancelling all active rides...\n');

  const activeStatuses = ['pending', 'accepted', 'arriving', 'arrived', 'in_progress'];
  const ridesRef = collection(db, 'rides');
  const q = query(ridesRef, where('status', 'in', activeStatuses));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log('✅ No active rides to cancel.');
    return;
  }

  for (const docSnapshot of snapshot.docs) {
    const rideRef = doc(db, 'rides', docSnapshot.id);
    await updateDoc(rideRef, {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      cancellationReason: 'Cancelled by admin/testing',
      cancelledBy: 'system',
      updatedAt: serverTimestamp(),
    });
    console.log(`  ❌ Cancelled: ${docSnapshot.id}`);
  }

  console.log(`\n✅ Cancelled ${snapshot.size} active rides.`);
}

// Run check
checkRides();
*/
// --- END COPY HERE ---


// ============================================
// FIREBASE ADMIN SDK VERSION (Node.js)
// ============================================
// Run with: node scripts/check-rides.js

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

// Initialize Firebase Admin (uses default credentials)
try {
  initializeApp();
} catch (e) {
  // Already initialized
}

const db = getFirestore();

async function checkRides() {
  console.log('🔍 Checking for rides in Firestore...\n');

  const ridesRef = db.collection('rides');
  const snapshot = await ridesRef.orderBy('createdAt', 'desc').limit(20).get();

  if (snapshot.empty) {
    console.log('✅ No rides found in database.');
    return [];
  }

  console.log(`Found ${snapshot.size} rides:\n`);
  console.log('─'.repeat(80));

  const activeStatuses = ['pending', 'accepted', 'arriving', 'arrived', 'in_progress'];
  let activeCount = 0;
  const rides = [];

  snapshot.forEach((doc) => {
    const ride = doc.data();
    rides.push({ id: doc.id, ...ride });

    const isActive = activeStatuses.includes(ride.status);
    if (isActive) activeCount++;

    const statusEmoji = {
      pending: '⏳',
      accepted: '✅',
      arriving: '🚗',
      arrived: '📍',
      in_progress: '🚀',
      completed: '✔️',
      cancelled: '❌',
    }[ride.status] || '❓';

    console.log(`${statusEmoji} ${ride.status.toUpperCase().padEnd(12)} | ID: ${doc.id.substring(0, 30)}...`);
    console.log(`   Driver: ${ride.driverId || 'Not assigned'}`);
    console.log(`   Passenger: ${ride.passengerId || 'N/A'}`);
    console.log(`   Pickup: ${ride.pickup?.address?.substring(0, 50) || 'N/A'}`);
    console.log(`   Created: ${ride.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}`);
    console.log('');
  });

  console.log('─'.repeat(80));
  console.log(`\n📊 Summary: ${activeCount} active rides, ${snapshot.size - activeCount} completed/cancelled\n`);

  if (activeCount > 0) {
    console.log('⚠️  Active rides will cause auto-navigation to the active ride page.');
    console.log('💡 To clear them, run: node scripts/check-rides.js --cancel-active\n');
  }

  return rides;
}

async function cancelAllActiveRides() {
  console.log('🗑️  Cancelling all active rides...\n');

  const activeStatuses = ['pending', 'accepted', 'arriving', 'arrived', 'in_progress'];
  const ridesRef = db.collection('rides');
  const snapshot = await ridesRef.where('status', 'in', activeStatuses).get();

  if (snapshot.empty) {
    console.log('✅ No active rides to cancel.');
    return;
  }

  const batch = db.batch();

  snapshot.forEach((doc) => {
    batch.update(doc.ref, {
      status: 'cancelled',
      cancelledAt: Timestamp.now(),
      cancellationReason: 'Cancelled by admin/testing',
      cancelledBy: 'system',
      updatedAt: Timestamp.now(),
    });
    console.log(`  ❌ Cancelling: ${doc.id}`);
  });

  await batch.commit();
  console.log(`\n✅ Cancelled ${snapshot.size} active rides.`);
}

async function clearDriverCurrentRide() {
  console.log('🔄 Clearing currentRideId from all drivers...\n');

  const driversRef = db.collection('drivers');
  const snapshot = await driversRef.where('currentRideId', '!=', null).get();

  if (snapshot.empty) {
    console.log('✅ No drivers with active rides.');
    return;
  }

  const batch = db.batch();

  snapshot.forEach((doc) => {
    batch.update(doc.ref, {
      currentRideId: null,
      status: 'online',
      updatedAt: Timestamp.now(),
    });
    console.log(`  🔄 Clearing: ${doc.data().firstName} ${doc.data().lastName}`);
  });

  await batch.commit();
  console.log(`\n✅ Cleared ${snapshot.size} drivers.`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--cancel-active')) {
    await cancelAllActiveRides();
    await clearDriverCurrentRide();
  } else if (args.includes('--clear-drivers')) {
    await clearDriverCurrentRide();
  } else {
    await checkRides();
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
