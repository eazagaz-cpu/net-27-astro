/**
 * gridItems.ts — server-rendered first page for DynamicGrid, linked to the
 * real title pages.
 *
 * DynamicGrid used to render nothing on the server for most hubs (genre,
 * platform, language, country, year, Hindi dubbed…) and, where it did
 * (trending, latest), every card linked to the noindex /detail/?id= route. So
 * dozens of hub pages passed no link equity to a single title page. Items
 * built here carry the title page slug when the title has one, and the grid
 * links /movies/<slug>/ or /shows/<slug>/ instead.
 */
import { getCachedItems } from './movie-cache';
import { getAllRealTitles, type RealTitle } from './realTitles';

export interface GridItem {
  id: number;
  type: string;
  title: string;
  year: number;
  rating: number;
  posterUrl: string;
  backdropUrl?: string;
  /** Slug of this title's page, when it has one. */
  slug?: string;
}

/** Same aliases DynamicGrid uses for its static-cache fallback. */
const ALIASES: Record<string, string> = {
  latest: 'latest-movies',
  popular: 'popular-movies',
  'tv-popular': 'popular-tv',
  'top-rated': 'top-rated-movies',
};

let slugIndex: Map<string, string> | null = null;
function slugFor(type: string, id: number): string | undefined {
  slugIndex ??= new Map(getAllRealTitles().map(t => [`${t.type}-${t.tmdbId}`, t.slug]));
  return slugIndex.get(`${type === 'tv' ? 'show' : type}-${id}`);
}

/** Adds title-page slugs to items from any cache or API shape. */
export function withTitleSlugs<T extends { id: number; type: string }>(items: T[]): (T & { slug?: string })[] {
  return items.map(item => ({ ...item, slug: slugFor(item.type, item.id) }));
}

/**
 * Picks catalogue titles for a hub that has no category cache. Many genre,
 * year, country and language hubs (/genre/action/, /year/2025/, …) have no
 * cache file, so they rendered an empty grid: no content and no links for
 * search engines. The catalogue (titles.json) covers all of them.
 */
export interface HubFilter {
  genre?: string;      // hub slug, e.g. "sci-fi"
  year?: number;
  country?: string;    // hub slug, e.g. "united-states"
  language?: string;   // hub slug, e.g. "tamil"
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/** TMDB splits some genres differently for movies and TV. */
const GENRE_NAMES: Record<string, string[]> = {
  action: ['Action', 'Action & Adventure'],
  adventure: ['Adventure', 'Action & Adventure'],
  fantasy: ['Fantasy', 'Sci-Fi & Fantasy'],
  'sci-fi': ['Science Fiction', 'Sci-Fi & Fantasy'],
};
const LANGUAGE_CODES: Record<string, string> = {
  english: 'en', french: 'fr', german: 'de', hindi: 'hi', japanese: 'ja', kannada: 'kn',
  korean: 'ko', malayalam: 'ml', spanish: 'es', tamil: 'ta', telugu: 'te', turkish: 'tr', urdu: 'ur',
  bengali: 'bn', marathi: 'mr', punjabi: 'pa', chinese: 'zh', portuguese: 'pt', italian: 'it',
};

function matches(t: RealTitle, f: HubFilter): boolean {
  if (f.year !== undefined && t.year !== f.year) return false;
  if (f.genre) {
    const names = GENRE_NAMES[f.genre];
    if (!t.genres.some(g => (names ? names.includes(g) : slugify(g) === f.genre))) return false;
  }
  if (f.country && !(t.countries ?? []).some(c => { const s = slugify(c); return s === f.country || s.startsWith(`${f.country}-`); })) return false;
  if (f.language && t.originalLanguage !== LANGUAGE_CODES[f.language]) return false;
  return true;
}

export function catalogueGridItems(filter: HubFilter, limit = 40): GridItem[] {
  return getAllRealTitles()
    .filter(t => matches(t, filter))
    // Live titles first, then the best-known (most votes).
    .sort((a, b) => Number(!!a.retainedSince) - Number(!!b.retainedSince) || (b.voteCount ?? 0) - (a.voteCount ?? 0))
    .slice(0, limit)
    .map(t => ({
      id: t.tmdbId,
      // Grid items use the API's "tv"; slugs are matched on type + id.
      type: t.type === 'show' ? 'tv' : 'movie',
      title: t.title,
      year: t.year,
      rating: t.rating,
      posterUrl: t.posterUrl,
      backdropUrl: t.backdropUrl,
      slug: t.slug,
    }));
}

/** The catalogue filter for an ArchivePage hub, when its kind has one. */
export function archiveFilter(kind: string, slug: string): HubFilter | undefined {
  if (kind === 'genre') return { genre: slug };
  if (kind === 'year' && /^\d{4}$/.test(slug)) return { year: Number(slug) };
  if (kind === 'country') return { country: slug };
  if (kind === 'language') return { language: slug };
  return undefined;
}

/**
 * First page of a category for server rendering: the category cache when
 * there is one, otherwise catalogue titles matching `fallback`, otherwise [].
 */
export function gridInitialItems(category: string, fallback?: HubFilter, limit = 40): GridItem[] {
  const direct = getCachedItems(category);
  const items = direct.length > 0 ? direct : getCachedItems(ALIASES[category] ?? '');
  if (items.length === 0 && fallback) return catalogueGridItems(fallback, limit);
  return withTitleSlugs(items.slice(0, limit) as unknown as GridItem[]).map(i => ({
    id: i.id,
    type: i.type,
    title: i.title,
    year: i.year,
    rating: i.rating,
    posterUrl: i.posterUrl,
    backdropUrl: i.backdropUrl,
    slug: i.slug,
  }));
}
