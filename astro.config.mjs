// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://net-27.cc',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    sitemap({
      entryLimit: 50000,
      filter: (page) =>
        !page.includes('/actor/') &&
        !page.includes('/director/') &&
        !page.includes('/studio/') &&
        !page.includes('/watch/') &&
        !page.includes('/player/') &&
        !page.includes('/login/') &&
        !page.includes('/help/'),
    }),
  ],
  image: {
    domains: ['image.tmdb.org'],
  },
});
