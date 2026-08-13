/**
 * validate-blog-i18n.mjs — checks the localized blog against the traps that
 * come with translating articles one at a time.
 *
 * 1. Every internal link inside a localized article resolves to a built page.
 *    Translations rewrite hrefs to /hi/… by hand, and a locale prefix on a
 *    route that was never generated is an easy mistake to make.
 * 2. Table-of-contents anchors match a heading id in the translated body. The
 *    ids stay English while the titles are translated, so a typo silently
 *    produces a jump link that goes nowhere.
 * 3. No English body prose survives on a localized article.
 * 4. hreflang on an article names exactly the locales that have it.
 */
import { readdir, readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const DIST = 'dist';
const LOCALES = ['hi', 'ur', 'bn'];
let errors = 0;
let warnings = 0;
let checked = 0;

const bad = (m) => { console.error(`  ERROR: ${m}`); errors++; };
const warn = (m) => { console.warn(`  WARN:  ${m}`); warnings++; };

/** Article body only — links in the shared header and footer are not our concern. */
function articleBody(html) {
  const m = html.match(/<div class="blog-content"[\s\S]*?(?=<div class="mt-10 pt-6)/);
  return m ? m[0] : '';
}

function mainBlock(html) {
  const m = html.match(/<main[\s\S]*?<\/main>/);
  if (!m) return '';
  return m[0]
    .replace(/<(script|style|svg)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ');
}

/** A built page exists for this site-relative path. */
function pageExists(path) {
  const rel = path.replace(/^\//, '').replace(/\/$/, '');
  if (!rel) return existsSync(join(DIST, 'index.html'));
  return existsSync(join(DIST, rel, 'index.html')) || existsSync(join(DIST, `${rel}.html`));
}

/** English strings that must not survive on a localized article. */
const LEAK = [
  'By NetMirror Editorial',
  'Frequently Asked Questions',
  'Related Articles',
  'Quick Answer',
  'Table of Contents',
  'does not host, store, or distribute any media content',
];

console.log('=== Localized blog validation ===\n');

for (const lang of LOCALES) {
  const dir = join(DIST, lang, 'blog');
  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    console.log(`  ${lang}: no localized blog (nothing translated yet)`);
    continue;
  }

  const slugs = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    if ((await stat(full)).isDirectory()) slugs.push(entry);
  }
  console.log(`  ${lang}: ${slugs.length} article(s)`);

  for (const slug of slugs) {
    const file = join(dir, slug, 'index.html');
    const html = await readFile(file, 'utf-8');
    const where = `/${lang}/blog/${slug}/`;
    checked++;

    // 1. internal links resolve
    const body = articleBody(html);
    for (const m of body.matchAll(/href="(\/[^"#?]*)"/g)) {
      if (!pageExists(m[1])) bad(`${where} links to ${m[1]} which has no built page`);
    }

    // 2. toc anchors have a matching heading id
    const ids = new Set([...body.matchAll(/<h[2-4][^>]*\bid="([^"]+)"/g)].map(m => m[1]));
    const toc = [...html.matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
    for (const anchor of new Set(toc)) {
      // "faqs" is rendered by the FAQ component, outside the article body.
      if (anchor === 'faqs') continue;
      if (!ids.has(anchor)) bad(`${where} toc anchor #${anchor} matches no heading id`);
    }

    // 3. no English prose
    const text = mainBlock(html);
    for (const phrase of LEAK) {
      if (text.includes(phrase)) bad(`${where} still shows English: "${phrase}"`);
    }

    // 4. hreflang names exactly the locales that have this article
    const present = LOCALES.filter(code => existsSync(join(DIST, code, 'blog', slug, 'index.html')));
    const want = ['x-default', 'en', ...present].join(',');
    const got = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map(m => m[1]).join(',');
    if (got !== want) bad(`${where} hreflang is [${got}], expected [${want}]`);
  }
}

// The English index must still list every article, translated or not.
const englishArticles = (await readdir(join(DIST, 'blog'), { withFileTypes: true }))
  .filter(e => e.isDirectory()).length;
const indexHtml = await readFile(join(DIST, 'blog', 'index.html'), 'utf-8');
const linked = new Set([...indexHtml.matchAll(/href="\/blog\/([^/"]+)\//g)].map(m => m[1]));
if (linked.size !== englishArticles) {
  warn(`English index links ${linked.size} of ${englishArticles} articles`);
}

console.log(`\nArticles checked: ${checked}`);
console.log(`Errors: ${errors}`);
console.log(`Warnings: ${warnings}`);

if (errors > 0) {
  console.log('\nFAILED');
  process.exit(1);
}
console.log('\nPASSED');
