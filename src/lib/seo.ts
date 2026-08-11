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

const REGION_NAMES: Record<string, string> = { IN: 'India', US: 'the US' };

/** Characters available for a page title once generateSEO appends " | NetMirror". */
const TITLE_BUDGET = 60 - ` | ${SITE_NAME}`.length;

interface TitleSeoInput {
  name: string;
  year: number;
  overview: string;
  /** Resolved availability from the sync; shape matches RealWatchAvailability. */
  watch?: { region: string; stream: { name: string }[]; free: { name: string }[]; rent: { name: string }[] } | null;
  /** Set when another title shares this name and year, to keep titles distinct. */
  disambiguator?: string | number;
}

/**
 * Search titles for a movie or show page.
 *
 * The name leads because the queries that reach these pages are the title
 * itself, usually with the brand appended — and generateSEO adds the brand
 * suffix, so repeating it here would only eat the character budget.
 */
export function titleSeoHeading(input: TitleSeoInput): string {
  const suffix = input.disambiguator ? ` [${input.disambiguator}]` : '';
  const base = `${input.name} (${input.year})${suffix}`;
  const qualifier = ' — Where to Watch';
  // Long names would otherwise be cut mid-qualifier ("… — Where to…"), which
  // reads as a broken title. Dropping it whole is tidier than truncating it.
  return base.length + qualifier.length <= TITLE_BUDGET ? `${base}${qualifier}` : base;
}

/**
 * Search snippet for a movie or show page.
 *
 * Where real availability exists it is named, because that is both the reason
 * someone is searching and the thing that makes the snippet unique per title.
 * Nothing here is invented: with no provider data the snippet falls back to the
 * synopsis rather than claiming a title is streaming somewhere.
 */
export function titleSeoDescription(input: TitleSeoInput): string {
  const { name, year, overview, watch } = input;
  const region = watch ? (REGION_NAMES[watch.region] ?? watch.region) : '';

  if (watch) {
    const streaming = [...watch.stream, ...watch.free].map(p => p.name);
    if (streaming.length > 0) {
      return `Where to watch ${name} (${year}) in ${region} — streaming on ${streaming.slice(0, 3).join(', ')}. Cast, ratings and official availability.`;
    }
    if (watch.rent.length > 0) {
      return `Where to watch ${name} (${year}) in ${region} — available to rent on ${watch.rent.slice(0, 2).map(p => p.name).join(', ')}. Cast, ratings and availability.`;
    }
  }

  const synopsis = overview ? ` ${overview}` : '';
  return `Where to watch ${name} (${year}).${synopsis} Streaming availability, cast, ratings and release details.`;
}

export function generateSEO(input: SEOInput): SEOOutput {
  const hasBrand = input.title.toLowerCase().includes('netmirror') || input.title.toLowerCase().includes('net mirror');
  const brandSuffix = ` | ${SITE_NAME}`;
  const title = hasBrand
    ? truncateSeoText(input.title, 60)
    : `${truncateSeoText(input.title, TITLE_BUDGET)}${brandSuffix}`;
  // A slightly tighter limit avoids pixel-width overflow for wide glyphs while
  // preserving a useful, complete search snippet on mobile and desktop.
  const description = truncateSeoText(input.description, 145);
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
