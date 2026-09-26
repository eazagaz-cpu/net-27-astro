/**
 * verify-dist-links.mjs — checks the BUILT homepages, i.e. what actually ships.
 *
 * Every enabled link in src/data/sponsor-links.json must be present as an
 * <a href> in the homepage HTML (all locales), and above "Top 10". This holds
 * no matter what the rail scripts, KV or ad-blockers do later, because the
 * rails are server-rendered from the manifest.
 *
 *   node scripts/verify-dist-links.mjs            (after `astro build`)
 *
 * Runs as `postbuild` and in CI between build and deploy; exit 1 blocks.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { ROOT, loadManifest } from './lib/sponsor-guard.mjs';

const DIST = join(ROOT, 'dist');
const m = loadManifest();
const links = [...m.trail1, ...m.trail2].filter((s) => s.enabled !== false);
const esc = (u) => u.replace(/&/g, '&amp;');

// Homepages: dist/index.html plus each locale's dist/<xx>/index.html.
const pages = ['index.html', ...readdirSync(DIST, { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^[a-z]{2}(-[a-z]{2})?$/i.test(d.name))
  .map((d) => join(d.name, 'index.html'))]
  .filter((p) => existsSync(join(DIST, p)));

let failed = 0;
for (const page of pages) {
  const html = readFileSync(join(DIST, page), 'utf8');
  // Top10Rail.astro's own section class — text like "Top 10" also appears in
  // <title>/meta and is translated per locale, so it is no marker.
  const top10 = html.search(/<section[^>]+class="[^"]*\btop10-section\b/);
  const missing = [];
  const below = [];
  for (const s of links) {
    const at = html.indexOf(`href="${esc(s.url)}"`);
    if (at === -1) missing.push(s.id);
    else if (top10 !== -1 && at > top10) below.push(s.id);
  }
  if (missing.length || below.length) {
    failed++;
    console.error(`❌ ${page}: ${missing.length ? `missing ${missing.join(', ')}` : ''}${below.length ? ` below Top 10: ${below.join(', ')}` : ''}`);
  }
}

if (!pages.length) {
  console.error('❌ No built homepage found in dist/ — run astro build first.');
  process.exit(1);
}
if (failed) {
  console.error(`\n❌ Sponsor links missing from ${failed}/${pages.length} built homepage(s). Deploy blocked.`);
  process.exitCode = 1;
} else {
  console.log(`✅ All ${links.length} sponsor links are in the HTML above Top 10 on ${pages.length} homepage(s).`);
}
