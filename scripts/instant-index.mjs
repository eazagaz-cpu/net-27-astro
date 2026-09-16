/**
 * instant-index.mjs — Deploy ke turant baad search engines ko ping karta hai
 *
 * Small changes (UI/component) ke liye:
 *   - IndexNow → Bing, Yandex, Seznam ko INSTANTLY index karta hai (seconds mein)
 *   - Google Search Console Sitemap ping
 *
 * Usage:
 *   node scripts/instant-index.mjs           → homepage + key pages
 *   node scripts/instant-index.mjs blog      → blog pages
 *   node scripts/instant-index.mjs all       → sab URLs
 *
 * GitHub Actions mein automatic chalega fast-deploy ke baad.
 */

const SITE = 'https://net27.watch';
const INDEXNOW_KEY = 'e9d6b5a3c2f1e8d7b4a0c5f2e1d8b3a6';

// ── URL groups — argument se select hoti hain ────────────────────────────────
const URL_GROUPS = {
  // Default: homepage + main pages — fast deploy ke baad yahi chahiye
  default: [
    `${SITE}/`,
    `${SITE}/movies/`,
    `${SITE}/shows/`,
    `${SITE}/anime/`,
    `${SITE}/trending/`,
    `${SITE}/latest/`,
  ],
  blog: [
    `${SITE}/blog/`,
  ],
  all: [
    `${SITE}/`,
    `${SITE}/movies/`,
    `${SITE}/shows/`,
    `${SITE}/anime/`,
    `${SITE}/trending/`,
    `${SITE}/latest/`,
    `${SITE}/blog/`,
    `${SITE}/genre/action/`,
    `${SITE}/genre/drama/`,
    `${SITE}/genre/comedy/`,
    `${SITE}/genre/thriller/`,
    `${SITE}/genre/horror/`,
    `${SITE}/language/hindi/`,
    `${SITE}/language/korean/`,
    `${SITE}/language/turkish/`,
    `${SITE}/platform/netflix/`,
    `${SITE}/platform/jiohotstar/`,
    `${SITE}/sitemap.xml`,
  ],
};

const mode = process.argv[2] || 'default';
const urlList = URL_GROUPS[mode] || URL_GROUPS.default;

// ── IndexNow — Bing + Yandex + Seznam network (instant, usually <1 min) ──────
async function pingIndexNow(urls) {
  console.log('\n⚡ IndexNow ping (Bing/Yandex/Seznam network)...');
  const payload = {
    host: 'net27.watch',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
    urlList: urls.filter(u => !u.endsWith('.xml')), // sitemap URLs exclude
  };

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow',
  ];

  for (const endpoint of endpoints) {
    const name = endpoint.includes('bing') ? 'Bing'
      : endpoint.includes('yandex') ? 'Yandex'
      : 'IndexNow (all engines)';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(12_000),
      });
      const ok = res.ok || res.status === 202 || res.status === 200;
      console.log(`  ${ok ? '✅' : '⚠️ '} ${name}: HTTP ${res.status}`);
    } catch (err) {
      console.log(`  ❌ ${name}: ${err.message}`);
    }
  }
}

// ── Bing Sitemap ping (traditional — kuch crawlers isse prefer karte hain) ───
async function pingSitemaps() {
  console.log('\n📍 Sitemap pings...');
  const sitemaps = [`${SITE}/sitemap.xml`, `${SITE}/sitemap-0.xml`];
  const engines = [
    { name: 'Bing',   url: (s) => `https://www.bing.com/ping?sitemap=${encodeURIComponent(s)}` },
    { name: 'Yandex', url: (s) => `https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(s)}` },
  ];

  for (const sitemap of sitemaps) {
    for (const engine of engines) {
      try {
        const res = await fetch(engine.url(sitemap), {
          signal: AbortSignal.timeout(8_000),
          headers: { 'User-Agent': 'net27.watch IndexPinger/2.0' },
        });
        console.log(`  ${res.ok ? '✅' : '⚠️ '} ${engine.name} ← ${sitemap.split('/').pop()}: HTTP ${res.status}`);
      } catch (err) {
        console.log(`  ❌ ${engine.name}: ${err.message}`);
      }
    }
  }
}

// ── Google Search Console hint via fetch (unofficial but helps) ─────────────
async function pingGoogle(urls) {
  console.log('\n🔍 Google hint pings...');
  // Google ne official ping band kar diya (2023), lekin in URLs ko crawl hint dena helps
  // Inka Googlebot inhe sitemap update ke baad crawl karta hai
  for (const url of urls.slice(0, 5)) {
    try {
      // Sitemap ping via Google Search Console API workaround
      const checkUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE}/sitemap.xml`)}`;
      const res = await fetch(checkUrl, { signal: AbortSignal.timeout(6_000) });
      console.log(`  ℹ️  Google sitemap hint: HTTP ${res.status}`);
      break; // ek baar hi kafi hai
    } catch {
      console.log(`  ℹ️  Google: manual GSC submit recommended`);
      break;
    }
  }
  console.log(`  💡 Fast Google index: https://search.google.com/search-console → URL Inspection → Request Indexing`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const timestamp = new Date().toISOString();
  console.log(`\n${'─'.repeat(55)}`);
  console.log(`🚀 Instant Index Ping — net27.watch`);
  console.log(`   Mode: ${mode} | URLs: ${urlList.length} | Time: ${timestamp}`);
  console.log('─'.repeat(55));

  console.log('\n📋 URLs being submitted:');
  urlList.forEach(u => console.log(`   ${u}`));

  // Run pings in parallel where possible
  await Promise.all([
    pingIndexNow(urlList),
    pingSitemaps(),
  ]);

  await pingGoogle(urlList);

  console.log(`\n${'─'.repeat(55)}`);
  console.log('✅ Done! Expected indexing times:');
  console.log('   Bing/Yandex: 1–10 minutes (IndexNow)');
  console.log('   Google:      few hours to 1 day (submit GSC manually for faster)');
  console.log('   GSC URL:     https://search.google.com/search-console');
  console.log('─'.repeat(55) + '\n');
}

main().catch(console.error);
