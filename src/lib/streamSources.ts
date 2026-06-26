export interface StreamSource {
  id: string;
  name: string;
  label: string;
  url: string;
  type: 'iframe';
  priority: number;
  enabled: boolean;
  adExperience: 'minimal' | 'moderate';
  qualityScore: number;
}

export function getStreamSources(params: {
  tmdbId: number | string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
}): StreamSource[] {
  const { tmdbId, type, season, episode } = params;
  const s = season || 1;
  const e = episode || 1;

  if (type === 'movie') {
    return [
      {
        id: 'server-1', name: 'Server 1', label: 'Default',
        url: `https://vidsrc.to/embed/movie/${tmdbId}`,
        type: 'iframe', priority: 1, enabled: true,
        adExperience: 'minimal', qualityScore: 90,
      },
      {
        id: 'server-2', name: 'Server 2', label: 'Backup',
        url: `https://player.videasy.net/movie/${tmdbId}`,
        type: 'iframe', priority: 2, enabled: true,
        adExperience: 'minimal', qualityScore: 85,
      },
      {
        id: 'server-3', name: 'Server 3', label: 'Alternate',
        url: `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`,
        type: 'iframe', priority: 3, enabled: true,
        adExperience: 'minimal', qualityScore: 80,
      },
      {
        id: 'server-4', name: 'Server 4', label: 'Alternate',
        url: `https://autoembed.co/movie/tmdb/${tmdbId}`,
        type: 'iframe', priority: 4, enabled: true,
        adExperience: 'moderate', qualityScore: 65,
      },
    ];
  }

  return [
    {
      id: 'server-1', name: 'Server 1', label: 'Default',
      url: `https://vidsrc.to/embed/tv/${tmdbId}/${s}/${e}`,
      type: 'iframe', priority: 1, enabled: true,
      adExperience: 'minimal', qualityScore: 90,
    },
    {
      id: 'server-2', name: 'Server 2', label: 'Backup',
      url: `https://player.videasy.net/tv/${tmdbId}/${s}/${e}`,
      type: 'iframe', priority: 2, enabled: true,
      adExperience: 'minimal', qualityScore: 85,
    },
    {
      id: 'server-3', name: 'Server 3', label: 'Alternate',
      url: `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${s}&episode=${e}`,
      type: 'iframe', priority: 3, enabled: true,
      adExperience: 'minimal', qualityScore: 80,
    },
    {
      id: 'server-4', name: 'Server 4', label: 'Alternate',
      url: `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}`,
      type: 'iframe', priority: 4, enabled: true,
      adExperience: 'moderate', qualityScore: 65,
    },
  ];
}
