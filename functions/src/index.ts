import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// ==========================================
// USER FUNCTIONS
// ==========================================

// Create user profile on first sign-in
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const { uid, email, phoneNumber, displayName, photoURL } = user;

  // Check if user profile already exists
  const userDoc = await db.collection('users').doc(uid).get();
  if (userDoc.exists) return;

  // Generate referral code
  const referralCode = 'GOGO' + Math.random().toString(36).substring(2, 8).toUpperCase();

  // Create user profile
  await db.collection('users').doc(uid).set({
    id: uid,
    email: email || '',
    phone: phoneNumber || '',
    firstName: displayName?.split(' ')[0] || '',
    lastName: displayName?.split(' ').slice(1).join(' ') || '',
    profileImage: photoURL || null,
    walletBalance: 0,
    referralCode,
    status: 'active',
    settings: {
      notifications: {
        push: true,
        email: true,
        sms: true,
        promotions: true,
      },
      language: 'en',
      currency: 'PHP',
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Created user profile for ${uid}`);
});

// ==========================================
// RIDE FUNCTIONS
// ==========================================

// On ride created - Find and match driver
export const onRideCreated = functions.firestore
  .document('rides/{rideId}')
  .onCreate(async (snapshot, context) => {
    const ride = snapshot.data();
    const rideId = context.params.rideId;

    console.log(`New ride created: ${rideId}`);

    // Find available drivers of the requested vehicle type
    const driversSnapshot = await db.collection('drivers')
      .where('vehicleType', '==', ride.vehicleType)
      .where('status', '==', 'online')
      .where('verified', '==', true)
      .limit(10)
      .get();

    if (driversSnapshot.empty) {
      console.log(`No available drivers for ride ${rideId}`);
      // In production, you would implement a queue/retry mechanism
      return;
    }

    // For demo, assign the first available driver
    // In production, implement proper matching algorithm based on distance, ratings, etc.
    const driver = driversSnapshot.docs[0];

    await db.collection('rides').doc(rideId).update({
      driverId: driver.id,
      status: 'accepted',
      acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update driver status
    await db.collection('drivers').doc(driver.id).update({
      status: 'busy',
      currentRideId: rideId,
    });

    // Send notification to passenger (in production)
    console.log(`Assigned driver ${driver.id} to ride ${rideId}`);
  });

// On ride status change - Send notifications
export const onRideUpdated = functions.firestore
  .document('rides/{rideId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const rideId = context.params.rideId;

    // Check if status changed
    if (before.status === after.status) return;

    console.log(`Ride ${rideId} status changed: ${before.status} -> ${after.status}`);

    // Handle status-specific actions
    switch (after.status) {
      case 'arrived':
        // Driver arrived at pickup - notify passenger
        break;
      case 'in_progress':
        // Ride started
        break;
      case 'completed':
        // Process payment, update stats
        await handleRideCompleted(rideId, after);
        break;
      case 'cancelled':
        // Handle cancellation
        await handleRideCancelled(rideId, after);
        break;
    }
  });

async function handleRideCompleted(rideId: string, ride: FirebaseFirestore.DocumentData) {
  // Update driver status
  if (ride.driverId) {
    await db.collection('drivers').doc(ride.driverId).update({
      status: 'online',
      currentRideId: null,
      totalRides: admin.firestore.FieldValue.increment(1),
    });
  }

  // Process payment if using wallet
  if (ride.paymentMethod === 'wallet') {
    const userDoc = await db.collection('users').doc(ride.passengerId).get();
    const userData = userDoc.data();
    if (userData) {
      const newBalance = userData.walletBalance - ride.fare.total;
      await db.collection('users').doc(ride.passengerId).update({
        walletBalance: newBalance,
      });

      // Create transaction record
      await db.collection('transactions').add({
        userId: ride.passengerId,
        type: 'payment',
        amount: ride.fare.total,
        balance: newBalance,
        reference: rideId,
        description: `Ride payment - ${ride.vehicleType}`,
        status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  // Update ride payment status
  await db.collection('rides').doc(rideId).update({
    paymentStatus: 'paid',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Ride ${rideId} completed and processed`);
}

async function handleRideCancelled(rideId: string, ride: FirebaseFirestore.DocumentData) {
  // Free up driver
  if (ride.driverId) {
    await db.collection('drivers').doc(ride.driverId).update({
      status: 'online',
      currentRideId: null,
    });
  }

  console.log(`Ride ${rideId} cancelled`);
}

// ==========================================
// ORDER FUNCTIONS
// ==========================================

// On order created - Notify merchant
export const onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snapshot, context) => {
    const order = snapshot.data();
    const orderId = context.params.orderId;

    console.log(`New order created: ${orderId}`);

    // Notify merchant (in production, send push notification)
    // Auto-confirm for demo purposes
    setTimeout(async () => {
      await db.collection('orders').doc(orderId).update({
        status: 'confirmed',
        confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }, 5000);
  });

// On order status change - Process payments and notifications
export const onOrderUpdated = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    if (before.status === after.status) return;

    console.log(`Order ${orderId} status changed: ${before.status} -> ${after.status}`);

    switch (after.status) {
      case 'preparing':
        // Find available rider
        break;
      case 'ready':
        // Notify rider
        break;
      case 'delivered':
        await handleOrderDelivered(orderId, after);
        break;
      case 'cancelled':
        // Handle refund if pre-paid
        break;
    }
  });

async function handleOrderDelivered(orderId: string, order: FirebaseFirestore.DocumentData) {
  // Update merchant stats
  await db.collection('merchants').doc(order.merchantId).update({
    totalOrders: admin.firestore.FieldValue.increment(1),
  });

  // Process payment if wallet
  if (order.paymentMethod === 'wallet') {
    const userDoc = await db.collection('users').doc(order.customerId).get();
    const userData = userDoc.data();
    if (userData) {
      const newBalance = userData.walletBalance - order.total;
      await db.collection('users').doc(order.customerId).update({
        walletBalance: newBalance,
      });

      await db.collection('transactions').add({
        userId: order.customerId,
        type: 'payment',
        amount: order.total,
        balance: newBalance,
        reference: orderId,
        description: `Order payment - ${order.type}`,
        status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  await db.collection('orders').doc(orderId).update({
    paymentStatus: 'paid',
    deliveredAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Order ${orderId} delivered and processed`);
}

// ==========================================
// WALLET FUNCTIONS
// ==========================================

// HTTP function for wallet top-up
export const processTopUp = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount, paymentMethod } = data;
  const userId = context.auth.uid;

  // Validate amount
  if (!amount || amount < 100) {
    throw new functions.https.HttpsError('invalid-argument', 'Minimum top-up is ₱100');
  }

  // Get current balance
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();

  if (!userData) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }

  const newBalance = userData.walletBalance + amount;

  // In production, integrate with actual payment gateway here
  // For demo, we simulate successful payment

  // Update balance
  await db.collection('users').doc(userId).update({
    walletBalance: newBalance,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Create transaction record
  const transactionRef = await db.collection('transactions').add({
    userId,
    type: 'topup',
    amount,
    balance: newBalance,
    paymentMethod,
    description: `Wallet top up via ${paymentMethod}`,
    status: 'completed',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    success: true,
    transactionId: transactionRef.id,
    newBalance,
  };
});

// ==========================================
// PROMO FUNCTIONS
// ==========================================

// HTTP function to validate promo code
export const validatePromo = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { code, orderTotal, serviceType } = data;
  const userId = context.auth.uid;

  // Find promo
  const promoSnapshot = await db.collection('promos')
    .where('code', '==', code.toUpperCase())
    .where('isActive', '==', true)
    .limit(1)
    .get();

  if (promoSnapshot.empty) {
    return { valid: false, message: 'Invalid promo code' };
  }

  const promo = promoSnapshot.docs[0].data();
  const promoId = promoSnapshot.docs[0].id;

  // Check validity period
  const now = new Date();
  if (promo.validFrom.toDate() > now || promo.validTo.toDate() < now) {
    return { valid: false, message: 'This promo code has expired' };
  }

  // Check service type
  if (promo.applicableServices && !promo.applicableServices.includes(serviceType)) {
    return { valid: false, message: 'This promo is not valid for this service' };
  }

  // Check minimum order
  if (promo.minOrder && orderTotal < promo.minOrder) {
    return { valid: false, message: `Minimum order of ₱${promo.minOrder} required` };
  }

  // Check usage limits
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    return { valid: false, message: 'This promo code has reached its usage limit' };
  }

  // Calculate discount
  let discount = 0;
  if (promo.type === 'percentage') {
    discount = orderTotal * (promo.value / 100);
    if (promo.maxDiscount) {
      discount = Math.min(discount, promo.maxDiscount);
    }
  } else if (promo.type === 'fixed') {
    discount = promo.value;
  }

  return {
    valid: true,
    discount,
    promoId,
    message: `₱${discount.toFixed(2)} discount applied!`,
  };
});

// ==========================================
// NOTIFICATION FUNCTIONS
// ==========================================

// Scheduled function to clean up old notifications
export const cleanupNotifications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldNotifications = await db.collection('notifications')
      .where('createdAt', '<', thirtyDaysAgo)
      .get();

    const batch = db.batch();
    oldNotifications.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${oldNotifications.size} old notifications`);
  });
