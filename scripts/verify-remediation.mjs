import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

console.log('=== REMEDIATION VERIFICATION AUDIT ===\n');

// 1. Files in dist
const distChecks = [
  'dist/movies/spider-man-brand-new-day-969681/index.html',
  'dist/movies/the-death-of-robin-hood-1284465/index.html',
  'dist/movies/ice-cream-man-1477712/index.html',
  'dist/hi/movies/spider-man-brand-new-day-969681/index.html',
  'dist/hi/movies/the-death-of-robin-hood-1284465/index.html',
  'dist/es/movies/spider-man-brand-new-day-969681/index.html',
  'dist/ur/movies/the-death-of-robin-hood-1284465/index.html',
];

let distClean = true;
for (const c of distChecks) {
  const exists = existsSync(join(ROOT, c));
  if (exists) {
    console.log(`❌ FAILED: ${c} exists!`);
    distClean = false;
  } else {
    console.log(`✅ VERIFIED: ${c} does NOT exist (genuine 404)`);
  }
}

// 2. Sitemap checks
const sitemapPath = join(ROOT, 'dist', 'sitemap.xml');
const sitemap0Path = join(ROOT, 'dist', 'sitemap-0.xml');
const sitemapContent = readFileSync(sitemapPath, 'utf8');
const sitemap0Content = readFileSync(sitemap0Path, 'utf8');

const dmcaTerms = [
  '969681',
  '1284465',
  '1477712',
  'spider-man-brand-new-day',
  'the-death-of-robin-hood',
  'ice-cream-man',
];

let sitemapClean = true;
for (const term of dmcaTerms) {
  const inSitemap = sitemapContent.includes(term);
  const inSitemap0 = sitemap0Content.includes(term);
  if (inSitemap || inSitemap0) {
    console.log(`❌ FAILED: term "${term}" found in sitemap!`);
    sitemapClean = false;
  } else {
    console.log(`✅ VERIFIED: term "${term}" absent from sitemaps`);
  }
}

// 3. Search index checks
const searchIndexPath = join(ROOT, 'dist', 'search-index.json');
const searchIndexContent = readFileSync(searchIndexPath, 'utf8');
let searchClean = true;
for (const term of dmcaTerms) {
  if (searchIndexContent.includes(term)) {
    console.log(`❌ FAILED: term "${term}" found in search-index.json!`);
    searchClean = false;
  } else {
    console.log(`✅ VERIFIED: term "${term}" absent from search-index.json`);
  }
}

// 4. Popunder / Sortallav checks in dist
const distFiles = [
  'dist/index.html',
  'dist/_headers',
  'dist/_redirects',
  'dist/robots.txt',
];

let popunderClean = true;
const badTerms = ['sortallav', 'profiton'];
for (const df of distFiles) {
  if (existsSync(join(ROOT, df))) {
    const content = readFileSync(join(ROOT, df), 'utf8');
    for (const b of badTerms) {
      if (content.toLowerCase().includes(b)) {
        console.log(`❌ FAILED: "${b}" found in ${df}!`);
        popunderClean = false;
      }
    }
  }
}
if (popunderClean) {
  console.log('✅ VERIFIED: zero occurrences of sortallav/profiton in dist assets');
}

console.log('\n=== SUMMARY ===');
console.log(`Dist Clean:     ${distClean ? 'PASSED' : 'FAILED'}`);
console.log(`Sitemap Clean:  ${sitemapClean ? 'PASSED' : 'FAILED'}`);
console.log(`Search Clean:   ${searchClean ? 'PASSED' : 'FAILED'}`);
console.log(`Popunder Clean: ${popunderClean ? 'PASSED' : 'FAILED'}`);

process.exit(distClean && sitemapClean && searchClean && popunderClean ? 0 : 1);
