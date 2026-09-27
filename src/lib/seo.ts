import { SITE_NAME, SITE_URL } from './constants';

export { SITE_NAME, SITE_URL };

export const SITE_DESCRIPTION = 'NET27 Watch — Movie & TV discovery. Find where to stream legally on Netflix, Prime Video, JioHotstar, SonyLIV and more. 500,000+ titles with official streaming options.';

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
  /** Billed cast names, lead first. */
  cast?: string[];
}

/** Snippet budget; generateSEO cuts anything longer with "…". */
const DESCRIPTION_BUDGET = 145;

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
  // Search Console (Sep 2026): title pages averaged 3.5% CTR, and the queries
  // reaching them add "watch", "online", "streaming". The longest qualifier
  // that fits wins. Long names would otherwise be cut mid-qualifier
  // ("… — Where to…"), which reads as a broken title, so a qualifier that does
  // not fit is dropped whole rather than truncated.
  const qualifier = [' — Where to Watch Online', ' — Where to Watch']
    .find(q => base.length + q.length <= TITLE_BUDGET);
  return qualifier ? `${base}${qualifier}` : base;
}

/** "Starring A & B." when it fits after `text` within the snippet budget. */
function withStarring(text: string, cast: string[] | undefined): string {
  const names = (cast ?? []).filter(Boolean);
  for (const n of [2, 1]) {
    if (names.length < n) continue;
    const line = `${text} Starring ${names.slice(0, n).join(' & ')}.`;
    if (line.length <= DESCRIPTION_BUDGET) return line;
  }
  return text;
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
  const { name, year, overview, watch, cast } = input;
  const region = watch ? (REGION_NAMES[watch.region] ?? watch.region) : '';

  // Named leads make each snippet specific to its film, and match the
  // "<title> cast" searches; they replace the generic tail when there is room.
  if (watch) {
    const streaming = [...watch.stream, ...watch.free].map(p => p.name);
    if (streaming.length > 0) {
      const lead = `Where to watch ${name} (${year}) in ${region} — streaming on ${streaming.slice(0, 3).join(', ')}.`;
      const starred = withStarring(lead, cast);
      return starred !== lead ? starred : `${lead} Cast, ratings and official availability.`;
    }
    if (watch.rent.length > 0) {
      const lead = `Where to watch ${name} (${year}) in ${region} — available to rent on ${watch.rent.slice(0, 2).map(p => p.name).join(', ')}.`;
      const starred = withStarring(lead, cast);
      return starred !== lead ? starred : `${lead} Cast, ratings and availability.`;
    }
  }

  const synopsis = overview ? ` ${overview}` : '';
  return `Where to watch ${name} (${year}).${synopsis} Streaming availability, cast, ratings and release details.`;
}

/**
 * The share preview for one title.
 *
 * A generated card was tried first and cannot work here: Facebook, X, WhatsApp
 * and LinkedIn only render raster previews, so an SVG returned by a Function is
 * simply dropped, and rasterising one per request costs more CPU than a Pages
 * Function is allowed. The backdrop TMDB already gives us is a real JPEG at
 * close to the 1.91:1 ratio these crawlers want, needs no request of our own,
 * and shows the actual film — so it beats a generated card on every count.
 *
 * 46 of 920 titles have no backdrop; those keep the site card.
 */
export function titleOgImage(
  backdropUrl: string | undefined | null,
  titleName: string,
): { ogImage: string; ogImageWidth: number; ogImageHeight: number; ogImageAlt: string } {
  // w1280 rather than the stored `original`: originals run to several MB, and
  // crawlers give up on images past about 5MB.
  const sized = backdropUrl?.replace('/t/p/original/', '/t/p/w1280/');
  if (!sized) {
    return {
      ogImage: `${SITE_URL}/og-image.png`,
      ogImageWidth: 1200,
      ogImageHeight: 630,
      ogImageAlt: `${titleName} on ${SITE_NAME}`,
    };
  }
  // TMDB backdrops are 16:9, which w1280 makes 1280×720.
  return {
    ogImage: sized,
    ogImageWidth: 1280,
    ogImageHeight: 720,
    ogImageAlt: `${titleName} — backdrop image`,
  };
}

export function generateSEO(input: SEOInput): SEOOutput {
  const hasBrand = input.title.toLowerCase().includes('net27') || input.title.toLowerCase().includes('net27 watch');
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
