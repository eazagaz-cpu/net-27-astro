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
  'spider-man-brand-new-day-969681',
  'the-death-of-robin-hood-1284465',
]);

/** TMDB IDs that must not be served (belt-and-suspenders alongside slugs). */
export const DMCA_DENIED_TMDB_IDS = new Set<number>([
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

