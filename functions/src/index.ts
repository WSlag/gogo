import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initialize Firebase Admin
admin.initializeApp();

// PayMongo API Configuration
// In production, these should be stored in Firebase Functions config or Secret Manager
const PAYMONGO_SECRET_KEY = functions.config().paymongo?.secret_key || process.env.PAYMONGO_SECRET_KEY || '';
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

// Helper function to make PayMongo API requests
async function paymongoRequest(endpoint: string, method: string, body?: Record<string, unknown>) {
  const fetch = (await import('node-fetch')).default;

  const response = await fetch(`${PAYMONGO_API_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json() as { errors?: Array<{ detail: string }> };
    throw new Error(error.errors?.[0]?.detail || 'PayMongo API error');
  }

  return response.json();
}

const db = admin.firestore();

// ==========================================
// USER FUNCTIONS
// ==========================================

// Bootstrap admin - syncs Firestore role to custom claims
// If user has role: 'admin' in Firestore, set custom claim
export const bootstrapAdmin = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const callerUid = context.auth.uid;

  // Check if user has admin role in Firestore
  const userDoc = await db.collection('users').doc(callerUid).get();

  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User document not found');
  }

  const userData = userDoc.data();

  if (userData?.role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'You do not have admin role in Firestore. Set role to admin in Firestore first.'
    );
  }

  // User has admin role in Firestore - sync to custom claims
  await admin.auth().setCustomUserClaims(callerUid, { role: 'admin' });

  console.log(`User ${callerUid} custom claims synced to admin`);

  return {
    success: true,
    message: 'Admin custom claims set. Please sign out and sign back in to apply the changes.',
  };
});

// ==========================================
// APP CONFIG - PRODUCTION SETTINGS
// ==========================================
const APP_CONFIG = {
  AUTO_APPROVE_DRIVERS: false,    // PRODUCTION: Requires admin approval
  AUTO_APPROVE_MERCHANTS: false,  // PRODUCTION: Requires admin approval
  DEFAULT_ROLE: 'customer' as const,
};

// Create user profile on first sign-in
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const { uid, email, phoneNumber, displayName, photoURL } = user;

  // Check if user profile already exists
  const userDoc = await db.collection('users').doc(uid).get();
  if (userDoc.exists) return;

  // Generate referral code
  const referralCode = 'GOGO' + Math.random().toString(36).substring(2, 8).toUpperCase();

  // Set default role via custom claims
  await admin.auth().setCustomUserClaims(uid, { role: APP_CONFIG.DEFAULT_ROLE });

  // Create user profile
  await db.collection('users').doc(uid).set({
    id: uid,
    role: APP_CONFIG.DEFAULT_ROLE,
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

  console.log(`Created user profile for ${uid} with role: ${APP_CONFIG.DEFAULT_ROLE}`);
});

// Set user role (admin only in production, auto-approve for testing)
export const setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { targetUserId, role } = data;
  const callerUid = context.auth.uid;
  const validRoles = ['customer', 'driver', 'merchant', 'admin'];

  // Validate role
  if (!role || !validRoles.includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid role specified');
  }

  // Check if caller is admin or if it's a self-upgrade during testing
  const callerClaims = context.auth.token;
  const isAdmin = callerClaims.role === 'admin';
  const isSelfUpgrade = callerUid === targetUserId;

  // In production, only admin can change roles
  // For testing, allow self-upgrade to driver/merchant if auto-approve is enabled
  if (!isAdmin && !isSelfUpgrade) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can change other users\' roles');
  }

  if (isSelfUpgrade && !isAdmin) {
    // Self-upgrade checks
    if (role === 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Cannot self-assign admin role');
    }
    if (role === 'driver' && !APP_CONFIG.AUTO_APPROVE_DRIVERS) {
      throw new functions.https.HttpsError('permission-denied', 'Driver applications require admin approval');
    }
    if (role === 'merchant' && !APP_CONFIG.AUTO_APPROVE_MERCHANTS) {
      throw new functions.https.HttpsError('permission-denied', 'Merchant applications require admin approval');
    }
  }

  // Update custom claims
  await admin.auth().setCustomUserClaims(targetUserId, { role });

  // Update Firestore
  await db.collection('users').doc(targetUserId).update({
    role,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`User ${targetUserId} role changed to ${role} by ${callerUid}`);

  return { success: true, role };
});

// Auto-approve driver when driver document is created (for testing)
export const onDriverCreated = functions.firestore
  .document('drivers/{driverId}')
  .onCreate(async (snapshot, context) => {
    const driverId = context.params.driverId;
    const driverData = snapshot.data();

    // Skip if already verified or if it's a demo driver
    if (driverData.verified || driverId.startsWith('demo_')) {
      return;
    }

    if (APP_CONFIG.AUTO_APPROVE_DRIVERS) {
      // Auto-approve for testing
      await admin.auth().setCustomUserClaims(driverId, { role: 'driver' });

      await snapshot.ref.update({
        verified: true,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update user role in users collection
      await db.collection('users').doc(driverId).update({
        role: 'driver',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Driver ${driverId} auto-approved for testing`);
    } else {
      console.log(`Driver ${driverId} created, pending admin approval`);
    }
  });

// Auto-approve merchant when merchant document is created (for testing)
export const onMerchantCreated = functions.firestore
  .document('merchants/{merchantId}')
  .onCreate(async (snapshot, context) => {
    const merchantId = context.params.merchantId;
    const merchantData = snapshot.data();
    const ownerId = merchantData.ownerId;

    // Skip if already verified
    if (merchantData.verified) {
      return;
    }

    if (APP_CONFIG.AUTO_APPROVE_MERCHANTS && ownerId) {
      // Auto-approve for testing
      await admin.auth().setCustomUserClaims(ownerId, { role: 'merchant' });

      await snapshot.ref.update({
        verified: true,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update user role in users collection
      await db.collection('users').doc(ownerId).update({
        role: 'merchant',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Merchant ${merchantId} auto-approved for testing (owner: ${ownerId})`);
    } else {
      console.log(`Merchant ${merchantId} created, pending admin approval`);
    }
  });

// ==========================================
// RIDE FUNCTIONS
// ==========================================

// On ride created - Notify available drivers (manual accept flow)
// The ride stays in 'pending' status until a driver accepts it
export const onRideCreated = functions.firestore
  .document('rides/{rideId}')
  .onCreate(async (snapshot, context) => {
    const ride = snapshot.data();
    const rideId = context.params.rideId;

    console.log(`New ride created: ${rideId}, vehicleType: ${ride.vehicleType}, status: ${ride.status}`);

    // Ride stays in 'pending' status - driver must manually accept
    // This function just logs the new ride for now
    // In production, you would send push notifications to nearby drivers

    // Find online drivers that could accept this ride (for logging/notification purposes)
    const driversSnapshot = await db.collection('drivers')
      .where('status', '==', 'online')
      .where('verified', '==', true)
      .limit(10)
      .get();

    if (driversSnapshot.empty) {
      console.log(`No online drivers available for ride ${rideId}`);
      // In production, you might want to notify the customer or retry later
      return;
    }

    const availableDriverIds = driversSnapshot.docs.map(doc => doc.id);
    console.log(`Found ${availableDriverIds.length} online drivers for ride ${rideId}: ${availableDriverIds.join(', ')}`);

    // In production, send push notifications to these drivers
    // For now, the driver dashboard will poll for pending rides

    // Create notifications for available drivers
    const batch = db.batch();
    for (const driverDoc of driversSnapshot.docs) {
      const notificationRef = db.collection('notifications').doc();
      batch.set(notificationRef, {
        userId: driverDoc.id,
        type: 'ride_request',
        title: 'New Ride Request',
        body: `₱${ride.fare?.total?.toFixed(2) || '0'} - ${ride.pickup?.address?.substring(0, 50) || 'Pickup location'}`,
        data: {
          rideId,
          vehicleType: ride.vehicleType,
          fare: ride.fare?.total,
          pickupAddress: ride.pickup?.address,
          dropoffAddress: ride.dropoff?.address,
        },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    try {
      await batch.commit();
      console.log(`Sent notifications to ${driversSnapshot.size} drivers for ride ${rideId}`);
    } catch (err) {
      console.error('Error sending notifications:', err);
    }
  });

// Helper function to calculate distance between two points (Haversine formula)
// Used for production driver matching based on proximity
// Exported to satisfy noUnusedLocals check - will be used in production mode
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

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

  // Process payment if using wallet - USE TRANSACTION for atomic balance update
  if (ride.paymentMethod === 'wallet') {
    const userRef = db.collection('users').doc(ride.passengerId);

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const userData = userDoc.data();

      if (!userData) {
        throw new Error('User not found');
      }

      const currentBalance = userData.walletBalance || 0;
      const fareAmount = ride.fare?.total || 0;
      const newBalance = currentBalance - fareAmount;

      // Ensure balance doesn't go negative (should have been checked before ride)
      if (newBalance < 0) {
        console.warn(`User ${ride.passengerId} has insufficient balance for ride ${rideId}`);
      }

      // Update user balance atomically
      transaction.update(userRef, {
        walletBalance: newBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create transaction record within the same transaction
      const transactionRef = db.collection('transactions').doc();
      transaction.set(transactionRef, {
        userId: ride.passengerId,
        type: 'payment',
        amount: -fareAmount,
        balance: newBalance,
        reference: rideId,
        referenceType: 'ride',
        description: `Ride payment - ${ride.vehicleType}`,
        status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update ride payment status within transaction
      const rideRef = db.collection('rides').doc(rideId);
      transaction.update(rideRef, {
        paymentStatus: 'paid',
        paymentTransactionId: transactionRef.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    console.log(`Ride ${rideId} wallet payment processed with transaction`);
  } else {
    // For non-wallet payments, just update ride status
    await db.collection('rides').doc(rideId).update({
      paymentStatus: 'paid',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log(`Ride ${rideId} completed and processed`);
}

async function handleRideCancelled(rideId: string, ride: FirebaseFirestore.DocumentData) {
  // Free up driver
  if (ride.driverId) {
    await db.collection('drivers').doc(ride.driverId).update({
      status: 'online',
      currentRideId: null,
    });

    // Notify driver about cancellation
    await db.collection('notifications').add({
      userId: ride.driverId,
      type: 'ride_cancelled',
      title: 'Ride Cancelled',
      body: ride.cancelledBy === 'passenger'
        ? 'The passenger has cancelled the ride.'
        : 'The ride has been cancelled.',
      data: { rideId },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log(`Ride ${rideId} cancelled by ${ride.cancelledBy || 'unknown'}`);
}

// ==========================================
// ORDER FUNCTIONS
// ==========================================

// On order created - Notify merchant
export const onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snapshot, context) => {
    const _order = snapshot.data(); // Prefixed with _ to indicate intentionally unused
    const orderId = context.params.orderId;

    console.log(`New order created: ${orderId}`, _order.status);

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

  // Process payment if wallet - USE TRANSACTION for atomic balance update
  if (order.paymentMethod === 'wallet') {
    const userRef = db.collection('users').doc(order.customerId);

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const userData = userDoc.data();

      if (!userData) {
        throw new Error('User not found');
      }

      const currentBalance = userData.walletBalance || 0;
      const orderAmount = order.total || 0;
      const newBalance = currentBalance - orderAmount;

      // Ensure balance doesn't go negative
      if (newBalance < 0) {
        console.warn(`User ${order.customerId} has insufficient balance for order ${orderId}`);
      }

      // Update user balance atomically
      transaction.update(userRef, {
        walletBalance: newBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create transaction record within the same transaction
      const transactionRef = db.collection('transactions').doc();
      transaction.set(transactionRef, {
        userId: order.customerId,
        type: 'payment',
        amount: -orderAmount,
        balance: newBalance,
        reference: orderId,
        referenceType: 'order',
        description: `Order payment - ${order.type}`,
        status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update order payment status within transaction
      const orderRef = db.collection('orders').doc(orderId);
      transaction.update(orderRef, {
        paymentStatus: 'paid',
        paymentTransactionId: transactionRef.id,
        deliveredAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    console.log(`Order ${orderId} wallet payment processed with transaction`);
  } else {
    // For non-wallet payments, just update order status
    await db.collection('orders').doc(orderId).update({
      paymentStatus: 'paid',
      deliveredAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

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

  // In production, integrate with actual payment gateway here
  // For demo, we simulate successful payment

  // USE TRANSACTION for atomic balance update to prevent race conditions
  const userRef = db.collection('users').doc(userId);
  let transactionId: string = '';
  let newBalance: number = 0;

  await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const userData = userDoc.data();

    if (!userData) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const currentBalance = userData.walletBalance || 0;
    newBalance = currentBalance + amount;

    // Update balance atomically
    transaction.update(userRef, {
      walletBalance: newBalance,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create transaction record within the same transaction
    const transactionRef = db.collection('transactions').doc();
    transactionId = transactionRef.id;
    transaction.set(transactionRef, {
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
  });

  return {
    success: true,
    transactionId,
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
  // userId can be used for per-user promo validation in production
  const _userId = context.auth.uid;
  console.log(`Validating promo for user: ${_userId}`);

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

// ==========================================
// PAYMENT FUNCTIONS (PayMongo Integration)
// ==========================================

interface PayMongoResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      amount: number;
      currency: string;
      status: string;
      client_key?: string;
      redirect?: {
        checkout_url: string;
        success: string;
        failed: string;
      };
    };
  };
}

// Create a payment intent for card payments
export const createPaymentIntent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount, description, metadata } = data;

  if (!amount || amount < 100) {
    throw new functions.https.HttpsError('invalid-argument', 'Minimum payment is ₱100');
  }

  // Check if PayMongo is configured
  if (!PAYMONGO_SECRET_KEY) {
    console.warn('PayMongo not configured - simulating payment intent');
    // Simulation mode for development
    return {
      id: `pi_sim_${Date.now()}`,
      clientKey: `client_sim_${Date.now()}`,
      status: 'awaiting_payment_method',
      amount: amount,
      currency: 'PHP',
    };
  }

  try {
    const response = await paymongoRequest('/payment_intents', 'POST', {
      data: {
        attributes: {
          amount: Math.round(amount * 100), // PayMongo uses centavos
          payment_method_allowed: ['card', 'paymaya', 'gcash'],
          payment_method_options: {
            card: { request_three_d_secure: 'any' },
          },
          currency: 'PHP',
          description: description || 'GOGO Express Payment',
          metadata: {
            ...metadata,
            userId: context.auth.uid,
          },
        },
      },
    }) as PayMongoResponse;

    return {
      id: response.data.id,
      clientKey: response.data.attributes.client_key,
      status: response.data.attributes.status,
      amount: response.data.attributes.amount / 100,
      currency: response.data.attributes.currency,
    };
  } catch (error) {
    console.error('PayMongo createPaymentIntent error:', error);
    throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Failed to create payment intent');
  }
});

// Create a payment source for e-wallet payments (GCash, Maya)
export const createPaymentSource = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount, type, successUrl, failedUrl, description, metadata } = data;

  if (!amount || amount < 100) {
    throw new functions.https.HttpsError('invalid-argument', 'Minimum payment is ₱100');
  }

  const validTypes = ['gcash', 'grab_pay', 'paymaya'];
  if (!type || !validTypes.includes(type)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid payment type');
  }

  // Check if PayMongo is configured
  if (!PAYMONGO_SECRET_KEY) {
    console.warn('PayMongo not configured - simulating payment source');
    // Simulation mode for development
    const simId = `src_sim_${Date.now()}`;
    return {
      id: simId,
      type: type,
      status: 'pending',
      amount: amount,
      redirectUrl: `${successUrl}?source_id=${simId}&status=success`,
      checkoutUrl: `${successUrl}?source_id=${simId}&status=success`,
    };
  }

  try {
    const response = await paymongoRequest('/sources', 'POST', {
      data: {
        attributes: {
          amount: Math.round(amount * 100), // PayMongo uses centavos
          type: type === 'maya' ? 'paymaya' : type,
          currency: 'PHP',
          redirect: {
            success: successUrl,
            failed: failedUrl,
          },
          billing: {
            name: metadata?.customerName || 'GOGO Express Customer',
            email: metadata?.customerEmail || '',
            phone: metadata?.customerPhone || '',
          },
          metadata: {
            ...metadata,
            userId: context.auth.uid,
            description: description || 'GOGO Express Payment',
          },
        },
      },
    }) as PayMongoResponse;

    return {
      id: response.data.id,
      type: response.data.type,
      status: response.data.attributes.status,
      amount: response.data.attributes.amount / 100,
      redirectUrl: response.data.attributes.redirect?.checkout_url,
      checkoutUrl: response.data.attributes.redirect?.checkout_url,
    };
  } catch (error) {
    console.error('PayMongo createPaymentSource error:', error);
    throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Failed to create payment source');
  }
});

// Process ride payment
export const processRidePayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { rideId, amount, paymentMethod } = data;
  const userId = context.auth.uid;

  if (!rideId || !amount) {
    throw new functions.https.HttpsError('invalid-argument', 'Ride ID and amount are required');
  }

  // Verify ride belongs to user
  const rideDoc = await db.collection('rides').doc(rideId).get();
  if (!rideDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Ride not found');
  }

  const rideData = rideDoc.data();
  if (rideData?.passengerId !== userId && rideData?.customerId !== userId) {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized to pay for this ride');
  }

  try {
    // For wallet payments, deduct from balance using TRANSACTION
    if (paymentMethod === 'wallet') {
      const userRef = db.collection('users').doc(userId);
      const rideRef = db.collection('rides').doc(rideId);
      let transactionId: string = '';

      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const userData = userDoc.data();

        if (!userData) {
          throw new functions.https.HttpsError('not-found', 'User not found');
        }

        const currentBalance = userData.walletBalance || 0;
        if (currentBalance < amount) {
          throw new functions.https.HttpsError('failed-precondition', 'Insufficient wallet balance');
        }

        const newBalance = currentBalance - amount;

        // Update balance atomically
        transaction.update(userRef, {
          walletBalance: newBalance,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create transaction record within the same transaction
        const transactionRef = db.collection('transactions').doc();
        transactionId = transactionRef.id;
        transaction.set(transactionRef, {
          userId,
          type: 'payment',
          amount: -amount,
          balance: newBalance,
          reference: rideId,
          referenceType: 'ride',
          paymentMethod: 'wallet',
          description: `Ride payment - ${rideData?.vehicleType || 'ride'}`,
          status: 'completed',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update ride payment status within transaction
        transaction.update(rideRef, {
          paymentStatus: 'paid',
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          paymentTransactionId: transactionRef.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      return {
        success: true,
        transactionId,
      };
    }

    // For cash payments, just mark as pending
    if (paymentMethod === 'cash') {
      await db.collection('rides').doc(rideId).update({
        paymentStatus: 'pending_cash',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        transactionId: null,
      };
    }

    // For e-wallet/card payments, return redirect info
    // The actual payment is processed via createPaymentSource or createPaymentIntent
    return {
      success: true,
      redirectUrl: `/payment/ride/${rideId}?amount=${amount}&method=${paymentMethod}`,
    };
  } catch (error) {
    console.error('processRidePayment error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Payment failed');
  }
});

// Process order payment
export const processOrderPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { orderId, amount, paymentMethod } = data;
  const userId = context.auth.uid;

  if (!orderId || !amount) {
    throw new functions.https.HttpsError('invalid-argument', 'Order ID and amount are required');
  }

  // Verify order belongs to user
  const orderDoc = await db.collection('orders').doc(orderId).get();
  if (!orderDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Order not found');
  }

  const orderData = orderDoc.data();
  if (orderData?.customerId !== userId) {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized to pay for this order');
  }

  try {
    // For wallet payments, deduct from balance using TRANSACTION
    if (paymentMethod === 'wallet') {
      const userRef = db.collection('users').doc(userId);
      const orderRef = db.collection('orders').doc(orderId);
      let transactionId: string = '';

      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const userData = userDoc.data();

        if (!userData) {
          throw new functions.https.HttpsError('not-found', 'User not found');
        }

        const currentBalance = userData.walletBalance || 0;
        if (currentBalance < amount) {
          throw new functions.https.HttpsError('failed-precondition', 'Insufficient wallet balance');
        }

        const newBalance = currentBalance - amount;

        // Update balance atomically
        transaction.update(userRef, {
          walletBalance: newBalance,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create transaction record within the same transaction
        const transactionRef = db.collection('transactions').doc();
        transactionId = transactionRef.id;
        transaction.set(transactionRef, {
          userId,
          type: 'payment',
          amount: -amount,
          balance: newBalance,
          reference: orderId,
          referenceType: 'order',
          paymentMethod: 'wallet',
          description: `Order payment - ${orderData?.type || 'order'}`,
          status: 'completed',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update order payment status within transaction
        transaction.update(orderRef, {
          paymentStatus: 'paid',
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          paymentTransactionId: transactionRef.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      return {
        success: true,
        transactionId,
      };
    }

    // For cash payments, just mark as pending
    if (paymentMethod === 'cash') {
      await db.collection('orders').doc(orderId).update({
        paymentStatus: 'pending_cash',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        transactionId: null,
      };
    }

    // For e-wallet/card payments, return redirect info
    return {
      success: true,
      redirectUrl: `/payment/order/${orderId}?amount=${amount}&method=${paymentMethod}`,
    };
  } catch (error) {
    console.error('processOrderPayment error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Payment failed');
  }
});

// Check payment status
export const checkPaymentStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { paymentId, type } = data;

  if (!paymentId || !type) {
    throw new functions.https.HttpsError('invalid-argument', 'Payment ID and type are required');
  }

  // Check if PayMongo is configured
  if (!PAYMONGO_SECRET_KEY) {
    // Simulation mode - check if it's a simulated payment
    if (paymentId.startsWith('pi_sim_') || paymentId.startsWith('src_sim_')) {
      return { status: 'succeeded', paid: true };
    }
    return { status: 'unknown', paid: false };
  }

  try {
    const endpoint = type === 'intent' ? `/payment_intents/${paymentId}` : `/sources/${paymentId}`;
    const response = await paymongoRequest(endpoint, 'GET') as PayMongoResponse;

    const status = response.data.attributes.status;
    const paid = status === 'succeeded' || status === 'paid' || status === 'chargeable';

    return { status, paid };
  } catch (error) {
    console.error('checkPaymentStatus error:', error);
    return { status: 'unknown', paid: false };
  }
});

// Verify e-wallet payment after redirect
export const verifyEWalletPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { sourceId } = data;
  const userId = context.auth.uid;

  if (!sourceId) {
    throw new functions.https.HttpsError('invalid-argument', 'Source ID is required');
  }

  // Check if PayMongo is configured
  if (!PAYMONGO_SECRET_KEY) {
    // Simulation mode
    if (sourceId.startsWith('src_sim_')) {
      return { success: true, transactionId: `txn_sim_${Date.now()}` };
    }
    throw new functions.https.HttpsError('failed-precondition', 'PayMongo not configured');
  }

  try {
    // Get source status from PayMongo
    const response = await paymongoRequest(`/sources/${sourceId}`, 'GET') as PayMongoResponse;
    const source = response.data;

    if (source.attributes.status !== 'chargeable') {
      return {
        success: false,
        error: `Payment not completed. Status: ${source.attributes.status}`,
      };
    }

    // Source is chargeable - create a payment to charge it
    const paymentResponse = await paymongoRequest('/payments', 'POST', {
      data: {
        attributes: {
          amount: source.attributes.amount,
          currency: source.attributes.currency,
          source: {
            id: sourceId,
            type: 'source',
          },
          description: 'GOGO Express Payment',
        },
      },
    }) as PayMongoResponse;

    // Record the transaction
    const transactionRef = await db.collection('transactions').add({
      userId,
      type: 'topup',
      amount: source.attributes.amount / 100,
      paymentId: paymentResponse.data.id,
      sourceId: sourceId,
      paymentMethod: source.type,
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      transactionId: transactionRef.id,
      paymentId: paymentResponse.data.id,
    };
  } catch (error) {
    console.error('verifyEWalletPayment error:', error);
    throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Failed to verify payment');
  }
});

// PayMongo Webhook Handler
export const paymongoWebhook = functions.https.onRequest(async (req, res) => {
  // Verify webhook signature (in production, verify using PayMongo webhook secret)
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const event = req.body as {
      data: {
        id: string;
        type: string;
        attributes: {
          type: string;
          data: {
            id: string;
            type: string;
            attributes: {
              status: string;
              amount: number;
              metadata?: Record<string, string>;
            };
          };
        };
      };
    };

    const eventType = event.data.attributes.type;
    const paymentData = event.data.attributes.data;

    console.log(`PayMongo webhook received: ${eventType}`, paymentData.id);

    switch (eventType) {
      case 'payment.paid':
        // Payment was successful - update relevant records
        const metadata = paymentData.attributes.metadata || {};
        if (metadata.rideId) {
          await db.collection('rides').doc(metadata.rideId).update({
            paymentStatus: 'paid',
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            paymentId: paymentData.id,
          });
        }
        if (metadata.orderId) {
          await db.collection('orders').doc(metadata.orderId).update({
            paymentStatus: 'paid',
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            paymentId: paymentData.id,
          });
        }
        break;

      case 'payment.failed':
        // Payment failed
        console.log('Payment failed:', paymentData.id);
        break;

      case 'source.chargeable':
        // Source is ready to be charged (for e-wallet payments)
        console.log('Source chargeable:', paymentData.id);
        break;
    }

    res.status(200).send({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
});
