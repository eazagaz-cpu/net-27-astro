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

  const sources: StreamSource[] = [];

  if (type === 'movie') {
    sources.push({
      name: 'Server 1',
      url: `https://vidsrc.xyz/embed/movie/${tmdbId}`,
      type: 'iframe',
    });
    sources.push({
      name: 'Server 2',
      url: `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
      type: 'iframe',
    });
  } else {
    const s = season || 1;
    const e = episode || 1;
    sources.push({
      name: 'Server 1',
      url: `https://vidsrc.xyz/embed/tv/${tmdbId}/${s}/${e}`,
      type: 'iframe',
    });
    sources.push({
      name: 'Server 2',
      url: `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${s}/${e}`,
      type: 'iframe',
    });
  }

  return sources;
}
