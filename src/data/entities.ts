import type { Country, Year } from '../lib/types';

// =====================
// COUNTRIES
// =====================
// Static list — country archive pages pull real titles live via DynamicGrid
// (functions/api/tmdb/category.js `country-{slug}`), not from any local dataset.

export const countries: Country[] = [
  {
    slug: 'united-states',
    name: 'United States',
    description: 'Hollywood remains the global epicenter of film and television production, home to major studios and streaming platforms that shape entertainment worldwide.',
  },
  {
    slug: 'united-kingdom',
    name: 'United Kingdom',
    description: 'The UK boasts a rich cinematic tradition spanning period dramas, gritty crime thrillers, and groundbreaking science fiction, supported by world-class talent and studios like Pinewood.',
  },
  {
    slug: 'japan',
    name: 'Japan',
    description: 'Japan is a powerhouse of both live-action cinema and animation, with its anime industry reaching global audiences and auteur filmmakers continuing to push creative boundaries.',
  },
  {
    slug: 'south-korea',
    name: 'South Korea',
    description: 'South Korean cinema and television have experienced an unprecedented global surge, with K-dramas and award-winning films captivating audiences across every continent.',
  },
  {
    slug: 'france',
    name: 'France',
    description: 'As the birthplace of cinema, France continues to produce influential films that balance artistic ambition with popular appeal, from auteur masterpieces to acclaimed documentaries.',
  },
  {
    slug: 'india',
    name: 'India',
    description: 'India produces more films annually than any other country, with Bollywood leading a diverse industry that spans multiple languages, regions, and storytelling traditions.',
  },
  {
    slug: 'germany',
    name: 'Germany',
    description: 'German cinema has a storied history from Expressionism to modern thrillers, and the country has become a major hub for international television production and co-productions.',
  },
  {
    slug: 'turkey',
    name: 'Turkey',
    description: 'Turkish television dramas have become a global phenomenon, exported to over 150 countries and captivating audiences with their sweeping narratives and production values.',
  },
  {
    slug: 'spain',
    name: 'Spain',
    description: 'Spanish cinema and television have gained international prominence with critically acclaimed thrillers, dramas, and genre-defying series that showcase the country\'s creative vitality.',
  },
  {
    slug: 'canada',
    name: 'Canada',
    description: 'Canada is a major filming destination and co-production partner, with a thriving domestic industry known for innovative independent films, horror, and science fiction.',
  },
];

export function getCountryBySlug(slug: string): Country | undefined {
  return countries.find(c => c.slug === slug);
}

// =====================
// YEARS
// =====================
// Static range — year archive pages pull real titles live via DynamicGrid
// (functions/api/tmdb/category.js, numeric `type`), not from any local dataset.

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = Array.from({ length: CURRENT_YEAR - 2009 }, (_, i) => CURRENT_YEAR - i);

export const years: Year[] = YEAR_RANGE.map(y => ({
  year: y,
  slug: String(y),
}));

export function getYearBySlug(slug: string): Year | undefined {
  return years.find(y => y.slug === slug);
}
