/**
 * scripts/verify-production.mjs
 * ═══════════════════════════════════════════════════════
 * POST-DEPLOY PRODUCTION VERIFICATION
 * ═══════════════════════════════════════════════════════
 *
 * Production site se live data fetch karta hai aur canonical JSON se compare.
 * Deploy PASS tab hi hoga jab production mein expected links houn.
 *
 * Usage: npm run verify:production
 * CI:    Run after deploy step (continue-on-error: true recommended)
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MANIFEST_PATH = join(ROOT, 'src', 'data', 'sponsor-links.json');

const SITE_URL = 'https://net27.watch';
const TIMEOUT_MS = 15000;

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function main() {
  console.log('\n🌐 Production Verification — net27.watch');
  console.log('═'.repeat(50));

  // Load canonical manifest
  if (!existsSync(MANIFEST_PATH)) {
    console.error('❌ Canonical manifest not found: src/data/sponsor-links.json');
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const expectedT1 = manifest.expectedCounts.trail1;
  const expectedT2 = manifest.expectedCounts.trail2;

  console.log(`📋 Expected: Trail 1 = ${expectedT1}, Trail 2 = ${expectedT2}`);
  console.log('');

  let allPassed = true;

  // ── Check Trail 1: /api/sponsors ─────────────────────────────────────────
  console.log('🔍 Checking Trail 1 (/api/sponsors)...');
  try {
    const res = await fetchWithTimeout(`${SITE_URL}/api/sponsors`, TIMEOUT_MS);
    if (!res.ok) {
      console.error(`  ❌ /api/sponsors returned HTTP ${res.status}`);
      allPassed = false;
    } else {
      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error('  ❌ /api/sponsors did not return an array');
        allPassed = false;
      } else {
        const source = res.headers.get('X-Link-Source') || 'unknown';
        console.log(`  ✅ Trail 1: ${data.length} links received (source: ${source})`);

        if (data.length < expectedT1) {
          console.error(`  ❌ Trail 1 count ${data.length} < expected ${expectedT1}`);
          allPassed = false;
        } else {
          console.log(`  ✅ Trail 1 count OK (${data.length} >= ${expectedT1})`);
        }

        // Check required IDs
        const liveIds = data.map(s => s.name || s.id);
        const requiredIds = manifest.trail1.filter(s => s.enabled !== false).map(s => s.id);
        const missingIds = requiredIds.filter(id => !liveIds.includes(id));
        if (missingIds.length > 0) {
          console.error(`  ❌ Missing IDs in Trail 1: ${missingIds.join(', ')}`);
          allPassed = false;
        } else {
          console.log(`  ✅ All Trail 1 IDs present`);
        }
      }
    }
  } catch (e) {
    console.error(`  ❌ /api/sponsors fetch failed: ${e.message}`);
    allPassed = false;
  }

  console.log('');

  // ── Check Trail 2: /api/sponsors2 ────────────────────────────────────────
  console.log('🔍 Checking Trail 2 (/api/sponsors2)...');
  try {
    const res = await fetchWithTimeout(`${SITE_URL}/api/sponsors2`, TIMEOUT_MS);
    if (!res.ok) {
      console.error(`  ❌ /api/sponsors2 returned HTTP ${res.status}`);
      allPassed = false;
    } else {
      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error('  ❌ /api/sponsors2 did not return an array');
        allPassed = false;
      } else {
        const source = res.headers.get('X-Link-Source') || 'unknown';
        console.log(`  ✅ Trail 2: ${data.length} links received (source: ${source})`);

        if (data.length < expectedT2) {
          console.error(`  ❌ Trail 2 count ${data.length} < expected ${expectedT2}`);
          allPassed = false;
        } else {
          console.log(`  ✅ Trail 2 count OK (${data.length} >= ${expectedT2})`);
        }
      }
    }
  } catch (e) {
    console.error(`  ❌ /api/sponsors2 fetch failed: ${e.message}`);
    allPassed = false;
  }

  console.log('');

  // ── Check /api/link-health ───────────────────────────────────────────────
  console.log('🔍 Checking Health Endpoint (/api/link-health)...');
  try {
    const res = await fetchWithTimeout(`${SITE_URL}/api/link-health`, TIMEOUT_MS);
    if (res.ok) {
      const health = await res.json();
      console.log(`  ✅ Health: ${JSON.stringify(health)}`);
    } else {
      console.log(`  ⚠️ /api/link-health returned HTTP ${res.status} (non-critical)`);
    }
  } catch (e) {
    console.log(`  ⚠️ /api/link-health not available: ${e.message} (non-critical)`);
  }

  // ── Final Report ──────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50));
  if (allPassed) {
    console.log('✅ PRODUCTION VERIFICATION PASSED');
    console.log(`🌐 ${SITE_URL} — All links live and healthy!\n`);
    process.exit(0);
  } else {
    console.error('❌ PRODUCTION VERIFICATION FAILED');
    console.error('   Some links may be missing from production!');
    console.error('   Emergency fix: npm run sponsors:push\n');
    process.exit(1);
  }
}

main().catch(e => {
  console.error('❌ Verification error:', e.message);
  process.exit(1);
});
