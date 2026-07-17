#!/usr/bin/env node
/**
 * fetch-blog-images.mjs
 * Queries TMDB for real, unique backdrop images for every blog post.
 * Run: node src/scripts/fetch-blog-images.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

// Load .env
try {
  const env = readFileSync(join(ROOT, '.env'), 'utf-8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
} catch {}

const API_KEY = process.env.TMDB_API_KEY;
if (!API_KEY) { console.error('Missing TMDB_API_KEY'); process.exit(1); }

const BASE = 'https://api.themoviedb.org/3';
const IMG  = 'https://image.tmdb.org/t/p/w1280';

async function tmdb(path) {
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}api_key=${API_KEY}`;
  const r = await fetch(url);
  return r.json();
}

async function getMovieBackdrop(id) {
  const d = await tmdb(`/movie/${id}/images?include_image_language=en,null`);
  const imgs = d.backdrops || [];
  const best = imgs.sort((a, b) => b.vote_average - a.vote_average)[0];
  return best?.file_path || null;
}

async function getTVBackdrop(id) {
  const d = await tmdb(`/tv/${id}/images?include_image_language=en,null`);
  const imgs = d.backdrops || [];
  const best = imgs.sort((a, b) => b.vote_average - a.vote_average)[0];
  return best?.file_path || null;
}

// Curated TMDB IDs — one unique source per blog post, chosen for visual relevance
const sources = [
  // slug                                  type      id         alt description
  ['free-movie-streaming-guide-2026',     'movie',  299534,   'Avengers: Endgame cinematic scene — how to watch movies online free legally in 2026'],
  ['best-anime-2026',                     'tv',     95479,    'Jujutsu Kaisen sorcerers in battle — best anime to watch in 2026'],
  ['best-korean-dramas-2026',             'tv',     95396,    'Squid Game players in iconic costumes — best Korean dramas to watch in 2026'],
  ['hindi-dubbed-movies-ott-guide',       'movie',  834856,   'RRR epic action scene — Hindi dubbed movies on OTT guide 2026'],
  ['best-movies-netflix-india-2026',      'tv',     192231,   'The Night Agent Netflix series — best movies on Netflix India 2026'],
  ['best-action-movies-2026',             'movie',  575264,   'Mission Impossible Dead Reckoning action scene — best action movies 2026'],
  ['best-horror-movies-streaming-2026',   'movie',  610150,   'A Quiet Place horror scene — best horror movies streaming 2026'],
  ['best-sci-fi-series-2026',             'movie',  693134,   'Dune Part Two desert landscape — best sci-fi series to binge 2026'],
  ['best-family-movies-ott-2026',         'movie',  568124,   'Encanto colorful magical scene — best family movies on OTT 2026'],
  ['turkish-dramas-watch-guide-2026',     'tv',     68155,    'Dirilis Ertugrul epic historical scene — best Turkish dramas 2026'],
  ['netflix-vs-prime-video-india',        'tv',     76479,    'The Boys superhero showdown — Netflix vs Prime Video India 2026'],
  ['watch-anime-online-free-2026',        'tv',     37854,    'One Piece adventure on the sea — watch anime online free 2026'],
  ['how-to-watch-foreign-movies-subtitles','movie', 496243,   'Parasite Korean cinema scene — how to watch foreign movies with subtitles'],
  ['what-is-netmirror',                   'tv',     66732,    'Stranger Things Hawkins lab scene — what is NetMirror how it works'],
  ['new-on-netflix-july-2026',            'tv',     115036,   'Wednesday Addams Netflix series — new on Netflix India July 2026'],
  ['new-on-prime-video-july-2026',        'tv',     46533,    'Jack Ryan Prime Video action scene — new on Prime Video India July 2026'],
  // Also fix the original posts that got the "bearded man" by accident
  ['how-tv-shows-get-made',               'tv',     1399,     'Game of Thrones production — from script to screen how TV shows get made'],
  ['sci-fi-renaissance-modern-cinema',    'movie',  438631,   'Dune 2021 science fiction landscape — sci-fi renaissance in modern cinema'],
  ['streaming-platform-comparison',       'tv',     1418,     'The Big Bang Theory couch scene — streaming platform comparison Netflix vs Prime'],
  ['movie-rating-systems-explained',      'movie',  550,      'Fight Club cinematic scene — movie rating systems explained MPAA CBFC'],
  ['anime-streaming-guide-2026',          'tv',     85937,    'Demon Slayer Tanjiro in battle — anime streaming guide all major platforms'],
  ['best-movies-2026',                    'movie',  823464,   'Godzilla x Kong epic battle — best movies to watch in 2026'],
  ['best-hindi-dubbed-movies-2026',       'movie',  769897,   'KGF Chapter 2 action scene — best Hindi dubbed movies 2026'],
  ['is-netmirror-safe',                   'skip',   0,        null],
  ['arm64-vs-arm32-apk',                  'skip',   0,        null],
  ['netmirror-apk-download-guide',        'skip',   0,        null],
];

// Fetch all images
console.log('Fetching TMDB backdrops...\n');
const results = {};

for (const [slug, type, id, alt] of sources) {
  if (type === 'skip') { // sentinel — keep existing image
    console.log(`  SKIP  ${slug} (keeping existing)`);
    continue;
  }
  try {
    const path = type === 'movie' ? await getMovieBackdrop(id) : await getTVBackdrop(id);
    if (path) {
      results[slug] = { url: `${IMG}${path}`, alt, width: 1280, height: 720 };
      console.log(`  OK    ${slug} → ${path}`);
    } else {
      console.log(`  MISS  ${slug} — no backdrop found for ${type}:${id}`);
    }
  } catch (e) {
    console.log(`  ERR   ${slug} — ${e.message}`);
  }
}

// Read existing blogImages.ts and patch only the changed slugs
let src = readFileSync(join(ROOT, 'src/data/blogImages.ts'), 'utf-8');

for (const [slug, , , alt] of sources) {
  const data = results[slug];
  if (!data) continue;

  // Build new entry block
  const newBlock = `  '${slug}': {
    url: \`\${TMDB}${data.url.replace(IMG, '')}\`,
    alt: '${data.alt.replace(/'/g, "\\'")}',
    width: 1280,
    height: 720,
  },`;

  // Replace existing entry using regex
  const regex = new RegExp(
    `  '${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}': \\{[\\s\\S]*?\\},`,
    'g'
  );
  if (regex.test(src)) {
    src = src.replace(regex, newBlock);
    console.log(`  PATCH ${slug}`);
  } else {
    console.log(`  NOT_FOUND ${slug} in blogImages.ts — skipping patch`);
  }
}

writeFileSync(join(ROOT, 'src/data/blogImages.ts'), src, 'utf-8');
console.log('\nDone! blogImages.ts updated.');
