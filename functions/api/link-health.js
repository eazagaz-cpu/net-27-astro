/**
 * functions/api/link-health.js
 * Cloudflare Pages Function — Link Health & Diagnostics
 *
 * GET  /api/link-health        → Non-sensitive diagnostic stats
 * POST /api/link-health        → Drift auto-recovery (self-heals KV from bundled fallback)
 * GET  /api/link-health?heal=1 → Self-heal trigger via browser/GET
 *
 * AUTO-SYNCED by: scripts/push-sponsors.mjs — DO NOT EDIT MANUALLY
 * Source: src/data/sponsor-links.json (canonical)
 * Manifest Version: 2026-09-26-01
 * Manifest Hash: fe83f8b565a2f862
 * Last updated: 2026-09-26T09:26:08.399Z
 */

const MANIFEST_VERSION = '2026-09-26-01';
const MANIFEST_HASH = 'fe83f8b565a2f862';
const EXPECTED_TRAIL1 = 11;
const EXPECTED_TRAIL2 = 9;
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
      if (!liveIds1.includes(id)) missingCritical.push(`trail1:${id}`);
    });
  } else {
    missingCritical.push('trail1:all_kv_missing');
  }

  if (Array.isArray(t2Data)) {
    const liveIds2 = t2Data.map(s => s.name || s.id);
    REQUIRED_TRAIL2_IDS.forEach(id => {
      if (!liveIds2.includes(id)) missingCritical.push(`trail2:${id}`);
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
