export interface StreamSource {
  name: string;
  url: string;
  type: 'iframe' | 'direct';
}

export function getStreamSources(params: {
  tmdbId: number | string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
}): StreamSource[] {
  const { tmdbId, type, season, episode } = params;

  if (type === 'movie') {
    return [
      { name: 'Server 1', url: `https://www.2embed.cc/embed/${tmdbId}`, type: 'iframe' },
      { name: 'Server 2', url: `https://autoembed.co/movie/tmdb/${tmdbId}`, type: 'iframe' },
    ];
  }

  const s = season || 1;
  const e = episode || 1;
  return [
    { name: 'Server 1', url: `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}`, type: 'iframe' },
    { name: 'Server 2', url: `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}`, type: 'iframe' },
  ];
}
