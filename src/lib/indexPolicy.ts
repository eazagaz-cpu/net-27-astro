/**
 * Which detail pages ask Google to index them.
 *
 * Search Console, 2 Oct to 22 Oct 2026: pages earning impressions fell from
 * 1,718 to 8, in two drops (3 Oct, 18-19 Oct). Of 74 sampled URLs, 26 were
 * "Crawled - currently not indexed", 40 "URL is unknown to Google" and 3
 * indexed. About 6,400 of the 11,219 sitemap URLs repeated an English page:
 *   - hi/ur/bn title pages with no synopsis in that language (their HTML even
 *     carried the English one; the translation was swapped in by JS), and
 *   - actor pages in four languages, where the filmography is identical.
 * On the owner's decision (2026-10-23) those are noindex. English pages, and
 * localized title pages that have their own synopsis, stay indexable. The
 * build then drops every noindex page from the sitemap (astro.config.mjs), so
 * the two can never disagree.
 */
import { DEFAULT_LANG, DETAIL_PAGE_LANGS, type Lang } from '../i18n/config';

/**
 * Locales whose pages may be indexed at all: English plus Hindi, Urdu and
 * Bangla, where the audience is. The other routed locales only translate the
 * interface around the same English lists; in the 60 days to 2026-10-22 they
 * drew under 900 clicks each, mostly from detail pages that now redirect to
 * English. Their pages stay live but are noindex and out of every hreflang
 * cluster (SEOHead).
 */
export const INDEXABLE_LANGS: readonly Lang[] = DETAIL_PAGE_LANGS;

export function isIndexableLang(lang: Lang): boolean {
  return INDEXABLE_LANGS.includes(lang);
}

/**
 * An English actor page is indexable from this many credits. In the 60 days to
 * 2026-10-22, 1,517 actor pages drew 22,485 impressions and 31 clicks; a
 * three- or four-poster filmography answers almost nothing. 863 of the 1,265
 * pages had 3-4 credits; the 402 with five or more stay indexable.
 */
export const MIN_INDEXABLE_CREDITS = 5;

/** Shortest TMDB synopsis that counts as the title's own text in a language. */
const MIN_LOCAL_OVERVIEW = 40;

interface Localizable {
  overviews?: Record<string, string>;
  retainedSince?: string;
}

/** The title's synopsis in `lang`, when TMDB has a real one; never for English. */
export function localOverview(title: Localizable, lang: Lang): string | undefined {
  if (lang === DEFAULT_LANG) return undefined;
  const text = title.overviews?.[lang]?.trim();
  return text && text.length >= MIN_LOCAL_OVERVIEW ? text : undefined;
}

/**
 * Detail locales whose version of this title page is indexable: English, plus
 * each localized route that has its own synopsis. Retained titles have no
 * localized routes at all.
 */
export function indexableTitleLocales(title: Localizable): Lang[] {
  if (title.retainedSince) return [DEFAULT_LANG];
  return DETAIL_PAGE_LANGS.filter((lang) => lang === DEFAULT_LANG || localOverview(title, lang) !== undefined);
}
