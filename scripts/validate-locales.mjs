/**
 * validate-locales.mjs — keeps the two locale trees from drifting apart.
 *
 * Translations live in two places and neither generates the other:
 *
 *   src/i18n/locales/  — imported at build time, renders into the HTML
 *   public/locales/    — fetched by the browser at runtime, and what
 *                        BaseLayout hands to `data-t` nodes and window.__nmT
 *
 * A key added to one and not the other looks completely fine in review and in
 * the build, and simply never reaches users. That is not hypothetical: the
 * watchlist button's labels were translated into all nineteen locales, landed
 * in src/i18n/locales only, and stayed English on the site because the browser
 * reads the other tree.
 *
 * This runs off the source, not dist, so it does not need a build first.
 */
import { readdir, readFile } from 'fs/promises';

const SRC = 'src/i18n/locales';
const PUB = 'public/locales';

let errors = 0;
const bad = (m) => { console.error(`  ERROR: ${m}`); errors++; };

console.log('=== Locale Parity Validation ===\n');

const jsonFiles = (names) => names.filter((f) => f.endsWith('.json')).sort();
const srcFiles = jsonFiles(await readdir(SRC));
const pubFiles = jsonFiles(await readdir(PUB));

for (const f of srcFiles) if (!pubFiles.includes(f)) bad(`${PUB}/${f} is missing`);
for (const f of pubFiles) if (!srcFiles.includes(f)) bad(`${SRC}/${f} is missing`);

/** Dotted paths of every string in the tree. */
function keyPaths(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? keyPaths(v, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );
}

for (const file of srcFiles) {
  if (!pubFiles.includes(file)) continue;
  const lang = file.replace('.json', '');

  let src, pub;
  try {
    src = JSON.parse(await readFile(`${SRC}/${file}`, 'utf-8'));
    pub = JSON.parse(await readFile(`${PUB}/${file}`, 'utf-8'));
  } catch (e) {
    bad(`${lang}: invalid JSON — ${e.message}`);
    continue;
  }

  const inSrc = new Set(keyPaths(src));
  const inPub = new Set(keyPaths(pub));

  const onlySrc = [...inSrc].filter((k) => !inPub.has(k));
  const onlyPub = [...inPub].filter((k) => !inSrc.has(k));

  if (onlySrc.length) {
    bad(`${lang}: ${onlySrc.length} key(s) in ${SRC} but not ${PUB} — these never reach the browser: ${onlySrc.slice(0, 5).join(', ')}`);
  }
  if (onlyPub.length) {
    bad(`${lang}: ${onlyPub.length} key(s) in ${PUB} but not ${SRC} — these never render server-side: ${onlyPub.slice(0, 5).join(', ')}`);
  }

  const empty = [...inSrc].filter((k) => {
    const value = k.split('.').reduce((o, part) => o?.[part], src);
    return typeof value === 'string' && value.trim() === '';
  });
  if (empty.length) bad(`${lang}: empty string(s) at ${empty.slice(0, 5).join(', ')}`);

  if (!onlySrc.length && !onlyPub.length && !empty.length) {
    console.log(`  OK: ${lang} (${inSrc.size} keys, both trees)`);
  }
}

console.log(`\nErrors: ${errors}`);
if (errors > 0) {
  console.log('\nFAILED');
  process.exit(1);
}
console.log('\nPASSED');
