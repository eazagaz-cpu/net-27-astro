import type { Lang } from '../config';
import type { StaticDocs } from './types';
import en from './en';
import hi from './hi';
import ur from './ur';
import bn from './bn';

/**
 * Prose-page content per locale.
 *
 * Only the routed locales carry a translation; everything else resolves to
 * English, which is also what the English routes render. Add a locale to
 * ROUTED_LANGS and it will fall back to English until its file lands here,
 * so a new route can never 500 for want of a translation.
 */
const DOCS: Partial<Record<Lang, StaticDocs>> = { en, hi, ur, bn };

export function getStaticDocs(lang: Lang): StaticDocs {
  return DOCS[lang] ?? en;
}

/**
 * Locales with a hand-written translation, as opposed to the English fallback.
 *
 * Routes are generated from this rather than from ROUTED_LANGS, so adding a
 * locale to the site cannot silently produce /xx/privacy/ pages wrapping
 * English prose — the page simply does not exist until it is translated.
 */
export const TRANSLATED_LANGS = Object.keys(DOCS) as Lang[];

export type { StaticDocs, LegalDoc, AboutDoc, ContactDoc, LegalDocKey, Block, CardRow } from './types';
