// Firebase Cloud Messaging Service Worker
// This handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: 'YOUR_API_KEY', // Will be replaced during build
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'GOGO Express';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: payload.data?.type || 'default',
    data: payload.data,
    actions: getNotificationActions(payload.data?.type),
    vibrate: [200, 100, 200],
    requireInteraction: shouldRequireInteraction(payload.data?.type),
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Get notification actions based on type
function getNotificationActions(type) {
  switch (type) {
    case 'ride_accepted':
    case 'ride_arriving':
    case 'ride_arrived':
      return [
        { action: 'view', title: 'View Ride' },
        { action: 'call', title: 'Call Driver' },
      ];
    case 'order_confirmed':
    case 'order_on_the_way':
      return [
        { action: 'view', title: 'Track Order' },
      ];
    case 'new_ride_request':
      return [
        { action: 'accept', title: 'Accept' },
        { action: 'decline', title: 'Decline' },
      ];
    case 'new_order':
      return [
        { action: 'accept', title: 'Accept Order' },
        { action: 'view', title: 'View Details' },
      ];
    default:
      return [];
  }
}

// Determine if notification should require user interaction
function shouldRequireInteraction(type) {
  const interactiveTypes = [
    'ride_arrived',
    'new_ride_request',
    'new_order',
    'ride_completed',
    'order_delivered',
  ];
  return interactiveTypes.includes(type);
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  const data = event.notification.data || {};
  let url = '/';

  // Determine URL based on notification type and action
  switch (event.action) {
    case 'view':
      if (data.rideId) {
        url = `/rides/tracking/${data.rideId}`;
      } else if (data.orderId) {
        url = `/orders/${data.orderId}`;
      }
      break;
    case 'call':
      // Open phone dialer (if supported)
      if (data.driverPhone) {
        url = `tel:${data.driverPhone}`;
      }
      break;
    case 'accept':
      // Handle accept action for drivers/merchants
      if (data.rideId) {
        url = `/driver/active?ride=${data.rideId}`;
      } else if (data.orderId) {
        url = `/merchant/orders?order=${data.orderId}`;
      }
      break;
    case 'decline':
      // Handle decline - just close notification
      return;
    default:
      // Default click behavior
      if (data.rideId) {
        url = `/rides/tracking/${data.rideId}`;
      } else if (data.orderId) {
        url = `/orders/${data.orderId}`;
      }
  }

  // Focus or open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Open a new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed:', event);
  // Re-subscribe and update the server
  event.waitUntil(
    self.registration.pushManager
      .subscribe({ userVisibleOnly: true })
      .then((subscription) => {
        // Send new subscription to server
        return fetch('/api/update-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });
      })
  );
});
