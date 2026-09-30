// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { copyFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';

// DMCA-denied slugs — must never appear in sitemap.
// Keep in sync with src/lib/dmcaDenyList.ts.
const DMCA_DENIED_SLUGS = new Set([
  'awarapan-2-1444466',
  'monster-mia-1572116',
  'spider-man-brand-new-day-969681',
  'the-death-of-robin-hood-1284465',
  'ice-cream-man-1477712',
]);

// @astrojs/sitemap emits an index plus sitemap-0.xml. This site is well below
// the 50,000 URL limit, so also publish a stable, direct /sitemap.xml URL set.
// Search engines can consume it without an extra index fetch, while the
// generated index remains available for backwards compatibility.
// Title pages carrying no synopsis, cast or availability are rendered noindex,
// and a noindex URL in the sitemap is a contradictory signal, so the same rule
// decides both. Read from the cache the pages themselves are built from.
const thinTitleSlugs = (() => {
  try {
    const { items } = JSON.parse(readFileSync('./src/data/cache/titles.json', 'utf8'));
    return new Set(
      items
        .filter((/** @type {any} */ t) => (t.overview || '').trim().length < 80 && !t.watch && (t.cast || []).length === 0)
        .map((/** @type {any} */ t) => `/${t.type === 'show' ? 'shows' : 'movies'}/${t.slug}/`)
    );
  } catch {
    return new Set();
  }
})();

// Crawl focus (Search Console, 28 days to 2026-09-24): English pages took
// 6,170 clicks; the eight locales below took under 20 each, while their
// ~10,000 title/person pages filled most of the sitemap — and 9 of 10 sampled
// English title pages were still "unknown to Google". So those locales keep
// their hubs (root, genre, platform, year…) in the sitemap but not their
// per-title and per-person pages. The pages still exist, stay indexable and
// hreflang-linked; they are just not advertised for crawling.
// Hindi, Urdu and Bangla stay in full: the audience is India, Bangladesh and
// Pakistan.
const FULL_SITEMAP_LOCALES = new Set(['hi', 'ur', 'bn']);
const LOCALE_DETAIL_PAGE = /^\/([a-z]{2})\/(movies|shows|person)\/[^/]+\/$/;

/**
 * 301s for renamed titles. TMDB retitles now and then ("Serpenti" → "Snake"),
 * which changes the slug, so the URL Google indexed turned into a 404 and the
 * new one started from nothing. movie-sync.mjs records every earlier slug in
 * src/data/slug-history.json; this appends one redirect per earlier slug to
 * dist/_redirects, for English and each locale — but only where the target
 * page was actually built, so a redirect can never point at a 404.
 * Cloudflare Pages allows 2,000 static redirects; this uses a few hundred.
 * @param {URL} dir
 */
async function appendSlugRedirects(dir) {
  const { existsSync, readdirSync, appendFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const out = fileURLToPath(dir);
  let history = {};
  let titles = [];
  try {
    history = JSON.parse(readFileSync('./src/data/slug-history.json', 'utf8')).slugs ?? {};
    titles = JSON.parse(readFileSync('./src/data/cache/titles.json', 'utf8')).items ?? [];
  } catch {
    return;
  }
  const current = new Set(titles.map((/** @type {any} */ t) => t.slug));
  const prefixes = ['', ...readdirSync(out, { withFileTypes: true })
    .filter(d => d.isDirectory() && /^[a-z]{2}$/.test(d.name))
    .map(d => `/${d.name}`)];
  const lines = [];
  for (const t of titles) {
    const olds = (history[t.id] ?? []).filter((/** @type {string} */ s) => s !== t.slug && !current.has(s));
    if (!olds.length) continue;
    const section = t.type === 'show' ? 'shows' : 'movies';
    for (const p of prefixes) {
      if (!existsSync(`${out}${p}/${section}/${t.slug}/index.html`)) continue;
      for (const old of olds) lines.push(`${p}/${section}/${old}/ ${p}/${section}/${t.slug}/ 301`);
    }
  }
  if (lines.length) {
    appendFileSync(`${out}/_redirects`, `\n# Renamed titles (generated from src/data/slug-history.json)\n${lines.join('\n')}\n`);
    console.log(`[slug-redirects] ${lines.length} redirects for renamed titles`);
  }
}

const directSitemap = {
  name: 'net27-direct-sitemap',
  hooks: {
    'astro:build:done': async (/** @type {any} */ { dir }) => {
      await copyFile(new URL('sitemap-0.xml', dir), new URL('sitemap.xml', dir));
      await appendSlugRedirects(dir);

      // IndexNow — tells the Bing/Yandex/Yahoo network that these URLs changed.
      //
      // Only from a build that actually publishes. `astro build` runs on dev
      // machines many times a day, and each of those runs was announcing that
      // production had changed when nothing had been deployed — a false signal
      // to Bing, plus a network call and up to a 15s timeout on every local
      // build. Cloudflare Pages sets CF_PAGES; the cron deploy runs under
      // GitHub Actions.
      const isPublishingBuild = Boolean(process.env.CF_PAGES || process.env.GITHUB_ACTIONS);
      if (!isPublishingBuild) return;

      const INDEXNOW_KEY = 'e9d6b5a3c2f1e8d7b4a0c5f2e1d8b3a6';
      const SITE = 'https://net27.watch';
      const payload = {
        host: 'net27.watch',
        key: INDEXNOW_KEY,
        keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
        urlList: [
          `${SITE}/`,
          `${SITE}/movies/`,
          `${SITE}/shows/`,
          `${SITE}/anime/`,
          `${SITE}/trending/`,
          `${SITE}/latest/`,
          `${SITE}/blog/`,
          `${SITE}/sitemap.xml`,
        ],
      };
      try {
        const res = await fetch('https://api.indexnow.org/indexnow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(15_000),
        });
        if (res.ok || res.status === 202) {
          console.log(`[IndexNow] Pinged Bing network: ${res.status}`);
        } else {
          console.warn(`[IndexNow] Unexpected status: ${res.status}`);
        }
      } catch (/** @type {any} */ err) {
        console.warn('[IndexNow] Ping failed (non-blocking):', err?.message || String(err));
      }
    },
  },
};

export default defineConfig({
  site: 'https://net27.watch',
  output: 'static',
  devToolbar: {
    enabled: false,
  },
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      minify: 'esbuild',
      target: 'es2022',
      sourcemap: false,
    },
  },
  integrations: [
    react(),
    sitemap({
      entryLimit: 50000,
      filter: (page) => {
        // Exclude noindex pages
        if (
          page.includes('/player/') ||
          page.includes('/detail/') ||
          page.includes('/login/') ||
          page.includes('/help/') ||
          page.includes('/watchlist/')
        ) return false;
        // Crawl focus: see FULL_SITEMAP_LOCALES above
        const detail = new URL(page).pathname.match(LOCALE_DETAIL_PAGE);
        if (detail && !FULL_SITEMAP_LOCALES.has(detail[1])) return false;
        // Exclude thin title pages
        if ([...thinTitleSlugs].some(slug => page.endsWith(slug))) return false;
        // Exclude DMCA-denied movie slugs from sitemap
        for (const slug of DMCA_DENIED_SLUGS) {
          if (page.includes(`/${slug}/`) || page.includes(`/${slug}`)) return false;
        }
        return true;
      },
    }),
    directSitemap,
  ],
  image: {
    domains: ['image.tmdb.org'],
  },
});
