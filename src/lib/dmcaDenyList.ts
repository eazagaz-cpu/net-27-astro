/**
 * dmcaDenyList.ts — DMCA/legal takedown deny list.
 *
 * Slugs and TMDB IDs listed here are:
 *   1. Excluded from getStaticPaths (movie/show pages never generated -> genuine 404)
 *   2. Excluded from the sitemap
 *   3. Enforced at Cloudflare Pages Function layer (functions/player.js -> 404 for /player?id=...)
 *
 * To add a new removal: append the slug and/or TMDB ID.
 * Do NOT remove existing entries — the list is a permanent legal record.
 *
 * Cloudflare Report IDs:
 *   afd2de4e15d0c7ae  /movies/spider-man-brand-new-day-969681
 *   a37e65dce9a83274  /movies/the-death-of-robin-hood-1284465/
 *   451 active        /player?id=1477712&type=movie
 */

/** Slugs that must not be served. Used to filter getStaticPaths. */
export const DMCA_DENIED_SLUGS = new Set<string>([
  'dna-journey-95334',  // Report 4-3544000041599-1791877662
  'neagley-273207',  // Report 8-9482000041961-0983248293
  'elsbeth-226285',  // Report 9-1394000041259-0388052934
  'motor-city-87513',  // Report 5-6368000041919-0472668742
  'mutiny-1288445',  // Report 4-0245000041850-1105303401
  'the-rivals-of-amziah-king-1124142',  // Report 1-6787000041872-2058879532
  'her-private-hell-1469342',  // Report 7-9227000041270-0278538683
  'physical-100-mexico-332282',  // Report 8-9857000041155-2050300815
  'coyote-vs-acme-1204680',  // Report 3-8650000041167-0215118043
  'modha-rathri-1685882',  // Report 0-5244000040961-0510082230
  'irumudi-1441228',  // Report 8-5441000041004-0209944395
  'spa-weekend-1341138',  // Report 8-3283000042085-2124411901
  'spider-island-1462861',  // Report 5-0925000041952-1463337483
  'awarapan-2-1444466',  // Report 2-1742000042305-0465477435
  'monster-mia-1572116',  // Report 5-5498000041661-2024935596
  'spider-man-brand-new-day-969681',
  'the-death-of-robin-hood-1284465',
  'ice-cream-man-1477712',
]);

/** TMDB IDs that must not be served (belt-and-suspenders alongside slugs). */
export const DMCA_DENIED_TMDB_IDS = new Set<number>([
  95334,  // TMDB ID 95334 — Report 4-3544000041599-1791877662
  273207,  // TMDB ID 273207 — Report 8-9482000041961-0983248293
  226285,  // TMDB ID 226285 — Report 9-1394000041259-0388052934
  1400357,  // TMDB ID 1400357 — Report 9-2165000041310-1923643827
  87513,  // TMDB ID 87513 — Report 5-6368000041919-0472668742
  1212763,  // TMDB ID 1212763 — Report 6-9633000040951-0976351274
  634649,  // TMDB ID 634649 — Report 2-0887000041399-1946778762
  1288445,  // TMDB ID 1288445 — Report 4-0245000041850-1105303401
  1124142,  // TMDB ID 1124142 — Report 1-6787000041872-2058879532
  1701141,  // TMDB ID 1701141 — Report bca639c43b56bc0b
  1469342,  // TMDB ID 1469342 — Report 7-9227000041270-0278538683
  332282,  // TMDB ID 332282 — Report 8-9857000041155-2050300815
  1204680,  // TMDB ID 1204680 — Report 3-8650000041167-0215118043
  1685882,  // TMDB ID 1685882 — Report 0-5244000040961-0510082230
  1441228,  // TMDB ID 1441228 — Report 8-5441000041004-0209944395
  1471168,  // TMDB ID 1471168 — Report 9-2085000041762-1122044031
  1341138,  // TMDB ID 1341138 — Report 8-3283000042085-2124411901
  1462861,  // TMDB ID 1462861 — Report 5-0925000041952-1463337483
  1444466,  // TMDB ID 1444466 — Report 2-1742000042305-0465477435
  1572116,  // TMDB ID 1572116 — Report 5-5498000041661-2024935596
  969681,   // Spider-Man: Brand New Day — Report afd2de4e15d0c7ae
  1284465,  // The Death of Robin Hood    — Report a37e65dce9a83274
  1477712,  // Player ID — 451 active
]);

/**
 * Returns true when a title's slug or TMDB ID appears on the deny list.
 * Use this guard in every getStaticPaths that generates title pages.
 */
export function isDmcaDenied(slug: string, tmdbId?: number): boolean {
  if (DMCA_DENIED_SLUGS.has(slug)) return true;
  if (tmdbId !== undefined && DMCA_DENIED_TMDB_IDS.has(tmdbId)) return true;
  return false;
}

/**
 * Returns true when a TMDB ID is on the deny list.
 */
export function isDmcaBlockedId(id: string | number): boolean {
  const num = typeof id === 'string' ? parseInt(id, 10) : id;
  return !Number.isNaN(num) && DMCA_DENIED_TMDB_IDS.has(num);
}

