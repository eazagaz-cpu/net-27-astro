import { readFile, access, stat } from 'fs/promises';

const DIST = 'dist';
let errors = 0;

console.log('=== OG Image Validation ===\n');

// Check og-image.png exists
try {
  const s = await stat(`${DIST}/og-image.png`);
  if (s.size > 0) {
    console.log(`  OK: og-image.png exists (${Math.round(s.size / 1024)}KB)`);
  } else {
    console.error('  ERROR: og-image.png is empty');
    errors++;
  }
} catch {
  console.error('  ERROR: og-image.png missing from dist');
  errors++;
}

// Check homepage HTML
try {
  const html = await readFile(`${DIST}/index.html`, 'utf-8');

  if (html.includes('og:image" content="https://net-27.cc/og-image.png"')) {
    console.log('  OK: homepage has correct og:image');
  } else if (html.includes('og:image')) {
    console.log('  WARN: homepage has og:image but may not use og-image.png');
  } else {
    console.error('  ERROR: homepage missing og:image');
    errors++;
  }

  if (html.includes('twitter:image" content="https://net-27.cc/og-image.png"')) {
    console.log('  OK: homepage has correct twitter:image');
  } else if (html.includes('twitter:image')) {
    console.log('  WARN: homepage has twitter:image but may not use og-image.png');
  } else {
    console.error('  ERROR: homepage missing twitter:image');
    errors++;
  }

  if (html.includes('og:image:width" content="1200"')) {
    console.log('  OK: og:image:width present');
  } else {
    console.error('  ERROR: missing og:image:width');
    errors++;
  }

  if (html.includes('og:image:height" content="630"')) {
    console.log('  OK: og:image:height present');
  } else {
    console.error('  ERROR: missing og:image:height');
    errors++;
  }

  // Check no wrong domains
  const ogMatches = html.match(/og:image.*?content="([^"]*)"/g) || [];
  for (const m of ogMatches) {
    if (m.includes('pages.dev')) { console.error('  ERROR: og:image uses pages.dev'); errors++; }
    if (m.includes('net27.cc/') && !m.includes('net-27.cc')) { console.error('  ERROR: og:image uses net27.cc'); errors++; }
  }

} catch (e) {
  console.error('  ERROR: Could not read homepage:', e.message);
  errors++;
}

// Check a few other pages
const pages = ['blog/index.html', 'movies/index.html', 'app/download/index.html'];
for (const page of pages) {
  try {
    const html = await readFile(`${DIST}/${page}`, 'utf-8');
    if (html.includes('og:image')) {
      console.log(`  OK: /${page.replace('/index.html', '/')} has og:image`);
    } else {
      console.error(`  ERROR: /${page.replace('/index.html', '/')} missing og:image`);
      errors++;
    }
  } catch {}
}

console.log(`\nErrors: ${errors}`);
if (errors > 0) {
  console.log('\nFAILED');
  process.exit(1);
}
console.log('\nPASSED');
