const TMDB_BASE = 'https://api.themoviedb.org/3';

export const GENRE_IDS: Record<string, number> = {
  action: 28, adventure: 12, animation: 16, comedy: 35, crime: 80,
  documentary: 99, drama: 18, family: 10751, fantasy: 14, history: 36,
  horror: 27, music: 10402, mystery: 9648, romance: 10749, 'sci-fi': 878,
  thriller: 53, war: 10752, western: 37,
};

export const PROVIDER_IDS: Record<string, string> = {
  netflix: '8', 'prime-video': '9', 'disney-plus': '337',
  'apple-tv-plus': '350', hulu: '15', 'hbo-max': '384',
  'paramount-plus': '531', crunchyroll: '283',
  jiohotstar: '122|220', sonyliv: '237', 'mx-player': '515',
};

export interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  media_type?: string;
  original_language?: string;
  adult?: boolean;
}

export interface TMDBResponse {
  results: TMDBItem[];
  total_pages: number;
  total_results: number;
}

async function tmdbFetch(path: string, params: Record<string, string> = {}, apiKey: string): Promise<any> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', apiKey);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
  return res.json();
}

export async function fetchCategory(type: string, apiKey: string): Promise<TMDBItem[]> {
  let data: TMDBResponse;

  switch (type) {
    case 'trending':
      data = await tmdbFetch('/trending/all/week', {}, apiKey);
      break;
    case 'latest': {
      const today = new Date().toISOString().split('T')[0];
      data = await tmdbFetch('/discover/movie', {
        sort_by: 'primary_release_date.desc',
        'primary_release_date.lte': today,
        'vote_count.gte': '20',
      }, apiKey);
      break;
    }
    case 'upcoming':
      data = await tmdbFetch('/movie/upcoming', { region: 'IN' }, apiKey);
      break;
    case 'popular':
      data = await tmdbFetch('/movie/popular', {}, apiKey);
      break;
    case 'tv-popular':
      data = await tmdbFetch('/tv/popular', {}, apiKey);
      break;
    case 'bollywood':
      data = await tmdbFetch('/discover/movie', {
        with_original_language: 'hi', sort_by: 'popularity.desc',
      }, apiKey);
      break;
    case 'hollywood':
      data = await tmdbFetch('/discover/movie', {
        with_original_language: 'en', sort_by: 'popularity.desc',
      }, apiKey);
      break;
    case 'korean-drama':
      data = await tmdbFetch('/discover/tv', {
        with_original_language: 'ko', with_genres: '18', sort_by: 'popularity.desc',
      }, apiKey);
      break;
    case 'anime':
      data = await tmdbFetch('/discover/tv', {
        with_original_language: 'ja', with_genres: '16', sort_by: 'popularity.desc',
      }, apiKey);
      break;
    case 'kids':
      data = await tmdbFetch('/discover/movie', {
        with_genres: '16,10751', sort_by: 'popularity.desc',
      }, apiKey);
      break;
    default: {
      // Platform-based or genre-based
      const providerId = PROVIDER_IDS[type];
      const genreId = GENRE_IDS[type];

      if (providerId) {
        data = await tmdbFetch('/discover/movie', {
          with_watch_providers: providerId,
          watch_region: 'IN',
          sort_by: 'popularity.desc',
        }, apiKey);
      } else if (genreId) {
        data = await tmdbFetch('/discover/movie', {
          with_genres: String(genreId),
          sort_by: 'popularity.desc',
        }, apiKey);
      } else {
        data = await tmdbFetch('/movie/popular', {}, apiKey);
      }
    }
  }

  return (data.results || []).filter(item => !item.adult && (item.title || item.name));
}

export async function searchTMDB(query: string, apiKey: string): Promise<TMDBItem[]> {
  const data: TMDBResponse = await tmdbFetch('/search/multi', { query }, apiKey);
  return (data.results || []).filter(item =>
    !item.adult && (item.media_type === 'movie' || item.media_type === 'tv') && (item.title || item.name)
  );
}

export async function fetchDetails(type: 'movie' | 'tv', id: number, apiKey: string): Promise<any> {
  return tmdbFetch(`/${type}/${id}`, { append_to_response: 'credits,recommendations,videos,similar' }, apiKey);
}

export function normalizeItem(item: TMDBItem) {
  const isTV = !!(item.name || item.first_air_date || item.media_type === 'tv');
  const title = item.title || item.name || 'Unknown';
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const type = isTV ? 'tv' : 'movie';

  return {
    id: item.id,
    type,
    title,
    year: year ? parseInt(year) : 0,
    rating: Math.round((item.vote_average || 0) * 10) / 10,
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    overview: item.overview || '',
    genreIds: item.genre_ids || [],
    language: item.original_language || 'en',
  };
}
