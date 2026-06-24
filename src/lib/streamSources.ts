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
      { name: 'Server 1', url: `https://embed.su/embed/movie/${tmdbId}`, type: 'iframe' },
      { name: 'Server 2', url: `https://vidlink.pro/movie/${tmdbId}`, type: 'iframe' },
    ];
  }

  const s = season || 1;
  const e = episode || 1;
  return [
    { name: 'Server 1', url: `https://embed.su/embed/tv/${tmdbId}/${s}/${e}`, type: 'iframe' },
    { name: 'Server 2', url: `https://vidlink.pro/tv/${tmdbId}/${s}/${e}`, type: 'iframe' },
  ];
}
