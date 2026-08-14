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
    voteCount: Math.max(0, Number(item.vote_count) || 0),
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
    // South Indian cinema. Most of the audience is in India, where these four
    // industries are mainstream rather than regional, so each gets its own
    // category instead of being folded into a single "South" bucket.
    telugu: [
      { path: '/discover/movie', params: { with_original_language: 'te', sort_by: 'popularity.desc' } },
      { path: '/discover/tv', params: { with_original_language: 'te', sort_by: 'popularity.desc' } },
    ],
    tamil: [
      { path: '/discover/movie', params: { with_original_language: 'ta', sort_by: 'popularity.desc' } },
      { path: '/discover/tv', params: { with_original_language: 'ta', sort_by: 'popularity.desc' } },
    ],
    malayalam: [
      { path: '/discover/movie', params: { with_original_language: 'ml', sort_by: 'popularity.desc' } },
    ],
    kannada: [
      { path: '/discover/movie', params: { with_original_language: 'kn', sort_by: 'popularity.desc' } },
    ],
    // TMDB cannot filter on "has a Hindi dub", but the South films that get one
    // are reliably the ones with real audience reach — hence the vote floor.
    'south-hindi-dubbed': [
      { path: '/discover/movie', params: { with_original_language: 'te|ta|ml|kn', sort_by: 'popularity.desc', 'vote_count.gte': '50' } },
    ],
    // Indian TV: origin country rather than language, so Hindi soaps and the
    // regional channels both land here.
    'indian-tv': [
      { path: '/discover/tv', params: { with_origin_country: 'IN', sort_by: 'popularity.desc' } },
    ],
    // Indian OTT platforms, keyed on watch_region IN. The existing netflix and
    // prime-video categories deliberately stay on US catalogues.
    jiohotstar: [
      { path: '/discover/movie', params: { with_watch_providers: '2336', watch_region: 'IN', sort_by: 'popularity.desc' } },
      { path: '/discover/tv', params: { with_watch_providers: '2336', watch_region: 'IN', sort_by: 'popularity.desc' } },
    ],
    zee5: [
      { path: '/discover/movie', params: { with_watch_providers: '232', watch_region: 'IN', sort_by: 'popularity.desc' } },
      { path: '/discover/tv', params: { with_watch_providers: '232', watch_region: 'IN', sort_by: 'popularity.desc' } },
    ],
    sonyliv: [
      { path: '/discover/movie', params: { with_watch_providers: '237', watch_region: 'IN', sort_by: 'popularity.desc' } },
      { path: '/discover/tv', params: { with_watch_providers: '237', watch_region: 'IN', sort_by: 'popularity.desc' } },
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

// ── Slug helper ───────────────────────────────────────────────────────────
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ── Full per-title detail fetch — builds the real replacement for the old
// fictional sampleTitles.ts dataset that movies/[slug].astro and
// shows/[slug].astro render from. ─────────────────────────────────────────
async function fetchTitleDetail(type, id) {
  const path = type === 'tv' ? `/tv/${id}` : `/movie/${id}`;
  // watch/providers rides along on the same request — append_to_response costs
  // no extra call, so availability data is effectively free here.
  // external_ids carries the IMDb id, which TV responses otherwise omit and
  // which OMDb needs to look a title up. Like the other appends it is free.
  const d = await tmdbFetch(path, { append_to_response: 'credits,videos,similar,watch/providers,external_ids,translations' });
  if (!d.poster_path && !d.backdrop_path) return null;

  const title = (d.title || d.name || '').trim();
  if (!title) return null;

  const releaseDate = d.release_date || d.first_air_date || '';
  const year = parseInt(releaseDate.slice(0, 4)) || 0;
  const trailer = (d.videos?.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const director = type === 'tv'
    ? (d.created_by || [])[0]?.name || ''
    : (d.credits?.crew || []).find(c => c.job === 'Director')?.name || '';

  const runtime = type === 'tv'
    ? (d.episode_run_time?.[0] ? `${d.episode_run_time[0]}m per ep` : '')
    : (d.runtime ? `${Math.floor(d.runtime / 60)}h ${d.runtime % 60}m` : '');

  return {
    id: `${type}-${id}`,
    tmdbId: id,
    slug: `${slugify(title)}-${id}`,
    type: type === 'tv' ? 'show' : 'movie',
    title,
    year,
    rating: Math.round((d.vote_average || 0) * 10) / 10,
    voteCount: Math.max(0, Number(d.vote_count) || 0),
    runtime,
    posterUrl: d.poster_path ? `${IMG_BASE}/w780${d.poster_path}` : '',
    backdropUrl: d.backdrop_path ? `${IMG_BASE}/original${d.backdrop_path}` : '',
    overview: d.overview || '',
    genres: (d.genres || []).map(g => g.name),
    languages: (d.spoken_languages || []).map(l => l.english_name).filter(Boolean),
    // The language the title was made in, which `languages` cannot stand in for:
    // that lists every spoken track, so a Hollywood film with a Hindi dub looks
    // identical to an Indian production. Used to decide which titles get an
    // OMDb rating lookup, where the two must not be confused.
    originalLanguage: d.original_language || '',
    countries: (d.production_countries || []).map(c => c.name).filter(Boolean),
    cast: (d.credits?.cast || []).slice(0, 10).map(c => ({ name: c.name, role: c.character || '' })),
    director,
    trailerUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}` : '',
    releaseDate,
    status: d.status || '',
    seasons: type === 'tv' ? (d.number_of_seasons || 0) : undefined,
    episodes: type === 'tv' ? (d.number_of_episodes || 0) : undefined,
    relatedIds: (d.similar?.results || []).slice(0, 12).map(r => `${type}-${r.id}`),
    imdbId: d.imdb_id || d.external_ids?.imdb_id || '',
    overviews: extractOverviews(d.translations, d.overview),
    watch: extractWatchProviders(d['watch/providers']),
    // The season list comes back on the base TV response, so a breakdown costs
    // nothing extra. Full episode listings would need one request per season,
    // which is why only season-level detail is stored.
    seasonList: type === 'tv' ? extractSeasons(d.seasons) : undefined,
  };
}

// ── Translated synopses ──────────────────────────────────────────────────────
// The language switcher could only ever restyle the interface; synopses stayed
// English because the page had nothing else to show. TMDB returns every
// translation it holds on the same detail request, so collecting them costs no
// extra call.
//
// Only the site's own locales are kept, and only where TMDB has real text that
// differs from English — an entry that merely repeats the English would add
// page weight for nothing.
const SITE_LOCALES = ['hi', 'ur', 'bn', 'es', 'fr', 'de', 'pt', 'it', 'ru', 'tr', 'ar', 'id', 'ms', 'ja', 'ko', 'pl', 'bg', 'sv'];

function extractOverviews(translations, englishOverview) {
  const list = translations?.translations;
  if (!Array.isArray(list)) return undefined;

  const english = (englishOverview || '').trim();
  const out = {};
  for (const t of list) {
    const code = t.iso_639_1;
    if (!SITE_LOCALES.includes(code) || out[code]) continue;
    const overview = (t.data?.overview || '').trim();
    if (overview && overview !== english) out[code] = overview;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

// ── Season breakdown for TV ──────────────────────────────────────────────────
function extractSeasons(seasons) {
  const list = (seasons || [])
    // Season 0 is TMDB's specials bucket — usually a grab bag of recaps and
    // behind-the-scenes clips, and confusing next to the numbered seasons.
    .filter(s => s.season_number > 0 && s.episode_count > 0)
    .map(s => ({
      number: s.season_number,
      name: s.name || `Season ${s.season_number}`,
      episodes: s.episode_count,
      airDate: s.air_date || '',
      posterUrl: s.poster_path ? `${IMG_BASE}/w342${s.poster_path}` : '',
      overview: (s.overview || '').slice(0, 300),
    }));
  return list.length > 0 ? list : undefined;
}

// ── Official streaming availability ──────────────────────────────────────────
// India first, since that is where most of the audience is; US is only a
// fallback so a title still shows something rather than an empty section.
const WATCH_REGIONS = ['IN', 'US'];

function extractWatchProviders(block) {
  const results = block?.results;
  if (!results) return null;

  const region = WATCH_REGIONS.find(code => results[code]);
  if (!region) return null;

  const entry = results[region];
  const shape = list => (list || []).map(p => ({
    name: p.provider_name,
    logo: p.logo_path ? `${IMG_BASE}/w92${p.logo_path}` : '',
  }));

  // "ads" and "free" both mean watchable at no cost; MX Player and JioHotstar
  // land in one or the other depending on the title, so they are merged.
  const watch = {
    region,
    link: entry.link || '',
    stream: shape(entry.flatrate),
    free: [...shape(entry.free), ...shape(entry.ads)],
    rent: shape(entry.rent),
    buy: shape(entry.buy),
  };

  const hasAny = watch.stream.length || watch.free.length || watch.rent.length || watch.buy.length;
  return hasAny ? watch : null;
}

// ── OMDb ratings (IMDb, Rotten Tomatoes, Metacritic) ─────────────────────────
// TMDB carries only its own score. OMDb adds the three ratings people actually
// compare against, keyed on the IMDb id collected above.
//
// The free OMDb tier allows 1,000 requests a day and this runs on every
// Cloudflare build, so the pass is capped and aborts the moment OMDb reports
// the quota is gone — ratings are a bonus, never a reason for a build to fail.
const OMDB_MAX_TITLES = 200;

/**
 * ISO codes TMDB returns in `original_language` for Indian productions. Codes
 * rather than names, because that is the shape of the field being tested.
 */
const INDIAN_LANGUAGES = new Set([
  'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'mr', 'pa', 'gu', 'ur',
]);

function parseRating(ratings, source) {
  const hit = (ratings || []).find(r => r.Source === source);
  return hit?.Value || '';
}

async function fetchOmdb(imdbId, key) {
  const url = `https://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&apikey=${encodeURIComponent(key)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`OMDb HTTP ${res.status}`);
  const d = await res.json();

  // OMDb answers 200 with Response:"False" for both "not found" and a spent
  // quota, so the message is the only way to tell them apart.
  if (d.Response !== 'True') {
    const err = new Error(d.Error || 'OMDb lookup failed');
    err.quotaExhausted = /limit reached/i.test(d.Error || '');
    throw err;
  }

  const imdb = d.imdbRating && d.imdbRating !== 'N/A' ? d.imdbRating : '';
  const rotten = parseRating(d.Ratings, 'Rotten Tomatoes');
  const meta = d.Metascore && d.Metascore !== 'N/A' ? d.Metascore : '';
  if (!imdb && !rotten && !meta) return null;

  return {
    imdb,
    imdbVotes: d.imdbVotes && d.imdbVotes !== 'N/A' ? d.imdbVotes : '',
    rottenTomatoes: rotten,
    metacritic: meta,
    rated: d.Rated && d.Rated !== 'N/A' ? d.Rated : '',
  };
}

async function enrichWithOmdb(titles) {
  const key = process.env.OMDB_API_KEY;
  if (!key) {
    console.log('[movie-sync] OMDB_API_KEY not set — skipping IMDb/RT/Metacritic ratings');
    return;
  }

  // Two pools, interleaved, rather than one global popularity ranking.
  //
  // Sorting purely by TMDB vote count fills the whole budget with Hollywood:
  // even the 200th title had more votes than any Indian release, so of 92
  // Hindi-language titles only 5 were covered and no India-country title was
  // covered at all. Search Console puts 70% of this site's clicks in India, so
  // that spent the entire OMDb quota on the titles the audience opens least.
  //
  // Interleaving keeps the same request count — the quota is 1,000 a day and
  // several builds can run in one — while making the covered set look like the
  // traffic. Each pool stays vote-sorted, so within a pool the best-known
  // titles still come first and a truncated run degrades sensibly.
  const byVotes = (a, b) => (b.voteCount || 0) - (a.voteCount || 0);
  const eligible = titles.filter(t => t.imdbId);
  const isIndian = t =>
    INDIAN_LANGUAGES.has(t.originalLanguage) || (t.countries || []).includes('India');

  const indian = eligible.filter(isIndian).sort(byVotes);
  const global = eligible.filter(t => !isIndian(t)).sort(byVotes);

  const queue = [];
  for (let i = 0; queue.length < OMDB_MAX_TITLES && (i < indian.length || i < global.length); i++) {
    if (i < indian.length && queue.length < OMDB_MAX_TITLES) queue.push(indian[i]);
    if (i < global.length && queue.length < OMDB_MAX_TITLES) queue.push(global[i]);
  }

  // Report the split. The previous ranking silently covered 5 of 92 Hindi
  // titles, which is exactly the kind of thing that hides in a passing build.
  const indianInQueue = queue.filter(isIndian).length;
  console.log(
    `\n[movie-sync] Fetching OMDb ratings for ${queue.length} titles ` +
    `(${indianInQueue} Indian, ${queue.length - indianInQueue} global; ` +
    `pools: ${indian.length}/${global.length})...`,
  );
  let done = 0;
  let missing = 0;
  // Reasons are surfaced because a silent "0 attached" gives no way to tell a
  // rejected key from titles OMDb genuinely has no data for.
  const reasons = new Map();

  for (const title of queue) {
    try {
      const ratings = await fetchOmdb(title.imdbId, key);
      if (ratings) { title.ratings = ratings; done++; }
      else { missing++; reasons.set('no ratings in response', (reasons.get('no ratings in response') || 0) + 1); }
    } catch (err) {
      if (err.quotaExhausted) {
        console.log(`[movie-sync] OMDb daily quota reached — keeping the ${done} ratings fetched so far`);
        break;
      }
      missing++;
      reasons.set(err.message, (reasons.get(err.message) || 0) + 1);
      // A key OMDb refuses outright fails identically for every title, so stop
      // rather than spending 200 requests proving the same point. 401 is how a
      // wrong key arrives; the text variants are how an unactivated one does.
      if (/HTTP 401|invalid api key|no api key/i.test(err.message)) {
        console.log(`[movie-sync] OMDb rejected the key — skipping the rest of the pass`);
        break;
      }
    }
    await delay(120);
  }

  console.log(`[movie-sync] OMDb ratings attached to ${done} titles (${missing} skipped).`);
  for (const [reason, count] of [...reasons].sort((a, b) => b[1] - a[1]).slice(0, 3)) {
    console.log(`[movie-sync]   ${count}x ${reason}`);
  }
}

// ── Search index ─────────────────────────────────────────────────────────────
// Search asks the TMDB proxy on every keystroke, so results arrive a round trip
// late and cannot match on anything this site knows — cast, director, language,
// provider. Shipping the catalogue as a small index lets those queries be
// answered locally and instantly; the proxy still covers titles not held here.
//
// Fields are single letters because this file is downloaded by every visitor
// who opens search, and 900 records of readable keys is a lot of nothing.
function writeSearchIndex(titles) {
  const records = titles.map(t => ({
    s: t.slug,
    y: t.type === 'show' ? 1 : 0,
    t: t.title,
    r: t.year,
    v: t.rating,
    // Poster path only. Every URL shared the same TMDB prefix, which cost more
    // than the paths themselves; the client puts it back.
    p: (t.posterUrl || '').replace(/^https:\/\/image\.tmdb\.org\/t\/p\/w\d+/, ''),
    // Names people actually search by, flattened into one haystack. Four is
    // enough to catch the billed leads without doubling the download.
    c: [...t.cast.slice(0, 4).map(c => c.name), t.director].filter(Boolean).join('|'),
    g: (t.genres || []).join('|'),
    l: (t.languages || []).join('|'),
    w: t.watch ? [...t.watch.stream, ...t.watch.free].map(p => p.name).join('|') : '',
  }));

  const path = join(ROOT, 'public', 'search-index.json');
  writeFileSync(path, JSON.stringify({ built: new Date().toISOString(), items: records }), 'utf8');
  const kb = Math.round(Buffer.byteLength(JSON.stringify(records)) / 1024);
  console.log(`[movie-sync] Wrote search-index.json — ${records.length} records (${kb} KB).`);
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
  // Trakt sits behind a bot-protection edge that rejects datacenter and most
  // consumer IPs before the API key is ever read — the bare host answers 412
  // and the API answers a plain-text 403 whether the key is valid, wrong, or
  // absent. That is an upstream block, not a broken key or a bug here, so it
  // is reported as a skip and the previous cache is left untouched.
  if (res.status === 403 || res.status === 412) {
    const body = await res.text().catch(() => '');
    if (!body.trim().startsWith('{')) {
      const blocked = new Error(`blocked by Trakt's edge (HTTP ${res.status}) — needs an allowlisted IP`);
      blocked.isEdgeBlock = true;
      throw blocked;
    }
  }
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
  { key: 'telugu',           pages: 2 },
  { key: 'tamil',            pages: 2 },
  { key: 'malayalam',        pages: 2 },
  { key: 'kannada',          pages: 1 },
  { key: 'south-hindi-dubbed', pages: 2 },
  { key: 'indian-tv',        pages: 2 },
  { key: 'jiohotstar',       pages: 2 },
  { key: 'zee5',             pages: 1 },
  { key: 'sonyliv',          pages: 1 },
];

// ── Main ─────────────────────────────────────────────────────────────────────
// The category caches hold around 910 distinct titles between them. Capping the
// detail pass at 350 meant roughly 560 of them were fetched, counted, and then
// dropped — every one a page that could have ranked. Search Console shows the
// title pages taking almost no traffic, and this cap is a large part of why.
//
// The ceiling stays a little above the current pool so a sync that finds more
// titles is not silently truncated, while still bounding a runaway build.
const MAX_DETAIL_TITLES = 1000;

// Rebuilding the index from the titles already on disk takes a second, against
// nine minutes for a full sync — worth having when only its shape changed.
if (process.argv.includes('--index-only')) {
  const { items } = JSON.parse(readFileSync(join(CACHE_DIR, 'titles.json'), 'utf8'));
  writeSearchIndex(items);
  process.exit(0);
}

async function main() {
  console.log('\n[movie-sync] Starting TMDB data pipeline...\n');
  const t0 = Date.now();
  let ok = 0;
  let fail = 0;
  const candidates = new Map(); // "type-id" -> { type, id } — union across all categories, most-popular-first

  for (const { key, pages } of CATEGORIES) {
    try {
      process.stdout.write(`  Fetching ${key.padEnd(20)}`);
      const items = await fetchCategory(key, pages);
      writeCache(key, items);
      for (const item of items) {
        const k = `${item.type}-${item.id}`;
        if (!candidates.has(k)) candidates.set(k, { type: item.type, id: item.id });
      }
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
    if (err.isEdgeBlock) {
      console.log(`- skipped: ${err.message}`);
    } else {
      console.log(`✗ ${err.message}`);
      fail++;
    }
  }

  // ── Full-detail pass — real replacement for the old fictional sampleTitles.ts.
  // Powers movies/[slug].astro and shows/[slug].astro with real cast, director,
  // runtime, trailer, and a stable slug. Capped to keep build time and TMDB
  // rate-limit usage bounded.
  const toDetail = [...candidates.values()].slice(0, MAX_DETAIL_TITLES);
  console.log(`\n[movie-sync] Fetching full detail for ${toDetail.length} titles...`);
  const titles = [];
  let detailFail = 0;
  for (const { type, id } of toDetail) {
    try {
      const detail = await fetchTitleDetail(type, id);
      if (detail) titles.push(detail);
    } catch {
      detailFail++;
    }
    // ~7 requests a second. TMDB allows far more; this keeps a wide margin
    // while stopping the larger detail pass from dominating the build.
    await delay(140);
  }

  await enrichWithOmdb(titles);

  writeFileSync(
    join(CACHE_DIR, 'titles.json'),
    JSON.stringify({ fetchedAt: new Date().toISOString(), count: titles.length, items: titles }),
    'utf8'
  );
  console.log(`[movie-sync] Wrote titles.json — ${titles.length} titles (${detailFail} failed).`);

  writeSearchIndex(titles);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n[movie-sync] Done in ${elapsed}s — ${ok} succeeded, ${fail} failed.\n`);
}

main().catch(err => {
  console.error('[movie-sync] Fatal:', err.message);
  console.warn('[movie-sync] Continuing build with existing cache files.');
  process.exit(0);
});
