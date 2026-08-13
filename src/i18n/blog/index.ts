import type { Lang } from '../config';
import { ROUTED_LANGS, DEFAULT_LANG } from '../config';

/**
 * Localized blog articles.
 *
 * The translatable subset of BlogPost. Everything omitted here — slug, author,
 * date, image, readTime, relatedSlugs — is shared with the English original, so
 * a translation can never disagree with it about which article it is or when it
 * was published.
 */
export interface LocalizedPost {
  title: string;
  excerpt: string;
  /** Full article body as HTML. Heading `id` attributes must match `toc` ids. */
  content: string;
  category: string;
  tags: string[];
  quickAnswer?: string;
  /** Same ids and order as the English toc; only the titles are translated. */
  toc?: { id: string; title: string; level: number }[];
  faqs?: { question: string; answer: string }[];
  tables?: { caption?: string; headers: string[]; rows: string[][] }[];
  pros?: string[];
  cons?: string[];
  safetyNote?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  /** Localized "N min read"; falls back to the English string when absent. */
  readTime?: string;
}

/**
 * One file per article per locale, at ./<lang>/<slug>.ts. Glob-imported so
 * adding a translation is a single new file with no index to keep in step —
 * and, critically, so an article with no translation simply has no localized
 * route rather than a localized URL wrapping an English body.
 */
const modules = import.meta.glob<{ default: LocalizedPost }>('./*/*.ts', { eager: true });

const byLang = new Map<Lang, Map<string, LocalizedPost>>();

for (const [path, mod] of Object.entries(modules)) {
  const match = path.match(/^\.\/([a-z]{2})\/(.+)\.ts$/);
  if (!match) continue;
  const [, lang, slug] = match as unknown as [string, Lang, string];
  if (lang === DEFAULT_LANG || !ROUTED_LANGS.includes(lang)) continue;
  if (!byLang.has(lang)) byLang.set(lang, new Map());
  byLang.get(lang)!.set(slug, mod.default);
}

/** The translation for one article in one locale, or undefined. */
export function getLocalizedPost(lang: Lang, slug: string): LocalizedPost | undefined {
  return byLang.get(lang)?.get(slug);
}

/** Slugs translated into `lang`, in no particular order. */
export function translatedSlugs(lang: Lang): string[] {
  return [...(byLang.get(lang)?.keys() ?? [])];
}

/** Non-default locales that have this article, for its hreflang cluster. */
export function localesWithPost(slug: string): Lang[] {
  return [...byLang.entries()].filter(([, posts]) => posts.has(slug)).map(([lang]) => lang);
}

/** Every (lang, slug) pair that has a translation — the localized route list. */
export function translatedPairs(): { lang: Lang; slug: string }[] {
  return [...byLang.entries()].flatMap(([lang, posts]) =>
    [...posts.keys()].map(slug => ({ lang, slug })),
  );
}

/** Per-locale progress, for the coverage report. */
export function coverage(): Record<string, number> {
  return Object.fromEntries([...byLang.entries()].map(([lang, posts]) => [lang, posts.size]));
}
