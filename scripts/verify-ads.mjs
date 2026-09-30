/**
 * verify-ads.mjs — the ad tags must ship. Runs after `astro build` (postbuild,
 * and in CI between build and deploy); exit 1 blocks the deploy.
 *
 * Ad tags here used to "remove themselves": a tag added outside git, dropped
 * by an unrelated edit, or overwritten by a deploy from the old net27.watch
 * repo, and nothing noticed. This checks the built output against
 * src/data/ads.json:
 *
 *   - RollerAds: SDK tag on the homepage and a title page, its service worker
 *     file, and a CSP that allows its host (a blocked tag looks the same as a
 *     missing one);
 *   - public/_headers values stay under Cloudflare's 2,000-character limit.
 *
 * Adsterra was removed on 2026-10-01 at the owner's request (low CPM).
 * The same checks run against the live site hourly (scripts/sponsor-watchdog.mjs).
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const { rollerads } = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'ads.json'), 'utf8'));

const problems = [];
const need = (ok, msg) => { if (!ok) problems.push(msg); };

export function adTagProblems(html, where) {
  return html.includes(rollerads.sdkScript) ? [] : [`${where}: RollerAds SDK tag missing`];
}

/** The policy in a page's <meta http-equiv="Content-Security-Policy"> tag ('' when absent). */
export function metaCsp(html) {
  const m = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/i);
  return m ? m[1].replace(/&#39;/g, "'").replace(/&amp;/g, '&') : '';
}

/** Directives of the site-wide policy that would block the RollerAds host. */
export function cspProblems(csp, where) {
  const out = [];
  for (const d of ['script-src', 'connect-src']) {
    const value = (csp.match(new RegExp(`${d} ([^;]*)`)) || [])[1] || '';
    if (!value.split(/\s+/).includes(rollerads.cspHost)) out.push(`${where}: CSP ${d} blocks ${rollerads.cspHost}`);
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

  // The resource policy is a <meta> tag (src/lib/csp.ts), not a header.
  problems.push(...cspProblems(metaCsp(homeHtml), 'homepage <meta> CSP'));

  // Cloudflare Pages silently drops any _headers value over 2,000 characters;
  // a CSP that long left the whole site with no policy on 2026-09-29.
  const headers = readFileSync(join(ROOT, 'public', '_headers'), 'utf8');
  headers.split(/\r?\n/).forEach((line, i) => {
    const value = line.match(/^\s+[A-Za-z-]+:\s*(.*)$/)?.[1] ?? '';
    if (value.length > 2000) problems.push(`public/_headers line ${i + 1}: value is ${value.length} chars; Cloudflare drops values over 2,000`);
  });

  need(existsSync(join(DIST, rollerads.serviceWorker)), `dist/${rollerads.serviceWorker} missing (RollerAds service worker)`);

  if (problems.length) {
    console.error('❌ Ad tags would not work after this deploy:');
    for (const p of problems) console.error(`   • ${p}`);
    console.error('   Keys/hosts: src/data/ads.json · RollerAds tag: src/layouts/BaseLayout.astro · CSP: src/lib/csp.ts');
    process.exitCode = 1;
  } else {
    console.log('✅ Ads: RollerAds tag and service worker present; CSP allows its host.');
  }
}
