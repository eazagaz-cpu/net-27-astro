import { DEFAULT_LANG, type Lang } from './config';
import en from './locales/en.json';

const localeCache: Partial<Record<Lang, typeof en>> = { en };

const loaders: Record<Lang, () => Promise<{ default: typeof en }>> = {
  en: () => import('./locales/en.json'),
  hi: () => import('./locales/hi.json'),
  es: () => import('./locales/es.json'),
  ru: () => import('./locales/ru.json'),
  fr: () => import('./locales/fr.json'),
  de: () => import('./locales/de.json'),
  it: () => import('./locales/it.json'),
  pt: () => import('./locales/pt.json'),
  bn: () => import('./locales/bn.json'),
  ja: () => import('./locales/ja.json'),
  ko: () => import('./locales/ko.json'),
  ms: () => import('./locales/ms.json'),
  pl: () => import('./locales/pl.json'),
  id: () => import('./locales/id.json'),
  ar: () => import('./locales/ar.json'),
  bg: () => import('./locales/bg.json'),
  tr: () => import('./locales/tr.json'),
  sv: () => import('./locales/sv.json'),
  ur: () => import('./locales/ur.json'),
};

export async function loadTranslations(lang: Lang): Promise<typeof en> {
  if (localeCache[lang]) return localeCache[lang]!;
  try {
    const mod = await loaders[lang]();
    localeCache[lang] = mod.default;
    return mod.default;
  } catch {
    return en;
  }
}

export function getTranslations(lang: Lang): typeof en {
  return localeCache[lang] || en;
}

type NestedKeys<T, Prefix extends string = ''> = T extends object
  ? { [K in keyof T]: K extends string ? NestedKeys<T[K], Prefix extends '' ? K : `${Prefix}.${K}`> : never }[keyof T]
  : Prefix;

export function t(translations: typeof en, key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = translations;
  for (const k of keys) {
    value = value?.[k];
  }
  if (typeof value !== 'string') {
    let fallback: any = en;
    for (const k of keys) fallback = fallback?.[k];
    value = typeof fallback === 'string' ? fallback : key;
  }
  if (params && typeof value === 'string') {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{${k}}`, String(v));
    }
  }
  return value;
}

export { getLangFromUrl, stripLangFromPath, getLocalizedPath, getDefaultLang, isRTL, getDir, getLanguageName, getAlternateLinks } from './utils';
export { DEFAULT_LANG, LANGUAGES, LANG_CODES, RTL_LANGS, TMDB_LANG_MAP } from './config';
export type { Lang } from './config';
