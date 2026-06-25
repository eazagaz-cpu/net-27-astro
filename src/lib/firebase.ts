import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDMwZDCGMAqGf3qTEzdMeW0bAaxXgbm0',
  authDomain: 'net-27-a4cd1.firebaseapp.com',
  projectId: 'net-27-a4cd1',
  appId: '1:334281971333:web:1a6fcb777687b04b187bec',
};

export function getFirebaseApp(): FirebaseApp | null {
  if (app) return app;
  try {
    app = initializeApp(FIREBASE_CONFIG);
    return app;
  } catch {
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  if (auth) return auth;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  try {
    auth = getAuth(firebaseApp);
    return auth;
  } catch {
    return null;
  }
}

export function isFirebaseConfigured(): boolean {
  return true;
}
