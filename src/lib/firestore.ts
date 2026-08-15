/**
 * firestore.ts — Firestore client, lazily initialized.
 *
 * Firestore is only imported when the user is actually logged in,
 * keeping the bundle size minimal for anonymous visitors.
 */
import { getFirebaseApp } from './firebase';

let _db: import('firebase/firestore').Firestore | null = null;

export async function getFirestore() {
  if (_db) return _db;
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    const { getFirestore: fsGet } = await import('firebase/firestore');
    _db = fsGet(app);
    return _db;
  } catch {
    return null;
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface WatchlistItem {
  id: string | number;
  type: 'movie' | 'tv' | string;
  title: string;
  poster: string;
  year: number | string;
  addedAt: number;
}

export interface HistoryItem {
  id: string | number;
  type: 'movie' | 'tv' | string;
  title: string;
  poster: string;
  year: number | string;
  progress: number;
  season?: number;
  episode?: number;
  watchedAt: number;
}

// ── Watchlist ─────────────────────────────────────────────────────────────────

export async function firestoreGetWatchlist(uid: string): Promise<WatchlistItem[]> {
  const db = await getFirestore();
  if (!db) return [];
  try {
    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    const q = query(collection(db, 'users', uid, 'watchlist'), orderBy('addedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as WatchlistItem);
  } catch {
    return [];
  }
}

export async function firestoreAddToWatchlist(uid: string, item: Omit<WatchlistItem, 'addedAt'>): Promise<void> {
  const db = await getFirestore();
  if (!db) return;
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    const ref = doc(db, 'users', uid, 'watchlist', String(item.id));
    await setDoc(ref, { ...item, addedAt: Date.now() }, { merge: true });
  } catch {}
}

export async function firestoreRemoveFromWatchlist(uid: string, itemId: string | number): Promise<void> {
  const db = await getFirestore();
  if (!db) return;
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'users', uid, 'watchlist', String(itemId)));
  } catch {}
}

export async function firestoreClearWatchlist(uid: string): Promise<void> {
  const db = await getFirestore();
  if (!db) return;
  try {
    const { collection, getDocs, writeBatch, doc } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'users', uid, 'watchlist'));
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(doc(db, 'users', uid, 'watchlist', d.id)));
    await batch.commit();
  } catch {}
}

// ── History / Continue Watching ───────────────────────────────────────────────

export async function firestoreGetHistory(uid: string): Promise<HistoryItem[]> {
  const db = await getFirestore();
  if (!db) return [];
  try {
    const { collection, getDocs, orderBy, query, limit } = await import('firebase/firestore');
    const q = query(
      collection(db, 'users', uid, 'history'),
      orderBy('watchedAt', 'desc'),
      limit(24),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as HistoryItem);
  } catch {
    return [];
  }
}

export async function firestoreUpsertHistory(uid: string, item: Omit<HistoryItem, 'watchedAt'>): Promise<void> {
  const db = await getFirestore();
  if (!db) return;
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    const key = item.season != null ? `${item.id}-s${item.season}e${item.episode ?? 1}` : String(item.id);
    const ref = doc(db, 'users', uid, 'history', key);
    await setDoc(ref, { ...item, watchedAt: Date.now() }, { merge: true });
  } catch {}
}

export async function firestoreClearHistory(uid: string): Promise<void> {
  const db = await getFirestore();
  if (!db) return;
  try {
    const { collection, getDocs, writeBatch, doc } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'users', uid, 'history'));
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(doc(db, 'users', uid, 'history', d.id)));
    await batch.commit();
  } catch {}
}

// ── Sync helpers (localStorage ↔ Firestore) ──────────────────────────────────

const WL_KEY = 'netmirror:watchlist';
const HX_KEY = 'netmirror:history';

function localGet<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}

/**
 * Called once on login. Merges localStorage items into Firestore,
 * then replaces localStorage with the merged Firestore result.
 * Firestore always wins for conflicts (same id).
 */
export async function syncOnLogin(uid: string): Promise<void> {
  try {
    // Watchlist sync
    const localWL = localGet<WatchlistItem>(WL_KEY);
    const remoteWL = await firestoreGetWatchlist(uid);
    const remoteIds = new Set(remoteWL.map(i => String(i.id)));

    // Push local-only items to Firestore
    const toUpload = localWL.filter(i => !remoteIds.has(String(i.id)));
    await Promise.all(toUpload.map(item => firestoreAddToWatchlist(uid, item)));

    // Fetch fresh merged list and write back to localStorage
    const merged = await firestoreGetWatchlist(uid);
    localStorage.setItem(WL_KEY, JSON.stringify(merged));

    // History sync (upload local → remote, pull latest)
    const localHX = localGet<HistoryItem>(HX_KEY);
    const remoteHX = await firestoreGetHistory(uid);
    const remoteHXIds = new Set(remoteHX.map(i => String(i.id)));
    const hxToUpload = localHX.filter(i => !remoteHXIds.has(String(i.id)));
    await Promise.all(hxToUpload.map(item => firestoreUpsertHistory(uid, item)));
    const mergedHX = await firestoreGetHistory(uid);
    localStorage.setItem(HX_KEY, JSON.stringify(mergedHX));
  } catch {}
}

/**
 * Called on sign-out. Clears localStorage (Firestore data is preserved server-side).
 */
export function clearLocalOnSignOut(): void {
  try {
    localStorage.removeItem(WL_KEY);
    localStorage.removeItem(HX_KEY);
  } catch {}
}

// ── Current user helper (reads from Firebase Auth) ───────────────────────────

export async function getCurrentUid(): Promise<string | null> {
  try {
    const { getFirebaseAuth } = await import('./firebase');
    const auth = getFirebaseAuth();
    if (!auth) return null;
    return auth.currentUser?.uid ?? null;
  } catch {
    return null;
  }
}
