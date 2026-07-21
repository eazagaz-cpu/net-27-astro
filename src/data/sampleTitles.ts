import type { Genre, Language, Platform } from '../lib/types';

// Static metadata lists — genre/language/platform archive pages generate
// getStaticPaths from these and pull real titles live via DynamicGrid
// (functions/api/tmdb/category.js), not from any local title dataset.

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const genres: Genre[] = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Fantasy',
  'Animation',
  'Documentary',
  'Mystery',
  'Crime',
  'Adventure',
  'Family',
  'Kids',
  'Hindi Dubbed',
].map((name) => ({ slug: slugify(name), name }));

export const languages: Language[] = [
  'English',
  'Hindi',
  'Spanish',
  'Korean',
  'Japanese',
  'French',
  'German',
  'Turkish',
].map((name) => ({ slug: slugify(name), name }));

export const platforms: Platform[] = [
  'Netflix',
  'Prime Video',
  'Disney+',
  'Hulu',
  'Apple TV+',
  'Crunchyroll',
  'HBO Max',
  'Paramount+',
  'JioHotstar',
  'SonyLIV',
  'MX Player',
].map((name) => ({ slug: slugify(name), name }));
