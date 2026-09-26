/**
 * sponsor-guard.mjs — the rule that stops sponsor links vanishing silently.
 *
 * A link that is LIVE (in KV, or served by net27.watch) may only disappear if
 * src/data/sponsor-links.json says so explicitly, by listing it under
 * `removed`. Anything else — an agent editing the wrong file, a local KV push
 * that was never committed, a stale branch — would otherwise be erased by the
 * next CI run, which rewrites KV from the manifest four times a day.
 *
 * So instead of overwriting, every writer (push-sponsors.mjs) and the CI gate
 * (verify-links.mjs) compare the live lists with the manifest and refuse to
 * continue when a live link is unaccounted for.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const MANIFEST_PATH = join(ROOT, 'src', 'data', 'sponsor-links.json');

/** Same link regardless of scheme, "www.", case or trailing slash. */
export const normUrl = (u) => String(u ?? '').trim().toLowerCase()
  .replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');

export function loadManifest() {
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
}

/**
 * Writes the manifest after an edit, keeping the derived fields honest:
 * priorities follow array order, expectedCounts follow the enabled entries,
 * and manifestVersion becomes today's date plus a same-day counter.
 */
export function saveManifest(m) {
  for (const trail of [m.trail1, m.trail2]) trail.forEach((s, i) => { s.priority = i + 1; });
  const t1 = m.trail1.filter((s) => s.enabled !== false).length;
  const t2 = m.trail2.filter((s) => s.enabled !== false).length;
  m.expectedCounts = { trail1: t1, trail2: t2, total: t1 + t2 };
  const today = new Date().toISOString().slice(0, 10);
  const [, day, n] = String(m.manifestVersion ?? '').match(/^(\d{4}-\d{2}-\d{2})-(\d+)$/) ?? [];
  m.manifestVersion = `${today}-${String(day === today ? +n + 1 : 1).padStart(2, '0')}`;
  m.generatedAt = new Date().toISOString();
  writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 2) + '\n');
}

/** Minimal --key value parser shared by the add/remove scripts. */
export function parseArgs(argv = process.argv.slice(2)) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const next = argv[i + 1];
    out[argv[i].slice(2)] = next && !next.startsWith('--') ? (i++, next) : true;
  }
  return out;
}

/**
 * Live links that the manifest would drop without saying so.
 * @param {Array<{name?: string, id?: string, label?: string, url: string}>} live
 * @returns the offending live entries (empty array = safe)
 */
export function silentRemovals(live, manifest) {
  const kept = new Set([...manifest.trail1, ...manifest.trail2]
    .filter((s) => s.enabled !== false).map((s) => normUrl(s.url)));
  const removed = new Set((manifest.removed ?? []).map((r) => normUrl(r.url)));
  return (Array.isArray(live) ? live : [])
    .filter((s) => s?.url && !kept.has(normUrl(s.url)) && !removed.has(normUrl(s.url)));
}

/** Human-readable explanation, shared by every caller so the fix is always the same. */
export function explain(offenders, where) {
  const lines = offenders.map((s) => `     • ${s.label ?? s.name ?? s.id ?? '?'} → ${s.url}`);
  return [
    `❌ ${offenders.length} link(s) are LIVE in ${where} but missing from src/data/sponsor-links.json:`,
    ...lines,
    '',
    '   Proceeding would delete them from the site. Nothing was written.',
    '   Fix ONE of these in src/data/sponsor-links.json, then commit + push:',
    '     • keep it   → add it back:   npm run sponsors:add -- --url <url> ...',
    '     • remove it → ONLY if the user asked: npm run sponsors:remove -- --url <url>',
  ].join('\n');
}
