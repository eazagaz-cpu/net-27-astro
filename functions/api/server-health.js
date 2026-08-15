/**
 * server-health.js — Cloudflare Pages Function
 *
 * GET  /api/server-health          → returns current server health scores from KV
 * POST /api/server-health          → (cron/internal) pings each server & updates KV
 *
 * Cloudflare KV binding: SERVER_HEALTH_KV (set in wrangler.toml / Pages dashboard)
 *
 * Usage: client seeds localStorage quality scores from this endpoint on page load
 * so every user benefits from global aggregate server health data.
 */

const SERVERS = [
  { id: 'server-1', pingUrl: 'https://vidsrc.to',               defaultScore: 90 },
  { id: 'server-2', pingUrl: 'https://player.videasy.net',       defaultScore: 85 },
  { id: 'server-3', pingUrl: 'https://vidsrc.me',                defaultScore: 80 },
  { id: 'server-4', pingUrl: 'https://autoembed.co',             defaultScore: 65 },
  { id: 'server-5', pingUrl: 'https://www.2embed.cc',            defaultScore: 60 },
  { id: 'server-6', pingUrl: 'https://superembed.stream',        defaultScore: 55 },
];

const KV_KEY    = 'server-health-v1';
const CACHE_TTL = 3600; // 1 hour in seconds

async function pingServer(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);
    const latency = Date.now() - start;
    const ok = res.ok || res.status < 500;
    // Score: 100 if fast + ok, penalise by latency and errors
    const score = ok ? Math.max(10, 100 - Math.floor(latency / 50)) : 10;
    return { ok, latency, score };
  } catch {
    clearTimeout(timer);
    return { ok: false, latency: timeoutMs, score: 10 };
  }
}

export async function onRequest(context) {
  const { request, env } = context;
  const kv = env.SERVER_HEALTH_KV;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
      },
    });
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=300', // 5 min client cache
  };

  // GET — return cached health data (or defaults if KV not available)
  if (request.method === 'GET') {
    try {
      if (kv) {
        const cached = await kv.get(KV_KEY, { type: 'json' });
        if (cached) {
          return new Response(JSON.stringify(cached), { headers });
        }
      }
    } catch {}

    // Return defaults if KV unavailable or empty
    const defaults = Object.fromEntries(
      SERVERS.map(s => [s.id, { score: s.defaultScore, ok: true, checkedAt: 0 }])
    );
    return new Response(JSON.stringify({ servers: defaults, source: 'defaults' }), { headers });
  }

  // POST — ping all servers and update KV (called by cron or admin)
  if (request.method === 'POST') {
    // Optional: verify a secret token to prevent abuse
    const authHeader = request.headers.get('X-Health-Token');
    if (env.HEALTH_SECRET && authHeader !== env.HEALTH_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
    }

    const results = await Promise.allSettled(
      SERVERS.map(async s => {
        const health = await pingServer(s.pingUrl);
        return { id: s.id, ...health, checkedAt: Date.now() };
      })
    );

    const servers = {};
    for (const r of results) {
      if (r.status === 'fulfilled') {
        const { id, ...rest } = r.value;
        servers[id] = rest;
      }
    }

    const payload = { servers, updatedAt: Date.now(), source: 'live' };

    try {
      if (kv) {
        await kv.put(KV_KEY, JSON.stringify(payload), { expirationTtl: CACHE_TTL * 2 });
      }
    } catch {}

    return new Response(JSON.stringify(payload), { headers });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
}
