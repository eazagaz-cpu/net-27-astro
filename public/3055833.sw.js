/**
 * 3055833.sw.js — the site's ONE service worker for scope "/".
 *
 * Only one service worker can control a scope, and two scripts want "/":
 * the RollerAds push SDK registers /3055833.sw.js (zone 3055833), and
 * BaseLayout used to register /sw.js. Each registration replaced the other on
 * every page load, which silently breaks push delivery. So this file carries
 * both: RollerAds' push handlers, then Net27's offline/caching worker.
 * BaseLayout registers this same URL, so the two never fight.
 *
 * The filename is fixed by RollerAds (<zoneID>.sw.js) — do not rename it.
 * /firebase-messaging-sw.js lives on its own scope (see src/lib/fcm.ts).
 */
self.opts = {
  zoneID: 3055833,
  swDomain: 'push-sdk.com',
};

try {
  importScripts('https://push-sdk.com/f/sw.js');
} catch (e) {
  // Blocked or unreachable: keep the caching worker installable anyway.
}

importScripts('/sw.js');
