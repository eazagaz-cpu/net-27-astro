import { readFile, access } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DIST = 'dist';
let errors = 0;
let sitemapUrls = [];

const decodeXml = (value) => value
  .replaceAll('&amp;', '&')
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .replaceAll('&quot;', '"')
  .replaceAll('&apos;', "'");

function outputFileForUrl(url) {
  const pathname = new URL(url).pathname;
  const relative = decodeURIComponent(pathname).replace(/^\/+/, '');
  const candidates = pathname === '/'
    ? [path.join(DIST, 'index.html')]
    : [
        path.join(DIST, relative, 'index.html'),
        path.join(DIST, relative),
        path.join(DIST, `${relative}.html`),
      ];
  return candidates.find((candidate) => existsSync(candidate));
}

console.log('=== Sitemap Validation ===\n');

// Check sitemap files exist
const indexPath = `${DIST}/sitemap-index.xml`;
const childPath = `${DIST}/sitemap-0.xml`;
const directPath = `${DIST}/sitemap.xml`;
const robotsPath = `${DIST}/robots.txt`;
const headersPath = `${DIST}/_headers`;

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

try {
  await access(directPath);
  console.log('  OK: sitemap.xml exists');
} catch {
  console.error('  ERROR: sitemap.xml missing');
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
  const directXml = await readFile(directPath, 'utf-8');

  if (directXml !== childXml) {
    console.error('  ERROR: sitemap.xml is not the generated direct URL set');
    errors++;
  } else {
    console.log('  OK: sitemap.xml is a direct generated URL set');
  }

  sitemapUrls = [...childXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => decodeXml(match[1].trim()));
  const urlCount = sitemapUrls.length;
  console.log(`  OK: sitemap-0.xml contains ${urlCount} URLs`);

  if (urlCount === 0) {
    console.error('  ERROR: sitemap-0.xml has 0 URLs');
    errors++;
  }

  if (!childXml.includes('https://net-27.cc/')) {
    console.error('  ERROR: sitemap-0.xml does not contain https://net-27.cc/');
    errors++;
  }

  const invalidHosts = sitemapUrls.filter((url) => {
    try {
      const parsed = new URL(url);
      return parsed.origin !== 'https://net-27.cc' || parsed.search || parsed.hash;
    } catch {
      return true;
    }
  });
  if (invalidHosts.length > 0) {
    console.error('  ERROR: sitemap contains non-canonical or invalid URLs:', invalidHosts.slice(0, 5));
    errors += invalidHosts.length;
  }

  const duplicateCount = sitemapUrls.length - new Set(sitemapUrls).size;
  if (duplicateCount > 0) {
    console.error(`  ERROR: sitemap contains ${duplicateCount} duplicate URLs`);
    errors += duplicateCount;
  }

  if (childXml.includes('/api/')) {
    console.error('  ERROR: sitemap-0.xml contains /api/ URLs');
    errors++;
  }

  for (const excludedPath of ['/player/', '/detail/', '/watchlist/']) {
    if (childXml.includes(excludedPath)) {
      console.error(`  ERROR: sitemap-0.xml contains non-indexable ${excludedPath} URLs`);
      errors++;
    }
  }

  if (childXml.includes('<html') || childXml.includes('<!DOCTYPE')) {
    console.error('  ERROR: sitemap-0.xml contains HTML');
    errors++;
  }
} catch (e) {
  console.error('  ERROR: Could not read sitemap-0.xml:', e.message);
  errors++;
}

// Legacy query routes must remain crawlable but explicitly noindex. This lets
// Google retire old URLs instead of reporting them as robots-blocked or soft
// 404 pages.
try {
  const headers = await readFile(headersPath, 'utf-8');
  for (const route of ['/player/', '/detail/', '/watchlist/']) {
    const routeBlock = headers.match(new RegExp(
      `^${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\r?\\n([\\s\\S]*?)(?=^\\S|\\Z)`,
      'm',
    ))?.[1] ?? '';
    if (!/X-Robots-Tag:\s*noindex/i.test(routeBlock)) {
      console.error(`  ERROR: ${route} is missing an X-Robots-Tag noindex header`);
      errors++;
    }
  }

  const detailHtml = await readFile(path.join(DIST, 'detail', 'index.html'), 'utf-8');
  if (!/<meta\b[^>]*name=["']robots["'][^>]*noindex/i.test(detailHtml)) {
    console.error('  ERROR: /detail/ is missing its HTML noindex directive');
    errors++;
  }
  if (!detailHtml.includes('canonicalTitleUrls')) {
    console.error('  ERROR: /detail/ is missing its canonical-title redirect map');
    errors++;
  }
} catch (e) {
  console.error('  ERROR: Could not validate legacy-route indexing guards:', e.message);
  errors++;
}

// Validate robots.txt
try {
  const robots = await readFile(robotsPath, 'utf-8');

  if (robots.includes('https://net-27.cc/sitemap.xml')) {
    console.log('  OK: robots.txt references sitemap.xml');
  } else {
    console.error('  ERROR: robots.txt does not reference the canonical sitemap.xml');
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

  const disallowed = robots
    .split(/\r?\n/)
    .map((line) => line.match(/^Disallow:\s*(\S+)/i)?.[1])
    .filter(Boolean);
  const blockedSitemapUrls = sitemapUrls.filter((url) => {
    const pathname = new URL(url).pathname;
    return disallowed.some((rule) => rule !== '/' && pathname.startsWith(rule));
  });
  if (blockedSitemapUrls.length > 0) {
    console.error('  ERROR: robots.txt blocks sitemap URLs:', blockedSitemapUrls.slice(0, 5));
    errors += blockedSitemapUrls.length;
  }

  if (disallowed.some((rule) => rule.startsWith('/player'))) {
    console.error('  ERROR: /player/ is blocked; crawlers must see its noindex directive');
    errors++;
  }
} catch (e) {
  console.error('  ERROR: Could not read robots.txt:', e.message);
  errors++;
}

// Every sitemap URL must be a generated, indexable, self-canonical HTML page.
for (const url of sitemapUrls) {
  const outputFile = outputFileForUrl(url);
  if (!outputFile) {
    console.error(`  ERROR: sitemap URL has no generated output: ${url}`);
    errors++;
    continue;
  }

  const html = await readFile(outputFile, 'utf-8');
  if (/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html) ||
      /<meta\b[^>]*content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots["']/i.test(html)) {
    console.error(`  ERROR: noindex page is present in sitemap: ${url}`);
    errors++;
  }

  const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)?.[1];
  if (!canonical) {
    console.error(`  ERROR: sitemap page has no canonical link: ${url}`);
    errors++;
  } else {
    const normalizedCanonical = new URL(canonical, 'https://net-27.cc').href;
    const normalizedUrl = new URL(url).href;
    if (normalizedCanonical !== normalizedUrl) {
      console.error(`  ERROR: canonical mismatch: ${url} -> ${canonical}`);
      errors++;
    }
  }

  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const structuredData = JSON.parse(match[1]);
      const queue = [structuredData];
      while (queue.length > 0) {
        const value = queue.pop();
        if (!value || typeof value !== 'object') continue;
        if (value['@type'] === 'AggregateRating' && Number(value.ratingCount) <= 0) {
          console.error(`  ERROR: non-positive AggregateRating.ratingCount on ${url}`);
          errors++;
        }
        queue.push(...Object.values(value));
      }
    } catch {
      console.error(`  ERROR: invalid JSON-LD on ${url}`);
      errors++;
    }
  }
}

if (sitemapUrls.length > 0) {
  console.log(`  OK: validated ${sitemapUrls.length} generated indexable, self-canonical pages`);
}

console.log(`\nErrors: ${errors}`);
if (errors > 0) {
  console.log('\nFAILED');
  process.exit(1);
}
console.log('\nPASSED');
