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
import { silentRemovals, explain, normUrl } from './lib/sponsor-guard.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MANIFEST_PATH = join(ROOT, 'src', 'data', 'sponsor-links.json');
const LIVE_SITE = 'https://net27.watch';

// ── Required minimum counts ────────────────────────────────────────────────
// Only "never empty". A floor like 9 blocked legitimate removals; accidental
// ones are caught by the live-link check below instead.
const MIN_TRAIL1 = 1;
const MIN_TRAIL2 = 1;

// Which links must stay is no longer a hardcoded ID list here (one more copy
// of the data to drift). The rule is: nothing that is LIVE may leave the
// manifest unless it is recorded under `removed` — see lib/sponsor-guard.mjs.

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

async function main() {
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

  // ── Check 9: `removed` tombstones are well-formed and not contradictory ──
  const removed = manifest.removed ?? [];
  check('removed is an array', Array.isArray(removed), '`removed` must be an array of { url, removedOn, reason }');
  const liveUrls = new Set([...t1, ...t2].map(s => normUrl(s.url)));
  const badTombstones = removed.filter(r => !r?.url || !r?.removedOn);
  check('Every removed entry has url + removedOn', badTombstones.length === 0,
    `removed entries missing url/removedOn: ${JSON.stringify(badTombstones)}`);
  const contradictions = removed.filter(r => liveUrls.has(normUrl(r.url)));
  check('No link is both active and removed', contradictions.length === 0,
    `Listed as active AND removed: ${contradictions.map(r => r.url).join(', ')} — delete the removed entry to keep it`);

  // ── Check 10: The homepage still mounts both rails ───────────────────────
  // An unrelated layout edit deleting a rail looks exactly like "links gone".
  const home = readFileSync(join(ROOT, 'src', 'components', 'pages', 'HomePage.astro'), 'utf8');
  for (const rail of ['SponsorRailDynamic', 'SponsorRailSecondary']) {
    check(`HomePage.astro mounts <${rail} client:only="react" />`,
      new RegExp(`<${rail}\\s+client:only=["']react["']`).test(home),
      `src/components/pages/HomePage.astro no longer renders <${rail} client:only="react" /> — the rail would disappear from the site`);
    // Owner's decision (2026-09-26): rails sit ABOVE the Top 10 rails. Moved
    // to the page bottom once (bbef911) and were reported as "gone".
    const railAt = home.search(new RegExp(`<${rail}\\s`));
    const top10At = home.indexOf('<Top10Rail');
    check(`HomePage.astro places <${rail}> above <Top10Rail>`,
      railAt !== -1 && top10At !== -1 && railAt < top10At,
      `<${rail}> must come before <Top10Rail> in HomePage.astro — below it, visitors do not see the links`);
  }

  // ── Check 11: Components derive their fallback from the manifest ─────────
  for (const f of ['SponsorRailDynamic.tsx', 'SponsorRailSecondary.tsx']) {
    const src = readFileSync(join(ROOT, 'src', 'components', f), 'utf8');
    check(`${f} reads its fallback from sponsor-links.json`,
      src.includes('data/sponsor-links.json') && !/https?:\/\/[^'"`\s]+\.(pk|cc|net|com|org)/i.test(src),
      `${f} hardcodes sponsor URLs — it must build FALLBACK from src/data/sponsor-links.json`);
  }

  // ── Check 11: All sponsors have required fields ───────────────────────────
  [...manifest.trail1, ...manifest.trail2].forEach(s => {
    const missing = ['id', 'label', 'url', 'image', 'badge'].filter(f => !s[f]);
    check(
      `Sponsor '${s.id || 'UNKNOWN'}' has all required fields`,
      missing.length === 0,
      `Sponsor '${s.id}' missing fields: ${missing.join(', ')}`
    );
  });

  // ── Check 12: Nothing live on net27.watch is dropped silently ────────────
  // Runs in CI before any KV write or deploy, and locally before commits.
  for (const [path, label] of [['/api/sponsors', 'Trail 1'], ['/api/sponsors2', 'Trail 2']]) {
    let live = null;
    try {
      const res = await fetch(`${LIVE_SITE}${path}?verify=${Date.now()}`, {
        headers: { 'User-Agent': 'net27-verify-links' },
        signal: AbortSignal.timeout(15_000),
      });
      if (res.ok) live = await res.json();
    } catch {}
    if (!Array.isArray(live)) {
      // Site down or unreachable: nothing to compare against, and a deploy
      // may be what fixes it. push-sponsors.mjs still guards KV directly.
      console.warn(`  ⚠️  ${label}: could not read ${LIVE_SITE}${path} — live comparison skipped`);
      continue;
    }
    const lost = silentRemovals(live, manifest);
    check(`${label}: all ${live.length} live links are kept or explicitly removed`, lost.length === 0,
      explain(lost, `${LIVE_SITE}${path}`));
  }

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
    process.exitCode = 1;
  } else {
    console.log('\n✅ ALL CHECKS PASSED — Safe to deploy!');
    console.log(`🚀 Run: npm run sponsors:deploy\n`);
    process.exitCode = 0;
  }
}

main();
