import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

function getConfig() {
  const apiKey = (import.meta as any).env?.PUBLIC_FIREBASE_API_KEY;
  const authDomain = (import.meta as any).env?.PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = (import.meta as any).env?.PUBLIC_FIREBASE_PROJECT_ID;
  const appId = (import.meta as any).env?.PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  return { apiKey, authDomain, projectId, appId };
}

export function getFirebaseApp(): FirebaseApp | null {
  if (app) return app;
  const config = getConfig();
  if (!config) return null;
  try {
    app = initializeApp(config);
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
  return getConfig() !== null;
}
