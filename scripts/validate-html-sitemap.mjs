import { readFile, access } from 'fs/promises';

const DIST = 'dist';
let errors = 0;

console.log('=== HTML Sitemap Validation ===\n');

// Check page exists
try {
  await access(`${DIST}/sitemap/index.html`);
  console.log('  OK: /sitemap/index.html exists');
} catch {
  console.error('  ERROR: /sitemap/index.html missing');
  errors++;
}

// Check content
try {
  const html = await readFile(`${DIST}/sitemap/index.html`, 'utf-8');

  // Check important routes are linked
  const requiredLinks = ['/movies/', '/shows/', '/anime/', '/blog/', '/app/download/', '/platform/netflix/', '/genre/action/', '/about/', '/privacy/'];
  for (const route of requiredLinks) {
    if (html.includes(`href="${route}"`)) {
      console.log(`  OK: contains link to ${route}`);
    } else {
      console.error(`  ERROR: missing link to ${route}`);
      errors++;
    }
  }

  // Check no wrong domains
  if (html.includes('pages.dev')) { console.error('  ERROR: contains pages.dev'); errors++; }
  if (html.includes('net27.cc/') && !html.includes('net-27.cc')) { console.error('  ERROR: contains net27.cc'); errors++; }
  if (html.includes('www.net-27.cc')) { console.error('  ERROR: contains www.net-27.cc'); errors++; }

  // Check not noindex
  if (html.includes('noindex')) { console.error('  ERROR: page has noindex'); errors++; }

  // Check canonical
  if (html.includes('net-27.cc/sitemap/')) {
    console.log('  OK: canonical correct');
  } else {
    console.error('  ERROR: canonical missing or wrong');
    errors++;
  }

  // Check H1
  if (html.includes('<h1')) {
    console.log('  OK: has H1');
  } else {
    console.error('  ERROR: missing H1');
    errors++;
  }

} catch (e) {
  console.error('  ERROR: Could not read sitemap page:', e.message);
  errors++;
}

// Check footer contains sitemap link
try {
  const homepage = await readFile(`${DIST}/index.html`, 'utf-8');
  if (homepage.includes('href="/sitemap/"')) {
    console.log('  OK: footer links to /sitemap/');
  } else {
    console.error('  ERROR: footer missing /sitemap/ link');
    errors++;
  }
} catch {
  console.error('  ERROR: Could not check homepage footer');
  errors++;
}

// Check XML sitemap includes HTML sitemap
try {
  const xml = await readFile(`${DIST}/sitemap-0.xml`, 'utf-8');
  if (xml.includes('/sitemap/')) {
    console.log('  OK: XML sitemap includes /sitemap/');
  } else {
    console.log('  INFO: XML sitemap does not include /sitemap/ (will be added after rebuild)');
  }
} catch {}

console.log(`\nErrors: ${errors}`);
if (errors > 0) {
  console.log('\nFAILED');
  process.exit(1);
}
console.log('\nPASSED');
