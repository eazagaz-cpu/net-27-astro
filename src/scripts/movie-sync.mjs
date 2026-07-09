#!/usr/bin/env node
/**
 * movie-sync.mjs — Build-time TMDB metadata pipeline
 * Fetches fresh data for all homepage sections and writes JSON cache files.
 *
 * Run manually : node src/scripts/movie-sync.mjs
 * Auto-runs    : npm run prebuild (before every astro build)
 */

import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..', '..');
const CACHE_DIR = join(ROOT, 'src', 'data', 'cache');

// ── Load .env (silent if missing — CI uses secrets instead) ─────────────────
try {
  const raw = readFileSync(join(ROOT, '.env'), 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch { /* .env not present */ }

const API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

if (!API_KEY) {
  console.warn('[movie-sync] TMDB_API_KEY not set — skipping sync, keeping existing cache.');
  process.exit(0);
}

mkdirSync(CACHE_DIR, { recursive: true });

// ── Normalize a raw TMDB item ────────────────────────────────────────────────
function normalize(item) {
  const isTV = !!(item.name || item.first_air_date || item.media_type === 'tv');
  const title = (item.title || item.name || '').trim();
  const year = parseInt((item.release_date || item.first_air_date || '').slice(0, 4)) || 0;
  const posterPath = item.poster_path || null;
  const backdropPath = item.backdrop_path || null;

  return {
    id: item.id,
    type: isTV ? 'tv' : 'movie',
    title,
    year,
    rating: Math.round((item.vote_average || 0) * 10) / 10,
    posterPath,
    backdropPath,
    posterUrl: posterPath
      ? `${IMG_BASE}/w342${posterPath}`
      : backdropPath
        ? `${IMG_BASE}/w342${backdropPath}`
        : '',
    backdropUrl: backdropPath ? `${IMG_BASE}/w1280${backdropPath}` : '',
    overview: (item.overview || '').slice(0, 300),
    genreIds: item.genre_ids || [],
    language: item.original_language || 'en',
  };
}

// ── TMDB fetch helper ────────────────────────────────────────────────────────
async function tmdbFetch(path, params = {}) {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'en-US');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${path}`);
  return res.json();
}

// ── Category endpoint definitions ────────────────────────────────────────────
function getEndpoints(category) {
  const today = new Date().toISOString().split('T')[0];
  const map = {
    trending: [
      { path: '/trending/all/week', params: {} },
    ],
    'latest-movies': [
      { path: '/discover/movie', params: { sort_by: 'primary_release_date.desc', 'primary_release_date.lte': today, 'vote_count.gte': '10' } },
    ],
    'popular-movies': [
      { path: '/movie/popular', params: {} },
    ],
    'now-playing': [
      { path: '/movie/now_playing', params: { region: 'US' } },
    ],
    upcoming: [
      { path: '/movie/upcoming', params: { region: 'US' } },
    ],
    'top-rated-movies': [
      { path: '/movie/top_rated', params: {} },
    ],
    'latest-tv': [
      { path: '/discover/tv', params: { sort_by: 'first_air_date.desc', 'first_air_date.lte': today, 'vote_count.gte': '10' } },
    ],
    'popular-tv': [
      { path: '/tv/popular', params: {} },
    ],
    'top-rated-tv': [
      { path: '/tv/top_rated', params: {} },
    ],
    anime: [
      { path: '/discover/tv', params: { with_original_language: 'ja', with_genres: '16', sort_by: 'popularity.desc' } },
      { path: '/discover/movie', params: { with_original_language: 'ja', with_genres: '16', sort_by: 'popularity.desc' } },
    ],
    bollywood: [
      { path: '/discover/movie', params: { with_original_language: 'hi', sort_by: 'popularity.desc' } },
      { path: '/discover/tv', params: { with_original_language: 'hi', sort_by: 'popularity.desc' } },
    ],
    hollywood: [
      { path: '/discover/movie', params: { with_original_language: 'en', sort_by: 'popularity.desc' } },
    ],
    'korean-drama': [
      { path: '/discover/tv', params: { with_original_language: 'ko', with_genres: '18', sort_by: 'popularity.desc' } },
    ],
    netflix: [
      { path: '/discover/movie', params: { with_watch_providers: '8', watch_region: 'US', sort_by: 'popularity.desc' } },
      { path: '/discover/tv', params: { with_watch_providers: '8', watch_region: 'US', sort_by: 'popularity.desc' } },
    ],
    'prime-video': [
      { path: '/discover/movie', params: { with_watch_providers: '9', watch_region: 'US', sort_by: 'popularity.desc' } },
      { path: '/discover/tv', params: { with_watch_providers: '9', watch_region: 'US', sort_by: 'popularity.desc' } },
    ],
    'new-2026': [
      { path: '/discover/movie', params: { sort_by: 'popularity.desc', 'primary_release_date.gte': '2026-01-01', 'primary_release_date.lte': '', 'vote_count.gte': '5' } },
      { path: '/discover/tv', params: { sort_by: 'popularity.desc', 'first_air_date.gte': '2026-01-01', 'first_air_date.lte': '', 'vote_count.gte': '5' } },
    ],
    'hindi-dubbed': [
      { path: '/discover/movie', params: { with_original_language: 'en', sort_by: 'popularity.desc', 'vote_count.gte': '500' } },
    ],
        'top-rated-hindi': [
      { path: '/discover/movie', params: { with_original_language: 'hi', sort_by: 'vote_average.desc', 'vote_count.gte': '100' } },
    ],
    documentary: [
      { path: '/discover/movie', params: { with_genres: '99', sort_by: 'popularity.desc' } },
      { path: '/discover/tv', params: { with_genres: '99', sort_by: 'popularity.desc' } },
    ],
    'pakistani-drama': [
      { path: '/discover/tv', params: { with_origin_country: 'PK', sort_by: 'popularity.desc' } },
      { path: '/discover/tv', params: { with_original_language: 'ur', sort_by: 'popularity.desc' } },
    ],
    'turkish-drama': [
      { path: '/discover/tv', params: { with_original_language: 'tr', with_genres: '18', sort_by: 'popularity.desc' } },
      { path: '/discover/tv', params: { with_origin_country: 'TR', sort_by: 'popularity.desc' } },
    ],
  };
  return map[category] || [{ path: '/movie/popular', params: {} }];
}

// ── Fetch a single category ──────────────────────────────────────────────────
async function fetchCategory(category, maxPages = 2) {
  const endpoints = getEndpoints(category);
  const items = [];
  const seen = new Set();

  for (const ep of endpoints) {
    for (let page = 1; page <= maxPages; page++) {
      try {
        const data = await tmdbFetch(ep.path, { ...ep.params, page: String(page) });
        for (const raw of data.results || []) {
          if (raw.adult) continue;
          if (!(raw.title || raw.name)) continue;
          if (seen.has(raw.id)) continue;
          if (!raw.poster_path && !raw.backdrop_path) continue; // skip imageless items
          seen.add(raw.id);
          items.push(normalize(raw));
        }
      } catch (err) {
        console.warn(`    ⚠ ${category} page ${page}: ${err.message}`);
      }
      // Respect TMDB rate limit (40 req/10s)
      await delay(260);
    }
  }
  return items;
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Write a cache JSON file ──────────────────────────────────────────────────
function writeCache(category, items) {
  const payload = {
    fetchedAt: new Date().toISOString(),
    category,
    count: items.length,
    items,
  };
  writeFileSync(join(CACHE_DIR, `${category}.json`), JSON.stringify(payload), 'utf8');
}

// ── Trakt trending fetch (uses TRAKT_CLIENT_ID env var) ─────────────────────
async function fetchTrakt() {
  const traktKey = process.env.TRAKT_CLIENT_ID;
  if (!traktKey) {
    console.warn('    ⚠ TRAKT_CLIENT_ID not set — skipping trakt-trending');
    return [];
  }

  const res = await fetch('https://api.trakt.tv/movies/trending?limit=24', {
    headers: {
      'trakt-api-key': traktKey,
      'trakt-api-version': '2',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; NetMirror/1.0)',
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`Trakt HTTP ${res.status}`);
  const data = await res.json();

  // Cross-reference TMDB for full item data (poster, rating, etc.)
  const items = [];
  const seen = new Set();
  for (const entry of data) {
    const tmdbId = entry.movie?.ids?.tmdb;
    if (!tmdbId || seen.has(tmdbId)) continue;
    seen.add(tmdbId);
    try {
      const d = await tmdbFetch(`/movie/${tmdbId}`, {});
      if (!d.poster_path && !d.backdrop_path) continue;
      items.push(normalize(d));
    } catch {}
    await delay(260);
  }
  return items;
}

// ── Category manifest ────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'trending',         pages: 1 },
  { key: 'latest-movies',    pages: 2 },
  { key: 'popular-movies',   pages: 2 },
  { key: 'now-playing',      pages: 2 },
  { key: 'upcoming',         pages: 2 },
  { key: 'top-rated-movies', pages: 2 },
  { key: 'latest-tv',        pages: 2 },
  { key: 'popular-tv',       pages: 2 },
  { key: 'top-rated-tv',     pages: 1 },
  { key: 'anime',            pages: 2 },
  { key: 'bollywood',        pages: 2 },
  { key: 'hollywood',        pages: 1 },
  { key: 'korean-drama',     pages: 1 },
  { key: 'netflix',          pages: 1 },
  { key: 'prime-video',      pages: 1 },
  { key: 'new-2026',      pages: 2 },
  { key: 'hindi-dubbed',     pages: 2 },
  { key: 'documentary',      pages: 1 },
  { key: 'pakistani-drama',  pages: 2 },
  { key: 'turkish-drama',    pages: 2 },
];

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n[movie-sync] Starting TMDB data pipeline...\n');
  const t0 = Date.now();
  let ok = 0;
  let fail = 0;

  for (const { key, pages } of CATEGORIES) {
    try {
      process.stdout.write(`  Fetching ${key.padEnd(20)}`);
      const items = await fetchCategory(key, pages);
      writeCache(key, items);
      console.log(`✓ ${items.length} items`);
      ok++;
    } catch (err) {
      console.log(`✗ ${err.message}`);
      fail++;
    }
  }

  // Trakt trending (separate fetch, not in CATEGORIES map)
  try {
    process.stdout.write(`  Fetching ${'trakt-trending'.padEnd(20)}`);
    const traktItems = await fetchTrakt();
    if (traktItems.length > 0) {
      writeCache('trakt-trending', traktItems);
      console.log(`✓ ${traktItems.length} items`);
      ok++;
    } else {
      console.log(`- skipped (no key or no results)`);
    }
  } catch (err) {
    console.log(`✗ ${err.message}`);
    fail++;
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n[movie-sync] Done in ${elapsed}s — ${ok} succeeded, ${fail} failed.\n`);
}

main().catch(err => {
  console.error('[movie-sync] Fatal:', err.message);
  process.exit(1);
});
