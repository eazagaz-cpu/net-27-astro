import { access } from 'fs/promises';
import { join } from 'path';

const DIST = 'dist';
let errors = 0;

const REQUIRED_ROUTES = [
  '/',
  '/blog/',
  '/movies/',
  '/shows/',
  '/anime/',
  '/trending/',
  '/latest/',
  '/search/',
  '/login/',
  '/player/',
  '/about/',
  '/contact/',
  '/privacy/',
  '/terms/',
  '/dmca/',
  '/app/download/',
  '/help/app-not-installed/',
  '/help/video-not-playing/',
  '/help/parsing-package-error/',
  '/genre/hindi-dubbed/',
  '/platform/netflix/',
  '/platform/prime-video/',
  '/platform/jiohotstar/',
  '/platform/sonyliv/',
  '/platform/crunchyroll/',
];

console.log('=== Route Validation ===\n');

for (const route of REQUIRED_ROUTES) {
  const filePath = join(DIST, route, 'index.html');
  try {
    await access(filePath);
    console.log(`  OK: ${route}`);
  } catch {
    console.error(`  MISSING: ${route}`);
    errors++;
  }
}

// Check special files
const SPECIAL_FILES = ['robots.txt', 'sitemap-index.xml', 'llms.txt', '_headers'];
console.log('\n--- Special Files ---');
for (const file of SPECIAL_FILES) {
  try {
    await access(join(DIST, file));
    console.log(`  OK: ${file}`);
  } catch {
    console.error(`  MISSING: ${file}`);
    errors++;
  }
}

console.log(`\nErrors: ${errors}`);
if (errors > 0) {
  console.log('\nFAILED: Missing routes/files');
  process.exit(1);
}
console.log('\nPASSED');
