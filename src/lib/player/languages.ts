export interface Lang {
  code: string;
  label: string;
}

export const LANGUAGES: Lang[] = [
  { code: 'default', label: 'Default' },
  { code: 'en',      label: 'English' },
  { code: 'hi',      label: 'Hindi' },
  { code: 'ar',      label: 'Arabic' },
  { code: 'fr',      label: 'French' },
  { code: 'ta',      label: 'Tamil' },
  { code: 'te',      label: 'Telugu' },
  { code: 'ml',      label: 'Malayalam' },
  { code: 'kn',      label: 'Kannada' },
  { code: 'es',      label: 'Spanish' },
  { code: 'pt',      label: 'Portuguese' },
  { code: 'de',      label: 'German' },
  { code: 'ko',      label: 'Korean' },
  { code: 'ja',      label: 'Japanese' },
  { code: 'zh',      label: 'Chinese' },
];

const LANG_KEY = 'netmirror:lang';

export function loadLang(): string {
  try { return localStorage.getItem(LANG_KEY) || 'default'; } catch { return 'default'; }
}

export function saveLang(code: string): void {
  try { localStorage.setItem(LANG_KEY, code); } catch {}
}

export function buildUrlWithLang(url: string, langCode: string): string {
  if (!langCode || langCode === 'default') return url;
  try {
    const u = new URL(url);
    u.searchParams.set('lang', langCode);
    return u.toString();
  } catch {
    return url;
  }
}
