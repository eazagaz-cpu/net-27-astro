import { DEFAULT_LANG, LANGUAGES, LANG_CODES, SITE_DOMAIN, type Lang } from './config';

export function getLangFromUrl(url: URL | string): Lang {
  const pathname = typeof url === 'string' ? url : url.pathname;
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first && LANG_CODES.includes(first as Lang) && first !== DEFAULT_LANG) {
    return first as Lang;
  }
  return DEFAULT_LANG;
}

export function stripLangFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  const first = segments[0];
  if (first && LANG_CODES.includes(first as Lang) && first !== DEFAULT_LANG) {
    return '/' + segments.slice(1).join('/') + (path.endsWith('/') ? '/' : '');
  }
  return path;
}

export function getLocalizedPath(path: string, lang: Lang): string {
  const clean = stripLangFromPath(path);
  if (lang === DEFAULT_LANG) return clean || '/';
  return `/${lang}${clean}`;
}

export function getDefaultLang(): Lang {
  return DEFAULT_LANG;
}

export function isRTL(lang: Lang): boolean {
  return LANGUAGES[lang].dir === 'rtl';
}

export function getDir(lang: Lang): 'ltr' | 'rtl' {
  return LANGUAGES[lang].dir;
}

export function getLanguageName(lang: Lang): string {
  const entry: { name: string; nativeName: string; dir: 'ltr' | 'rtl' } = LANGUAGES[lang];
  return entry.nativeName || entry.name || lang;
}

export function getAlternateLinks(path: string): { lang: string; href: string }[] {
  const clean = stripLangFromPath(path);
  const links: { lang: string; href: string }[] = [
    { lang: 'x-default', href: `${SITE_DOMAIN}${clean}` },
  ];
  for (const code of LANG_CODES) {
    const localPath = code === DEFAULT_LANG ? clean : `/${code}${clean}`;
    links.push({ lang: code, href: `${SITE_DOMAIN}${localPath}` });
  }
  return links;
}
