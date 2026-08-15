/**
 * fcm.ts — Firebase Cloud Messaging push notification helpers.
 *
 * Usage:
 *   import { requestPushPermission } from './fcm';
 *   await requestPushPermission(uid);
 *
 * The Firebase app uses the config in firebase.ts (already configured).
 * The only additional requirement is VITE_FIREBASE_VAPID_KEY in .env.local —
 * this is the VAPID public key from Firebase console → Project Settings →
 * Cloud Messaging → Web Push certificates → Key pair.
 *
 * Without a VAPID key the functions are safe no-ops.
 */

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

/**
 * Request push permission, get an FCM token, and store it in
 * Firestore at users/{uid}/notifications/token.
 *
 * Returns the token string, or null if permission was denied / key missing.
 */
export async function requestPushPermission(uid: string): Promise<string | null> {
  if (!VAPID_KEY) {
    console.warn('[fcm] VITE_FIREBASE_VAPID_KEY not set — push notifications disabled.');
    return null;
  }
  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    // Register the FCM SW
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });

    const { getFirebaseApp } = await import('./firebase');
    const app = getFirebaseApp();
    if (!app) return null;

    const { getMessaging, getToken } = await import('firebase/messaging');
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) return null;

    // Persist token to Firestore
    const { getFirestore } = await import('./firestore');
    const db = await getFirestore();
    if (db) {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, `users/${uid}/notifications/token`), {
        token,
        updatedAt: Date.now(),
        userAgent: navigator.userAgent.slice(0, 200),
      });
    }

    return token;
  } catch (err) {
    console.error('[fcm] requestPushPermission failed:', err);
    return null;
  }
}

/**
 * Unsubscribe from push notifications — deletes the token from Firestore.
 */
export async function unsubscribePush(uid: string): Promise<void> {
  try {
    const { getFirestore } = await import('./firestore');
    const db = await getFirestore();
    if (!db) return;
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, `users/${uid}/notifications/token`));

    // Also revoke the FCM token
    if (VAPID_KEY) {
      const { getFirebaseApp } = await import('./firebase');
      const app = getFirebaseApp();
      if (app) {
        const { getMessaging, deleteToken } = await import('firebase/messaging');
        await deleteToken(getMessaging(app));
      }
    }
  } catch (err) {
    console.error('[fcm] unsubscribePush failed:', err);
  }
}

/** Returns true if browser push is supported and permission is already granted. */
export function isPushGranted(): boolean {
  return typeof window !== 'undefined'
    && 'Notification' in window
    && Notification.permission === 'granted';
}

/** Returns true if the browser supports push notifications at all. */
export function isPushSupported(): boolean {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'Notification' in window
    && !!VAPID_KEY;
}
