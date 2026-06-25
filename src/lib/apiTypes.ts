export interface EnrichedMediaItem {
  id: number | string;
  tmdbId?: number;
  imdbId?: string;
  type: 'movie' | 'tv';
  title: string;
  year: number;
  rating: number;
  runtime?: string;
  quality?: string;
  posterUrl: string;
  backdropUrl: string;
  overview: string;
  genres?: string[];
  languages?: string[];
  cast?: { name: string; character: string; profileUrl: string }[];
  director?: string;
  ratings?: { imdb: string; rottenTomatoes: string; metacritic: string };
  awards?: string;
  trailer?: { videoId: string; embedUrl: string; watchUrl: string; thumbnail: string };
  availability?: { name: string; type: string; webUrl: string }[];
  seasons?: number;
  episodes?: { season: number; number: number; name: string; airdate: string }[];
  recommendations?: { id: number; type: string; title: string; posterUrl: string; rating: number; year: string }[];
}
