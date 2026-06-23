export const SITE_NAME = 'Net27';
export const SITE_URL = 'https://net-27.cc';
export const SITE_DESCRIPTION =
  'Discover movies, TV shows, and anime. Find where to watch legally across Netflix, Prime Video, Disney+, and more streaming platforms.';

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
  const title = `${input.title} | ${SITE_NAME} - Movie & Show Discovery`;
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
