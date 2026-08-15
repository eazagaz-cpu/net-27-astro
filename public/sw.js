/**
 * sw.js — Net27 Service Worker
 *
 * Strategy:
 *   - Navigation requests (HTML pages): Network-first, fall back to /offline.html
 *   - Static assets (JS, CSS, images, fonts): Cache-first with network fallback
 *   - API / embed / third-party: Network-only (never cached)
 *
 * Cache names are versioned so old caches are cleaned up on activate.
 */

const CACHE_VERSION = 'v1';
const SHELL_CACHE   = `net27-shell-${CACHE_VERSION}`;
const ASSET_CACHE   = `net27-assets-${CACHE_VERSION}`;

// Precache the offline fallback page
const OFFLINE_PAGE = '/offline.html';

// Origins we must never intercept (embed providers, APIs, analytics)
const BYPASS_ORIGINS = [
  'vidsrc.to', 'vidsrc.me', 'vidsrc.cc', 'vidlink.pro',
  'autoembed.co', 'multiembed.mov', '2embed.cc', 'superembed.stream',
  'image.tmdb.org', 'api.themoviedb.org',
  'pagead2.googlesyndication.com', 'googletagmanager.com',
  'firebaseapp.com', 'firebasestorage.googleapis.com',
  'googleapis.com', 'identitytoolkit.googleapis.com',
];

function shouldBypass(url) {
  try {
    const u = new URL(url);
    // Bypass any API or player route
    if (u.pathname.startsWith('/api/') || u.pathname.startsWith('/player')) return true;
    return BYPASS_ORIGINS.some(origin => u.hostname.includes(origin));
  } catch { return true; }
}

// ── Install: precache offline page ─────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => cache.addAll([OFFLINE_PAGE]))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: remove stale caches ──────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== SHELL_CACHE && k !== ASSET_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: routing logic ────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin and bypassed resources entirely
  if (shouldBypass(request.url)) return;

  const url = new URL(request.url);

  // Navigation (HTML) — network-first, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone and cache successful navigation responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_PAGE);
        })
    );
    return;
  }

  // Static assets (JS, CSS, fonts, images) — cache-first
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|ico|webp|avif)$/i)
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(ASSET_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else — network-only (JSON data, search index, etc.)
  // Don't add a respondWith — browser handles it natively.
});

// ── Push Notifications (FCM via firebase-messaging-sw.js) ──────────────────
// FCM push handling is in /firebase-messaging-sw.js (separate SW scope).
// This SW intentionally does NOT handle push events to avoid scope conflicts.
