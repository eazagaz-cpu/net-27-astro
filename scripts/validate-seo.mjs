import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const DIST = 'dist';
let errors = 0;
let warnings = 0;
let checked = 0;

async function walkHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walkHtml(full);
    else if (entry.name === 'index.html') await checkSeo(full);
  }
}

async function checkSeo(filePath) {
  const html = await readFile(filePath, 'utf-8');
  checked++;
  const route = filePath.replace(DIST, '').replace(/[\\\/]index\.html$/, '/') || '/';

  if (!/<title>/.test(html)) {
    console.error(`  ERROR: Missing <title> in ${route}`);
    errors++;
  }

  if (!/<meta name="description"/.test(html)) {
    console.error(`  ERROR: Missing meta description in ${route}`);
    errors++;
  }

  if (!/<link rel="canonical"/.test(html)) {
    console.error(`  ERROR: Missing canonical in ${route}`);
    errors++;
  }

  if (!/<meta property="og:title"/.test(html)) {
    console.warn(`  WARN: Missing og:title in ${route}`);
    warnings++;
  }

  if (!/<meta property="og:description"/.test(html)) {
    console.warn(`  WARN: Missing og:description in ${route}`);
    warnings++;
  }

  if (!/<meta name="twitter:card"/.test(html)) {
    console.warn(`  WARN: Missing twitter:card in ${route}`);
    warnings++;
  }

  // Check for valid JSON-LD schema
  const schemaMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  if (schemaMatches) {
    for (const match of schemaMatches) {
      const json = match.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '');
      try {
        JSON.parse(json);
      } catch {
        console.error(`  ERROR: Invalid JSON-LD schema in ${route}`);
        errors++;
      }
    }
  }

  // Check H1 count
  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  if (h1Count === 0 && route !== '/') {
    console.warn(`  WARN: No H1 in ${route}`);
    warnings++;
  } else if (h1Count > 1) {
    console.warn(`  WARN: Multiple H1s (${h1Count}) in ${route}`);
    warnings++;
  }
}

console.log('=== SEO Validation ===\n');
try {
  await walkHtml(DIST);
  console.log(`\nChecked ${checked} pages`);
  console.log(`Errors: ${errors}`);
  console.log(`Warnings: ${warnings}`);
  if (errors > 0) {
    console.log('\nFAILED: Fix SEO errors');
    process.exit(1);
  }
  console.log('\nPASSED');
} catch (e) {
  console.error('Validation failed:', e.message);
  process.exit(1);
}
