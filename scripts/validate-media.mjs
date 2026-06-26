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
    if (entry.isDirectory()) {
      await walkHtml(full);
    } else if (entry.name.endsWith('.html')) {
      await checkFile(full);
    }
  }
}

async function checkFile(filePath) {
  const html = await readFile(filePath, 'utf-8');
  checked++;

  // Check for empty src
  const emptySrc = html.match(/src=["']\s*["']/g);
  if (emptySrc) {
    console.error(`  ERROR: Empty image src in ${filePath} (${emptySrc.length} found)`);
    errors += emptySrc.length;
  }

  // Check for images without alt (important images)
  const imgNoAlt = html.match(/<img(?![^>]*alt=)[^>]*>/g);
  if (imgNoAlt) {
    console.warn(`  WARN: ${imgNoAlt.length} image(s) without alt in ${filePath}`);
    warnings += imgNoAlt.length;
  }

  // Check for broken local image references
  const localImgs = html.match(/src=["']\/images\/[^"']+["']/g);
  if (localImgs) {
    for (const match of localImgs) {
      const path = match.replace(/src=["']/, '').replace(/["']$/, '');
      try {
        await readFile(join(DIST, path));
      } catch {
        console.error(`  ERROR: Missing local image ${path} in ${filePath}`);
        errors++;
      }
    }
  }
}

console.log('=== Media Validation ===\n');
try {
  await walkHtml(DIST);
  console.log(`\nChecked ${checked} HTML files`);
  console.log(`Errors: ${errors}`);
  console.log(`Warnings: ${warnings}`);
  if (errors > 0) {
    console.log('\nFAILED: Fix errors above');
    process.exit(1);
  }
  console.log('\nPASSED');
} catch (e) {
  console.error('Validation failed:', e.message);
  process.exit(1);
}
