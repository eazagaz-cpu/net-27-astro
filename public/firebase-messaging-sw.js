/**
 * firebase-messaging-sw.js — Firebase Cloud Messaging Service Worker
 *
 * Handles background push notifications from FCM.
 * This file MUST be at /firebase-messaging-sw.js (root scope) for FCM to find it.
 *
 * To activate push notifications:
 * 1. Add VITE_FIREBASE_VAPID_KEY to your .env.local
 * 2. Call requestPushPermission(uid) from src/lib/fcm.ts on user action
 *
 * Firebase config is duplicated here (service workers cannot import modules).
 */

importScripts('https://www.gstatic.com/firebasejs/10.12.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging-compat.js');

// Firebase config — keep in sync with src/lib/firebase.ts
const firebaseConfig = {
  apiKey:            'AIzaSyDHvvZDCGWAaGf3qTEzdMeW06zAaKXgbm0',
  authDomain:        'net-27-a4cd1.firebaseapp.com',
  projectId:         'net-27-a4cd1',
  storageBucket:     'net-27-a4cd1.firebasestorage.app',
  messagingSenderId: '334281971333',
  appId:             '1:334281971333:web:1a5fcb777687b04b187bec',
};

// Only initialize if we have a project ID (avoids errors in dev without config)
if (firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  // Handle background messages (app is closed or in background)
  messaging.onBackgroundMessage(payload => {
    const { title, body, icon, data } = payload.notification ?? payload.data ?? {};
    const notificationTitle = title || 'Net27';
    const notificationOptions = {
      body: body || 'New content is available.',
      icon: icon || '/favicon.svg',
      badge: '/favicon.svg',
      data: data || {},
      actions: [
        { action: 'view', title: '▶ Watch Now' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });

  // Handle notification click
  self.addEventListener('notificationclick', event => {
    event.notification.close();
    if (event.action === 'dismiss') return;
    const url = event.notification.data?.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        if (clients.openWindow) return clients.openWindow(url);
      })
    );
  });
}
