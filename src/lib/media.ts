import { TMDB_IMAGE_BASE, POSTER_SIZES, BACKDROP_SIZES } from './constants';

export function getPosterUrl(path: string, size: keyof typeof POSTER_SIZES = 'md'): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${POSTER_SIZES[size]}${path}`;
}

export function getBackdropUrl(path: string, size: keyof typeof BACKDROP_SIZES = 'md'): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${BACKDROP_SIZES[size]}${path}`;
}

export function getOptimizedImageAlt(title: string, type: 'poster' | 'backdrop' | 'cast' = 'poster'): string {
  const labels: Record<string, string> = {
    poster: `${title} official poster`,
    backdrop: `${title} backdrop image`,
    cast: `${title} cast promotional image`,
  };
  return labels[type] || `${title} image`;
}

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)',
  'linear-gradient(135deg, #8b0000 0%, #1a0000 100%)',
  'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
  'linear-gradient(135deg, #0c0c0c 0%, #333333 50%, #0c0c0c 100%)',
];

export function fallbackPoster(title: string): string {
  const idx = title.length % FALLBACK_GRADIENTS.length;
  return FALLBACK_GRADIENTS[idx];
}

export function fallbackBackdrop(title: string): string {
  const idx = (title.length + 2) % FALLBACK_GRADIENTS.length;
  return FALLBACK_GRADIENTS[idx];
}
