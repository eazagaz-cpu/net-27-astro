/**
 * validate-csp.mjs — checks every third-party script the site loads against the
 * Content-Security-Policy it ships.
 *
 * A blocked ad or analytics tag is invisible from the outside: the tag is in the
 * HTML, the vendor's server answers 200, and the page looks fine — the browser
 * just refuses to run it, and the revenue or the data quietly never arrives.
 * That is exactly how the ProfitON popunder shipped broken. This catches it at
 * build time instead.
 */
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

const DIST = 'dist';
let errors = 0;

/** Reads the site-wide script-src from _headers. */
async function scriptSrc() {
  const headers = await readFile(join(DIST, '_headers'), 'utf-8');
  const csp = headers.match(/Content-Security-Policy:\s*(.+)/)?.[1];
  if (!csp) throw new Error('no Content-Security-Policy in dist/_headers');
  const directive = csp.split(';').map(s => s.trim()).find(s => s.startsWith('script-src'));
  if (!directive) throw new Error('no script-src directive');
  return directive.replace('script-src', '').trim().split(/\s+/);
}

/** Does `origin` satisfy any source in the allowlist? */
function allowed(origin, sources) {
  return sources.some(src => {
    if (src === "'self'" || src.startsWith("'")) return false;
    const clean = src.replace(/^https?:\/\//, '');
    if (clean.startsWith('*.')) {
      const suffix = clean.slice(1); // ".example.com"
      return origin.endsWith(suffix);
    }
    return origin === clean;
  });
}

/** Collects external script hosts from a sample of built pages. */
async function sampleHosts() {
  const pages = [
    'index.html',
    'movies/index.html',
    'movies/12th-fail-1163258/index.html',
    'player/index.html',
    'app/download/index.html',
    'blog/index.html',
    'hi/index.html',
    'hi/blog/what-is-netmirror/index.html',
    'privacy/index.html',
  ];
  const found = new Map(); // host -> pages it appears on
  for (const page of pages) {
    let html;
    try {
      html = await readFile(join(DIST, page), 'utf-8');
    } catch {
      continue;
    }
    for (const m of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
      const raw = m[1];
      if (raw.startsWith('/') && !raw.startsWith('//')) continue; // first-party
      const url = raw.startsWith('//') ? `https:${raw}` : raw;
      let host;
      try {
        host = new URL(url).host;
      } catch {
        continue;
      }
      if (!found.has(host)) found.set(host, []);
      found.get(host).push(page);
    }
  }
  return found;
}

console.log('=== CSP vs third-party scripts ===\n');

const sources = await scriptSrc();
console.log(`  script-src allows ${sources.filter(s => !s.startsWith("'")).length} external origin(s)\n`);

const hosts = await sampleHosts();
if (hosts.size === 0) console.log('  no external scripts found in the sampled pages');

for (const [host, pages] of [...hosts].sort()) {
  if (allowed(host, sources)) {
    console.log(`  OK    ${host}`);
  } else {
    console.error(`  ERROR ${host} is loaded but not in script-src — the browser will block it`);
    console.error(`        seen on: ${pages.slice(0, 3).join(', ')}${pages.length > 3 ? ` (+${pages.length - 3})` : ''}`);
    errors++;
  }
}

// An allowlisted origin nobody loads any more is dead weight in the policy.
const loaded = new Set(hosts.keys());
for (const src of sources.filter(s => !s.startsWith("'"))) {
  const clean = src.replace(/^https?:\/\//, '');
  if (clean.startsWith('*.')) continue;
  if (![...loaded].some(h => h === clean)) {
    console.log(`  note  ${clean} is allowed but not loaded on the sampled pages`);
  }
}

console.log(`\nErrors: ${errors}`);
if (errors > 0) {
  console.log('\nFAILED: a script the site loads would be blocked at runtime');
  process.exit(1);
}
console.log('\nPASSED');
