import { readFile, access } from 'fs/promises';

const DIST = 'dist';
let errors = 0;

console.log('=== Sitemap Validation ===\n');

// Check sitemap files exist
const indexPath = `${DIST}/sitemap-index.xml`;
const childPath = `${DIST}/sitemap-0.xml`;
const robotsPath = `${DIST}/robots.txt`;

try {
  await access(indexPath);
  console.log('  OK: sitemap-index.xml exists');
} catch {
  console.error('  ERROR: sitemap-index.xml missing');
  errors++;
}

try {
  await access(childPath);
  console.log('  OK: sitemap-0.xml exists');
} catch {
  console.error('  ERROR: sitemap-0.xml missing');
  errors++;
}

// Validate sitemap-index.xml content
try {
  const indexXml = await readFile(indexPath, 'utf-8');

  if (indexXml.includes('net-27.cc/sitemap-0.xml')) {
    console.log('  OK: sitemap-index references sitemap-0.xml correctly');
  } else {
    console.error('  ERROR: sitemap-index does not reference sitemap-0.xml');
    errors++;
  }

  if (indexXml.includes('net27.cc') && !indexXml.includes('net-27.cc')) {
    console.error('  ERROR: sitemap-index contains net27.cc (no hyphen)');
    errors++;
  }

  if (indexXml.includes('pages.dev')) {
    console.error('  ERROR: sitemap-index contains pages.dev');
    errors++;
  }

  if (indexXml.includes('www.net-27.cc')) {
    console.error('  ERROR: sitemap-index contains www.net-27.cc');
    errors++;
  }

  if (indexXml.includes('<html') || indexXml.includes('<!DOCTYPE')) {
    console.error('  ERROR: sitemap-index contains HTML (might be 404 page)');
    errors++;
  }
} catch (e) {
  console.error('  ERROR: Could not read sitemap-index.xml:', e.message);
  errors++;
}

// Validate sitemap-0.xml content
try {
  const childXml = await readFile(childPath, 'utf-8');
  const urlCount = (childXml.match(/<loc>/g) || []).length;
  console.log(`  OK: sitemap-0.xml contains ${urlCount} URLs`);

  if (urlCount === 0) {
    console.error('  ERROR: sitemap-0.xml has 0 URLs');
    errors++;
  }

  if (!childXml.includes('https://net-27.cc/')) {
    console.error('  ERROR: sitemap-0.xml does not contain https://net-27.cc/');
    errors++;
  }

  const wrongDomains = [
    { pattern: 'net27.cc/', label: 'net27.cc (no hyphen)' },
    { pattern: 'pages.dev', label: 'pages.dev' },
    { pattern: 'www.net-27.cc', label: 'www.net-27.cc' },
  ];

  for (const { pattern, label } of wrongDomains) {
    if (childXml.includes(pattern) && !childXml.includes('net-27.cc')) {
      console.error(`  ERROR: sitemap-0.xml contains ${label}`);
      errors++;
    }
  }

  if (childXml.includes('/api/')) {
    console.error('  ERROR: sitemap-0.xml contains /api/ URLs');
    errors++;
  }

  if (childXml.includes('<html') || childXml.includes('<!DOCTYPE')) {
    console.error('  ERROR: sitemap-0.xml contains HTML');
    errors++;
  }
} catch (e) {
  console.error('  ERROR: Could not read sitemap-0.xml:', e.message);
  errors++;
}

// Validate robots.txt
try {
  const robots = await readFile(robotsPath, 'utf-8');

  if (robots.includes('sitemap-index.xml')) {
    console.log('  OK: robots.txt references sitemap-index.xml');
  } else if (robots.includes('sitemap.xml')) {
    console.log('  OK: robots.txt references sitemap.xml');
  } else {
    console.error('  ERROR: robots.txt does not reference any sitemap');
    errors++;
  }

  if (robots.includes('sitemap_index')) {
    console.error('  ERROR: robots.txt contains underscore sitemap_index');
    errors++;
  }

  if (robots.includes('www.net-27')) {
    console.error('  ERROR: robots.txt contains www');
    errors++;
  }

  if (robots.includes('pages.dev')) {
    console.error('  ERROR: robots.txt contains pages.dev');
    errors++;
  }
} catch (e) {
  console.error('  ERROR: Could not read robots.txt:', e.message);
  errors++;
}

console.log(`\nErrors: ${errors}`);
if (errors > 0) {
  console.log('\nFAILED');
  process.exit(1);
}
console.log('\nPASSED');
