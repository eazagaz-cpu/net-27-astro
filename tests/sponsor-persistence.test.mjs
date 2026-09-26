/**
 * tests/sponsor-persistence.test.mjs
 * ═══════════════════════════════════════════════════════
 * AUTOMATED TESTS FOR SPONSOR/LINK PERSISTENCE & FAIL-SAFE ARCHITECTURE
 * ═══════════════════════════════════════════════════════
 *
 * Tests:
 *  1. Canonical manifest schema & validity
 *  2. Expected link counts (Trail 1 = 10, Trail 2 = 9, Total = 19)
 *  3. Critical sponsor IDs presence
 *  4. Duplicate ID detection (negative test)
 *  5. Empty URL / empty ID detection (negative test)
 *  6. Manifest hash determinism
 *  7. KV failure fallback simulation (remote KV unavailable)
 *  8. Empty KV response fallback simulation (KV returns [])
 *  9. Partial KV response fallback simulation (KV returns fewer than required)
 * 10. Concurrency protection in GitHub workflows
 * 11. Integrity gate in GitHub workflows
 * 12. Safe deploy script in package.json
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testErrors = [];

function assert(description, condition, details = '') {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${description} — ${details}`);
    testErrors.push(`${description}: ${details}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('\n🧪 Running Sponsor Persistence & Fail-Safe Test Suite');
  console.log('═'.repeat(60));

  // ── Test 1: Canonical Manifest Existence & Parsing ───────────────────────
  console.log('\n[Suite 1: Canonical Manifest Schema]');
  const manifestPath = join(ROOT, 'src', 'data', 'sponsor-links.json');
  assert('sponsor-links.json exists', existsSync(manifestPath));

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    assert('sponsor-links.json is valid JSON', true);
  } catch (e) {
    assert('sponsor-links.json is valid JSON', false, e.message);
    return;
  }

  assert('Manifest has manifestVersion', typeof manifest.manifestVersion === 'string' && manifest.manifestVersion.length > 0);
  assert('Manifest has expectedCounts', typeof manifest.expectedCounts === 'object' && manifest.expectedCounts !== null);
  assert('Manifest has trail1 array', Array.isArray(manifest.trail1));
  assert('Manifest has trail2 array', Array.isArray(manifest.trail2));

  // ── Test 2: Expected Counts ───────────────────────────────────────────────
  console.log('\n[Suite 2: Link Counts]');
  const t1 = manifest.trail1.filter(s => s.enabled !== false);
  const t2 = manifest.trail2.filter(s => s.enabled !== false);

  assert(`Trail 1 count matches expected (${t1.length} == ${manifest.expectedCounts.trail1})`, t1.length === manifest.expectedCounts.trail1);
  assert(`Trail 2 count matches expected (${t2.length} == ${manifest.expectedCounts.trail2})`, t2.length === manifest.expectedCounts.trail2);
  assert('Trail 1 is not empty', t1.length >= 1);
  assert('Trail 2 is not empty', t2.length >= 1);
  assert(`Total count is ${manifest.expectedCounts.total}`, t1.length + t2.length === manifest.expectedCounts.total);

  // ── Test 3: No-silent-removal guard ───────────────────────────────────────
  // Replaces the old hardcoded "critical IDs" list: ANY live link is protected.
  console.log('\n[Suite 3: No-Silent-Removal Guard]');
  const { silentRemovals, normUrl } = await import('../scripts/lib/sponsor-guard.mjs');
  const t1Ids = t1.map(s => s.id);
  const t2Ids = t2.map(s => s.id);
  const liveNow = [...t1, ...t2].map(s => ({ name: s.id, url: s.url }));

  assert('Current manifest keeps every link it serves', silentRemovals(liveNow, manifest).length === 0);
  const dropped = { ...manifest, trail1: manifest.trail1.slice(1) };
  assert('Dropping a live link without a record is caught',
    silentRemovals(liveNow, dropped).length === 1);
  const tombstoned = { ...dropped, removed: [{ url: manifest.trail1[0].url, removedOn: '2026-09-26' }] };
  assert('Dropping a live link WITH a removed record is allowed',
    silentRemovals(liveNow, tombstoned).length === 0);
  const kvOnly = [...liveNow, { name: 'uncommitted', url: 'https://example.pk/new' }];
  assert('A KV-only link (never committed) blocks the overwrite',
    silentRemovals(kvOnly, manifest).length === 1);
  assert('URL matching ignores scheme, www, case and trailing slash',
    normUrl('HTTPS://www.Xx555.com.pk/') === normUrl('http://xx555.com.pk'));
  assert('Every removed entry is well-formed', (manifest.removed ?? []).every(r => r.url && r.removedOn));

  // ── Test 4: Duplicate and Empty Validation Logic ─────────────────────────
  console.log('\n[Suite 4: Negative Validations & Tamper Detection]');
  const allIds = [...t1Ids, ...t2Ids];
  const duplicates = allIds.filter((id, i) => allIds.indexOf(id) !== i);
  assert('No duplicate IDs in manifest', duplicates.length === 0, `Duplicates found: ${duplicates.join(', ')}`);

  const emptyUrls = [...t1, ...t2].filter(s => !s.url || s.url.trim() === '');
  assert('No empty URLs in manifest', emptyUrls.length === 0);

  // Simulated duplicate detection
  const testDuplicateList = ['link-1', 'link-2', 'link-1'];
  const hasDupes = testDuplicateList.filter((id, i) => testDuplicateList.indexOf(id) !== i).length > 0;
  assert('Duplicate detection algorithm correctly flags duplicates', hasDupes);

  // Manifest hash determinism
  const hash1 = createHash('sha256').update(JSON.stringify({ trail1: manifest.trail1, trail2: manifest.trail2 })).digest('hex').substring(0, 16);
  const hash2 = createHash('sha256').update(JSON.stringify({ trail1: manifest.trail1, trail2: manifest.trail2 })).digest('hex').substring(0, 16);
  assert('Manifest hash is deterministic', hash1 === hash2 && hash1.length === 16);

  // Tamper detection: changing any sponsor changes the hash
  const tampered = JSON.parse(JSON.stringify(manifest));
  tampered.trail1[0].label = 'Tampered Label';
  const tamperedHash = createHash('sha256').update(JSON.stringify({ trail1: tampered.trail1, trail2: tampered.trail2 })).digest('hex').substring(0, 16);
  assert('Tampering with link data changes manifest hash', hash1 !== tamperedHash);

  // ── Test 5: Runtime Fallback Simulations ─────────────────────────────────
  console.log('\n[Suite 5: Runtime Fallback & Fail-Safe Simulations]');

  // Simulation A: KV is completely unavailable / throws error
  function simulateRuntimeFetch(kvMock, key) {
    const isRail2 = key === 'links2';
    const minExpected = isRail2 ? manifest.expectedCounts.trail2 : manifest.expectedCounts.trail1;
    const fallbackData = isRail2 ? t2 : t1;

    try {
      if (kvMock.shouldThrow) throw new Error('KV service unavailable (500)');
      const raw = kvMock.data[key];
      const isKvValid = Array.isArray(raw) && raw.length >= minExpected;
      return {
        data: isKvValid ? raw : fallbackData,
        source: isKvValid ? 'kv' : 'fallback-safe',
      };
    } catch (e) {
      return {
        data: fallbackData,
        source: 'fallback-error',
      };
    }
  }

  // A. KV throws error
  const resA = simulateRuntimeFetch({ shouldThrow: true, data: {} }, 'links');
  assert('KV error fallback preserves Trail 1 count', resA.data.length === manifest.expectedCounts.trail1);
  assert('KV error returns fallback source tag', resA.source === 'fallback-error');

  // B. KV returns empty array []
  const resB = simulateRuntimeFetch({ shouldThrow: false, data: { links: [] } }, 'links');
  assert('Empty KV array falls back to bundled Trail 1', resB.data.length === manifest.expectedCounts.trail1);
  assert('Empty KV array reports fallback-safe source', resB.source === 'fallback-safe');

  // C. KV returns partial data (e.g. only 2 links due to transient glitch)
  const resC = simulateRuntimeFetch({ shouldThrow: false, data: { links: [{ id: 'test1' }, { id: 'test2' }] } }, 'links');
  assert('Partial KV data (< expected) triggers safe fallback', resC.data.length === manifest.expectedCounts.trail1);
  assert('Partial KV data is blocked from rendering', resC.source === 'fallback-safe');

  // D. KV returns full healthy data
  const resD = simulateRuntimeFetch({ shouldThrow: false, data: { links: t1 } }, 'links');
  assert('Healthy KV data is served directly', resD.data.length === manifest.expectedCounts.trail1);
  assert('Healthy KV data reports kv source', resD.source === 'kv');

  // ── Test 6: Workflow Concurrency & Integrity Gate ─────────────────────────
  console.log('\n[Suite 6: Workflow & CI/CD Resilience]');
  const fastDeployYml = readFileSync(join(ROOT, '.github', 'workflows', 'fast-deploy.yml'), 'utf8');
  const dailySyncYml = readFileSync(join(ROOT, '.github', 'workflows', 'daily-sync.yml'), 'utf8');

  assert('fast-deploy.yml has concurrency protection', fastDeployYml.includes('concurrency:'));
  assert('fast-deploy.yml has cancel-in-progress', fastDeployYml.includes('cancel-in-progress: true'));
  assert('fast-deploy.yml has integrity gate (verify-links)', fastDeployYml.includes('node scripts/verify-links.mjs'));
  assert('fast-deploy.yml has post-deploy verification', fastDeployYml.includes('node scripts/verify-production.mjs'));

  assert('daily-sync.yml has concurrency protection', dailySyncYml.includes('concurrency:'));
  assert('daily-sync.yml has cancel-in-progress', dailySyncYml.includes('cancel-in-progress: true'));
  assert('daily-sync.yml has integrity gate (verify-links)', dailySyncYml.includes('node scripts/verify-links.mjs'));
  assert('daily-sync.yml has post-deploy verification', dailySyncYml.includes('node scripts/verify-production.mjs'));

  // ── Test 7: Package.json Scripts ──────────────────────────────────────────
  console.log('\n[Suite 7: npm Scripts]');
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  assert('package.json has verify:links script', !!pkg.scripts['verify:links']);
  assert('package.json has verify:production script', !!pkg.scripts['verify:production']);
  assert('package.json has deploy:safe script', !!pkg.scripts['deploy:safe']);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log(`📊 Test Summary: ${passedTests} passed, ${failedTests} failed (Total: ${totalTests})`);

  if (failedTests > 0) {
    console.error('\n❌ TEST SUITE FAILED:');
    testErrors.forEach(e => console.error(`   → ${e}`));
    process.exit(1);
  } else {
    console.log('\n✅ ALL 30+ TESTS PASSED! Link persistence architecture verified.\n');
    process.exit(0);
  }
}

runTests().catch(e => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
