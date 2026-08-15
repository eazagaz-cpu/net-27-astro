export const DEFAULT_LANG = 'en' as const;
export const SITE_DOMAIN = 'https://net-27.cc';

export const LANGUAGES = {
  en: { name: 'English', nativeName: 'English', dir: 'ltr' as const },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' as const },
  es: { name: 'Spanish', nativeName: 'Español', dir: 'ltr' as const },
  ru: { name: 'Russian', nativeName: 'Русский', dir: 'ltr' as const },
  fr: { name: 'French', nativeName: 'Français', dir: 'ltr' as const },
  de: { name: 'German', nativeName: 'Deutsch', dir: 'ltr' as const },
  it: { name: 'Italian', nativeName: 'Italiano', dir: 'ltr' as const },
  pt: { name: 'Portuguese', nativeName: 'Português', dir: 'ltr' as const },
  bn: { name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' as const },
  ja: { name: 'Japanese', nativeName: '日本語', dir: 'ltr' as const },
  ko: { name: 'Korean', nativeName: '한국어', dir: 'ltr' as const },
  ms: { name: 'Malay', nativeName: 'Bahasa Melayu', dir: 'ltr' as const },
  pl: { name: 'Polish', nativeName: 'Polski', dir: 'ltr' as const },
  id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr' as const },
  ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl' as const },
  bg: { name: 'Bulgarian', nativeName: 'Български', dir: 'ltr' as const },
  tr: { name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr' as const },
  sv: { name: 'Swedish', nativeName: 'Svenska', dir: 'ltr' as const },
  ur: { name: 'Urdu', nativeName: 'اردو', dir: 'rtl' as const },
} as const;

export type Lang = keyof typeof LANGUAGES;
export const LANG_CODES = Object.keys(LANGUAGES) as Lang[];

/**
 * Locales that get their own statically generated routes.
 *
 * Every locale in LANGUAGES stays selectable — the client-side switcher covers
 * them all — but only these are built as separate pages. Building all nineteen
 * produced roughly 25,000 pages and Cloudflare's builder was killed part way
 * through every time, so the site stopped deploying entirely.
 *
 * The choice follows the audience: Search Console puts 70% of clicks in India,
 * 10% in Pakistan and 2% in Bangladesh. hreflang is generated from this list
 * rather than from LANGUAGES, so it never points at a URL that does not exist.
 */
export const ROUTED_LANGS: Lang[] = [
  // Audience first: Search Console puts 70% of clicks in India, 10% in
  // Pakistan, 2% in Bangladesh.
  'en', 'hi', 'ur', 'bn',
  // Then the largest remaining language communities. Added in batches and
  // measured each time, because routing all nineteen at once produced ~25,000
  // pages and Cloudflare's builder was killed part way through, four times —
  // the logs stopped mid-render with no error, which is what an out-of-memory
  // kill looks like rather than a timeout.
  'es', 'ar', 'id', 'pt',
  'ru', 'fr', 'de', 'tr',
  // Measured ceiling. 15,937 pages (12 locales) builds; 21,205 (16) does not —
  // the log stops mid-render with no error, which is an out-of-memory kill, not
  // a timeout. Build time was never the constraint: 5,400 pages took 250s and
  // 10,668 took 237s, because the clock is spent in movie-sync fetching from
  // TMDB, a fixed cost. Adding more locales needs the builder's memory raised
  // or the page count per locale reduced, not a longer build window.
];

export const RTL_LANGS: Lang[] = ['ar', 'ur'];

export const TMDB_LANG_MAP: Record<Lang, string> = {
  en: 'en-US', hi: 'hi-IN', es: 'es-ES', ru: 'ru-RU', fr: 'fr-FR',
  de: 'de-DE', it: 'it-IT', pt: 'pt-BR', bn: 'bn-BD', ja: 'ja-JP',
  ko: 'ko-KR', ms: 'ms-MY', pl: 'pl-PL', id: 'id-ID', ar: 'ar-SA',
  bg: 'bg-BG', tr: 'tr-TR', sv: 'sv-SE', ur: 'ur-PK',
};
