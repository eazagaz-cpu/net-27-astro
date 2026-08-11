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
