/**
 * scripts/verify-links.mjs
 * ═══════════════════════════════════════════════════════
 * PRE-DEPLOY INTEGRITY GATE
 * ═══════════════════════════════════════════════════════
 *
 * Canonical sponsor-links.json ko validate karta hai BEFORE deploy.
 * Agar koi bhi check fail ho to exit code 1 → CI build fail ho jaata hai.
 * Yeh ensure karta hai ke KABHI BHAI incomplete/broken data deploy na ho.
 *
 * Usage: npm run verify:links
 * CI:    Run before build step
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MANIFEST_PATH = join(ROOT, 'src', 'data', 'sponsor-links.json');

// ── Required minimum counts ────────────────────────────────────────────────
const MIN_TRAIL1 = 9;   // At least 9 Trail 1 links required
const MIN_TRAIL2 = 8;   // At least 8 Trail 2 links required

// ── Required critical IDs that MUST always be present ─────────────────────
const REQUIRED_TRAIL1_IDS = ['y999-game', 'xd777-sting', 'xd777-gamzu', 'jb-game', 'bet-rupees'];
const REQUIRED_TRAIL2_IDS = ['pkr365', 'm666', 'win786'];

let passed = 0;
let failed = 0;
const errors = [];

function check(name, condition, errorMsg) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.error(`  ❌ ${name}: ${errorMsg}`);
    errors.push(errorMsg);
    failed++;
  }
}

function main() {
  console.log('\n🔍 Sponsor Links Integrity Verification');
  console.log('═'.repeat(50));
  console.log(`📄 Manifest: ${MANIFEST_PATH}\n`);

  // ── Check 1: File exists ──────────────────────────────────────────────────
  check('Manifest file exists', existsSync(MANIFEST_PATH), 'src/data/sponsor-links.json not found!');
  if (!existsSync(MANIFEST_PATH)) {
    reportAndExit();
    return;
  }

  // ── Check 2: Valid JSON ───────────────────────────────────────────────────
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    check('Valid JSON', true, '');
  } catch (e) {
    check('Valid JSON', false, `JSON parse error: ${e.message}`);
    reportAndExit();
    return;
  }

  // ── Check 3: Required top-level fields ───────────────────────────────────
  check('Has manifestVersion', !!manifest.manifestVersion, 'manifestVersion field missing');
  check('Has expectedCounts', !!manifest.expectedCounts, 'expectedCounts field missing');
  check('Has trail1 array', Array.isArray(manifest.trail1), 'trail1 must be an array');
  check('Has trail2 array', Array.isArray(manifest.trail2), 'trail2 must be an array');

  if (!Array.isArray(manifest.trail1) || !Array.isArray(manifest.trail2)) {
    reportAndExit();
    return;
  }

  const t1 = manifest.trail1.filter(s => s.enabled !== false);
  const t2 = manifest.trail2.filter(s => s.enabled !== false);

  // ── Check 4: Minimum counts ───────────────────────────────────────────────
  check(
    `Trail 1 minimum count (${t1.length} >= ${MIN_TRAIL1})`,
    t1.length >= MIN_TRAIL1,
    `Trail 1 has only ${t1.length} enabled links, minimum ${MIN_TRAIL1} required!`
  );
  check(
    `Trail 2 minimum count (${t2.length} >= ${MIN_TRAIL2})`,
    t2.length >= MIN_TRAIL2,
    `Trail 2 has only ${t2.length} enabled links, minimum ${MIN_TRAIL2} required!`
  );

  // ── Check 5: Expected counts match manifest declaration ───────────────────
  check(
    `Trail 1 count matches expectedCounts (${t1.length} == ${manifest.expectedCounts.trail1})`,
    t1.length === manifest.expectedCounts.trail1,
    `Trail 1 has ${t1.length} enabled links but expectedCounts.trail1 = ${manifest.expectedCounts.trail1}. Update expectedCounts!`
  );
  check(
    `Trail 2 count matches expectedCounts (${t2.length} == ${manifest.expectedCounts.trail2})`,
    t2.length === manifest.expectedCounts.trail2,
    `Trail 2 has ${t2.length} enabled links but expectedCounts.trail2 = ${manifest.expectedCounts.trail2}. Update expectedCounts!`
  );

  // ── Check 6: No duplicate IDs ─────────────────────────────────────────────
  const allIds = [...manifest.trail1, ...manifest.trail2].map(s => s.id);
  const uniqueIds = new Set(allIds);
  const duplicates = allIds.filter((id, i) => allIds.indexOf(id) !== i);
  check(
    'No duplicate IDs',
    duplicates.length === 0,
    `Duplicate IDs found: ${duplicates.join(', ')}`
  );

  // ── Check 7: No empty URLs ────────────────────────────────────────────────
  const emptyUrls = [...manifest.trail1, ...manifest.trail2].filter(s => !s.url || s.url.trim() === '');
  check(
    'No empty URLs',
    emptyUrls.length === 0,
    `Sponsors with empty URL: ${emptyUrls.map(s => s.id).join(', ')}`
  );

  // ── Check 8: No empty IDs ─────────────────────────────────────────────────
  const emptyIds = [...manifest.trail1, ...manifest.trail2].filter(s => !s.id || s.id.trim() === '');
  check(
    'No empty IDs',
    emptyIds.length === 0,
    `Sponsors with empty ID found!`
  );

  // ── Check 9: Required critical IDs present in Trail 1 ────────────────────
  const t1Ids = t1.map(s => s.id);
  REQUIRED_TRAIL1_IDS.forEach(reqId => {
    check(
      `Required Trail 1 ID present: ${reqId}`,
      t1Ids.includes(reqId),
      `Critical sponsor '${reqId}' is missing from Trail 1!`
    );
  });

  // ── Check 10: Required critical IDs present in Trail 2 ───────────────────
  const t2Ids = t2.map(s => s.id);
  REQUIRED_TRAIL2_IDS.forEach(reqId => {
    check(
      `Required Trail 2 ID present: ${reqId}`,
      t2Ids.includes(reqId),
      `Critical sponsor '${reqId}' is missing from Trail 2!`
    );
  });

  // ── Check 11: All sponsors have required fields ───────────────────────────
  [...manifest.trail1, ...manifest.trail2].forEach(s => {
    const missing = ['id', 'label', 'url', 'image', 'badge'].filter(f => !s[f]);
    check(
      `Sponsor '${s.id || 'UNKNOWN'}' has all required fields`,
      missing.length === 0,
      `Sponsor '${s.id}' missing fields: ${missing.join(', ')}`
    );
  });

  // ── Compute manifest hash ─────────────────────────────────────────────────
  const hash = createHash('sha256')
    .update(JSON.stringify({ trail1: manifest.trail1, trail2: manifest.trail2 }))
    .digest('hex')
    .substring(0, 16);

  reportAndExit(manifest, hash, t1.length, t2.length);
}

function reportAndExit(manifest, hash, t1Count, t2Count) {
  console.log('\n' + '═'.repeat(50));
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);

  if (manifest && hash) {
    console.log(`📋 Manifest Version: ${manifest.manifestVersion}`);
    console.log(`🔑 Manifest Hash: ${hash}`);
    console.log(`📦 Trail 1: ${t1Count} links | Trail 2: ${t2Count} links`);
  }

  if (failed > 0) {
    console.error('\n❌ VERIFICATION FAILED — Deploy blocked!');
    errors.forEach(e => console.error(`   → ${e}`));
    console.error('\n💡 Fix sponsor-links.json and re-run: npm run verify:links\n');
    process.exit(1);
  } else {
    console.log('\n✅ ALL CHECKS PASSED — Safe to deploy!');
    console.log(`🚀 Run: npm run sponsors:push && npm run push:safe\n`);
    process.exit(0);
  }
}

main();
