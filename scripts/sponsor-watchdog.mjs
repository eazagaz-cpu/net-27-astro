/**
 * sponsor-watchdog.mjs — checks the LIVE site against the manifest.
 *
 * Run hourly by .github/workflows/sponsor-watchdog.yml. Needs nothing but
 * Node's fetch, so it works without npm ci or credentials.
 *
 * Exit codes (the workflow branches on them):
 *   0  every enabled link is live: in the homepage HTML above Top 10 and in
 *      both /api rails, served from KV
 *   2  the API/KV side is wrong (link missing from an API, or served from the
 *      bundled fallback) — fixable by re-pushing KV from the manifest
 *   1  the homepage HTML itself is wrong — needs a deploy / a human
 */
import { loadManifest, normUrl } from './lib/sponsor-guard.mjs';

const SITE = process.env.SITE ?? 'https://net27.watch';
const GRACE_MIN = 45; // a manifest edited this recently may still be deploying
const m = loadManifest();
const t1 = m.trail1.filter((s) => s.enabled !== false);
const t2 = m.trail2.filter((s) => s.enabled !== false);

const get = async (path, as = 'text') => {
  const res = await fetch(`${SITE}${path}${path.includes('?') ? '&' : '?'}watchdog=${Date.now()}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (net27-sponsor-watchdog)' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return as === 'json' ? res.json() : res.text();
};

const ageMin = (Date.now() - Date.parse(m.generatedAt)) / 60_000;
if (ageMin < GRACE_MIN) {
  console.log(`⏳ Manifest changed ${Math.round(ageMin)} min ago (< ${GRACE_MIN}) — a deploy may be in flight; skipping.`);
  process.exit(0);
}

let apiBad = false;
let htmlBad = false;

// ── API / KV ────────────────────────────────────────────────────────────────
for (const [path, want] of [['/api/sponsors', t1], ['/api/sponsors2', t2]]) {
  try {
    const live = new Set((await get(path, 'json')).map((s) => normUrl(s.url)));
    const missing = want.filter((s) => !live.has(normUrl(s.url)));
    if (missing.length) { apiBad = true; console.error(`❌ ${path} is missing: ${missing.map((s) => s.id).join(', ')}`); }
    else console.log(`✅ ${path}: all ${want.length} links live`);
  } catch (e) { apiBad = true; console.error(`❌ ${path}: ${e.message}`); }
}
try {
  const h = await get('/api/link-health', 'json');
  if (h.source !== 'kv' || h.status !== 'healthy') { apiBad = true; console.error(`❌ link-health: status=${h.status} source=${h.source} (KV degraded — site is on the bundled fallback)`); }
  else console.log(`✅ link-health: healthy, served from KV (${h.activeCounts?.total} links)`);
} catch (e) { apiBad = true; console.error(`❌ /api/link-health: ${e.message}`); }

// ── Homepage HTML (server-rendered rails) ───────────────────────────────────
try {
  const html = await get('/');
  const top10 = html.search(/<section[^>]+class="[^"]*\btop10-section\b/);
  const missing = [];
  const below = [];
  for (const s of [...t1, ...t2]) {
    const at = html.indexOf(`href="${s.url.replace(/&/g, '&amp;')}"`);
    if (at === -1) missing.push(s.id);
    else if (top10 !== -1 && at > top10) below.push(s.id);
  }
  if (missing.length || below.length) {
    htmlBad = true;
    if (missing.length) console.error(`❌ homepage HTML is missing: ${missing.join(', ')}`);
    if (below.length) console.error(`❌ homepage HTML has these below Top 10: ${below.join(', ')}`);
  } else console.log(`✅ homepage HTML: all ${t1.length + t2.length} links above Top 10`);
} catch (e) { htmlBad = true; console.error(`❌ homepage: ${e.message}`); }

process.exitCode = htmlBad ? 1 : apiBad ? 2 : 0;
