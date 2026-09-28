/**
 * verify-ads.mjs — the ad tags must ship. Runs after `astro build` (postbuild,
 * and in CI between build and deploy); exit 1 blocks the deploy.
 *
 * The owner reported Adsterra tags "removing themselves" more than once. Here
 * that happened because nothing noticed: a tag added outside git, or dropped
 * by an unrelated edit, or overwritten by a deploy from the old net27.watch
 * repo. This checks the built output against src/data/ads.json:
 *
 *   - homepage and a title page carry the Adsterra loader (banner key, banner
 *     script, Social Bar script) and at least one banner slot;
 *   - the CSP in public/_headers allows every Adsterra host — without that
 *     the tags are present but silently blocked, which looks the same;
 *   - RollerAds: SDK tag on the homepage and its service worker file.
 *
 * The same checks run against the live site hourly (scripts/sponsor-watchdog.mjs).
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const ads = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'ads.json'), 'utf8'));
const { adsterra, rollerads } = ads;

const problems = [];
const need = (ok, msg) => { if (!ok) problems.push(msg); };

export function adTagProblems(html, where, { expectSlot = true } = {}) {
  const out = [];
  if (!html.includes(adsterra.bannerKey)) out.push(`${where}: Adsterra banner key missing`);
  if (!html.includes(adsterra.bannerScript)) out.push(`${where}: Adsterra banner script missing`);
  if (!html.includes(adsterra.socialBarScript)) out.push(`${where}: Adsterra Social Bar script missing`);
  if (expectSlot && !html.includes('data-adsterra-banner')) out.push(`${where}: no Adsterra banner slot`);
  return out;
}

/** Hosts from ads.json missing from one CSP directive of the site-wide policy. */
export function cspProblems(csp, where) {
  const out = [];
  for (const d of ['script-src', 'frame-src', 'connect-src']) {
    const value = (csp.match(new RegExp(`${d} ([^;]*)`)) || [])[1] || '';
    const missing = adsterra.cspHosts.filter(h => !value.split(/\s+/).includes(h));
    if (missing.length) out.push(`${where}: CSP ${d} blocks ${missing.join(' ')}`);
  }
  return out;
}

if (process.argv[1] && process.argv[1].endsWith('verify-ads.mjs')) {
  const home = join(DIST, 'index.html');
  if (!existsSync(home)) {
    console.error('❌ dist/index.html not found — run astro build first.');
    process.exit(1);
  }
  const homeHtml = readFileSync(home, 'utf8');
  problems.push(...adTagProblems(homeHtml, 'homepage'));

  const movieDir = join(DIST, 'movies');
  const slug = existsSync(movieDir) && readdirSync(movieDir).find(d => existsSync(join(movieDir, d, 'index.html')));
  if (slug) problems.push(...adTagProblems(readFileSync(join(movieDir, slug, 'index.html'), 'utf8'), `/movies/${slug}/`));
  else problems.push('no built movie page to check');

  // The site-wide policy is the first CSP in _headers (the "/*" rule).
  const headers = readFileSync(join(ROOT, 'public', '_headers'), 'utf8');
  const csp = (headers.match(/^\s*Content-Security-Policy:\s*(.*)$/m) || [])[1] || '';
  problems.push(...cspProblems(csp, 'public/_headers'));

  need(homeHtml.includes(rollerads.sdkScript), 'homepage: RollerAds SDK tag missing');
  need(existsSync(join(DIST, rollerads.serviceWorker)), `dist/${rollerads.serviceWorker} missing (RollerAds service worker)`);

  if (problems.length) {
    console.error('❌ Ad tags would not work after this deploy:');
    for (const p of problems) console.error(`   • ${p}`);
    console.error('   Keys/hosts: src/data/ads.json · loader: src/layouts/BaseLayout.astro · CSP: public/_headers');
    process.exitCode = 1;
  } else {
    console.log(`✅ Ads: Adsterra banner + Social Bar and RollerAds present; CSP allows all ${adsterra.cspHosts.length} Adsterra hosts.`);
  }
}
