// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { copyFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';

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
        .filter(t => (t.overview || '').trim().length < 80 && !t.watch && (t.cast || []).length === 0)
        .map(t => `/${t.type === 'show' ? 'shows' : 'movies'}/${t.slug}/`)
    );
  } catch {
    return new Set();
  }
})();

const directSitemap = {
  name: 'net27-direct-sitemap',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      await copyFile(new URL('sitemap-0.xml', dir), new URL('sitemap.xml', dir));

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
      const SITE = 'https://net-27.cc';
      const payload = {
        host: 'net-27.cc',
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
      } catch (err) {
        console.warn('[IndexNow] Ping failed (non-blocking):', err.message);
      }
    },
  },
};

export default defineConfig({
  site: 'https://net-27.cc',
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
      filter: (page) =>
        !page.includes('/player/') &&
        !page.includes('/detail/') &&
        !page.includes('/login/') &&
        !page.includes('/help/') &&
        !page.includes('/watchlist/') &&
        ![...thinTitleSlugs].some(slug => page.endsWith(slug)),
    }),
    directSitemap,
  ],
  image: {
    domains: ['image.tmdb.org'],
  },
});
