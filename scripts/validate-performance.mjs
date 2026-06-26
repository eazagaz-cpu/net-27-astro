import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const DIST = 'dist';
let warnings = 0;
let errors = 0;

const MAX_JS_SIZE = 300 * 1024; // 300KB per chunk
const MAX_CSS_SIZE = 200 * 1024;
const MAX_HTML_SIZE = 500 * 1024;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

async function checkAssets() {
  console.log('--- JS Bundles ---');
  try {
    const astroDir = join(DIST, '_astro');
    const files = await readdir(astroDir);
    let totalJs = 0;
    let totalCss = 0;

    for (const file of files) {
      const s = await stat(join(astroDir, file));
      const sizeKb = Math.round(s.size / 1024);

      if (file.endsWith('.js')) {
        totalJs += s.size;
        const status = s.size > MAX_JS_SIZE ? 'WARN' : 'OK';
        if (s.size > MAX_JS_SIZE) warnings++;
        console.log(`  ${status}: ${file} (${sizeKb}KB)`);
      } else if (file.endsWith('.css')) {
        totalCss += s.size;
        const status = s.size > MAX_CSS_SIZE ? 'WARN' : 'OK';
        if (s.size > MAX_CSS_SIZE) warnings++;
        console.log(`  ${status}: ${file} (${sizeKb}KB)`);
      }
    }

    console.log(`\n  Total JS: ${Math.round(totalJs / 1024)}KB`);
    console.log(`  Total CSS: ${Math.round(totalCss / 1024)}KB`);
  } catch (e) {
    console.error('  Could not read _astro directory:', e.message);
    errors++;
  }
}

async function checkImages() {
  console.log('\n--- Local Images ---');
  try {
    const imgDir = join(DIST, 'images');
    const files = await readdir(imgDir).catch(() => []);
    if (files.length === 0) {
      console.log('  No local images directory (using remote TMDB)');
      return;
    }
    for (const file of files) {
      const s = await stat(join(imgDir, file));
      if (s.size > MAX_IMAGE_SIZE) {
        console.warn(`  WARN: Large image ${file} (${Math.round(s.size / 1024)}KB)`);
        warnings++;
      }
    }
  } catch {
    console.log('  No local images directory');
  }
}

async function checkHtmlSizes() {
  console.log('\n--- HTML Page Sizes ---');
  let largest = { file: '', size: 0 };
  let count = 0;

  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name === 'index.html') {
        const s = await stat(full);
        count++;
        if (s.size > largest.size) largest = { file: full, size: s.size };
        if (s.size > MAX_HTML_SIZE) {
          console.warn(`  WARN: Large HTML ${full.replace(DIST, '')} (${Math.round(s.size / 1024)}KB)`);
          warnings++;
        }
      }
    }
  }

  await walk(DIST);
  console.log(`  Total pages: ${count}`);
  console.log(`  Largest: ${largest.file.replace(DIST, '')} (${Math.round(largest.size / 1024)}KB)`);
}

console.log('=== Performance Validation ===\n');
try {
  await checkAssets();
  await checkImages();
  await checkHtmlSizes();

  console.log(`\nWarnings: ${warnings}`);
  console.log(`Errors: ${errors}`);
  if (errors > 0) {
    console.log('\nFAILED');
    process.exit(1);
  }
  console.log('\nPASSED');
} catch (e) {
  console.error('Validation failed:', e.message);
  process.exit(1);
}
