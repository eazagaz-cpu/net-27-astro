#!/usr/bin/env node
/**
 * dmca-auto-remove.mjs
 *
 * Reads dmca/queue.json → pending array, then:
 *   1. Adds slug + TMDB ID to src/lib/dmcaDenyList.ts
 *   2. Updates DMCA_BLOCKED_IDS in functions/player.js
 *   3. Updates DMCA_DENIED_SLUGS in astro.config.mjs
 *   4. Moves processed items to queue.processed
 *   5. Appends entry to dmca/audit-log.json (permanent record; public repo, so
 *      sender domain and report ID only)
 *   6. Writes dmca/removed.md (not committed) for the workflow's GitHub issue
 *
 * Usage:
 *   node scripts/dmca-auto-remove.mjs           # Process queue
 *   node scripts/dmca-auto-remove.mjs --dry-run # Preview only
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const DRY_RUN = process.argv.includes('--dry-run');

// ── File paths ────────────────────────────────────────────────────────────────
const QUEUE_PATH      = join(ROOT, 'dmca', 'queue.json');
const AUDIT_PATH      = join(ROOT, 'dmca', 'audit-log.json');
const DENY_LIST_PATH  = join(ROOT, 'src', 'lib', 'dmcaDenyList.ts');
const PLAYER_FN_PATH  = join(ROOT, 'functions', 'player.js');
const ASTRO_CFG_PATH  = join(ROOT, 'astro.config.mjs');
const SUMMARY_PATH    = join(ROOT, 'dmca', 'removed.md');

function ensurePrivate() {
  const p = join(ROOT, 'dmca');
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

// ── Read/Write helpers ────────────────────────────────────────────────────────
function readFile(path) { return existsSync(path) ? readFileSync(path, 'utf8') : ''; }
function writeUtf8(path, content) {
  const utf8 = new TextEncoder();
  const bytes = utf8.encode(content);
  writeFileSync(path, Buffer.from(bytes));
}

// ── dmcaDenyList.ts updater ───────────────────────────────────────────────────
function updateDenyList(slug, tmdbId, reportId) {
  let src = readFile(DENY_LIST_PATH);

  let modified = false;

  // Add slug to DMCA_DENIED_SLUGS set
  if (slug && !src.includes(`'${slug}'`)) {
    const comment = reportId ? `  // Report ${reportId}` : '';
    src = src.replace(
      /export const DMCA_DENIED_SLUGS = new Set<string>\(\[/,
      `export const DMCA_DENIED_SLUGS = new Set<string>([\n  '${slug}',${comment}`
    );
    modified = true;
    console.log(`  ✅ dmcaDenyList.ts: added slug '${slug}'`);
  } else if (slug) {
    console.log(`  ℹ️  Slug '${slug}' already in deny list`);
  }

  // Add TMDB ID to DMCA_DENIED_TMDB_IDS set
  if (tmdbId && !src.includes(`${tmdbId},`) && !src.includes(`${tmdbId}  //`)) {
    const comment = reportId ? `  // TMDB ID ${tmdbId} — Report ${reportId}` : `  // TMDB ID ${tmdbId}`;
    src = src.replace(
      /export const DMCA_DENIED_TMDB_IDS = new Set<number>\(\[/,
      `export const DMCA_DENIED_TMDB_IDS = new Set<number>([\n  ${tmdbId},${comment}`
    );
    modified = true;
    console.log(`  ✅ dmcaDenyList.ts: added TMDB ID ${tmdbId}`);
  } else if (tmdbId) {
    console.log(`  ℹ️  TMDB ID ${tmdbId} already in deny list`);
  }

  if (modified && !DRY_RUN) writeUtf8(DENY_LIST_PATH, src);
  return modified;
}

// ── functions/player.js updater ───────────────────────────────────────────────
function updatePlayerFunction(tmdbId) {
  if (!existsSync(PLAYER_FN_PATH)) return false;
  let src = readFile(PLAYER_FN_PATH);
  const idStr = String(tmdbId);
  if (src.includes(`'${idStr}'`)) {
    console.log(`  ℹ️  Player function already blocks ${tmdbId}`);
    return false;
  }
  // Insert into the Set literal
  src = src.replace(
    /const DMCA_BLOCKED_IDS = new Set\(\[/,
    `const DMCA_BLOCKED_IDS = new Set(['${idStr}', `
  );
  if (!DRY_RUN) writeUtf8(PLAYER_FN_PATH, src);
  console.log(`  ✅ functions/player.js: blocked ID ${tmdbId}`);
  return true;
}

// ── astro.config.mjs updater ──────────────────────────────────────────────────
function updateAstroConfig(slug) {
  if (!slug || !existsSync(ASTRO_CFG_PATH)) return false;
  let src = readFile(ASTRO_CFG_PATH);
  if (src.includes(`'${slug}'`)) {
    console.log(`  ℹ️  astro.config.mjs already has '${slug}'`);
    return false;
  }
  src = src.replace(
    /const DMCA_DENIED_SLUGS = new Set\(\[/,
    `const DMCA_DENIED_SLUGS = new Set([\n  '${slug}',`
  );
  if (!DRY_RUN) writeUtf8(ASTRO_CFG_PATH, src);
  console.log(`  ✅ astro.config.mjs: added '${slug}'`);
  return true;
}

// ── Audit log ─────────────────────────────────────────────────────────────────
function appendAuditLog(entry) {
  let log = [];
  if (existsSync(AUDIT_PATH)) { try { log = JSON.parse(readFile(AUDIT_PATH)); } catch {} }
  log.push({ ...entry, processedAt: new Date().toISOString() });
  if (!DRY_RUN) writeUtf8(AUDIT_PATH, JSON.stringify(log, null, 2));
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🛡️  NET27 Watch — DMCA Auto-Remove');
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`   Time: ${new Date().toISOString()}\n`);

  ensurePrivate();

  if (!existsSync(QUEUE_PATH)) {
    console.log('✅ No DMCA queue found. Nothing to process.\n');
    return;
  }

  let queue;
  try {
    queue = JSON.parse(readFile(QUEUE_PATH));
  } catch (e) {
    console.error('❌ Could not parse dmca-queue.json:', e.message);
    process.exitCode = 1;
    return;
  }

  const pending = queue.pending || [];
  if (pending.length === 0) {
    console.log('✅ Queue is empty. Nothing to remove.\n');
    return;
  }

  console.log(`📋 Processing ${pending.length} queued email(s)...\n`);

  const removedItems = [];
  const processed = [];

  for (const item of pending) {
    console.log(`📩 Processing notice from ${item.fromDomain ?? 'unknown'}`);
    console.log(`   Date:    ${item.date}`);
    console.log(`   Targets: ${item.targets?.length || 0}`);

    if (!item.targets || item.targets.length === 0) {
      console.log('   ⚠️  No targets — skipping (should be in manualReview)\n');
      processed.push({ ...item, processedAt: new Date().toISOString(), result: 'skipped-no-targets' });
      continue;
    }

    for (const target of item.targets) {
      const { slug, tmdbId, type } = target;
      let anyChange = false;

      if (slug) {
        anyChange = updateDenyList(slug, tmdbId, item.reportId) || anyChange;
        anyChange = updateAstroConfig(slug) || anyChange;
      }

      if (tmdbId) {
        anyChange = updatePlayerFunction(tmdbId) || anyChange;
        if (!slug) updateDenyList(null, tmdbId, item.reportId);
      }

      appendAuditLog({
        date: item.date,
        processedAt: new Date().toISOString(),
        source: item.fromDomain ?? null,
        reportId: item.reportId || null,
        messageId: item.messageId,
        type,
        slug: slug || null,
        tmdbId: tmdbId || null,
        action: DRY_RUN ? 'dry-run' : (anyChange ? 'removed' : 'already-removed'),
      });

      if (anyChange) removedItems.push({ slug, tmdbId, type, reportId: item.reportId });
    }

    processed.push({ ...item, processedAt: new Date().toISOString(), result: 'processed' });
    console.log('');
  }

  // Move pending → processed in queue
  if (!DRY_RUN) {
    queue.processed = [...(queue.processed || []), ...processed];
    queue.pending = [];
    writeUtf8(QUEUE_PATH, JSON.stringify(queue, null, 2));
  }

  // Body of the GitHub issue the workflow opens (never committed).
  if (!DRY_RUN && removedItems.length > 0) {
    writeUtf8(SUMMARY_PATH, removedItems.map(r =>
      `- ${r.type}: ${r.slug ? `/${r.type === 'show' ? 'shows' : 'movies'}/${r.slug}/` : 'player'} (TMDB ${r.tmdbId})${r.reportId ? ` — report ${r.reportId}` : ''}`).join('\n') + '\n');
  }

  console.log('═'.repeat(55));
  console.log(`📊 Summary:`);
  console.log(`   Emails processed: ${processed.length}`);
  console.log(`   Content removed:  ${removedItems.length} items`);

  if (removedItems.length > 0) {
    console.log('\n📋 Removed items:');
    removedItems.forEach(r => console.log(`   - ${r.type}: ${r.slug || 'player'} (TMDB ${r.tmdbId})`));
    console.log('\n⚠️  NEXT STEP: commit and push; the push rebuilds the site.');
  } else {
    console.log('\n✅ No new items to remove (already blocked or no-op).\n');
  }

  if (DRY_RUN) console.log('\n[DRY RUN] No actual changes made.\n');

  // Exit code 10 = new items removed = trigger rebuild in GitHub Actions
  if (removedItems.length > 0 && !DRY_RUN) process.exitCode = 10;
}

main().catch(err => { console.error('Fatal:', err.message); process.exitCode = 1; });