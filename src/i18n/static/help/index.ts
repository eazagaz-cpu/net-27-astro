import type { Lang } from '../../config';
import type { HelpDocs } from '../types';
import en from './en';
import hi from './hi';
import ur from './ur';
import bn from './bn';

/**
 * Help guides and the download page, per locale. Locales without a hand-written
 * translation resolve to English, so adding a routed locale can never 500 for
 * want of a translation.
 */
const DOCS: Partial<Record<Lang, HelpDocs>> = { en, hi, ur, bn };

export function getHelpDocs(lang: Lang): HelpDocs {
  return DOCS[lang] ?? en;
}
