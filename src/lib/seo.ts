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

export function generateSEO(input: SEOInput): SEOOutput {
  const title = `${input.title} | ${SITE_NAME}`;
  const description = input.description;
  const canonical = input.canonical ?? SITE_URL;
  const ogImage = input.ogImage ?? `${SITE_URL}/images/og-default.webp`;
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
