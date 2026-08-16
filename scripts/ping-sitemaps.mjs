/**
 * ping-sitemaps.mjs — Build ke baad Bing aur Yandex ko sitemap notify karta hai.
 *
 * Usage:
 *   npm run ping
 *
 * Manual only — deliberately not wired to postbuild. Production is reached two
 * ways and they do not run the same command: Cloudflare Pages runs
 * `npm run build`, while .github/workflows/daily-sync.yml runs `npx astro
 * build`. A postbuild hook therefore fires on one path and not the other, and
 * on the Pages path it repeated the IndexNow ping that astro.config.mjs had
 * already sent. That ping now lives in astro.config.mjs alone, which runs on
 * both paths and only when the build actually publishes.
 *
 * Note: Google ne officially ping endpoint band kar diya hai (2023),
 * lekin Bing aur Yandex ab bhi kaam karte hain.
 */

const SITE_URL = 'https://net-27.cc';
const SITEMAPS = [
  `${SITE_URL}/sitemap.xml`,
  `${SITE_URL}/sitemap-0.xml`,
];

const PING_ENDPOINTS = [
  (sitemap) => `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
  (sitemap) => `https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
];

async function pingSitemap(url) {
  for (const makeEndpoint of PING_ENDPOINTS) {
    const endpoint = makeEndpoint(url);
    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { 'User-Agent': 'net-27.cc SitemapPinger/1.0' },
        signal: AbortSignal.timeout(10_000),
      });
      const engineName = endpoint.includes('bing') ? 'Bing' : 'Yandex';
      if (res.ok || res.status === 200) {
        console.log(`  OK ${engineName}: OK (${res.status})`);
      } else {
        console.log(`  WARN ${engineName}: HTTP ${res.status}`);
      }
    } catch (err) {
      const engineName = endpoint.includes('bing') ? 'Bing' : 'Yandex';
      console.log(`  FAIL ${engineName}: ${err.message}`);
    }
  }
}

async function pingIndexNow() {
  const INDEXNOW_KEY = 'e9d6b5a3c2f1e8d7b4a0c5f2e1d8b3a6';
  const payload = {
    host: 'net-27.cc',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: [
      `${SITE_URL}/`,
      `${SITE_URL}/movies/`,
      `${SITE_URL}/shows/`,
      `${SITE_URL}/anime/`,
      `${SITE_URL}/trending/`,
      `${SITE_URL}/blog/`,
    ],
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok || res.status === 200 || res.status === 202) {
      console.log(`  OK IndexNow (Bing network): OK (${res.status})`);
    } else {
      console.log(`  WARN IndexNow: HTTP ${res.status}`);
    }
  } catch (err) {
    console.log(`  FAIL IndexNow: ${err.message}`);
  }
}

async function main() {
  console.log('\nSitemap Ping — Notifying search engines...\n');
  for (const sitemap of SITEMAPS) {
    console.log(`Pinging: ${sitemap}`);
    await pingSitemap(sitemap);
  }
  console.log('\nIndexNow ping:');
  await pingIndexNow();
  console.log('\nDone! Also submit manually at:');
  console.log('  https://search.google.com/search-console/sitemaps');
  console.log('  Submit: sitemap.xml and sitemap-0.xml\n');
}

main().catch(console.error);
