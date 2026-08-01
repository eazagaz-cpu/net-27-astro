import { SITE_NAME, SITE_URL } from './constants';

export { SITE_NAME, SITE_URL };

export const SITE_DESCRIPTION = 'Watch movies, TV shows, and anime. Multi-language audio. 500k+ titles across Netflix, Prime Video, JioHotstar, SonyLIV, Crunchyroll, and more.';

export interface SEOInput {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

export interface SEOOutput {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  noindex: boolean;
}

function truncateSeoText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;

  const candidate = normalized.slice(0, maxLength - 1);
  const lastSpace = candidate.lastIndexOf(' ');
  const cleanCut = lastSpace >= Math.floor(maxLength * 0.7)
    ? candidate.slice(0, lastSpace)
    : candidate;
  return `${cleanCut.replace(/[\s,;:–—-]+$/u, '')}…`;
}

export function generateSEO(input: SEOInput): SEOOutput {
  const hasBrand = input.title.toLowerCase().includes('netmirror') || input.title.toLowerCase().includes('net mirror');
  const brandSuffix = ` | ${SITE_NAME}`;
  const title = hasBrand
    ? truncateSeoText(input.title, 60)
    : `${truncateSeoText(input.title, 60 - brandSuffix.length)}${brandSuffix}`;
  const description = truncateSeoText(input.description, 155);
  const canonical = input.canonical ?? SITE_URL;
  const ogImage = input.ogImage ?? `${SITE_URL}/og-image.png`;
  const ogType = input.ogType ?? 'website';

  return {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogType,
    twitterCard: 'summary_large_image',
    noindex: input.noindex ?? false,
  };
}
