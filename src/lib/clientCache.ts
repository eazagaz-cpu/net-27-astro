// Short-TTL client-side cache for repeated TMDB category fetches (DynamicGrid,
// DynamicRail, Top10Rail) — avoids re-fetching the same category on every
// page navigation within a browsing session. sessionStorage: survives
// same-tab navigation, cleared on tab close (appropriate for listing data
// that's already refreshed server-side every 30-60 min via Cache-Control).

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export async function fetchCached<T>(key: string, url: string, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (entry.expiresAt > Date.now()) return entry.data;
    }
  } catch {}

  const res = await fetch(url);
  const data: T = await res.json();

  try {
    sessionStorage.setItem(key, JSON.stringify({ data, expiresAt: Date.now() + ttlMs }));
  } catch {}

  return data;
}
