/**
 * scripts/push-sponsors.mjs
 * ═══════════════════════════════════════════════════════
 * INSTANT SPONSOR UPDATE — No build, no GitHub, no wait!
 * KV mein data push karo → 5-30 seconds mein live!
 * ═══════════════════════════════════════════════════════
 *
 * ⚠️  DATA SOURCE: src/data/sponsor-links.json
 *     Is file ko DIRECTLY edit karo — yahan kuch hardcode mat karo!
 *
 * Usage: npm run sponsors:deploy   (commit + push, PHIR KV)
 *
 * Nayi link:   npm run sponsors:add -- --url <url> --label <naam> --image <file> [--trail 2] [--position 1]
 * Link hatana: npm run sponsors:remove -- --url <url>   (sirf jab user khud kahe)
 * Phir:        npm run sponsors:deploy
 *
 * Guards (in ko bypass mat karo):
 *   - Local se sirf woh manifest push hota hai jo GitHub par already hai.
 *   - Jo link KV mein live hai magar manifest mein nahi (aur `removed` mein
 *     bhi nahi), us par script ruk jata hai — KV overwrite nahi hota.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { spawnSync } from 'child_process';
import sharp from 'sharp';
import { silentRemovals, explain } from './lib/sponsor-guard.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Load canonical manifest ────────────────────────────────────────────────
const MANIFEST_PATH = join(ROOT, 'src', 'data', 'sponsor-links.json');

if (!existsSync(MANIFEST_PATH)) {
  console.error('❌ FATAL: src/data/sponsor-links.json not found!');
  console.error('   Run: npm run verify:links to diagnose.');
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
} catch (e) {
  console.error(`❌ FATAL: Invalid JSON in sponsor-links.json: ${e.message}`);
  process.exit(1);
}

// Filter only enabled sponsors
const SPONSORS = manifest.trail1.filter(s => s.enabled !== false);
const SPONSORS_RAIL_2 = manifest.trail2.filter(s => s.enabled !== false);

if (SPONSORS.length === 0 || SPONSORS_RAIL_2.length === 0) {
  console.error('❌ FATAL: Empty sponsor list detected! Aborting to protect production KV.');
  process.exit(1);
}

// ── Load credentials ───────────────────────────────────────────────────────
// CI passes them as env vars; locally they live in .env.local (the old code
// only read .env, which does not exist here, so local pushes always failed).
for (const file of ['.env.local', '.env']) {
  try {
    for (const line of readFileSync(join(ROOT, file), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch {}
}

const KV_NAMESPACE_ID = 'aa59493bbbed47c0af878405e12bd8fb';
const { cloudflareAccountId: ACCOUNT_ID } = JSON.parse(readFileSync(join(ROOT, '.project-identity.json'), 'utf8'));
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const IS_CI = process.env.GITHUB_ACTIONS === 'true';
// --no-kv: only regenerate functions/api/sponsors*.js from the manifest, so
// they can be committed in sync (Cloudflare's Git build deploys the committed
// copies). Touches nothing remote.
const NO_KV = process.argv.includes('--no-kv');

if (!NO_KV && process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_ACCOUNT_ID !== ACCOUNT_ID) {
  console.error(`❌ CLOUDFLARE_ACCOUNT_ID is ${process.env.CLOUDFLARE_ACCOUNT_ID}, but .project-identity.json says ${ACCOUNT_ID}. Run npm run auth:check.`);
  process.exit(1);
}
if (!NO_KV && !API_TOKEN) {
  console.error('❌ CLOUDFLARE_API_TOKEN nahi mila (.env.local ya CI secret)!');
  process.exit(1);
}

// ── Local pushes only from a manifest that is already on GitHub ────────────
// CI rewrites KV from the COMMITTED manifest 4× a day. A local push of an
// uncommitted or unpushed manifest goes live for a few hours and is then
// wiped — the exact "links keep disappearing" pattern. So refuse it.
if (!IS_CI && !NO_KV) {
  const git = (args) => spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  git(['fetch', '--quiet', 'origin', 'main']);
  const dirty = git(['diff', '--quiet', 'HEAD', '--', 'src/data/sponsor-links.json']).status !== 0;
  const unpushed = git(['diff', '--quiet', 'origin/main', '--', 'src/data/sponsor-links.json']).status !== 0;
  if (dirty || unpushed) {
    console.error(`❌ src/data/sponsor-links.json is ${dirty ? 'not committed' : 'committed but not pushed'}.`);
    console.error('   CI would overwrite KV with the GitHub version within ~6 hours and these links would vanish.');
    console.error('   Use: npm run sponsors:deploy   (commits + pushes first, then updates KV)');
    process.exit(1);
  }
}

// ── Compute manifest hash ──────────────────────────────────────────────────
const manifestHash = createHash('sha256')
  .update(JSON.stringify({ trail1: manifest.trail1, trail2: manifest.trail2 }))
  .digest('hex')
  .substring(0, 16);

// ── Inline Base64 thumbnails ───────────────────────────────────────────────
async function inlineThumbnails(sponsorsList, railLabel) {
  let count = 0;
  const enriched = await Promise.all(
    sponsorsList.map(async (s) => {
      try {
        const filename = s.imageFile || basename(s.image);
        const fullPath = join(ROOT, 'public', 'links', filename);
        if (existsSync(fullPath)) {
          const buf = await sharp(fullPath)
            .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .webp({ quality: 80, effort: 6 })
            .toBuffer();
          count++;
          return {
            name: s.id,       // use id as name for consistency
            label: s.label,
            tagline: s.tagline,
            url: s.url,
            image: s.image,
            imageData: `data:image/webp;base64,${buf.toString('base64')}`,
            badge: s.badge,
          };
        }
      } catch (err) {
        console.warn(`⚠️ Warning: could not inline image for ${s.id}: ${err.message}`);
      }
      return {
        name: s.id,
        label: s.label,
        tagline: s.tagline,
        url: s.url,
        image: s.image,
        badge: s.badge,
      };
    })
  );
  console.log(`✅ [${railLabel}] Inlined ${count}/${sponsorsList.length} sponsor images as instant Base64!`);
  return enriched;
}

// ── Push to KV with read-back verification & last-known-good backup ────────
async function pushKeyToKV(key, data, label, retries = 3) {
  // ── Empty overwrite protection ──────────────────────────────────────────
  if (!Array.isArray(data) || data.length === 0) {
    console.error(`❌ ABORT: Refusing to push empty array to KV key '${key}'. This would wipe production links!`);
    process.exit(1);
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${key}`;
  const backupKey = `${key}_backup`;
  const backupUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${backupKey}`;

  // ── Step 0: Backup last-known-good version before overwrite ─────────────
  try {
    const existingRes = await fetch(url, {
      headers: { 'Authorization': `Bearer ${API_TOKEN}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (existingRes.ok) {
      const existingData = await existingRes.json();
      if (Array.isArray(existingData) && existingData.length > 0) {
        await fetch(backupUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(existingData),
          signal: AbortSignal.timeout(15_000),
        });
        console.log(`📦 [Last-Known-Good] Backed up ${existingData.length} existing items to '${backupKey}'`);
      }
    }
  } catch (backupErr) {
    console.warn(`⚠️ Warning: could not create backup copy of '${key}': ${backupErr.message}`);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(60_000),
      });

      const resData = await res.json();
      if (!resData.success) {
        throw new Error(`KV update failed for key '${key}': ${JSON.stringify(resData.errors)}`);
      }
      console.log(`✅ ${label} update SUCCESS! (Key: ${key})`);

      // ── Read-back verification (with propagation delay) ─────────────────
      await new Promise(r => setTimeout(r, 2000)); // 2s propagation wait
      const readUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${key}`;
      const readRes = await fetch(readUrl, {
        headers: { 'Authorization': `Bearer ${API_TOKEN}` },
        signal: AbortSignal.timeout(15_000),
      });

      if (readRes.ok) {
        const readData = await readRes.json();
        if (Array.isArray(readData) && readData.length === data.length) {
          console.log(`✅ ${label} read-back verified! (${readData.length} links in KV)`);
        } else {
          console.warn(`⚠️ ${label} read-back mismatch: expected ${data.length}, got ${Array.isArray(readData) ? readData.length : 'non-array'}`);
        }
      } else {
        console.warn(`⚠️ ${label} read-back check failed (HTTP ${readRes.status}) — KV may still propagate`);
      }

      return;
    } catch (err) {
      console.warn(`⚠️ Attempt ${attempt}/${retries} failed for ${key}: ${err.message}`);
      if (attempt === retries) throw err;
      console.log(`🔄 Retrying in ${attempt * 5}s...`);
      await new Promise(r => setTimeout(r, attempt * 5000));
    }
  }
}

// ── Sync function fallbacks (auto-generated from canonical JSON) ──────────
function toJsArray(sponsors) {
  return sponsors.map(s => {
    const parts = [
      `name: ${JSON.stringify(s.name)}`,
      `label: ${JSON.stringify(s.label)}`,
      `tagline: ${JSON.stringify(s.tagline)}`,
      `url: ${JSON.stringify(s.url)}`,
      `image: ${JSON.stringify(s.image)}`,
      s.imageData ? `imageData: ${JSON.stringify(s.imageData)}` : null,
      `badge: ${JSON.stringify(s.badge)}`,
    ].filter(Boolean);
    return `    { ${parts.join(', ')} }`;
  }).join(',\n');
}

function updateFunctionFallbacks(t1, t2) {
  // The manifest's own timestamp, not the clock: identical input must give
  // identical files, or every push leaves the tree dirty for no reason.
  const now = manifest.generatedAt;
  const expectedT1 = manifest.expectedCounts.trail1;
  const expectedT2 = manifest.expectedCounts.trail2;

  const sponsorsJsContent = `/**
 * functions/api/sponsors.js
 * Cloudflare Pages Function — KV se sponsor links serve karta hai
 *
 * GET /api/sponsors        → Trail 1 (Featured Sponsors - Gold Theme)
 * GET /api/sponsors?rail=2 → Trail 2 (Gaming Links - Emerald Theme)
 * GET /api/link-health     → Health diagnostic (non-sensitive)
 *
 * AUTO-SYNCED by: scripts/push-sponsors.mjs — DO NOT EDIT MANUALLY
 * Source: src/data/sponsor-links.json (canonical)
 * Manifest Version: ${manifest.manifestVersion}
 * Manifest Hash: ${manifestHash}
 * Last updated: ${now}
 *
 * Layer 2 Fallback: If KV unavailable, hardcoded Base64 data is served.
 * Layer 1 (KV): Updated by npm run sponsors:push
 */

const MANIFEST_VERSION = '${manifest.manifestVersion}';
const MANIFEST_HASH = '${manifestHash}';
const EXPECTED_TRAIL1 = ${expectedT1};
const EXPECTED_TRAIL2 = ${expectedT2};

export async function onRequest(context) {
  const { env } = context;
  const url = new URL(context.request.url);

  // ── Health diagnostic endpoint ──────────────────────────────────────────
  if (url.pathname === '/api/link-health') {
    let t1Count = 0, t2Count = 0, source = 'unknown';
    try {
      const raw1 = await env.SPONSORS.get('links', { type: 'json' });
      const raw2 = await env.SPONSORS.get('links2', { type: 'json' });
      t1Count = Array.isArray(raw1) ? raw1.length : getDefaultSponsors().length;
      t2Count = Array.isArray(raw2) ? raw2.length : getDefaultSponsors2().length;
      source = Array.isArray(raw1) && raw1.length > 0 ? 'kv' : 'fallback';
    } catch {
      source = 'fallback';
      t1Count = getDefaultSponsors().length;
      t2Count = getDefaultSponsors2().length;
    }
    return new Response(JSON.stringify({
      status: 'ok',
      manifestVersion: MANIFEST_VERSION,
      manifestHash: MANIFEST_HASH,
      trail1Count: t1Count,
      trail2Count: t2Count,
      expectedTrail1: EXPECTED_TRAIL1,
      expectedTrail2: EXPECTED_TRAIL2,
      trail1Healthy: t1Count >= EXPECTED_TRAIL1,
      trail2Healthy: t2Count >= EXPECTED_TRAIL2,
      source,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'Access-Control-Allow-Origin': '*' },
    });
  }

  // ── Normal sponsor data ─────────────────────────────────────────────────
  try {
    const isRail2 = url.searchParams.get('rail') === '2';
    const key = isRail2 ? 'links2' : 'links';
    const raw = await env.SPONSORS.get(key, { type: 'json' });

    // Validate KV data before serving (NEVER serve empty or partial array from KV)
    const minExpected = isRail2 ? EXPECTED_TRAIL2 : EXPECTED_TRAIL1;
    const isKvValid = Array.isArray(raw) && raw.length >= minExpected;
    const sponsors = isKvValid
      ? raw
      : (isRail2 ? getDefaultSponsors2() : getDefaultSponsors());

    const kvSource = isKvValid ? 'kv' : 'fallback-safe';

    return new Response(JSON.stringify(sponsors), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30, s-maxage=30',
        'Access-Control-Allow-Origin': '*',
        'X-Link-Count': String(sponsors.length),
        'X-Link-Source': kvSource,
        'X-Manifest-Version': MANIFEST_VERSION,
        'X-Manifest-Hash': MANIFEST_HASH,
      },
    });
  } catch (err) {
    // KV binding missing/error — serve hardcoded Base64 fallback
    const isRail2 = url.searchParams.get('rail') === '2';
    return new Response(JSON.stringify(isRail2 ? getDefaultSponsors2() : getDefaultSponsors()), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'X-Link-Source': 'fallback-error',
        'X-Manifest-Version': MANIFEST_VERSION,
      },
    });
  }
}

// ── TRAIL 1 FALLBACK (hardcoded Base64 — auto-generated from canonical JSON) ──
function getDefaultSponsors() {
  return [
${toJsArray(t1)}
  ];
}

// ── TRAIL 2 FALLBACK (hardcoded Base64 — auto-generated from canonical JSON) ──
function getDefaultSponsors2() {
  return [
${toJsArray(t2)}
  ];
}
`;

  const sponsors2JsContent = `/**
 * functions/api/sponsors2.js
 * Cloudflare Pages Function — KV se Trail 2 sponsor links serve karta hai
 *
 * GET /api/sponsors2 → Trail 2 (Gaming Links - Emerald Theme)
 *
 * AUTO-SYNCED by: scripts/push-sponsors.mjs — DO NOT EDIT MANUALLY
 * Source: src/data/sponsor-links.json (canonical)
 * Manifest Version: ${manifest.manifestVersion}
 * Last updated: ${now}
 */

const EXPECTED_TRAIL2 = ${expectedT2};

export async function onRequest(context) {
  const { env } = context;
  try {
    const raw = await env.SPONSORS.get('links2', { type: 'json' });
    const isKvValid = Array.isArray(raw) && raw.length >= EXPECTED_TRAIL2;
    const sponsors = isKvValid ? raw : getDefaultSponsors2();
    const source = isKvValid ? 'kv' : 'fallback-safe';
    return new Response(JSON.stringify(sponsors), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30, s-maxage=30',
        'Access-Control-Allow-Origin': '*',
        'X-Link-Count': String(sponsors.length),
        'X-Link-Source': source,
        'X-Manifest-Version': '${manifest.manifestVersion}',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify(getDefaultSponsors2()), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'X-Link-Source': 'fallback-error',
      },
    });
  }
}

function getDefaultSponsors2() {
  return [
${toJsArray(t2)}
  ];
}
`;

  const linkHealthJsContent = `/**
 * functions/api/link-health.js
 * Cloudflare Pages Function — Link Health & Diagnostics
 *
 * GET  /api/link-health        → Non-sensitive diagnostic stats
 * POST /api/link-health        → Drift auto-recovery (self-heals KV from bundled fallback)
 * GET  /api/link-health?heal=1 → Self-heal trigger via browser/GET
 *
 * AUTO-SYNCED by: scripts/push-sponsors.mjs — DO NOT EDIT MANUALLY
 * Source: src/data/sponsor-links.json (canonical)
 * Manifest Version: ${manifest.manifestVersion}
 * Manifest Hash: ${manifestHash}
 * Last updated: ${now}
 */

const MANIFEST_VERSION = '${manifest.manifestVersion}';
const MANIFEST_HASH = '${manifestHash}';
const EXPECTED_TRAIL1 = ${expectedT1};
const EXPECTED_TRAIL2 = ${expectedT2};
const REQUIRED_TRAIL1_IDS = ['12th-class-result-check', 'y999-game', 'xd777-sting', 'xd777-gamzu', 'jb-game', 'bet-rupees'];
const REQUIRED_TRAIL2_IDS = ['12th-class-result', 'pkr365', 'm666', 'win786'];

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  let t1Data = null;
  let t2Data = null;
  let source = 'kv';
  let missingCritical = [];

  try {
    if (env.SPONSORS) {
      t1Data = await env.SPONSORS.get('links', { type: 'json' });
      t2Data = await env.SPONSORS.get('links2', { type: 'json' });
    }
  } catch (err) {
    source = 'fallback-error';
  }

  const isT1KvValid = Array.isArray(t1Data) && t1Data.length >= EXPECTED_TRAIL1;
  const isT2KvValid = Array.isArray(t2Data) && t2Data.length >= EXPECTED_TRAIL2;

  const t1Count = Array.isArray(t1Data) ? t1Data.length : 0;
  const t2Count = Array.isArray(t2Data) ? t2Data.length : 0;

  if (!isT1KvValid || !isT2KvValid) {
    source = 'fallback';
  }

  if (Array.isArray(t1Data)) {
    const liveIds1 = t1Data.map(s => s.name || s.id);
    REQUIRED_TRAIL1_IDS.forEach(id => {
      if (!liveIds1.includes(id)) missingCritical.push(\`trail1:\${id}\`);
    });
  } else {
    missingCritical.push('trail1:all_kv_missing');
  }

  if (Array.isArray(t2Data)) {
    const liveIds2 = t2Data.map(s => s.name || s.id);
    REQUIRED_TRAIL2_IDS.forEach(id => {
      if (!liveIds2.includes(id)) missingCritical.push(\`trail2:\${id}\`);
    });
  } else {
    missingCritical.push('trail2:all_kv_missing');
  }

  const isHealthy = isT1KvValid && isT2KvValid && missingCritical.length === 0;

  let healed = false;
  const shouldHeal = (request.method === 'POST' || url.searchParams.get('heal') === '1' || url.searchParams.get('recover') === '1');
  if (shouldHeal && env.SPONSORS && env.SPONSORS.put) {
    try {
      const res1 = await fetch(new URL('/api/sponsors', request.url));
      const res2 = await fetch(new URL('/api/sponsors2', request.url));
      if (res1.ok && res2.ok) {
        const fresh1 = await res1.json();
        const fresh2 = await res2.json();
        if (Array.isArray(fresh1) && fresh1.length >= EXPECTED_TRAIL1) {
          await env.SPONSORS.put('links', JSON.stringify(fresh1));
        }
        if (Array.isArray(fresh2) && fresh2.length >= EXPECTED_TRAIL2) {
          await env.SPONSORS.put('links2', JSON.stringify(fresh2));
        }
        healed = true;
      }
    } catch (_) {}
  }

  const responsePayload = {
    status: isHealthy ? 'healthy' : 'degraded',
    manifestVersion: MANIFEST_VERSION,
    manifestHash: MANIFEST_HASH,
    expectedCounts: {
      trail1: EXPECTED_TRAIL1,
      trail2: EXPECTED_TRAIL2,
      total: EXPECTED_TRAIL1 + EXPECTED_TRAIL2,
    },
    activeCounts: {
      trail1: t1Count,
      trail2: t2Count,
      total: t1Count + t2Count,
    },
    trail1Healthy: isT1KvValid,
    trail2Healthy: isT2KvValid,
    source,
    missingCritical,
    healed,
    checkedAt: new Date().toISOString(),
  };

  return new Response(JSON.stringify(responsePayload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'X-Link-Status': isHealthy ? 'healthy' : 'degraded',
    },
  });
}
`;

  writeFileSync(join(ROOT, 'functions', 'api', 'sponsors.js'), sponsorsJsContent, 'utf8');
  writeFileSync(join(ROOT, 'functions', 'api', 'sponsors2.js'), sponsors2JsContent, 'utf8');
  writeFileSync(join(ROOT, 'functions', 'api', 'link-health.js'), linkHealthJsContent, 'utf8');
  console.log('✅ Auto-synced functions/api/sponsors.js, sponsors2.js & link-health.js with inline Base64 fallbacks!');
  console.log(`   Manifest Hash: ${manifestHash} | Version: ${manifest.manifestVersion}`);
}

// ── Main ───────────────────────────────────────────────────────────────────
async function pushToKV() {
  console.log('\n🚀 Sponsor Multi-Rail Instant Push — net27.watch');
  console.log('═'.repeat(50));
  console.log(`📋 Source: src/data/sponsor-links.json`);
  console.log(`📋 Version: ${manifest.manifestVersion} | Hash: ${manifestHash}`);
  console.log(`📋 Trail 1 (Featured): ${SPONSORS.length} links`);
  SPONSORS.forEach((s, i) => console.log(`   #${i + 1} ${s.label} → ${s.url}`));
  console.log('');
  console.log(`📋 Trail 2 (Gaming Links): ${SPONSORS_RAIL_2.length} links`);
  SPONSORS_RAIL_2.forEach((s, i) => console.log(`   #${i + 1} ${s.label} → ${s.url}`));
  console.log('');

  console.log('⚡ Generating instant Base64 WebP data (Zero 404 guarantee)...');
  const enrichedRail1 = await inlineThumbnails(SPONSORS, 'Trail 1');
  const enrichedRail2 = await inlineThumbnails(SPONSORS_RAIL_2, 'Trail 2');

  if (NO_KV) {
    updateFunctionFallbacks(enrichedRail1, enrichedRail2);
    console.log('ℹ️  --no-kv: functions regenerated, KV untouched.\n');
    return;
  }

  // ── No-silent-removal guard: check BOTH keys before writing EITHER ───────
  const base = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values`;
  for (const key of ['links', 'links2']) {
    let res;
    try {
      res = await fetch(`${base}/${key}`, { headers: { Authorization: `Bearer ${API_TOKEN}` }, signal: AbortSignal.timeout(15_000) });
    } catch (e) {
      console.error(`❌ Could not read KV '${key}' (${e.message}) — refusing to overwrite what I cannot see.`);
      process.exit(1);
    }
    if (res.status === 404) continue; // key never written yet
    if (!res.ok) {
      console.error(`❌ Could not read KV '${key}' (HTTP ${res.status}) — refusing to overwrite what I cannot see.`);
      process.exit(1);
    }
    const live = await res.json().catch(() => null);
    const lost = silentRemovals(live, manifest);
    if (lost.length) {
      console.error('\n' + explain(lost, `KV '${key}'`));
      process.exit(1);
    }
  }
  console.log('🛡️  Guard: every live KV link is in the manifest (or explicitly removed) — safe to write.');

  try {
    await pushKeyToKV('links', enrichedRail1, 'Trail 1 (Featured Sponsors)');
    await pushKeyToKV('links2', enrichedRail2, 'Trail 2 (Popular Gaming Links)');

    console.log('⚡ Syncing Cloudflare Pages functions hardcoded fallbacks...');
    updateFunctionFallbacks(enrichedRail1, enrichedRail2);

    console.log('\n⏱️  Both rails live in: 5–30 seconds');
    console.log(`🌐 Trail 1 Check: https://net27.watch/api/sponsors`);
    console.log(`🌐 Trail 2 Check: https://net27.watch/api/sponsors2`);
    console.log(`🌐 Health Check:  https://net27.watch/api/link-health`);
    console.log(`🌐 Site:          https://net27.watch/`);
    console.log('═'.repeat(50) + '\n');
  } catch (err) {
    console.error('❌ Error during KV push:', err.message);
    process.exit(1);
  }
}

pushToKV();
