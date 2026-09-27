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
import { getAllRealTitles } from './realTitles';

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

/** First page of a category for server rendering; [] when there is no cache for it. */
export function gridInitialItems(category: string, limit = 40): GridItem[] {
  const direct = getCachedItems(category);
  const items = direct.length > 0 ? direct : getCachedItems(ALIASES[category] ?? '');
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
