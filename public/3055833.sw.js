/**
 * Tombstone for the retired RollerAds push worker.
 *
 * Deleting the file was supposed to be enough: a 404 on the next update check
 * unregisters a worker. It did not work. Cloudflare's edge kept serving the old
 * script as a cached 200 long after the origin began returning 404, so update
 * checks saw a healthy worker and nothing was unregistered — and the cached
 * response carried the old per-path CSP that still allowed push-sdk.com.
 *
 * A tombstone does not depend on any of that. Whatever a browser receives, this
 * is a *changed* script, so it installs, takes control, and removes itself along
 * with the push subscription it owned. It works from cache or from origin.
 *
 * Safe to delete once traffic has cycled through — a few weeks is ample.
 */
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Drop the push subscription before unregistering, so the vendor stops
    // sending to this endpoint rather than waiting for delivery failures.
    try {
      const sub = await self.registration.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
    } catch {}

    try {
      for (const key of await caches.keys()) await caches.delete(key);
    } catch {}

    await self.registration.unregister();

    // Reload open tabs so they are no longer under a dead worker.
    try {
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) client.navigate(client.url);
    } catch {}
  })());
});

// Ignore anything the old worker would have handled.
self.addEventListener('push', () => {});
self.addEventListener('notificationclick', () => {});
